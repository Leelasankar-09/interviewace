from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.core.security import (
    get_password_hash, verify_password, create_access_token, 
    create_refresh_token, create_verification_token, create_reset_token,
    decode_token
)
from app.services.email_service import email_service
import datetime

class AuthController:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, body) -> dict:
        existing = self.user_repo.get_by_email(body.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user_data = {
            "name": body.name,
            "email": body.email,
            "password_hash": get_password_hash(body.password),
            "target_role": getattr(body, 'target_role', None),
            "college": getattr(body, 'college', None),
            "is_verified": False,
            "is_active": True
        }
        
        user = self.user_repo.create(user_data)

        # Generate verification token
        user.verification_token = create_verification_token({"sub": user.id})
        self.db.commit()
        
        # Call email service
        await email_service.send_verification_email(user.email, user.verification_token)
        
        return {"message": "Registration successful. Please verify your email.", "user_id": user.id}

    async def login(self, body, ip: str) -> dict:
        user = self.user_repo.get_by_email(body.email)
        
        # Check lockout
        if user and user.lockout_until and user.lockout_until > datetime.datetime.utcnow():
            diff = user.lockout_until - datetime.datetime.utcnow()
            minutes = int(diff.total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
                detail=f"Account locked. Try again in {minutes} minutes."
            )

        if not user or not verify_password(body.password, user.password_hash):
            if user:
                user.failed_login_attempts += 1
                if user.failed_login_attempts >= 5:
                    user.lockout_until = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
                self.db.commit()
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Success: Reset security flags
        user.failed_login_attempts = 0
        user.lockout_until = None
        user.last_login = datetime.datetime.utcnow()
        
        access_token = create_access_token({"sub": user.id, "role": user.role})
        refresh_token = create_refresh_token({"sub": user.id})
        
        user.hashed_refresh_token = get_password_hash(refresh_token)
        self.db.commit()

        return {
            "access_token": access_token, 
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }

    async def refresh(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
            
        user_id = payload.get("sub")
        user = self.user_repo.get_by_id(user_id)
        
        if not user or not user.hashed_refresh_token:
            raise HTTPException(status_code=401, detail="User session not found")

        if not verify_password(refresh_token, user.hashed_refresh_token):
            user.hashed_refresh_token = None
            self.db.commit()
            raise HTTPException(status_code=401, detail="Invalid session - potential token reuse detected")

        new_access = create_access_token({"sub": user.id, "role": user.role})
        new_refresh = create_refresh_token({"sub": user.id})
        
        user.hashed_refresh_token = get_password_hash(new_refresh)
        self.db.commit()

        return {
            "access_token": new_access,
            "refresh_token": new_refresh,
            "user": user.to_dict()
        }

    async def logout(self, user_id: str) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if user:
            user.hashed_refresh_token = None
            self.db.commit()
        return {"message": "Logged out successfully"}

    async def verify_email(self, token: str) -> dict:
        payload = decode_token(token)
        if not payload or payload.get("type") != "verification":
            raise HTTPException(status_code=400, detail="Invalid verification token")
        
        user = self.user_repo.get_by_id(payload.get("sub"))
        if not user or user.verification_token != token:
            raise HTTPException(status_code=400, detail="User not found or token mismatch")
        
        user.is_verified = True
        user.verification_token = None
        self.db.commit()
        return {"message": "Email verified successfully"}

    async def forgot_password(self, email: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            return {"message": "If this email is registered, a reset link will be sent."}
        
        token = create_reset_token({"sub": user.id})
        user.reset_token = token
        self.db.commit()
        # Send email
        await email_service.send_password_reset(user.email, token)
        
        return {"message": "Reset link sent", "debug_token": token}

    async def reset_password(self, token: str, new_password: str) -> dict:
        payload = decode_token(token)
        if not payload or payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        user = self.user_repo.get_by_id(payload.get("sub"))
        if not user or user.reset_token != token:
            raise HTTPException(status_code=400, detail="Invalid reset session")
        
        user.password_hash = get_password_hash(new_password)
        user.reset_token = None
        user.hashed_refresh_token = None 
        self.db.commit()
        return {"message": "Password reset successfully"}
