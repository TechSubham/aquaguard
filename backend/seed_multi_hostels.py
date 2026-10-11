import os
import sys
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.hostel import Hostel
from app.models.block import Block
from app.models.tank import Tank
from app.models.sensor_reading import SensorReading
from app.models.alert import Alert
from app.models.complaint import Complaint
from app.models.water_test import WaterTest
from app.models.incident import Incident
from app.models.maintenance import Maintenance
from app.models.user import User

TARGET_HOSTEL = {
    "name": "Ramanujan Hostel (Boys Hostel 1)",
    "location": "NSUT Main Campus - North Sector",
    "block": "Block A",
    "tank_code": "A2-ROOF-01",
    "capacity": 10000,
}


def seed_hostels_and_tanks():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        db.query(Tank).filter(Tank.tank_code != TARGET_HOSTEL["tank_code"]).delete(synchronize_session=False)
        db.flush()

        db.query(Hostel).filter(Hostel.name != TARGET_HOSTEL["name"]).delete(synchronize_session=False)
        db.flush()

        hostel = db.query(Hostel).filter(Hostel.name == TARGET_HOSTEL["name"]).first()
        if not hostel:
            hostel = Hostel(name=TARGET_HOSTEL["name"], location=TARGET_HOSTEL["location"])
            db.add(hostel)
            db.flush()
            print(f"Created hostel: {hostel.name}")
        else:
            hostel.location = TARGET_HOSTEL["location"]

        db.query(Block).filter(
            Block.hostel_id == hostel.id,
            Block.name != TARGET_HOSTEL["block"],
        ).delete(synchronize_session=False)
        db.flush()

        block = db.query(Block).filter(
            Block.hostel_id == hostel.id,
            Block.name == TARGET_HOSTEL["block"],
        ).first()
        if not block:
            block = Block(hostel_id=hostel.id, name=TARGET_HOSTEL["block"])
            db.add(block)
            db.flush()
            print(f"  Created block: {block.name} under {hostel.name}")

        tank = db.query(Tank).filter(Tank.tank_code == TARGET_HOSTEL["tank_code"]).first()
        if not tank:
            tank = Tank(
                tank_code=TARGET_HOSTEL["tank_code"],
                block_id=block.id,
                capacity_liters=TARGET_HOSTEL["capacity"],
                status="active",
            )
            db.add(tank)
            db.flush()
            print(f"    Created tank: {tank.tank_code} (Capacity: {TARGET_HOSTEL['capacity']} L)")
        else:
            tank.block_id = block.id
            tank.capacity_liters = TARGET_HOSTEL["capacity"]
            tank.status = "active"

        db.commit()
        print("Successfully seeded single-hostel AquaGuard database!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_hostels_and_tanks()
