from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt, JWTError
import os, datetime
from typing import Optional

from database import get_db
from models.user_model import User

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-prod")
ALGORITHM = "HS256"

# ── Schemas ────────────────────────────────────────────────────
class RegisterInput(BaseModel):
    name: str
    email: str
    password: str
    targetRole: str = ""
    college: str = ""

class LoginInput(BaseModel):
    email: str
    password: str

class ProfileUpdateInput(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    cgpa: Optional[str] = None
    target_role: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    is_public: Optional[bool] = None

# ── Helpers ────────────────────────────────────────────────────
def create_token(data: dict):
    exp = datetime.datetime.utcnow() + datetime.timedelta(days=30)
    return jwt.encode({**data, "exp": exp}, SECRET, algorithm=ALGORITHM)

def user_dict(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "targetRole": user.target_role or "",
        "college": user.college or "",
        "cgpa": user.cgpa or "",
        "bio": user.bio or "",
        "avatar": user.avatar_url or "",
        "linkedin": user.linkedin or "",
        "github": user.github or "",
        "portfolio": user.portfolio or "",
        "is_public": user.is_public,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """JWT dependency — raises 401 if invalid."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
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
@router.post("/register")
def register(body: RegisterInput, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=body.name,
        email=body.email,
        hashed_pw=pwd_ctx.hash(body.password),
        target_role=body.targetRole,
        college=body.college,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token({"sub": user.id, "email": user.email, "name": user.name})
    return {"access_token": token, "user": user_dict(user)}

# ── Login ──────────────────────────────────────────────────────
@router.post("/login")
def login(body: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not pwd_ctx.verify(body.password, user.hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": user.id, "email": user.email, "name": user.name})
    return {"access_token": token, "user": user_dict(user)}

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
