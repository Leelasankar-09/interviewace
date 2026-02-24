from fastapi import APIRouter
from pydantic import BaseModel
from services.ai_service import evaluate_answer

router = APIRouter(prefix="/behavioral", tags=["behavioral"])

class EvalRequest(BaseModel):
    question: str
    answer: str
    round_type: str = "Behavioral"

@router.post("/evaluate")
def evaluate(body: EvalRequest):
    return evaluate_answer(body.question, body.answer, body.round_type)

@router.get("/questions")
def get_questions(role: str = "Software Engineer", round_type: str = "Behavioral"):
    return {
        "questions": [
            {"id": 1, "text": "Tell me about yourself.", "type": "HR", "companies": ["Google", "Amazon"]},
            {"id": 2, "text": "Describe a challenging project.", "type": "Behavioral", "companies": ["Microsoft", "Meta"]},
            {"id": 3, "text": "How do you handle tight deadlines?", "type": "Behavioral", "companies": ["Flipkart", "Swiggy"]},
            {"id": 4, "text": "Describe a conflict with a colleague.", "type": "Behavioral", "companies": ["Amazon"]},
            {"id": 5, "text": "What's your biggest achievement?", "type": "HR", "companies": ["Google", "Tesla"]},
        ]
    }
