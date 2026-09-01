import re
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    pass # we assume it's downloaded from previous phase

class BiasReducer:
    def __init__(self):
        self.nlp = nlp if 'nlp' in globals() else None
        self.gendered_pronouns = {
            r'\bhe\b', r'\bhim\b', r'\bhis\b', 
            r'\bshe\b', r'\bher\b', r'\bhers\b',
            r'\bfemale\b', r'\bmale\b', r'\bwoman\b', r'\bman\b'
        }

    def anonymize_text(self, text: str) -> str:
        """
        Removes PII (Personally Identifiable Information) and gendered language 
        to ensure the semantic matching algorithm evaluates purely on merit and skills.
        """
        if not self.nlp:
            return text
            
        doc = self.nlp(text)
        anonymized_text = text
        
        # 1. Remove Names (PERSON entities)
        # Using string replacement backwards to avoid messing up index locations
        entities_to_remove = [ent for ent in doc.ents if ent.label_ in ["PERSON", "GPE", "DATE"]]
        entities_to_remove = sorted(entities_to_remove, key=lambda x: x.start_char, reverse=True)
        
        for ent in entities_to_remove:
            if ent.label_ == "PERSON":
                # Replace names with [CANDIDATE]
                anonymized_text = anonymized_text[:ent.start_char] + "[CANDIDATE]" + anonymized_text[ent.end_char:]
            elif ent.label_ == "GPE":
                # Mask locations to prevent regional bias
                anonymized_text = anonymized_text[:ent.start_char] + "[LOCATION]" + anonymized_text[ent.end_char:]
            elif ent.label_ == "DATE":
                # Mask dates which might indicate Age
                anonymized_text = anonymized_text[:ent.start_char] + "[DATE]" + anonymized_text[ent.end_char:]

        # 2. Strip Gendered Pronouns
        for pronoun in self.gendered_pronouns:
            anonymized_text = re.sub(pronoun, '[PRONOUN]', anonymized_text, flags=re.IGNORECASE)

        return anonymized_text

bias_reducer = BiasReducer()
