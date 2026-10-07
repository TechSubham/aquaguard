from sqlalchemy import Column, BigInteger, Integer, String, Text, Numeric, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    tank_id = Column(Integer, ForeignKey("tanks.id", ondelete="SET NULL"), nullable=True, index=True)
    complaint_type = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)
    status = Column(String(30), default="OPEN", index=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)

    user = relationship("User")
    tank = relationship("Tank")
