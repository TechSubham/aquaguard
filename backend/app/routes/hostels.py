from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hostel import Hostel
from app.models.user import User
from app.services.auth_service import require_roles

router = APIRouter(prefix="/hostels", tags=["Hostels"])


class HostelCreate(BaseModel):
    name: str
    location: Optional[str] = None


class HostelUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None


def format_hostel(hostel: Hostel) -> dict:
    return {
        "id": hostel.id,
        "name": hostel.name,
        "location": hostel.location,
        "blocks": [
            {"id": b.id, "name": b.name} for b in (hostel.blocks or [])
        ],
        "created_at": hostel.created_at.isoformat() if hostel.created_at else None
    }


@router.get("/")
def get_hostels(db: Session = Depends(get_db)):
    hostels = db.query(Hostel).all()
    return [format_hostel(h) for h in hostels]


@router.get("/{hostel_id}")
def get_hostel(hostel_id: int, db: Session = Depends(get_db)):
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hostel with ID {hostel_id} not found"
        )
    return format_hostel(hostel)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_hostel(
    req: HostelCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    hostel = Hostel(name=req.name, location=req.location)
    db.add(hostel)
    db.commit()
    db.refresh(hostel)
    return format_hostel(hostel)


@router.patch("/{hostel_id}")
def update_hostel(
    hostel_id: int,
    req: HostelUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    hostel = db.query(Hostel).filter(Hostel.id == hostel_id).first()
    if not hostel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hostel with ID {hostel_id} not found"
        )

    if req.name is not None:
        hostel.name = req.name
    if req.location is not None:
        hostel.location = req.location

    db.commit()
    db.refresh(hostel)
    return format_hostel(hostel)
