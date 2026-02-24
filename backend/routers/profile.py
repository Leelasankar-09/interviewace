from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    name: str = None
    bio: str = None
    college: str = None
    cgpa: str = None
    targetRole: str = None
    targetCompanies: str = None
    linkedin: str = None
    github: str = None
    portfolio: str = None
    twitter: str = None
    privacy: dict = {}

@router.get("/me")
def get_profile():
    return {"profile": {}}

@router.put("/me")
def update_profile(body: ProfileUpdate):
    return {"message": "Profile updated", "profile": body.dict()}

@router.get("/{user_id}")
def get_public_profile(user_id: str):
    return {"profile": {}}
