from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.alert import Alert
from app.models.tank import Tank
from app.models.user import User
from app.services.auth_service import get_current_user, require_roles

router = APIRouter(prefix="/alerts", tags=["Alerts"])


class AlertCreate(BaseModel):
    tank_id: int
    title: str
    alert_type: str = "THRESHOLD"
    severity: str = "WARNING"
    message: str
    status: Optional[str] = "OPEN"


class AlertUpdate(BaseModel):
    title: Optional[str] = None
    severity: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None  # OPEN, INVESTIGATING, RESOLVED


def format_alert(alert: Alert) -> dict:
    return {
        "id": alert.id,
        "tank_id": alert.tank_id,
        "tank_code": alert.tank.tank_code if alert.tank else f"TANK-{alert.tank_id}",
        "title": alert.title or f"{alert.severity} Water Quality Event",
        "type": alert.alert_type,
        "severity": alert.severity,
        "message": alert.message,
        "status": alert.status,
        "created_at": alert.created_at.isoformat() if alert.created_at else None,
        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None
    }


@router.get("/")
def get_alerts(
    status: Optional[str] = Query(None, description="Filter by status (OPEN, INVESTIGATING, RESOLVED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, WARNING, INFO)"),
    tank_code: Optional[str] = Query(None, description="Filter by tank code"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Alert).order_by(Alert.created_at.desc())

    if status:
        query = query.filter(Alert.status.ilike(status))
    if severity:
        query = query.filter(Alert.severity.ilike(severity))
    if tank_code:
        tank = db.query(Tank).filter(Tank.tank_code == tank_code).first()
        if tank:
            query = query.filter(Alert.tank_id == tank.id)

    alerts = query.limit(limit).all()
    return [format_alert(a) for a in alerts]


@router.get("/active")
def get_active_alerts(db: Session = Depends(get_db)):
    alerts = (
        db.query(Alert)
        .filter(Alert.status.in_(["OPEN", "active", "INVESTIGATING", "open"]))
        .order_by(Alert.created_at.desc())
        .all()
    )
    return [format_alert(a) for a in alerts]


@router.get("/{alert_id}")
def get_alert_by_id(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found"
        )
    return format_alert(alert)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_alert(
    payload: AlertCreate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    tank = db.query(Tank).filter(Tank.id == payload.tank_id).first()
    if not tank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tank ID {payload.tank_id} does not exist"
        )

    alert = Alert(
        tank_id=payload.tank_id,
        title=payload.title,
        alert_type=payload.alert_type.upper(),
        severity=payload.severity.upper(),
        message=payload.message,
        status=payload.status or "OPEN"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return format_alert(alert)


@router.patch("/{alert_id}")
def update_alert(
    alert_id: int,
    payload: AlertUpdate,
    current_user: User = Depends(require_roles(["admin", "maintenance"])),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID {alert_id} not found"
        )

    if payload.title is not None:
        alert.title = payload.title
    if payload.severity is not None:
        alert.severity = payload.severity.upper()
    if payload.message is not None:
        alert.message = payload.message
    if payload.status is not None:
        alert.status = payload.status.upper()
        if alert.status == "RESOLVED":
            alert.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)
    return format_alert(alert)
