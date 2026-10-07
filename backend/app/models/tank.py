from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base


class Tank(Base):
    __tablename__ = "tanks"

    id = Column(Integer, primary_key=True, index=True)
    tank_code = Column(String(100), unique=True, nullable=False, index=True)
    block_id = Column(Integer, ForeignKey("blocks.id", ondelete="SET NULL"), nullable=True)
    capacity_liters = Column(Numeric(12, 2), default=10000.0)
    status = Column(String(30), default="active")
    installation_date = Column(Date, nullable=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    block = relationship("Block", back_populates="tanks")
    sensor_readings = relationship("SensorReading", back_populates="tank", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="tank", cascade="all, delete-orphan")