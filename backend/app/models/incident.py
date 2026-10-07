from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, text
from sqlalchemy.orm import relationship
from app.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(Integer, unique=True, nullable=False, index=True)
    tank_id = Column(Integer, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    severity = Column(String(30), default="HIGH")
    current_stage = Column(String(50), default="DETECTED", index=True)
    detected_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    resolved_at = Column(DateTime, nullable=True)
    timeline = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    tank = relationship("Tank")
