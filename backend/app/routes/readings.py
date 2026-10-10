from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sensor_reading import SensorReading
from app.models.tank import Tank

router = APIRouter(
    prefix="/readings",
    tags=["Sensor Readings"]
)


@router.get("/")
def get_readings(
    db: Session = Depends(get_db)
):
    readings = (
        db.query(SensorReading)
        .order_by(
            SensorReading.recorded_at.desc().nullslast(),
            SensorReading.id.desc()
        )
        .limit(50)
        .all()
    )

    return readings


@router.get("/latest/{tank_code}")
def get_latest_reading(
    tank_code: str,
    db: Session = Depends(get_db)
):
    tank = (
        db.query(Tank)
        .filter(Tank.tank_code == tank_code)
        .first()
    )

    if not tank:
        raise HTTPException(
            status_code=404,
            detail=f"Tank '{tank_code}' not found"
        )

    reading = (
        db.query(SensorReading)
        .filter(SensorReading.tank_id == tank.id)
        .order_by(
            SensorReading.recorded_at.desc().nullslast(),
            SensorReading.id.desc()
        )
        .first()
    )

    if not reading:
        return {
            "tank_id": tank.tank_code,
            "recorded_at": None,
            "temperature": None,
            "ph": None,
            "tds": None,
            "turbidity": None,
            "water_level": None,
            "flow_rate": None,
            "risk_score": None,
            "ai_risk_probability": None,
            "has_data": False,
        }

    return {
        "tank_id": tank.tank_code,
        "recorded_at": reading.recorded_at,
        "temperature": reading.temperature,
        "ph": reading.ph,
        "tds": reading.tds,
        "turbidity": reading.turbidity,
        "water_level": reading.water_level,
        "flow_rate": reading.flow_rate,
        "risk_score": reading.risk_score,
        "ai_risk_probability": reading.ai_risk_probability,
        "has_data": True,
    }


@router.get("/history/{tank_code}")
def get_reading_history(
    tank_code: str,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    tank = (
        db.query(Tank)
        .filter(Tank.tank_code == tank_code)
        .first()
    )

    if not tank:
        raise HTTPException(
            status_code=404,
            detail=f"Tank '{tank_code}' not found"
        )

    readings = (
        db.query(SensorReading)
        .filter(SensorReading.tank_id == tank.id)
        .order_by(
            SensorReading.recorded_at.desc().nullslast(),
            SensorReading.id.desc()
        )
        .limit(limit)
        .all()
    )

    readings.reverse()

    return [
        {
            "recorded_at": reading.recorded_at,
            "temperature": reading.temperature,
            "ph": reading.ph,
            "tds": reading.tds,
            "turbidity": reading.turbidity,
            "water_level": reading.water_level,
            "flow_rate": reading.flow_rate,
            "risk_score": reading.risk_score
        }
        for reading in readings
    ]

