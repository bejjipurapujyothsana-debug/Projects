from backend.config.db import SessionLocal
from backend.app.models.models import Job, User, UserRole

db = SessionLocal()

# Ensure at least one user exists
user = db.query(User).first()
if not user:
    user = User(email="dummy_recruiter@gmail.com", hashed_password="mock", role=UserRole.RECRUITER)
    db.add(user)
    db.commit()
    db.refresh(user)

user_id = user.id

# Ensure at least one job exists
job = db.query(Job).first()
if not job:
    job = Job(
        title="Full Stack AI Developer", 
        description="Looking for an amazing developer.", 
        requirements="Python, React, Node, SQL, Machine Learning", 
        recruiter_id=user_id
    )
    db.add(job)
    db.commit()
    print(f"Seeded Job ID {job.id}")
else:
    print(f"Job ID {job.id} already exists")

db.close()
