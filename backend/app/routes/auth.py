from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository
from app.controllers.auth_controller import AuthController
from app.schemas.auth_schema import (
    LoginInput, RegisterInput, TokenResponse, 
    RefreshInput, ProfileUpdateInput, ForgotPasswordInput, ResetPasswordInput
)
from app.models.user_model import User
from fastapi import HTTPException

router = APIRouter(prefix="/auth", tags=["auth"])

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_optional_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    try:
        return get_current_user(authorization, db)
    except HTTPException:
        return None

@router.post("/register")
def register(body: RegisterInput, db: Session = Depends(get_db)):
    AuthController.register(db, body)
    return {"message": "Registration successful. Please check your email for verification."}

@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    return AuthController.verify_email(db, token)

@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordInput, db: Session = Depends(get_db)):
    return AuthController.forgot_password(db, body.email)

@router.post("/reset-password")
def reset_password(body: ResetPasswordInput, db: Session = Depends(get_db)):
    return AuthController.reset_password(db, body.token, body.new_password)

@router.post("/login", response_model=TokenResponse)
def login(body: LoginInput, db: Session = Depends(get_db)):
    return AuthController.login(db, body)

@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshInput, db: Session = Depends(get_db)):
    return AuthController.refresh(db, body.refresh_token)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.hashed_refresh_token = None
    UserRepository.save(db)
    return {"message": "Logged out successfully"}

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"user": current_user.to_dict()}

@router.put("/profile")
def update_profile(body: ProfileUpdateInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for field, val in body.dict(exclude_none=True).items():
        setattr(current_user, field, val)
    UserRepository.save(db)
    return {"user": current_user.to_dict()}
