from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
import enum
from backend.config.db import Base

class UserRole(str, enum.Enum):
    RECRUITER = "recruiter"
    CANDIDATE = "candidate"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CANDIDATE)
    
    jobs = relationship("Job", back_populates="recruiter")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    requirements = Column(Text)
    recruiter_id = Column(Integer, ForeignKey("users.id"))

    recruiter = relationship("User", back_populates="jobs")
    candidates = relationship("Candidate", back_populates="job")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, nullable=True)
    resume_path = Column(String)
    matched_skills = Column(Text) # Stored as comma separated or JSON string
    missing_skills = Column(Text) 
    experience_years = Column(Integer, default=0)
    match_score = Column(Float, default=0.0)
    fraud_score = Column(Float, default=0.0)
    fraud_status = Column(String, default="Clean")
    is_anonymized = Column(Boolean, default=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))

    job = relationship("Job", back_populates="candidates")
