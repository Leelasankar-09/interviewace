from fastapi import APIRouter, UploadFile, File, Form
from services.ai_service import rate_resume_ats
import io

router = APIRouter(prefix="/resume", tags=["resume"])

async def extract_text(file: UploadFile) -> str:
    content = await file.read()
    if file.filename.endswith(".pdf"):
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            return " ".join(page.extract_text() for page in reader.pages)
        except: return "PDF parsing failed"
    elif file.filename.endswith(".docx"):
        try:
            import docx
            doc = docx.Document(io.BytesIO(content))
            return " ".join(para.text for para in doc.paragraphs)
        except: return "DOCX parsing failed"
    return content.decode("utf-8", errors="ignore")

@router.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), job_description: str = Form("")):
    resume_text = await extract_text(file)
    result = rate_resume_ats(resume_text, job_description)
    return result

@router.get("/templates")
def get_templates():
    return [
        {"name": "Software Engineer", "description": "ATS-friendly SWE template", "url": "/templates/swe.pdf"},
        {"name": "Data Scientist", "description": "ML/Data Science template", "url": "/templates/ds.pdf"},
        {"name": "Product Manager", "description": "PM-optimized template", "url": "/templates/pm.pdf"},
    ]
