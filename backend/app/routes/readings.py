from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sensor_reading import SensorReading

router = APIRouter(prefix="/readings", tags=["Sensor Readings"])


@router.get("/")
def get_readings(db: Session = Depends(get_db)):
    readings = (
        db.query(SensorReading)
        .order_by(SensorReading.recorded_at.desc())
        .limit(50)
        .all()
    )

    return readings