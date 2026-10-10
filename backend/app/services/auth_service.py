import hashlib
import secrets
from typing import Optional, List
from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User

# In-memory session store mapping token -> user_id
ACTIVE_SESSIONS: dict[str, int] = {}


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password


def create_access_token(user_id: int) -> str:
    token = secrets.token_hex(32)
    ACTIVE_SESSIONS[token] = user_id
    return token


def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_role: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    # 1. Bearer token lookup
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        user_id = ACTIVE_SESSIONS.get(token)
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user



    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated"
    )


def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = (current_user.role or "").lower()
        allowed_normalized = [r.lower() for r in allowed_roles]
        if user_role not in allowed_normalized and "admin" not in user_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles} roles. Your role is '{current_user.role}'."
            )
        return current_user
    return role_checker
