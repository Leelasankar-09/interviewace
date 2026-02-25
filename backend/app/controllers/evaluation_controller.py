# app/controllers/evaluation_controller.py
from sqlalchemy.orm import Session
from app.repositories.evaluation_repository import EvaluationRepository
from app.services.ai_service import ai_service
from fastapi import HTTPException

class EvaluationController:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EvaluationRepository(db)

    async def evaluate_answer(self, user_id: str, data: dict):
        # 1. AI Evaluation
        try:
            ai_report = await ai_service.evaluate_interview_response(
                question=data.get("question"),
                answer=data.get("answer"),
                context=data.get("round_type")
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Evaluation failed: {str(e)}")

        # 2. Map AI Report to DB Model
        scores = ai_report.get("scores", {})
        db_data = {
            "user_id": user_id,
            "question": data.get("question"),
            "answer": data.get("answer"),
            "round_type": data.get("round_type"),
            "role": data.get("role"),
            "company": data.get("company"),
            "difficulty": data.get("difficulty"),
            "eval_type": data.get("eval_type", "text"),
            
            "score_relevance": scores.get("relevance", 0),
            "score_star_structure": scores.get("star", 0),
            "score_clarity": scores.get("clarity", 0),
            "score_tone_confidence": scores.get("tone_confidence", scores.get("tone", 0)),
            "score_depth": scores.get("depth", 0),
            "score_specificity": scores.get("specificity", 0),
            "score_vocabulary": scores.get("vocabulary", 0),
            "score_impact_results": scores.get("impact_results", scores.get("impact", 0)),
            "score_filler_control": scores.get("filler_control", 0),
            "score_pacing": scores.get("pacing", 0),
            "score_conciseness": scores.get("conciseness", 0),
            "score_enthusiasm": scores.get("enthusiasm", 0),
            
            "overall_score": ai_report.get("overall_score", 0),
            "score_band": self._get_score_band(ai_report.get("overall_score", 0)),
            "suggestions": ai_report.get("feedback", {}).get("improvements", []),
            "sample_answer": ai_report.get("sample_answer", ""), # Might be in a different field
            "power_words": ai_report.get("power_words", []),
            "filler_words_detected": ai_report.get("local_nlp", {}).get("fillers", []),
            "duration_seconds": data.get("duration_seconds", 0)
        }
        
        # 3. Save to Repo
        session = self.repo.create_session(db_data)
        
        return {
            "session_id": session.id,
            "report": ai_report
        }

    def _get_score_band(self, score: float) -> str:
        if score >= 85: return "Excellent"
        if score >= 70: return "Good"
        if score >= 50: return "Average"
        return "Poor"

    def get_history(self, user_id: str):
        return self.repo.get_user_history(user_id)
