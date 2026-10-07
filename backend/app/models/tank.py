from sqlalchemy import Column, Integer, String, Numeric, Date, ForeignKey
from app.database import Base


class Tank(Base):
    __tablename__ = "tanks"

    id = Column(Integer, primary_key=True)
    tank_code = Column(String(100), unique=True, nullable=False)
    block_id = Column(Integer, ForeignKey("blocks.id"))
    capacity_liters = Column(Numeric(12, 2))
    status = Column(String(30), default="active")
    installation_date = Column(Date)