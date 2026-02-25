# app/routes/profile.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.profile_controller import ProfileController
from app.schemas.user import UserUpdate, UserRead
from app.models.user import User

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    controller = ProfileController(db)
    return controller.get_profile(current_user.id, current_user.id)

@router.put("/me")
async def update_my_profile(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    controller = ProfileController(db)
    return controller.update_profile(current_user.id, body)

@router.get("/{user_id}")
async def get_user_profile(
    user_id: str, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    controller = ProfileController(db)
    return controller.get_profile(user_id, current_user.id)
