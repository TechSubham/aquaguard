from datetime import datetime
from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    Numeric,
    DateTime,
    ForeignKey,
    text
)
from sqlalchemy.orm import relationship
from app.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(
        BigInteger,
        primary_key=True,
        index=True
    )

    tank_id = Column(
        Integer,
        ForeignKey("tanks.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    recorded_at = Column(
        DateTime,
        server_default=text("CURRENT_TIMESTAMP"),
        nullable=False,
        index=True
    )

    temperature = Column(
        Numeric(6, 2)
    )

    ph = Column(
        Numeric(5, 2)
    )

    tds = Column(
        Numeric(8, 2)
    )

    turbidity = Column(
        Numeric(8, 2)
    )

    water_level = Column(
        Numeric(6, 2)
    )

    flow_rate = Column(
        Numeric(8, 2)
    )

    risk_score = Column(
        Numeric(5, 2)
    )

    ai_risk_probability = Column(
        Numeric(5, 4)
    )

    tank = relationship("Tank", back_populates="sensor_readings")