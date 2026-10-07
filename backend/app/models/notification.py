from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(30), default="INFO")
    read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)

    user = relationship("User")
