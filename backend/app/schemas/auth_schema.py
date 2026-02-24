from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str
    targetRole: Optional[str] = None
    college: Optional[str] = None

class RefreshInput(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class ProfileUpdateInput(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[str] = None
    college: Optional[str] = None
    cgpa: Optional[str] = None
    avatar_url: Optional[str] = None
    
    # Socials
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    twitter_url: Optional[str] = None
    
    # Platforms
    leetcode_username: Optional[str] = None
    codeforces_username: Optional[str] = None
    codechef_username: Optional[str] = None
    gfg_username: Optional[str] = None
    hackerrank_username: Optional[str] = None
    atcoder_username: Optional[str] = None

    # Privacy
    is_public: Optional[bool] = None
    is_college_public: Optional[bool] = None
    is_cgpa_public: Optional[bool] = None
    is_scores_public: Optional[bool] = None
    is_streak_public: Optional[bool] = None
    is_email_public: Optional[bool] = None

class ForgotPasswordInput(BaseModel):
    email: EmailStr

class ResetPasswordInput(BaseModel):
    token: str
    new_password: str
