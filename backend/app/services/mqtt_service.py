import json
from datetime import datetime
import paho.mqtt.client as mqtt

from app.database import SessionLocal
from app.models.sensor_reading import SensorReading
from app.models.tank import Tank
from app.models.alert import Alert
from app.models.notification import Notification

MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883

MQTT_TOPIC = "aquaguard/hostel/A/block/A2/tank/01/readings"

# Configured Safe Thresholds (IS 10500 standards)
TURBIDITY_CRITICAL_THRESHOLD = 5.0  # NTU
TDS_WARNING_THRESHOLD = 450.0       # ppm
PH_MIN_THRESHOLD = 6.5
PH_MAX_THRESHOLD = 8.5


def validate_reading_payload(payload: dict) -> bool:
    """Validate sensor payload bounds before database ingestion."""
    turbidity = payload.get("turbidity")
    tds = payload.get("tds")
    ph = payload.get("ph")

    if turbidity is not None and (turbidity < 0 or turbidity > 1000):
        print(f"Validation Warning: Turbidity {turbidity} out of physical range")
        return False
    if tds is not None and (tds < 0 or tds > 5000):
        print(f"Validation Warning: TDS {tds} out of physical range")
        return False
    if ph is not None and (ph < 0 or ph > 14):
        print(f"Validation Warning: pH {ph} out of physical range")
        return False
    return True


def check_and_manage_threshold_alerts(db, tank: Tank, reading: SensorReading):
    """
    Check reading against potability thresholds with deduplication.
    - If anomaly detected and NO active alert exists: Create CRITICAL/WARNING alert.
    - If anomaly persists and alert is already open: Do NOT create duplicate.
    - If parameters return to normal: Auto-resolve open threshold alerts.
    """
    turbidity = float(reading.turbidity or 0)
    tds = float(reading.tds or 0)
    ph = float(reading.ph or 7.0)

    anomalies = []
    highest_severity = "WARNING"

    if turbidity > TURBIDITY_CRITICAL_THRESHOLD:
        anomalies.append(f"Turbidity critical at {turbidity:.2f} NTU (exceeds {TURBIDITY_CRITICAL_THRESHOLD} NTU)")
        highest_severity = "CRITICAL"

    if tds > TDS_WARNING_THRESHOLD:
        anomalies.append(f"TDS elevated at {tds:.0f} ppm (exceeds baseline {TDS_WARNING_THRESHOLD} ppm)")

    if ph < PH_MIN_THRESHOLD:
        anomalies.append(f"Acidic water fluctuation with pH {ph:.2f} (below min {PH_MIN_THRESHOLD})")
        highest_severity = "CRITICAL" if ph < 6.0 else "WARNING"
    elif ph > PH_MAX_THRESHOLD:
        anomalies.append(f"Alkaline water fluctuation with pH {ph:.2f} (above max {PH_MAX_THRESHOLD})")

    # Find any existing active threshold alert for this tank
    active_alert = (
        db.query(Alert)
        .filter(
            Alert.tank_id == tank.id,
            Alert.alert_type == "THRESHOLD",
            Alert.status.in_(["OPEN", "active", "INVESTIGATING", "open"])
        )
        .first()
    )

    if anomalies:
        # Anomaly is active
        msg = " • ".join(anomalies)
        title = f"{highest_severity} Water Quality Event: {tank.tank_code}"

        if not active_alert:
            # Create NEW Alert (Deduplication: only if not already active)
            new_alert = Alert(
                tank_id=tank.id,
                title=title,
                alert_type="THRESHOLD",
                severity=highest_severity,
                message=msg,
                status="OPEN"
            )
            db.add(new_alert)

            # Also create in-app notification for dashboard notification bell
            notif = Notification(
                title=f"Water Quality Alert — {tank.tank_code}",
                message=f"High risk contamination detected in {tank.tank_code}. {msg}",
                severity=highest_severity,
                read=False
            )
            db.add(notif)
            db.commit()
            print(f"[ALERT TRIGGERED] Created new {highest_severity} alert for {tank.tank_code}: {msg}")
        else:
            # Active alert already exists: update message and severity without duplicating
            if active_alert.severity != "CRITICAL" and highest_severity == "CRITICAL":
                active_alert.severity = "CRITICAL"
                active_alert.title = title
            active_alert.message = msg
            db.commit()
            print(f"[ALERT DEDUPLICATED] Updated existing active alert #{active_alert.id} for {tank.tank_code}")
    else:
        # Quality returned to nominal. If an active threshold alert exists, auto-resolve it!
        if active_alert:
            active_alert.status = "RESOLVED"
            active_alert.resolved_at = datetime.utcnow()
            active_alert.message = f"{active_alert.message} (Resolved: Telemetry returned to nominal operating bounds)."

            # Notify resolution
            notif = Notification(
                title=f"Water Quality Cleared — {tank.tank_code}",
                message=f"Readings for {tank.tank_code} normalized. Threshold alert closed.",
                severity="INFO",
                read=False
            )
            db.add(notif)
            db.commit()
            print(f"[ALERT RESOLVED] Auto-closed threshold alert #{active_alert.id} for {tank.tank_code}")


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("MQTT connected successfully")
        client.subscribe(MQTT_TOPIC)
        print(f"Subscribed to: {MQTT_TOPIC}")
    else:
        print(f"MQTT connection failed: {rc}")


def on_message(client, userdata, msg):
    db = None
    try:
        # 1. Decode MQTT payload
        payload = json.loads(msg.payload.decode("utf-8"))
        print("\nMQTT DATA RECEIVED:", payload)

        # 2. Validate reading
        if not validate_reading_payload(payload):
            print("Ignoring reading with invalid sensor values")
            return

        tank_code = payload.get("tank_id")
        if not tank_code:
            print("ERROR: tank_id missing from MQTT payload")
            return

        db = SessionLocal()

        # 3. Find tank in PostgreSQL
        tank = db.query(Tank).filter(Tank.tank_code == tank_code).first()
        if not tank:
            print(f"ERROR: Tank '{tank_code}' not found in PostgreSQL")
            return

        # 4. Fetch recent history for AI temporal feature extraction
        past_readings = (
            db.query(SensorReading)
            .filter(SensorReading.tank_id == tank.id)
            .order_by(SensorReading.recorded_at.desc().nullslast(), SensorReading.id.desc())
            .limit(25)
            .all()
        )
        history = [
            {
                "ph": float(r.ph or 7.2),
                "tds": float(r.tds or 280.0),
                "turbidity": float(r.turbidity or 1.0),
                "temperature": float(r.temperature or 25.0),
                "water_level": float(r.water_level or 80.0),
                "flow_rate": float(r.flow_rate or 3.5),
                "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None
            }
            for r in reversed(past_readings)
        ]

        # Run AI Predictive Intelligence Layer
        try:
            from app.services.ai_engine import ai_engine
            from app.routes.ai import _sync_predictive_alerts
            ai_pred = ai_engine.predict_risk(
                tank_code=tank.tank_code,
                current_reading=payload,
                history=history
            )
            calculated_risk_score = ai_pred["risk_score"]
            calculated_ai_prob = ai_pred["risk_probability"]
        except Exception as e:
            print(f"[MQTT AI WARNING] Fallback on AI prediction: {e}")
            calculated_risk_score = payload.get("risk_score") or 20
            calculated_ai_prob = 0.20
            ai_pred = None

        # 5. Create and save sensor reading
        reading = SensorReading(
            tank_id=tank.id,
            temperature=payload.get("temperature"),
            ph=payload.get("ph"),
            tds=payload.get("tds"),
            turbidity=payload.get("turbidity"),
            water_level=payload.get("water_level"),
            flow_rate=payload.get("flow_rate"),
            risk_score=calculated_risk_score,
            ai_risk_probability=calculated_ai_prob
        )
        db.add(reading)
        db.commit()
        db.refresh(reading)
        print(f"Reading saved to PostgreSQL (reading ID: {reading.id}, AI Risk: {calculated_risk_score}%)")

        # 6. Check physical thresholds & AI predictive alerts
        check_and_manage_threshold_alerts(db, tank, reading)
        if ai_pred:
            _sync_predictive_alerts(db, tank, ai_pred)

    except json.JSONDecodeError as e:
        print(f"Invalid JSON received from MQTT: {e}")
    except Exception as e:
        if db:
            db.rollback()
        print(f"MQTT processing error: {e}")
    finally:
        if db:
            db.close()


def start_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    print("Connecting to MQTT broker...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()


if __name__ == "__main__":
    start_mqtt()