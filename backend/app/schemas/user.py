# app/schemas/user.py
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    target_role: Optional[str] = None
    college: Optional[str] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[List[str]] = None
    college: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    avatar_url: Optional[str] = None
    
    # Social Links
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    twitter_url: Optional[str] = None
    
    # Platform Usernames
    leetcode_username: Optional[str] = None
    codeforces_username: Optional[str] = None
    codechef_username: Optional[str] = None
    gfg_username: Optional[str] = None
    hackerrank_username: Optional[str] = None
    atcoder_username: Optional[str] = None
    
    # Privacy Toggles
    is_college_public: Optional[bool] = None
    is_cgpa_public: Optional[bool] = None
    is_scores_public: Optional[bool] = None
    is_streak_public: Optional[bool] = None
    is_email_public: Optional[bool] = None

class UserRead(UserBase):
    id: str
    role: str
    bio: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[List[str]] = None
    college: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    avatar_url: Optional[str] = None
    
    # Social Links
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    twitter_url: Optional[str] = None
    
    # Platform Usernames
    leetcode_username: Optional[str] = None
    codeforces_username: Optional[str] = None
    codechef_username: Optional[str] = None
    gfg_username: Optional[str] = None
    hackerrank_username: Optional[str] = None
    atcoder_username: Optional[str] = None
    
    # Privacy
    is_college_public: bool
    is_cgpa_public: bool
    is_scores_public: bool
    is_streak_public: bool
    is_email_public: bool
    
    is_verified: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
