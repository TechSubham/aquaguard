from sqlalchemy import Column, BigInteger, Integer, String, Text, Numeric, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(BigInteger, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=True)
    alert_type = Column(String(100), default="THRESHOLD")
    severity = Column(String(30), default="WARNING")
    message = Column(Text, nullable=True)
    ai_probability = Column(Numeric(5, 4), nullable=True)
    predicted_time_minutes = Column(Integer, nullable=True)
    status = Column(String(30), default="OPEN", index=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    resolved_at = Column(DateTime, nullable=True)

    tank = relationship("Tank", back_populates="alerts")
