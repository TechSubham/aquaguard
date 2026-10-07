import json
import paho.mqtt.client as mqtt

from app.database import SessionLocal
from app.models.sensor_reading import SensorReading
from app.models.tank import Tank


MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883

MQTT_TOPIC = (
    "aquaguard/hostel/A/block/A2/tank/01/readings"
)


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
        # -----------------------------------------
        # 1. Decode MQTT payload
        # -----------------------------------------

        payload = json.loads(
            msg.payload.decode("utf-8")
        )

        print("\nMQTT DATA RECEIVED")
        print(payload)

        # -----------------------------------------
        # 2. Get tank code from MQTT payload
        # -----------------------------------------

        tank_code = payload.get("tank_id")

        if not tank_code:
            print("ERROR: tank_id missing from MQTT payload")
            return

        # -----------------------------------------
        # 3. Open database session
        # -----------------------------------------

        db = SessionLocal()

        # -----------------------------------------
        # 4. Find tank in PostgreSQL
        # -----------------------------------------

        tank = (
            db.query(Tank)
            .filter(Tank.tank_code == tank_code)
            .first()
        )

        if not tank:
            print(
                f"ERROR: Tank '{tank_code}' "
                "not found in PostgreSQL"
            )
            return

        print(
            f"Tank found: {tank.tank_code} "
            f"(database ID: {tank.id})"
        )

        # -----------------------------------------
        # 5. Create sensor reading
        # -----------------------------------------

        reading = SensorReading(
            tank_id=tank.id,

            temperature=payload.get("temperature"),

            ph=payload.get("ph"),

            tds=payload.get("tds"),

            turbidity=payload.get("turbidity"),

            water_level=payload.get("water_level"),

            flow_rate=payload.get("flow_rate"),

            risk_score=payload.get("risk_score"),
        )

        # -----------------------------------------
        # 6. Save reading to PostgreSQL
        # -----------------------------------------

        db.add(reading)

        db.commit()

        db.refresh(reading)

        print(
            "Reading saved to PostgreSQL "
            f"(reading ID: {reading.id})"
        )

    except json.JSONDecodeError as e:

        print(
            f"Invalid JSON received from MQTT: {e}"
        )

    except Exception as e:

        if db:
            db.rollback()

        print(
            f"MQTT processing error: {e}"
        )

    finally:

        if db:
            db.close()


def start_mqtt():

    client = mqtt.Client()

    client.on_connect = on_connect

    client.on_message = on_message

    print(
        "Connecting to MQTT broker..."
    )

    client.connect(
        MQTT_BROKER,
        MQTT_PORT,
        60
    )

    client.loop_forever()


if __name__ == "__main__":
    start_mqtt()