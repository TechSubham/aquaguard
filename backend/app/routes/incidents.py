from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import Incident
from app.models.tank import Tank
from app.models.user import User
from app.services.auth_service import require_roles

router = APIRouter(prefix="/incidents", tags=["Incidents"])

VALID_STAGES = ["DETECTED", "INVESTIGATING", "ACTION_TAKEN", "TESTING", "RESOLVED"]


class IncidentCreate(BaseModel):
    tank_id: int
    title: str
    severity: Optional[str] = "HIGH"
    initial_note: Optional[str] = "Anomaly detected and logged."


class IncidentUpdate(BaseModel):
    current_stage: Optional[str] = None  # DETECTED, INVESTIGATING, ACTION_TAKEN, TESTING, RESOLVED
    title: Optional[str] = None
    severity: Optional[str] = None
    note: Optional[str] = None


def format_incident(inc: Incident) -> dict:
    return {
        "id": inc.id,
        "incident_number": inc.incident_number,
        "tank_id": inc.tank_id,
        "tank_code": inc.tank.tank_code if inc.tank else f"TANK-{inc.tank_id}",
        "title": inc.title,
        "severity": inc.severity,
        "current_stage": inc.current_stage,
        "detected_at": inc.detected_at.isoformat() if inc.detected_at else None,
        "resolved_at": inc.resolved_at.isoformat() if inc.resolved_at else None,
        "timeline": inc.timeline or [],
        "created_at": inc.created_at.isoformat() if inc.created_at else None
    }


@router.get("/")
def get_incidents(
    stage: Optional[str] = Query(None, description="Filter by stage"),
    tank_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident).order_by(Incident.detected_at.desc())
    if stage:
        query = query.filter(Incident.current_stage.ilike(stage))
    if tank_id:
        query = query.filter(Incident.tank_id == tank_id)
    incidents = query.all()
    return [format_incident(i) for i in incidents]


@router.get("/{incident_id}")
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID {incident_id} not found"
        )
    return format_incident(inc)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_incident(
    req: IncidentCreate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    tank = db.query(Tank).filter(Tank.id == req.tank_id).first()
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank ID {req.tank_id} does not exist"
        )

    # Compute next incident number
    max_num = db.query(Incident.incident_number).order_by(Incident.incident_number.desc()).first()
    next_num = (max_num[0] + 1) if max_num else 42

    initial_timeline = [
        {
            "stage": "DETECTED",
            "label": "Anomaly Detected",
            "timestamp": datetime.utcnow().strftime("%d %b %Y, %I:%M %p"),
            "note": req.initial_note or "Automated sensor or field inspection alert",
            "actor": current_user.name
        }
    ]

    inc = Incident(
        incident_number=next_num,
        tank_id=req.tank_id,
        title=req.title,
        severity=req.severity or "HIGH",
        current_stage="DETECTED",
        timeline=initial_timeline
    )
    db.add(inc)
    db.commit()
    db.refresh(inc)
    return format_incident(inc)


@router.patch("/{incident_id}")
def update_incident(
    incident_id: int,
    req: IncidentUpdate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with ID {incident_id} not found"
        )

    if req.title is not None:
        inc.title = req.title
    if req.severity is not None:
        inc.severity = req.severity.upper()

    if req.current_stage is not None:
        stage_upper = req.current_stage.upper()
        if stage_upper not in VALID_STAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid stage '{req.current_stage}'. Valid stages: {VALID_STAGES}"
            )
        inc.current_stage = stage_upper

        # Append to timeline
        timeline = list(inc.timeline or [])
        timeline.append({
            "stage": stage_upper,
            "label": stage_upper.replace("_", " ").title(),
            "timestamp": datetime.utcnow().strftime("%d %b %Y, %I:%M %p"),
            "note": req.note or f"Stage transitioned to {stage_upper}",
            "actor": current_user.name
        })
        inc.timeline = timeline

        if stage_upper == "RESOLVED":
            inc.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(inc)
    return format_incident(inc)
