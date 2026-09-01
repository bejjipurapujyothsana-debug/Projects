from pydantic import BaseModel
from typing import Optional, List
from backend.app.models.models import UserRole

# User Schemas
class UserBase(BaseModel):
    email: str
    role: UserRole

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

# Job Schemas
class JobBase(BaseModel):
    title: str
    description: str
    requirements: str

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    recruiter_id: int

    class Config:
        from_attributes = True

# Candidate Schemas
class CandidateBase(BaseModel):
    name: str
    email: Optional[str] = None
    resume_path: str
    matched_skills: str
    missing_skills: str
    experience_years: int
    match_score: float
    fraud_score: float = 0.0
    fraud_status: str = "Clean"
    is_anonymized: bool = True

class CandidateCreate(CandidateBase):
    job_id: int

class CandidateResponse(CandidateBase):
    id: int
    job_id: int

    class Config:
        from_attributes = True

class EmailRequest(BaseModel):
    subject: str
    body: str
