# app/controllers/resume_controller.py
from sqlalchemy.orm import Session
from app.services.resume_parser import resume_parser
from app.services.ai_service import ai_service
from app.models.resume_scan import ResumeScan
from fastapi import UploadFile, HTTPException

class ResumeController:
    def __init__(self, db: Session):
        self.db = db

    async def scan_resume(self, user_id: str, file: UploadFile, job_description: str = ""):
        # 1. Parse File
        content = await file.read()
        text = resume_parser.parse_file(content, file.filename)
        if not text:
            raise HTTPException(status_code=400, detail="Could not parse resume file")

        # 2. AI Scan
        report = await ai_service.rate_resume_ats(text, job_description)
        
        # 3. Save to DB
        scan = ResumeScan(
            user_id=user_id,
            file_url=file.filename, # In prod, would be Cloudinary URL
            ats_score=report.get("ats_score", 0),
            sections=report.get("section_analysis"),
            keyword_gaps=report.get("missing_keywords"),
            overall_suggestions=report.get("suggestions"),
            job_description=job_description
        )
        self.db.add(scan)
        self.db.commit()
        self.db.refresh(scan)
        
        return {
            "id": scan.id,
            "report": report
        }

    def get_history(self, user_id: str):
        return self.db.query(ResumeScan).filter_by(
            user_id=user_id
        ).order_by(ResumeScan.created_at.desc()).all()
