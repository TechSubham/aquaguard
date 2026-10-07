import json
import paho.mqtt.client as mqtt

from app.database import SessionLocal
from app.models.sensor_reading import SensorReading


MQTT_BROKER = "test.mosquitto.org"
MQTT_PORT = 1883
MQTT_TOPIC = "aquaguard/hostel/A/block/A2/tank/01/readings"


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
        payload = json.loads(msg.payload.decode())

        print("\nMQTT DATA RECEIVED")
        print(payload)

        db = SessionLocal()

        reading = SensorReading(
            tank_id=1,
            temperature=payload.get("temperature"),
            ph=payload.get("ph"),
            tds=payload.get("tds"),
            turbidity=payload.get("turbidity"),
            water_level=payload.get("water_level"),
            flow_rate=payload.get("flow_rate"),
            risk_score=payload.get("risk_score"),
        )

        db.add(reading)
        db.commit()

        print("Reading saved to PostgreSQL")

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

    client.connect(
        MQTT_BROKER,
        MQTT_PORT,
        60
    )

    client.loop_forever()