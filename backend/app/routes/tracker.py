# app/routes/tracker.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.core.database import get_db
from app.routes.auth import get_current_user
from app.models.user_model import User
from app.models.tracker_model import JobApplication, ApplicationStatus

router = APIRouter(prefix="/tracker", tags=["tracker"])

class TrackerInput(BaseModel):
    company: str
    role: str
    status: Optional[str] = "Applied"
    notes: Optional[str] = None

@router.post("/", response_model=dict)
def add_application(body: TrackerInput, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = JobApplication(
        user_id=current_user.id,
        company=body.company,
        role=body.role,
        status=body.status,
        notes=body.notes
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"message": "Application tracked", "id": app.id}

@router.get("/", response_model=List[dict])
def get_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    apps = db.query(JobApplication).filter_by(user_id=current_user.id).all()
    return [{"id": a.id, "company": a.company, "role": a.role, "status": a.status, "date": a.applied_date} for a in apps]

@router.put("/{app_id}")
def update_status(app_id: str, status: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    app = db.query(JobApplication).filter_by(id=app_id, user_id=current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = status
    db.commit()
    return {"message": "Status updated"}
