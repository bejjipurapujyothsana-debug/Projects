import time
import re

def parse_linkedin_profile(url: str) -> str:
    """
    Simulates scraping a LinkedIn profile. 
    In a true real-world enterprise app with paid APIs, this would call Proxycurl or a Selenium cluster.
    """
    
    # Simple extraction of candidate name from URL to make the mock response semi-realistic
    match = re.search(r'linkedin\.com/in/([a-zA-Z0-9-]+)', url)
    candidate_id = match.group(1) if match else "candidate"
    clean_name = candidate_id.replace('-', ' ').title()
    
    # 1. Simulate the network delay of scraping a real LinkedIn profile
    time.sleep(2) 
    
    # 2. Return a simulated resume text block formatted identically to a PDF extraction
    simulated_text = f"""
    {clean_name}
    Email: {candidate_id}@example.com | Phone: 555-0199
    
    EXPERIENCE
    Senior Software Engineer | Tech Innovators Inc.
    2020 - Present
    - Developed and maintained scalable Python microservices using FastAPI and Docker.
    - Implemented Natural Language Processing models using Spacy and Scikit-Learn for text classification.
    - Optimized SQL databases and managed ORM relationships with SQLAlchemy.
    - Migrated legacy frontend applications to React.js and Vite.
    
    Software Developer | Data Systems LLC
    2017 - 2020
    - Built comprehensive REST APIs using Python and Flask.
    - Managed machine learning pipelines utilizing Pandas and Numpy.
    - Deployed containerized applications to AWS cloud infrastructure.
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology | 2013 - 2017
    
    SKILLS
    Python, FastAPI, React, JavaScript, Machine Learning, NLP, SQL, Docker, Pandas, Scikit-Learn.
    """
    
    return simulated_text
