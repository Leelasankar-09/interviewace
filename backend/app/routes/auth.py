# app/routes/auth.py
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.auth_controller import AuthController
from app.schemas.auth import (
    LoginRequest, RegisterRequest, TokenResponse, 
    RefreshRequest, VerifyEmailRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    controller = AuthController(db)
    return await controller.register(body)

@router.post("/login", response_model=TokenResponse)
async def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    controller = AuthController(db)
    return await controller.login(body, request.client.host)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    controller = AuthController(db)
    return await controller.refresh(body.refresh_token)

@router.post("/verify")
async def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)):
    controller = AuthController(db)
    return await controller.verify_email(body.token)

@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    controller = AuthController(db)
    return await controller.forgot_password(body.email)

@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    controller = AuthController(db)
    return await controller.reset_password(body.token, body.new_password)

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    controller = AuthController(db)
    return await controller.logout(current_user.id)

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"user": current_user.to_dict()}
