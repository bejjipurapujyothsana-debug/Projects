from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
import os
import shutil

from backend.config.db import get_db
from backend.app.models.models import Candidate, Job, User, UserRole
from backend.app.schemas.schemas import CandidateResponse
from backend.app.auth import get_current_user
from backend.app.utils.email_service import dispatch_candidate_email
from backend.app.utils.linkedin_scraper import parse_linkedin_profile
from pydantic import BaseModel
import re

# Legacy Model import

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
# Legacy imports removed for Phase 1 to prevent large model blocks

from ml_models.nlp_extractor import extractor
from ml_models.bert_matcher import matcher
from ml_models.bias_reducer import bias_reducer
from ml_models.fraud_detector import fraud_detector

router = APIRouter()

# Ensure UPLOAD_DIR exists
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=CandidateResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    job_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 1. Text Extraction
        resume_text_raw = extractor.extract_text_from_pdf(file_path)
        
        # 2. Phase 5: Fraud Assessment (Runs on raw text)
        fraud_analysis = fraud_detector.assess_fraud_risk(resume_text_raw)
        
        # 3. Phase 5: Bias Reduction Anonymization
        resume_text = bias_reducer.anonymize_text(resume_text_raw)
        
        # 4. Phase 3: Advanced Intelligence Execution
        res_skills = extractor.extract_skills(resume_text)
        jd_skills = extractor.get_job_skills(job.requirements)
        
        common_skills = set(res_skills).intersection(set(jd_skills))
        missing_skills = list(set(jd_skills) - set(res_skills))
        
        # Core Semantic Verification
        semantic_score = matcher.calculate_similarity(resume_text, job.requirements)
        
        skill_score = (len(common_skills) / len(jd_skills)) if jd_skills else 0
        
        # Final hybrid score: 60% semantic depth, 40% keyword compliance
        final_score = round(((semantic_score * 0.6) + (skill_score * 0.4)) * 100, 2)
        
        experience = extractor.extract_experience_years(resume_text)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error parsing resume via AI: {str(e)}")

    # Extract email safely before creating candidate
    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', resume_text_raw) if 'resume_text_raw' in locals() else None
    extracted_email = email_match.group(0) if email_match else f"{file.filename.replace('.pdf', '').replace(' ', '').lower()}@example.com"

    new_candidate = Candidate(
        name=file.filename.replace('.pdf', ''),
        email=extracted_email,
        resume_path=file_path,
        matched_skills=",".join(common_skills),
        missing_skills=",".join(missing_skills),
        experience_years=experience,
        match_score=final_score,
        fraud_score=fraud_analysis["fraud_score"],
        fraud_status=fraud_analysis["status"],
        is_anonymized=True,
        job_id=job_id
    )
    
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    
    # 5. Dispatch Email based on Score in the Background
    background_tasks.add_task(
        dispatch_candidate_email,
        candidate_name=new_candidate.name,
        candidate_email=new_candidate.email,
        job_title=job.title,
        ai_score=new_candidate.match_score
    )
    
    return new_candidate

class LinkedInRequest(BaseModel):
    job_id: int
    linkedin_url: str

@router.post("/linkedin", response_model=CandidateResponse)
async def process_linkedin_profile(
    request: LinkedInRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == request.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    try:
        # 1. Simulate LinkedIn Scraping
        resume_text_raw = parse_linkedin_profile(request.linkedin_url)
        
        # 2. Phase 5: Fraud Assessment (Runs on raw text)
        fraud_analysis = fraud_detector.assess_fraud_risk(resume_text_raw)
        
        # 3. Phase 5: Bias Reduction Anonymization
        resume_text = bias_reducer.anonymize_text(resume_text_raw)
        
        # 4. Extract Skills & Score
        res_skills = extractor.extract_skills(resume_text)
        jd_skills = extractor.get_job_skills(job.requirements)
        
        common_skills = set(res_skills).intersection(set(jd_skills))
        missing_skills = list(set(jd_skills) - set(res_skills))
        
        semantic_score = matcher.calculate_similarity(resume_text, job.requirements)
        skill_score = (len(common_skills) / len(jd_skills)) if jd_skills else 0
        final_score = round(((semantic_score * 0.6) + (skill_score * 0.4)) * 100, 2)
        experience = extractor.extract_experience_years(resume_text)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error parsing LinkedIn profile: {str(e)}")

    name_guess = "LinkedIn Candidate"
    import re
    match = re.search(r'linkedin\.com/in/([a-zA-Z0-9-]+)', request.linkedin_url)
    if match:
        name_guess = match.group(1).replace('-', ' ').title()

    email_match = re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', resume_text_raw) if 'resume_text_raw' in locals() else None
    extracted_email = email_match.group(0) if email_match else f"{name_guess.replace(' ', '').lower()}@example.com"

    new_candidate = Candidate(
        name=name_guess,
        email=extracted_email,
        resume_path=request.linkedin_url, # Storing URL instead of file path
        matched_skills=",".join(common_skills),
        missing_skills=",".join(missing_skills),
        experience_years=experience,
        match_score=final_score,
        fraud_score=fraud_analysis["fraud_score"],
        fraud_status=fraud_analysis["status"],
        is_anonymized=True,
        job_id=request.job_id
    )
    
    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)
    
    # 5. Route Automated Email in the Background
    background_tasks.add_task(
        dispatch_candidate_email,
        candidate_name=name_guess,
        candidate_email=new_candidate.email,
        job_title=job.title,
        ai_score=new_candidate.match_score
    )
    
    return new_candidate
