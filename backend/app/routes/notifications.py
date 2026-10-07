from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationCreate(BaseModel):
    title: str
    message: str
    severity: Optional[str] = "INFO"
    user_id: Optional[int] = None


def format_notif(n: Notification) -> dict:
    return {
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "severity": n.severity,
        "read": n.read,
        "created_at": n.created_at.isoformat() if n.created_at else None
    }


@router.get("/")
def get_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Notification).order_by(Notification.created_at.desc())
    if unread_only:
        query = query.filter(Notification.read == False)
    notifications = query.limit(30).all()
    return [format_notif(n) for n in notifications]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_notification(req: NotificationCreate, db: Session = Depends(get_db)):
    n = Notification(
        title=req.title,
        message=req.message,
        severity=req.severity or "INFO",
        user_id=req.user_id,
        read=False
    )
    db.add(n)
    db.commit()
    db.refresh(n)
    return format_notif(n)


@router.patch("/{notification_id}/read")
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.id == notification_id).first()
    if not n:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification {notification_id} not found"
        )
    n.read = True
    db.commit()
    db.refresh(n)
    return format_notif(n)


@router.patch("/read-all")
def mark_all_notifications_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.read == False).update({"read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
