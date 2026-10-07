from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.maintenance import Maintenance
from app.models.tank import Tank
from app.models.user import User
from app.services.auth_service import require_roles

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


class MaintenanceCreate(BaseModel):
    tank_id: int
    maintenance_type: str
    scheduled_date: date
    status: Optional[str] = "PENDING"
    notes: Optional[str] = None
    performed_by: Optional[str] = None


class MaintenanceUpdate(BaseModel):
    maintenance_type: Optional[str] = None
    scheduled_date: Optional[date] = None
    completed_date: Optional[date] = None
    status: Optional[str] = None  # PENDING, IN_PROGRESS, COMPLETED, OVERDUE
    notes: Optional[str] = None
    performed_by: Optional[str] = None


def format_maintenance(m: Maintenance) -> dict:
    return {
        "id": m.id,
        "tank_id": m.tank_id,
        "tank_code": m.tank.tank_code if m.tank else f"TANK-{m.tank_id}",
        "maintenance_type": m.maintenance_type,
        "description": m.description,
        "notes": m.description,
        "scheduled_date": m.scheduled_date.isoformat() if m.scheduled_date else None,
        "completed_date": m.completed_date.isoformat() if m.completed_date else None,
        "performed_by": m.performed_by,
        "status": m.status,
        "created_at": m.created_at.isoformat() if m.created_at else None
    }


@router.get("/")
def get_maintenance_list(
    status: Optional[str] = Query(None, description="Filter by status (PENDING, IN_PROGRESS, COMPLETED, OVERDUE)"),
    tank_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Maintenance).order_by(Maintenance.scheduled_date.asc())
    if status:
        query = query.filter(Maintenance.status.ilike(status))
    if tank_id:
        query = query.filter(Maintenance.tank_id == tank_id)
    items = query.all()
    return [format_maintenance(m) for m in items]


@router.get("/{maintenance_id}")
def get_maintenance(maintenance_id: int, db: Session = Depends(get_db)):
    m = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not m:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance record {maintenance_id} not found"
        )
    return format_maintenance(m)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_maintenance(
    req: MaintenanceCreate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    tank = db.query(Tank).filter(Tank.id == req.tank_id).first()
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank ID {req.tank_id} does not exist"
        )

    m = Maintenance(
        tank_id=req.tank_id,
        maintenance_type=req.maintenance_type,
        description=req.notes,
        scheduled_date=req.scheduled_date,
        performed_by=req.performed_by or current_user.name,
        status=req.status or "PENDING"
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return format_maintenance(m)


@router.patch("/{maintenance_id}")
def update_maintenance(
    maintenance_id: int,
    req: MaintenanceUpdate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    m = db.query(Maintenance).filter(Maintenance.id == maintenance_id).first()
    if not m:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Maintenance record {maintenance_id} not found"
        )

    if req.maintenance_type is not None:
        m.maintenance_type = req.maintenance_type
    if req.scheduled_date is not None:
        m.scheduled_date = req.scheduled_date
    if req.completed_date is not None:
        m.completed_date = req.completed_date
    if req.performed_by is not None:
        m.performed_by = req.performed_by
    if req.notes is not None:
        m.description = req.notes
    if req.status is not None:
        m.status = req.status.upper()
        if m.status == "COMPLETED" and not m.completed_date:
            m.completed_date = date.today()

    db.commit()
    db.refresh(m)
    return format_maintenance(m)
