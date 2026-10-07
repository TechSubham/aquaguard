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

def seed_hostels_and_tanks():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    hostels_data = [
        {
            "name": "Ramanujan Hostel (Boys Hostel 1)",
            "location": "NSUT Main Campus - North Sector",
            "blocks": [
                {
                    "name": "Block A",
                    "tanks": [
                        {"code": "A2-ROOF-01", "capacity": 10000},
                        {"code": "A1-GROUND-01", "capacity": 25000},
                    ]
                },
                {
                    "name": "Block B",
                    "tanks": [
                        {"code": "B1-ROOF-01", "capacity": 12000},
                    ]
                },
                {
                    "name": "Block C",
                    "tanks": [
                        {"code": "C2-ROOF-01", "capacity": 8000},
                    ]
                },
            ]
        },
        {
            "name": "Aryabhatta Hostel (Boys Hostel 2)",
            "location": "NSUT Main Campus - East Sector",
            "blocks": [
                {
                    "name": "Block A",
                    "tanks": [
                        {"code": "ARY-A1-ROOF", "capacity": 15000},
                    ]
                },
                {
                    "name": "Block B",
                    "tanks": [
                        {"code": "ARY-B1-ROOF", "capacity": 15000},
                    ]
                },
            ]
        },
        {
            "name": "Kalpana Chawla Hostel (Girls Hostel 1)",
            "location": "NSUT Main Campus - West Sector",
            "blocks": [
                {
                    "name": "Tower 1",
                    "tanks": [
                        {"code": "KC-T1-ROOF", "capacity": 14000},
                    ]
                },
                {
                    "name": "Tower 2",
                    "tanks": [
                        {"code": "KC-T2-ROOF", "capacity": 10000},
                    ]
                },
            ]
        },
        {
            "name": "Sarojini Naidu Hostel (Girls Hostel 2)",
            "location": "NSUT Main Campus - South Sector",
            "blocks": [
                {
                    "name": "Wing A",
                    "tanks": [
                        {"code": "SN-W1-ROOF", "capacity": 9000},
                    ]
                },
                {
                    "name": "Wing B",
                    "tanks": [
                        {"code": "SN-W2-ROOF", "capacity": 8000},
                    ]
                },
            ]
        },
    ]

    try:
        for h_info in hostels_data:
            hostel = db.query(Hostel).filter(Hostel.name == h_info["name"]).first()
            if not hostel:
                hostel = Hostel(name=h_info["name"], location=h_info["location"])
                db.add(hostel)
                db.flush()
                print(f"Created hostel: {hostel.name}")

            for b_info in h_info["blocks"]:
                block = db.query(Block).filter(Block.hostel_id == hostel.id, Block.name == b_info["name"]).first()
                if not block:
                    block = Block(hostel_id=hostel.id, name=b_info["name"])
                    db.add(block)
                    db.flush()
                    print(f"  Created block: {block.name} under {hostel.name}")

                for t_info in b_info["tanks"]:
                    tank = db.query(Tank).filter(Tank.tank_code == t_info["code"]).first()
                    if not tank:
                        tank = Tank(
                            tank_code=t_info["code"],
                            block_id=block.id,
                            capacity_liters=t_info["capacity"],
                            status="active"
                        )
                        db.add(tank)
                        db.flush()
                        print(f"    Created tank: {tank.tank_code} (Capacity: {t_info['capacity']} L)")
                    else:
                        tank.block_id = block.id
                        tank.capacity_liters = t_info["capacity"]

        db.commit()
        print("Successfully seeded multi-hostel campus fleet!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_hostels_and_tanks()
