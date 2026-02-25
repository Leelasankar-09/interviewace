# app/services/resume_parser.py
import PyPDF2
import docx
import io
import logging

logger = logging.getLogger(__name__)

class ResumeParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes) -> str:
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        except Exception as e:
            logger.error(f"Failed to parse PDF: {str(e)}")
            return ""

    @staticmethod
    def parse_docx(file_bytes: bytes) -> str:
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            text = ""
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Failed to parse DOCX: {str(e)}")
            return ""

    @staticmethod
    def parse_file(file_bytes: bytes, filename: str) -> str:
        if filename.lower().endswith(".pdf"):
            return ResumeParser.parse_pdf(file_bytes)
        elif filename.lower().endswith(".docx"):
            return ResumeParser.parse_docx(file_bytes)
        else:
            return ""

resume_parser = ResumeParser()
