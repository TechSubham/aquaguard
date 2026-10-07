from sqlalchemy import Column, BigInteger, Integer, String, Text, Numeric, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base


class LeakageEvent(Base):
    __tablename__ = "leakage_events"

    id = Column(BigInteger, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    detected_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    flow_rate = Column(Numeric(8, 2), nullable=True)
    water_level = Column(Numeric(6, 2), nullable=True)
    confidence = Column(Numeric(5, 4), default=0.85)
    status = Column(String(30), default="OPEN", index=True)
    description = Column(Text, nullable=True)

    tank = relationship("Tank")
