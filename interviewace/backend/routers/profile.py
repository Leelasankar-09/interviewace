"""
Profile router — full CRUD with DB, protected via JWT.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.user_model import User
from routers.auth import get_current_user, user_dict

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    cgpa: Optional[str] = None
    target_role: Optional[str] = None
    avatar_url: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    is_public: Optional[bool] = None


@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {"profile": user_dict(current_user)}


@router.put("/me")
def update_my_profile(
    body: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == current_user.id).first()
    for field, val in body.dict(exclude_none=True).items():
        setattr(user, field, val)
    db.commit()
    db.refresh(user)
    return {"profile": user_dict(user)}


@router.get("/{user_id}")
def get_public_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_public:
        raise HTTPException(status_code=403, detail="Profile is private")
    return {"profile": user_dict(user)}
