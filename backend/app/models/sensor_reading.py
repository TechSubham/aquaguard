from sqlalchemy import Column, BigInteger, Integer, Numeric, DateTime, ForeignKey
from app.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(BigInteger, primary_key=True)
    tank_id = Column(Integer, ForeignKey("tanks.id"), nullable=False)

    recorded_at = Column(DateTime)

    temperature = Column(Numeric(6, 2))
    ph = Column(Numeric(5, 2))
    tds = Column(Numeric(8, 2))
    turbidity = Column(Numeric(8, 2))
    water_level = Column(Numeric(6, 2))
    flow_rate = Column(Numeric(8, 2))
    risk_score = Column(Numeric(5, 2))
    ai_risk_probability = Column(Numeric(5, 4))