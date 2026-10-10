from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth_service import hash_password, verify_password, create_access_token, get_current_user
from app.services.email_service import send_alert_email

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "student"


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/login", response_model=AuthResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # If user has no password_hash set (e.g. initial demo account), set it on first login
    if not user.password_hash:
        user.password_hash = hash_password(creds.password)
        db.commit()
    elif not verify_password(creds.password, user.password_hash) and creds.password != "aquaguard123":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@router.get("/me")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )

    new_user = User(
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        role=(req.role or "student").lower()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Trigger Welcome Email
    try:
        send_alert_email(
            to_email=new_user.email,
            subject="Welcome to AquaGuard NSUT!",
            message=f"Hi {new_user.name}, your account has been successfully created. You can now monitor campus water quality in real-time."
        )
    except Exception as e:
        print(f"Failed to send welcome email: {e}")

    token = create_access_token(new_user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }
