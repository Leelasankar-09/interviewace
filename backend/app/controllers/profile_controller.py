# app/controllers/profile_controller.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate
from app.models.user import User

class ProfileController:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)

    def get_profile(self, user_id: str, current_user_id: str = None) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Privacy constraints
        is_owner = current_user_id == user_id
        
        profile_data = user.to_dict()
    
        fields = [
            ("college", user.is_college_public),
            ("cgpa", user.is_cgpa_public),
            ("email", user.is_email_public),
            ("target_role", True),
            ("target_companies", True),
            ("bio", True),
            ("avatar_url", True),
            ("linkedin_url", True),
            ("github_url", True),
            ("portfolio_url", True),
            ("twitter_url", True),
            ("leetcode_username", True),
            ("codeforces_username", True),
            ("codechef_username", True),
            ("gfg_username", True),
            ("hackerrank_username", True),
            ("atcoder_username", True),
        ]
        
        result = {
            "id": user.id,
            "name": user.name,
            "role": user.role,
        }
        
        for field, is_public in fields:
            if is_owner or is_public:
                val = getattr(user, field, None)
                result[field] = val if val is not None else ""
        
        # Profile Strength Meter (simple heuristic)
        filled_fields = 0
        total_fields = len(fields)
        for field, _ in fields:
            if getattr(user, field, None):
                filled_fields += 1
        
        result["profile_strength"] = int((filled_fields / total_fields) * 100)
        
        return result

    def update_profile(self, user_id: str, update_data: UserUpdate) -> dict:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        data = update_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(user, key, value)
        
        self.db.commit()
        return {"message": "Profile updated successfully", "user": self.get_profile(user_id, user_id)}
