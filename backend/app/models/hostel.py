from sqlalchemy import Column, Integer, String, DateTime, text
from sqlalchemy.orm import relationship
from app.database import Base


class Hostel(Base):
    __tablename__ = "hostels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))

    blocks = relationship("Block", back_populates="hostel", cascade="all, delete-orphan")
