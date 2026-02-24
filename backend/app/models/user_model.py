from sqlalchemy import Column, String, Text, DateTime, Float, Integer, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


def _uuid():
    return uuid.uuid4().hex


class User(Base):
    __tablename__ = "users"

    id            = Column(String(32), primary_key=True, default=_uuid)
    name          = Column(String(120),  nullable=False)
    email         = Column(String(255),  nullable=False, unique=True, index=True)
    password_hash     = Column(String(255),  nullable=False)
    role              = Column(String(20),   default="user", index=True)  # user, admin, premium
    hashed_refresh_token = Column(String(255), nullable=True)
    bio               = Column(Text,         nullable=True)
    target_role       = Column(String(120),  nullable=True)
    target_companies  = Column(Text,         nullable=True)  # Comma separated
    college           = Column(String(200),  nullable=True)
    cgpa              = Column(String(10),   nullable=True)
    
    # Social Links
    linkedin_url      = Column(String(300),  nullable=True)
    github_url        = Column(String(300),  nullable=True)
    portfolio_url     = Column(String(300),  nullable=True)
    twitter_url       = Column(String(300),  nullable=True)
    avatar_url        = Column(Text,         nullable=True)
    
    # Platform Usernames
    leetcode_username   = Column(String(100),  nullable=True)
    codeforces_username = Column(String(100),  nullable=True)
    codechef_username   = Column(String(100),  nullable=True)
    gfg_username        = Column(String(100),  nullable=True)
    hackerrank_username = Column(String(100),  nullable=True)
    atcoder_username    = Column(String(100),  nullable=True)

    # Privacy Toggles
    is_public           = Column(Boolean,      default=True)
    is_college_public   = Column(Boolean,      default=True)
    is_cgpa_public      = Column(Boolean,      default=True)
    is_scores_public    = Column(Boolean,      default=True)
    is_streak_public    = Column(Boolean,      default=True)
    is_email_public     = Column(Boolean,      default=False)
    
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "bio": self.bio or "",
            "target_role": self.target_role or "",
            "target_companies": self.target_companies or "",
            "college": self.college or "",
            "cgpa": self.cgpa or "",
            "avatar_url": self.avatar_url or "",
            
            # Socials
            "linkedin_url": self.linkedin_url or "",
            "github_url": self.github_url or "",
            "portfolio_url": self.portfolio_url or "",
            "twitter_url": self.twitter_url or "",
            
            # Platforms
            "leetcode_username": self.leetcode_username or "",
            "codeforces_username": self.codeforces_username or "",
            "codechef_username": self.codechef_username or "",
            "gfg_username": self.gfg_username or "",
            "hackerrank_username": self.hackerrank_username or "",
            "atcoder_username": self.atcoder_username or "",

            # Privacy
            "is_public": self.is_public,
            "is_college_public": self.is_college_public,
            "is_cgpa_public": self.is_cgpa_public,
            "is_scores_public": self.is_scores_public,
            "is_streak_public": self.is_streak_public,
            "is_email_public": self.is_email_public,
            
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    # Security & Verification
    failed_login_attempts = Column(Integer, default=0)
    lockout_until = Column(DateTime, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
