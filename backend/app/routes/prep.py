# app/routes/prep.py
from fastapi import APIRouter, Depends
from app.services.ai_service import ai_service
from app.routes.auth import get_current_user
from app.models.user_model import User

router = APIRouter(prefix="/prep", tags=["prep"])

@router.get("/company/{company_name}")
async def get_company_prep(company_name: str, current_user: User = Depends(get_current_user)):
    # role defaults to the user's target role or "Software Engineer"
    role = current_user.target_role or "Software Engineer"
    return await ai_service.get_company_preparation(company_name, role)
