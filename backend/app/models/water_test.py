from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from app.database import Base


class WaterTest(Base):
    __tablename__ = "water_tests"

    id = Column(Integer, primary_key=True, index=True)
    tank_id = Column(Integer, ForeignKey("tanks.id", ondelete="CASCADE"), nullable=False, index=True)
    tested_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), index=True)
    tested_by = Column(String(150), nullable=True)
    ph = Column(Numeric(5, 2), nullable=True)
    tds = Column(Numeric(8, 2), nullable=True)
    turbidity = Column(Numeric(8, 2), nullable=True)
    ecoli_result = Column(String(50), default="NEGATIVE")
    coliform_result = Column(String(50), default="NEGATIVE")
    report_file = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    tank = relationship("Tank")
