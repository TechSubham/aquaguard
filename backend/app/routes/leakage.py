from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.leakage import LeakageEvent
from app.models.tank import Tank
from app.models.user import User
from app.services.auth_service import require_roles

router = APIRouter(prefix="/leakage", tags=["Leakage"])


class LeakageCreate(BaseModel):
    tank_id: int
    flow_rate: Optional[float] = None
    water_level: Optional[float] = None
    confidence: Optional[float] = 0.85
    status: Optional[str] = "OPEN"
    description: Optional[str] = None


class LeakageUpdate(BaseModel):
    status: Optional[str] = None  # OPEN, INVESTIGATING, REPAIRED, RESOLVED
    description: Optional[str] = None


def format_leakage(l: LeakageEvent) -> dict:
    return {
        "id": l.id,
        "tank_id": l.tank_id,
        "tank_code": l.tank.tank_code if l.tank else f"TANK-{l.tank_id}",
        "detected_at": l.detected_at.isoformat() if l.detected_at else None,
        "flow_rate": float(l.flow_rate) if l.flow_rate is not None else None,
        "water_level": float(l.water_level) if l.water_level is not None else None,
        "confidence": float(l.confidence) if l.confidence is not None else 0.85,
        "status": l.status,
        "description": l.description
    }


@router.get("/")
def get_leakages(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(LeakageEvent).order_by(LeakageEvent.detected_at.desc())
    if status:
        query = query.filter(LeakageEvent.status.ilike(status))
    events = query.all()
    return [format_leakage(e) for e in events]


@router.get("/{leakage_id}")
def get_leakage(leakage_id: int, db: Session = Depends(get_db)):
    event = db.query(LeakageEvent).filter(LeakageEvent.id == leakage_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Leakage event {leakage_id} not found"
        )
    return format_leakage(event)


@router.post("/", status_code=status.HTTP_201_CREATED)
def report_leakage(
    req: LeakageCreate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    tank = db.query(Tank).filter(Tank.id == req.tank_id).first()
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank ID {req.tank_id} does not exist"
        )

    ev = LeakageEvent(
        tank_id=req.tank_id,
        flow_rate=req.flow_rate,
        water_level=req.water_level,
        confidence=req.confidence or 0.85,
        status=req.status or "OPEN",
        description=req.description or "Automated differential flow drop detection"
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return format_leakage(ev)


@router.patch("/{leakage_id}")
def update_leakage(
    leakage_id: int,
    req: LeakageUpdate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    ev = db.query(LeakageEvent).filter(LeakageEvent.id == leakage_id).first()
    if not ev:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Leakage event {leakage_id} not found"
        )

    if req.status is not None:
        ev.status = req.status.upper()
    if req.description is not None:
        ev.description = req.description

    db.commit()
    db.refresh(ev)
    return format_leakage(ev)
