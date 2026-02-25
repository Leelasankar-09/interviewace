"""
Resume ATS router — analyze resume with AI, persist results to DB.
"""
from fastapi import APIRouter, UploadFile, File, Form, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
import io

from database import get_db
from models.analytics_model import ResumeAnalysis
from routers.auth import get_current_user, get_optional_user
from models.user_model import User
from services.ai_service import rate_resume_ats

router = APIRouter(prefix="/resume", tags=["resume"])


async def extract_text(file: UploadFile) -> str:
    content = await file.read()
    if file.filename.endswith(".pdf"):
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            return " ".join(page.extract_text() for page in reader.pages)
        except Exception:
            return "PDF parsing failed"
    elif file.filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            return " ".join(para.text for para in doc.paragraphs)
        except Exception:
            return "DOCX parsing failed"
    return content.decode("utf-8", errors="ignore")


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(""),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    resume_text = await extract_text(file)
    result = rate_resume_ats(resume_text, job_description)

    user_id = current_user.id if current_user else None

    analysis = ResumeAnalysis(
        user_id=user_id,
        filename=file.filename,
        ats_score=result.get("ats_score"),
        analysis_json=result,
        job_description=job_description or None,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    result["analysis_id"] = analysis.id
    return result


@router.get("/history")
def get_history(
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.user_id == current_user.id
    ).order_by(desc(ResumeAnalysis.created_at))
    total = q.count()
    analyses = q.offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "analyses": [
            {
                "id": a.id,
                "filename": a.filename,
                "ats_score": a.ats_score,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in analyses
        ],
    }


@router.get("/history/{analysis_id}")
def get_analysis_detail(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    a = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.id == analysis_id,
        ResumeAnalysis.user_id == current_user.id,
    ).first()
    if not a:
        return {"error": "Analysis not found"}
    return {
        "id": a.id, "filename": a.filename, "ats_score": a.ats_score,
        "analysis_json": a.analysis_json,
        "job_description": a.job_description,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }


@router.get("/templates")
def get_templates():
    return [
        {"name": "Software Engineer", "description": "ATS-friendly SWE template", "url": "/templates/swe.pdf"},
        {"name": "Data Scientist", "description": "ML/Data Science template", "url": "/templates/ds.pdf"},
        {"name": "Product Manager", "description": "PM-optimized template", "url": "/templates/pm.pdf"},
    ]
