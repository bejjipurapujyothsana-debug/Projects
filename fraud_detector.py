import re

class FraudDetector:
    def __init__(self):
        # Known generic templates or suspicious phrases
        self.suspicious_phrases = [
            "lorem ipsum",
            "insert company name",
            "replace with your experience",
            "your name here",
            "enter degree",
            "best team player", # Cliche over-padding indicator
            "hardworking individual",
            "synergy",
            "1234567890", # Dummy phone numbers
            "email@example.com"
        ]

    def assess_fraud_risk(self, text: str) -> dict:
        """
        Calculates a Fraud Risk factor based on dummy content, 
        template remnants, or overly extreme text duplication.
        Returns a dictionary with status and risk score (0-100).
        """
        text_lower = text.lower()
        score = 0
        reasons = []

        # 1. Template Overuse Check
        for phrase in self.suspicious_phrases:
            if phrase in text_lower:
                score += 30 # Severe penalty for leaving template text
                reasons.append(f"Contains generic template phrase: '{phrase}'")

        # 2. Text Length Anomaly
        words = text_lower.split()
        if len(words) < 50:
            score += 40
            reasons.append("Resume is suspiciously short (under 50 words)")

        # 3. Keyword Stuffing Check (Repeating the same skill artificially)
        # e.g., if "python" appears 20 times in a 100 word resume
        if len(words) > 0:
            word_counts = {}
            for w in words:
                word_counts[w] = word_counts.get(w, 0) + 1
            
            for word, count in word_counts.items():
                if len(word) > 4 and count > (len(words) * 0.15): 
                    # If a single word makes up 15% of the resume
                    score += 50
                    reasons.append(f"Keyword stuffing detected: '{word}' repeated abnormally")
                    break

        # Normalize score
        final_score = min(score, 100)
        
        status = "Clean"
        if final_score > 60:
            status = "High Risk"
        elif final_score > 20:
            status = "Warning"

        return {
            "fraud_score": final_score,
            "status": status,
            "reasons": reasons
        }

fraud_detector = FraudDetector()
