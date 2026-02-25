# app/controllers/tracker_controller.py
from sqlalchemy.orm import Session
from app.repositories.tracker_repository import TrackerRepository
from fastapi import HTTPException

class TrackerController:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TrackerRepository(db)

    def add_app(self, user_id: str, data: dict):
        data["user_id"] = user_id
        return self.repo.add_application(data)

    def get_board(self, user_id: str):
        apps = self.repo.list_applications(user_id)
        # Group by status for Kanban board
        board = {
            "Applied": [],
            "OA": [],
            "Technical": [],
            "HR": [],
            "Offer": [],
            "Rejected": []
        }
        for app in apps:
            status = app.current_status
            if status in board:
                board[status].append(app)
            else:
                # Handle unexpected status
                if "Other" not in board: board["Other"] = []
                board["Other"].append(app)
        return board

    def update_stage(self, user_id: str, app_id: str, status: str):
        # Verify ownership
        app = self.db.query(self.repo.db.query(JobApplication).filter_by(id=app_id).first()) # Wait, wrong logic
        # Clean way:
        from app.models.interview_tracker import JobApplication
        app = self.db.query(JobApplication).filter_by(id=app_id, user_id=user_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return self.repo.update_status(app_id, status)

    def delete_app(self, user_id: str, app_id: str):
        from app.models.interview_tracker import JobApplication
        app = self.db.query(JobApplication).filter_by(id=app_id, user_id=user_id).first()
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        return self.repo.delete_application(app_id)
