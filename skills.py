SKILLS = [
    "python", "django", "flask", "machine learning",
    "deep learning", "nlp", "sql", "sqlite",
    "html", "css", "javascript", "react",
    "tensorflow", "pytorch", "scikit-learn",
    "data analysis", "pandas", "numpy"
]

def extract_skills(text):
    text = text.lower()
    found_skills = [skill for skill in SKILLS if skill in text]
    return found_skills
