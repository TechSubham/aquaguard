from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    maintenance_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_date = Column(Date, nullable=False)
    completed_date = Column(Date, nullable=True)
    performed_by = Column(String(150), nullable=True)
    status = Column(String(30), default="PENDING", index=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    tank = relationship("Tank")
