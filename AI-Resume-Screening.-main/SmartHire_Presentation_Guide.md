# SmartHire AI Project Handbook

This document is your "cheat sheet" for explaining your project in interviews, presentations, or documentation. It contains the architecture, the problem it solves, and how it works under the hood.

## 1. The Core Problem It Solves

**The Problem (Real-world Context):** 
HR departments receive hundreds or thousands of resumes for a single job posting. Manually reading each resume is extremely slow, prone to human bias, and highly inefficient. Recruiters often miss top talent because they are overwhelmed by volume.

**The Solution (Your Application):**
You built an **AI-powered Resume Screening Platform** that automates the first round of hiring. It ingests thousands of resumes, uses Natural Language Processing (NLP) to "read" them like a human would, and instantly ranks candidates based on how well their skills match the specific job description.

## 2. Technical Stack (What to tell interviewers)

You built a modern, full-stack application using microservices-like architecture:
* **Frontend:** React.js paired with Vite. It provides a lightning-fast, reactive single-page application (SPA).
* **Backend:** Python using **FastAPI**. It's modern, asynchronous, and incredibly fast for API routing.
* **Database:** SQLite (managed via SQLAlchemy ORM). Used to safely store structured candidate and user data.
* **AI/Machine Learning:** 
  * `PyPDF2` (for parsing raw text from PDF resumes)
  * `spaCy` (Advanced NLP for Named Entity Recognition (NER), anonymization, and skill mapping)
  * `Scikit-Learn` (TF-IDF & Cosine Similarity for memory-efficient semantic matching on cloud free-tiers)
  * Custom Fraud Detection & Bias Reduction models.

## 3. How the AI Actually Works (The "Secret Sauce")

When asked *how* it screens resumes, explain this five-step pipeline:

1. **Extraction Pipeline:** Raw text is extracted from PDFs using `PyPDF2` and normalized for processing.
2. **Fraud Detection Engine:** The system scans for template remnants (e.g., "Lorem Ipsum"), keyword stuffing, or suspicious phone numbers to flag high-risk or fake applications.
3. **Impartiality (Bias Reduction):** Using spaCy NER, the system automatically identifies and masks PII (Personally Identifiable Information) like names, locations, and gendered pronouns. This ensures the AI ranks candidates purely on merit.
4. **Skill Mapping:** The system cross-references the text against a massive dataset of technical skills to isolate the candidate's core competency stack.
5. **Semantic Matching:** Instead of simple keyword matching, the system uses TF-IDF vectorization to understand the "weight" of technical domains. It calculates a **Cosine Similarity Score** between the resume and JD to rank candidates contextually.

---

# Proposing "Real-Time" Advanced Features

To take this from a great academic project to a **highly competitive, enterprise-grade application**, here are three features we could add right now. 

### Feature 1: Automated Email Dispatch (Core Module)
* **What it does:** The system includes a Python background task system. When an HR manager uploads resumes, the system ranks them. Automatically, all candidates who score above a threshold receive a success email, while others are notified appropriately.
* **Real-world value:** Solves the massive "ghosting" problem in the hiring industry by automating candidate communication.

### Feature 2: LLM-Generated Interview Questions (Roadmap)
* **What it does:** Once a candidate gets a high matching score, we integrate an LLM API (like Grok or OpenAI). It looks at the job description, looks at the candidate's resume, and automatically generates **5 custom technical interview questions** specifically tailored to grill *that specific candidate*. 
* **Real-world value:** It prepares the HR manager instantly for the interview stage.

### Feature Option 3: Real-Time Notifications via WebSocket
* **What it does:** Scanning heavy PDFs can take time. We can implement a WebSocket pipeline so the user sees a real-time progress bar (e.g., "Extracting text... 20%", "Running AI model... 80%") instead of just a spinning loader.
* **Real-world value:** Massively improves User Experience (UX) and system reliability perception. 
