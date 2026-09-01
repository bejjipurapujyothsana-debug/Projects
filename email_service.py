import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import sys

def dispatch_candidate_email(candidate_name: str, candidate_email: str, job_title: str, ai_score: float, custom_subject: str = None, custom_body: str = None):
    """
    Sends an email to the candidate. 
    If custom_subject/body are provided (from the recruiter), they are used.
    Otherwise, a default template is generated based on the AI score.
    """
    
    # 1. Determine Subject and Body
    if custom_subject and custom_body:
        subject = custom_subject
        body = custom_body
    else:
        # Default Template Logic (Auto-generation)
        if ai_score >= 75.0:
            subject = f"Interview Invitation: {job_title} at SmartHire"
            body = f"Dear {candidate_name},\n\nCongratulations! Your application for {job_title} has been shortlisted with a {ai_score}% match score. We'd love to schedule an interview.\n\nBest regards,\nThe Hiring Team"
        elif ai_score < 40.0:
            subject = f"Application Update: {job_title}"
            body = f"Dear {candidate_name},\n\nThank you for applying for {job_title}. At this time, we've decided to move forward with other candidates.\n\nBest regards,\nThe Hiring Team"
        else:
            # Neutral score, no auto-dispatch without recruiter input
            return None

    # 2. Build the Email Object
    msg = MIMEMultipart()
    msg['From'] = os.getenv("SMTP_USER", "hr@smarthire.co")
    msg['To'] = candidate_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    # 3. SMTP Dispatch Logic
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASS = os.getenv("SMTP_PASS")

    if SMTP_HOST and SMTP_USER and SMTP_PASS:
        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
            print(f"✅ REAL EMAIL SENT TO: {candidate_email}")
            return True
        except Exception as e:
            print(f"❌ SMTP FAILED: {str(e)}")
            # Fallback to terminal log for debugging
    
    # 4. Fallback/Mock Mode (Dispatch to Terminal)
    print("\n" + "="*60, flush=True)
    print(f"📧 [MOCKED] EMAIL DISPATCHED TO: {candidate_email}", flush=True)
    print("="*60, flush=True)
    print(f"Subject: {subject}\n", flush=True)
    print(body, flush=True)
    print("="*60 + "\n", flush=True)
    
    return True
