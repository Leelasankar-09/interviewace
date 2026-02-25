# app/controllers/study_plan_controller.py
from sqlalchemy.orm import Session
from app.services.ai_service import ai_service
from app.models.study_plan import StudyPlan, ReadinessScore
from fastapi import HTTPException

class StudyPlanController:
    def __init__(self, db: Session):
        self.db = db

    async def generate_plan(self, user_id: str, role: str, target_date: str):
        # 1. Get user weak areas from recent evaluations
        from app.models.evaluation_session import EvaluationSession
        evals = self.db.query(EvaluationSession).filter_by(user_id=user_id).limit(5).all()
        
        weak_areas = []
        for e in evals:
            # Simple heuristic: if score < 7 for a category
            categories = {
                "STAR": e.score_star_structure,
                "Clarity": e.score_clarity,
                "Tone": e.score_tone_confidence,
                "Depth": e.score_depth,
                "Impact": e.score_impact_results
            }
            for cat, score in categories.items():
                if score < 7 and cat not in weak_areas:
                    weak_areas.append(cat)

        # 2. Call AI
        plan_data = await ai_service.generate_study_plan(
            target_role=role,
            timeframe=f"until {target_date}",
            weak_areas=", ".join(weak_areas)
        )

        # 3. Save to DB
        plan = StudyPlan(
            user_id=user_id,
            role=role,
            target_date=target_date, # Should parse date
            weak_areas=weak_areas,
            plan=plan_data.get("weekly_milestones")
        )
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        
        return plan

    def get_latest_plan(self, user_id: str):
        return self.db.query(StudyPlan).filter_by(user_id=user_id).order_by(StudyPlan.created_at.desc()).first()
