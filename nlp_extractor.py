import spacy
from PyPDF2 import PdfReader
import re

# Load English NLP model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

from backend.app.schemas.schemas import CandidateBase

class NLPExtractor:
    def __init__(self):
        self.nlp = nlp
        
        # Load known skills dictionary for entity mapping 
        # (In a real app, this would query a skills database)
        self.skill_set = {
            "python", "java", "javascript", "react", "c++", "ruby", "aws", "docker", 
            "kubernetes", "sql", "mongodb", "fastapi", "flask", "django", "machine learning",
            "deep learning", "nlp", "bert", "tensorflow", "pytorch", "pandas", "numpy",
            "data science", "html", "css", "node.js", "agile", "scrum", "git", "linux"
        }

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extracts raw text from a PDF file."""
        text = ""
        try:
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + " "
        except Exception as e:
            raise ValueError(f"Failed to read PDF: {str(e)}")
        return text

    def extract_skills(self, text: str) -> list:
        """Extracts recognizable skills from raw text using tokenization."""
        doc = self.nlp(text.lower())
        skills_found = set()
        
        # Token-based scanning
        for token in doc:
            if token.text in self.skill_set:
                skills_found.add(token.text.capitalize())
                
        # N-gram scanning (e.g., "Machine Learning")
        for chunk in doc.noun_chunks:
            cleaned_chunk = chunk.text.strip()
            if cleaned_chunk in self.skill_set:
                skills_found.add(cleaned_chunk.title())
                
        return list(skills_found)

    def extract_experience_years(self, text: str) -> int:
        """Heuristically extracts years of experience from text."""
        # Look for patterns like "5+ years", "over 10 years"
        matches = re.findall(r'(\d+)\+?\s*years?', text.lower())
        if matches:
            return max([int(x) for x in matches])
        return 0

    def get_job_skills(self, job_requirements: str) -> list:
        return self.extract_skills(job_requirements)

# Initialize a singleton instance
extractor = NLPExtractor()
