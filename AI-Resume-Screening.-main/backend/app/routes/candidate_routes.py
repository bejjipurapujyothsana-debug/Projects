from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from backend.config.db import get_db
from backend.app.models.models import Candidate, User, Job
from backend.app.schemas.schemas import CandidateResponse, EmailRequest
from backend.app.auth import get_current_user
from backend.app.utils.email_service import dispatch_candidate_email

router = APIRouter()

@router.get("/", response_model=List[CandidateResponse])
def get_all_candidates(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Return all candidates for any authenticated recruiter or admin
    return db.query(Candidate).all()

@router.delete("/{candidate_id}")
def delete_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    db.delete(candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}

@router.post("/{candidate_id}/email")
def trigger_email(
    candidate_id: int,
    request: EmailRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    job = db.query(Job).filter(Job.id == candidate.job_id).first()
    job_title = job.title if job else "Position"
    
    background_tasks.add_task(
        dispatch_candidate_email,
        candidate_name=candidate.name,
        candidate_email=candidate.email,
        job_title=job_title,
        ai_score=candidate.match_score,
        custom_subject=request.subject,
        custom_body=request.body
    )
    return {"message": "Email dispatched"}
