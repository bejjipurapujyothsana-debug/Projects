import re
from pdfminer.high_level import extract_text

def extract_text_from_pdf(pdf_file):
    return extract_text(pdf_file)

def clean_text(text):
    text = re.sub(r'http\S+\s*', ' ', text)
    text = re.sub(r'[!#\$%&\*\+,\.\/:;<=>\?@\[\]\^_`\{\|\}~]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()