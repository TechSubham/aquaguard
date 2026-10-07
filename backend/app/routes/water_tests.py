from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.water_test import WaterTest
from app.models.tank import Tank
from app.models.user import User
from app.services.auth_service import require_roles

router = APIRouter(prefix="/water-tests", tags=["Water Tests"])


class WaterTestCreate(BaseModel):
    tank_id: int
    tested_by: str
    ph: Optional[float] = 7.0
    tds: Optional[float] = 250.0
    turbidity: Optional[float] = 1.0
    ecoli_result: Optional[str] = "NEGATIVE"
    coliform_result: Optional[str] = "NEGATIVE"
    report_file: Optional[str] = None
    notes: Optional[str] = None


class WaterTestUpdate(BaseModel):
    tested_by: Optional[str] = None
    ph: Optional[float] = None
    tds: Optional[float] = None
    turbidity: Optional[float] = None
    ecoli_result: Optional[str] = None
    coliform_result: Optional[str] = None
    report_file: Optional[str] = None
    notes: Optional[str] = None


def format_test(t: WaterTest) -> dict:
    return {
        "id": t.id,
        "tank_id": t.tank_id,
        "tank_code": t.tank.tank_code if t.tank else f"TANK-{t.tank_id}",
        "tested_at": t.tested_at.isoformat() if t.tested_at else None,
        "tested_by": t.tested_by,
        "ph": float(t.ph) if t.ph is not None else None,
        "tds": float(t.tds) if t.tds is not None else None,
        "turbidity": float(t.turbidity) if t.turbidity is not None else None,
        "ecoli_result": t.ecoli_result,
        "coliform_result": t.coliform_result,
        "report_file": t.report_file,
        "notes": t.notes
    }


@router.get("/")
def get_water_tests(tank_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WaterTest).order_by(WaterTest.tested_at.desc())
    if tank_id:
        query = query.filter(WaterTest.tank_id == tank_id)
    tests = query.all()
    return [format_test(t) for t in tests]


@router.get("/{test_id}")
def get_water_test(test_id: int, db: Session = Depends(get_db)):
    t = db.query(WaterTest).filter(WaterTest.id == test_id).first()
    if not t:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Water test record {test_id} not found"
        )
    return format_test(t)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_water_test(
    req: WaterTestCreate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    tank = db.query(Tank).filter(Tank.id == req.tank_id).first()
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank ID {req.tank_id} does not exist"
        )

    test = WaterTest(
        tank_id=req.tank_id,
        tested_by=req.tested_by,
        ph=req.ph,
        tds=req.tds,
        turbidity=req.turbidity,
        ecoli_result=(req.ecoli_result or "NEGATIVE").upper(),
        coliform_result=(req.coliform_result or "NEGATIVE").upper(),
        report_file=req.report_file,
        notes=req.notes
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return format_test(test)


@router.patch("/{test_id}")
def update_water_test(
    test_id: int,
    req: WaterTestUpdate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    test = db.query(WaterTest).filter(WaterTest.id == test_id).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Water test record {test_id} not found"
        )

    if req.tested_by is not None:
        test.tested_by = req.tested_by
    if req.ph is not None:
        test.ph = req.ph
    if req.tds is not None:
        test.tds = req.tds
    if req.turbidity is not None:
        test.turbidity = req.turbidity
    if req.ecoli_result is not None:
        test.ecoli_result = req.ecoli_result.upper()
    if req.coliform_result is not None:
        test.coliform_result = req.coliform_result.upper()
    if req.report_file is not None:
        test.report_file = req.report_file
    if req.notes is not None:
        test.notes = req.notes

    db.commit()
    db.refresh(test)
    return format_test(test)
