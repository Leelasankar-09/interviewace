# app/routes/resume.py
from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.controllers.resume_controller import ResumeController
from app.models.user import User

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/scan")
async def scan_resume(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    controller = ResumeController(db)
    return await controller.scan_resume(current_user.id, file, job_description)

@router.get("/history")
async def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    controller = ResumeController(db)
    return controller.get_history(current_user.id)

@router.get("/templates")
async def get_templates():
    return [
        {"name": "Software Engineer", "role": "SWE", "url": "#"},
        {"name": "Data Scientist", "role": "DS", "url": "#"},
        {"name": "Product Manager", "role": "PM", "url": "#"}
    ]
