from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user_model import User
from app.repositories.user_repository import UserRepository
from app.core.security import (
    get_password_hash, verify_password, create_access_token, 
    create_refresh_token, create_verification_token, create_reset_token,
    decode_token
)
from app.schemas.auth_schema import TokenResponse
import datetime

class AuthController:
    @staticmethod
    def register(db: Session, body) -> dict:
        existing = UserRepository.get_by_email(db, body.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(
            name=body.name,
            email=body.email,
            password_hash=get_password_hash(body.password),
            target_role=body.targetRole,
            college=body.college,
        )
        UserRepository.create(db, user)

        # Generate verification token
        user.verification_token = create_verification_token({"sub": user.id})
        UserRepository.save(db)
        # Note: In a real production app, an email with this token would be sent here.

    @staticmethod
    def login(db: Session, body) -> dict:
        user = UserRepository.get_by_email(db, body.email)
        
        # Check lockout
        if user and user.lockout_until and user.lockout_until > datetime.datetime.utcnow():
            diff = user.lockout_until - datetime.datetime.utcnow()
            minutes = int(diff.total_seconds() / 60) + 1
            raise HTTPException(status_code=429, detail=f"Account locked. Try again in {minutes} minutes.")

        if not user or not verify_password(body.password, user.password_hash):
            if user:
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= 5:
                    user.lockout_until = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
                UserRepository.save(db)
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Success: Reset security flags
        user.failed_login_attempts = 0
        user.lockout_until = None
        
        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})
        
        user.hashed_refresh_token = get_password_hash(refresh_token)
        UserRepository.save(db)

        return {
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }

    @staticmethod
    def refresh(db: Session, refresh_token: str) -> dict:
        from jose import jwt, JWTError
        from app.core.security import SECRET, ALGORITHM
        
        try:
            payload = jwt.decode(refresh_token, SECRET, algorithms=[ALGORITHM])
            if payload.get("type") != "refresh":
                raise HTTPException(status_code=401, detail="Invalid token type")
            user_id = payload.get("sub")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

        user = UserRepository.get_by_id(db, user_id)
        if not user or not user.hashed_refresh_token:
            raise HTTPException(status_code=401, detail="User session not found")

        if not verify_password(refresh_token, user.hashed_refresh_token):
            user.hashed_refresh_token = None
            UserRepository.save(db)
            raise HTTPException(status_code=401, detail="Invalid session")

        new_access = create_access_token({"sub": user.id})
        new_refresh = create_refresh_token({"sub": user.id})
        
        user.hashed_refresh_token = get_password_hash(new_refresh)
        UserRepository.save(db)

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "user": user.to_dict()
        }

    @staticmethod
    def verify_email(db: Session, token: str) -> dict:
        payload = decode_token(token)
        if not payload or payload.get("type") != "verification":
            raise HTTPException(status_code=400, detail="Invalid verification token")
        
        user = UserRepository.get_by_id(db, payload.get("sub"))
        if not user or user.verification_token != token:
            raise HTTPException(status_code=400, detail="User not found or token mismatch")
        
        user.is_verified = True
        user.verification_token = None
        UserRepository.save(db)
        return {"message": "Email verified successfully"}

    @staticmethod
    def forgot_password(db: Session, email: str) -> dict:
        user = UserRepository.get_by_email(db, email)
        if not user:
            # We don't want to leak if a user exists, but for better DX in dev:
            return {"message": "If this email is registered, a reset link will be sent."}
        
        token = create_reset_token({"sub": user.id})
        user.reset_token = token
        UserRepository.save(db)
        # Note: Send email here in production
        return {"message": "Reset token generated", "token": token} # Token returned for dev ease

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str) -> dict:
        payload = decode_token(token)
        if not payload or payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        user = UserRepository.get_by_id(db, payload.get("sub"))
        if not user or user.reset_token != token:
            raise HTTPException(status_code=400, detail="Invalid reset session")
        
        user.password_hash = get_password_hash(new_password)
        user.reset_token = None
        # Invalidate existing refresh tokens to force re-login on all devices
        user.hashed_refresh_token = None 
        UserRepository.save(db)
        return {"message": "Password reset successfully"}
