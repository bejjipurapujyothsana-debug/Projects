import pandas as pd
import spacy
from spacy.matcher import PhraseMatcher
import re
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Initialize spaCy
try:
    nlp = spacy.load("en_core_web_sm")
except:
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# --- 1. ADVANCED AI: Categorization Model ---
# This block trains a simple ML model to understand the resume field
training_data = [
    ("python machine learning data analysis pandas sql scikit-learn", "Data Science"),
    ("deep learning neural networks nlp pytorch tensorflow", "Data Science"),
    ("html css javascript react node express angular web development", "Web Dev"),
    ("frontend backend fullstack mongodb django bootstrap", "Web Dev"),
    ("recruitment payroll employee relations hr management hiring onboarding", "HR"),
    ("human resources labor law performance appraisal talent acquisition", "HR"),
    ("accountant finance audit tax ledger sap tally excel", "Finance")
]

texts, labels = zip(*training_data)
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)
clf = LogisticRegression()
clf.fit(X, labels)

def categorize_resume(text):
    """Predicts the job category using Machine Learning"""
    input_vec = vectorizer.transform([text.lower()])
    prediction = clf.predict(input_vec)
    return prediction[0]

# --- 2. ADVANCED AI: Experience Extraction ---
def extract_experience(text):
    """Uses Regex to find years of experience patterns"""
    # Patterns to find: "5+ years", "3 years", "8 years of experience"
    patterns = [
        r'(\d+)\+?\s+years?', 
        r'(\d+)\s*-\s*(\d+)\s+years?',
        r'experience\s+of\s+(\d+)\+?\s+years'
    ]
    
    found_years = []
    for pattern in patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if isinstance(match, tuple):
                found_years.append(int(match[1])) # Get max from range (e.g. 5 from 3-5)
            else:
                found_years.append(int(match))
                
    return max(found_years) if found_years else 0

# --- Existing Logic Updated ---

def load_skills_from_dataset():
    try:
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        file_path = os.path.join(BASE_DIR, "skills.csv")

        df = pd.read_csv(file_path)
        raw_skills = df['Skills'].dropna().unique().tolist()

        skill_set = set()
        for row in raw_skills:
            parts = [s.strip() for s in row.split(',')]
            skill_set.update(parts)
        return list(skill_set)
    except Exception as e:
        print(f"File Error: {e}")
        return ["Python", "Data Science", "SQL"]

SKILLS_DB = load_skills_from_dataset()

def extract_skills(text):
    doc = nlp(text)
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    patterns = [nlp.make_doc(skill) for skill in SKILLS_DB if len(skill) > 2]
    matcher.add("SKILL_MATCH", patterns)
    
    matches = matcher(doc)
    found_skills = set([doc[start:end].text.lower() for _, start, end in matches])
    return list(found_skills)

def identify_missing_skills(resume_skills, jd_skills):
    res_set = set(s.lower() for s in resume_skills)
    jd_set = set(s.lower() for s in jd_skills)
    return list(jd_set - res_set)