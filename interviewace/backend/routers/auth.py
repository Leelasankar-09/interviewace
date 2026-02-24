from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
import os, datetime

router = APIRouter(prefix="/auth", tags=["auth"])
pwd_ctx = CryptContext(schemes=["bcrypt"])
oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
SECRET = os.getenv("JWT_SECRET", "dev-secret")

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str
    targetRole: str = ""
    college: str = ""

class LoginInput(BaseModel):
    email: str
    password: str

def create_token(data: dict):
    exp = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    return jwt.encode({**data, "exp": exp}, SECRET, algorithm="HS256")

@router.post("/register")
def register(body: RegisterInput):
    # TODO: Check DB for existing user, save new user
    hashed = pwd_ctx.hash(body.password)
    token = create_token({"sub": body.email, "name": body.name})
    return {
        "access_token": token,
        "user": {"name": body.name, "email": body.email, "targetRole": body.targetRole, "college": body.college}
    }

@router.post("/login")
def login(body: LoginInput):
    # TODO: Verify from DB
    if body.email == "demo@interviewace.com" and body.password == "demo123":
        token = create_token({"sub": body.email, "name": "Demo User"})
        return {"access_token": token, "user": {"name": "Demo User", "email": body.email, "targetRole": "Software Engineer"}}
    raise HTTPException(status_code=401, detail="Invalid credentials")
