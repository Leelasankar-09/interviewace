from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
import datetime, secrets
from typing import Optional
from email_service import send_reset_email

from database import get_db
from models.user_model import User
from config import settings

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET = settings.JWT_SECRET
ALGORITHM = settings.JWT_ALGORITHM

class RefreshInput(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

# ── Helpers ────────────────────────────────────────────────────
def create_access_token(data: dict):
    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": exp, "type": "access"}, SECRET, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    exp = datetime.datetime.utcnow() + datetime.timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    return jwt.encode({**data, "exp": exp, "type": "refresh"}, SECRET, algorithm=ALGORITHM)

def get_password_hash(password: str):
    return pwd_ctx.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_ctx.verify(plain_password, hashed_password)

def user_dict(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "bio": user.bio or "",
        "target_role": user.target_role or "",
        "target_companies": user.target_companies or "",
        "college": user.college or "",
        "cgpa": user.cgpa or "",
        "avatar_url": user.avatar_url or "",
        
        # Socials
        "linkedin_url": user.linkedin_url or "",
        "github_url": user.github_url or "",
        "portfolio_url": user.portfolio_url or "",
        "twitter_url": user.twitter_url or "",
        
        # Platforms
        "leetcode_username": user.leetcode_username or "",
        "codeforces_username": user.codeforces_username or "",
        "codechef_username": user.codechef_username or "",
        "gfg_username": user.gfg_username or "",
        "hackerrank_username": user.hackerrank_username or "",
        "atcoder_username": user.atcoder_username or "",

        # Privacy
        "is_public": user.is_public,
        "is_college_public": user.is_college_public,
        "is_cgpa_public": user.is_cgpa_public,
        "is_scores_public": user.is_scores_public,
        "is_streak_public": user.is_streak_public,
        "is_email_public": user.is_email_public,
        
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """JWT dependency — raises 401 if invalid Access Token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_optional_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    """Optional JWT — returns None if not authenticated."""
    try:
        return get_current_user(authorization, db)
    except HTTPException:
        return None

# ── Register ───────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse)
def register(body: RegisterInput, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        password_hash=get_password_hash(body.password),
        target_role=body.targetRole,
        college=body.college,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    # Securely store hashed refresh token
    user.hashed_refresh_token = get_password_hash(refresh_token)
    db.commit()

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "user": user_dict(user)
    }

# ── Login ──────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(body: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    
    # Update refresh token in DB
    user.hashed_refresh_token = get_password_hash(refresh_token)
    db.commit()

    return {
        "access_token": access_token, 
        "refresh_token": refresh_token,
        "user": user_dict(user)
    }

# ── Refresh Token ──────────────────────────────────────────────
@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshInput, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(body.refresh_token, SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.hashed_refresh_token:
        raise HTTPException(status_code=401, detail="User session not found")

    # Verify matching refresh token
    if not verify_password(body.refresh_token, user.hashed_refresh_token):
        # Potential refresh token reuse attack? Clear session for safety
        user.hashed_refresh_token = None
        db.commit()
        raise HTTPException(status_code=401, detail="Invalid session")

    # Rotate both tokens
    new_access = create_access_token({"sub": user.id})
    new_refresh = create_refresh_token({"sub": user.id})
    
    user.hashed_refresh_token = get_password_hash(new_refresh)
    db.commit()

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "user": user_dict(user)
    }

# ── Logout ─────────────────────────────────────────────────────
@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.hashed_refresh_token = None
    db.commit()
    return {"message": "Logged out successfully"}

# ── Me ─────────────────────────────────────────────────────────
@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"user": user_dict(current_user)}

# ── Update Profile ─────────────────────────────────────────────
@router.put("/profile")
def update_profile(body: ProfileUpdateInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    for field, val in body.dict(exclude_none=True).items():
        setattr(user, field, val)
    db.commit()
    db.refresh(user)
    return {"user": user_dict(user)}

# ── Forgot Password ────────────────────────────────────────────
@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordInput, db: Session = Depends(get_db)):
    """
    Generates a password-reset token valid for 30 minutes.
    In production: send this link by email via SMTP/SendGrid.
    In dev: the reset link is returned in the JSON response.
    """
    user = db.query(User).filter(User.email == body.email).first()
    # Always return 200 to prevent email enumeration attacks
    if not user:
        return {"message": "If an account exists with that email, a reset link has been sent."}

    # Generate a cryptographically secure token
    token = secrets.token_urlsafe(32)
    expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    _reset_tokens[token] = {"user_id": user.id, "expires_at": expires}

    reset_url = f"http://localhost:5173/reset-password?token={token}"

    # Try to send real email; if SMTP not configured it logs to console and returns False
    email_sent = send_reset_email(to_email=user.email, name=user.name, reset_token=token)

    response = {"message": "If an account exists with that email, a reset link has been sent."}
    if not email_sent:
        # DEV ONLY — expose link directly when email is not configured
        response["reset_url"] = reset_url
    return response

# ── Reset Password ─────────────────────────────────────────────
@router.post("/reset-password")
def reset_password(body: ResetPasswordInput, db: Session = Depends(get_db)):
    """
    Accepts the one-time reset token and sets a new password.
    """
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    entry = _reset_tokens.get(body.token)
    if not entry:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if datetime.datetime.utcnow() > entry["expires_at"]:
        del _reset_tokens[body.token]
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    user = db.query(User).filter(User.id == entry["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = pwd_ctx.hash(body.new_password)
    db.commit()

    # Invalidate the token after use
    del _reset_tokens[body.token]

    return {"message": "Password updated successfully. Please log in with your new password."}

# ── Change Password (authenticated) ───────────────────────────
class ChangePasswordInput(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
def change_password(body: ChangePasswordInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Allows logged-in users to change their own password."""
    if not pwd_ctx.verify(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters.")
    current_user.hashed_pw = pwd_ctx.hash(body.new_password)
    db.commit()
    return {"message": "Password changed successfully."}
