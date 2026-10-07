from sqlalchemy import Column, BigInteger, Integer, Numeric, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base


class WaterConsumption(Base):
    __tablename__ = "water_consumption"

    id = Column(BigInteger, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    liters_consumed = Column(Numeric(12, 2), nullable=False)

    tank = relationship("Tank")
