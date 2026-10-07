from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.complaint import Complaint
from app.models.tank import Tank
from app.models.user import User
from app.services.auth_service import get_current_user, require_roles

router = APIRouter(prefix="/complaints", tags=["Complaints"])


class ComplaintCreate(BaseModel):
    tank_id: Optional[int] = None
    tank_code: Optional[str] = None
    category: str = "OTHER"  # BAD_SMELL, BAD_TASTE, DISCOLORATION, VISIBLE_PARTICLES, LOW_PRESSURE, OTHER
    description: str
    status: Optional[str] = "OPEN"


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None  # OPEN, INVESTIGATING, ACTION_TAKEN, RESOLVED
    admin_notes: Optional[str] = None
    category: Optional[str] = None


def format_complaint(c: Complaint) -> dict:
    return {
        "id": c.id,
        "ticket_code": f"#{c.id}",
        "user_id": c.user_id,
        "student_name": c.user.name if c.user else "Student Resident",
        "student_email": c.user.email if c.user else None,
        "tank_id": c.tank_id,
        "tank_code": c.tank.tank_code if c.tank else (f"TANK-{c.tank_id}" if c.tank_id else "Unassigned"),
        "block": c.tank.block.name if c.tank and c.tank.block else "Block A",
        "category": c.category or c.complaint_type or "OTHER",
        "description": c.description,
        "status": c.status,
        "admin_notes": c.admin_notes,
        "created_at": c.created_at.isoformat() if c.created_at else None
    }


@router.get("/")
def get_complaints(
    status: Optional[str] = Query(None, description="Filter by status (OPEN, INVESTIGATING, ACTION_TAKEN, RESOLVED)"),
    tank_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint).order_by(Complaint.created_at.desc())
    if status:
        query = query.filter(Complaint.status.ilike(status))
    if tank_id:
        query = query.filter(Complaint.tank_id == tank_id)
    complaints = query.all()
    return [format_complaint(c) for c in complaints]


@router.get("/{complaint_id}")
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found"
        )
    return format_complaint(c)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_complaint(
    req: ComplaintCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Resolve tank if provided by code or id
    resolved_tank_id = req.tank_id
    if not resolved_tank_id and req.tank_code:
        tank = db.query(Tank).filter(Tank.tank_code == req.tank_code).first()
        if tank:
            resolved_tank_id = tank.id

    # If still not found, default to first active tank
    if not resolved_tank_id:
        first_tank = db.query(Tank).first()
        if first_tank:
            resolved_tank_id = first_tank.id

    c = Complaint(
        user_id=current_user.id if current_user.id != 999 else None,
        tank_id=resolved_tank_id,
        category=req.category.upper(),
        complaint_type=req.category.upper(),
        description=req.description,
        status=req.status or "OPEN"
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return format_complaint(c)


@router.patch("/{complaint_id}")
def update_complaint(
    complaint_id: int,
    req: ComplaintUpdate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    c = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not c:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found"
        )

    if req.status is not None:
        c.status = req.status.upper()
    if req.admin_notes is not None:
        c.admin_notes = req.admin_notes
    if req.category is not None:
        c.category = req.category.upper()

    db.commit()
    db.refresh(c)
    return format_complaint(c)
