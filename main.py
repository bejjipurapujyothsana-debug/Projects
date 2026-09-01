from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.db import engine, Base

from backend.app.routes import auth_routes, job_routes, resume_routes, candidate_routes

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartHire AI Platform API", version="1.0.0")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For demo convenience. In production, list your Vercel URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(job_routes.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(candidate_routes.router, prefix="/api/candidates", tags=["Candidates"])
app.include_router(resume_routes.router, prefix="/api/resumes", tags=["Resumes"])

@app.get("/")
def read_root():
    return {"message": "Welcome to SmartHire AI Platform API. Visit /docs for Swagger UI."}
