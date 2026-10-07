from sqlalchemy import Column, Integer, String, Text, DateTime, text
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=True)
    role = Column(String(30), nullable=False, default="student")
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
