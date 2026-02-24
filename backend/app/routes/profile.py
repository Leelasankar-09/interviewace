"""
Profile router — full CRUD with DB, protected via JWT.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.models.user_model import User
from app.schemas.auth_schema import ProfileUpdateInput
from app.routes.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me")
def get_my_profile(current_user: User = Depends(get_current_user)):
    return {"profile": current_user.to_dict()}


@router.put("/me")
def update_my_profile(
    body: ProfileUpdateInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == current_user.id).first()
    for field, val in body.dict(exclude_none=True).items():
        setattr(user, field, val)
    db.commit()
    db.refresh(user)
    return {"profile": user.to_dict()}


@router.get("/{user_id}")
def get_public_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_public:
        raise HTTPException(status_code=403, detail="Profile is private")
    return {"profile": user.to_dict()}
