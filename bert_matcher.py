from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class BERTMatcher:
    """
    Renamed to keep compatibility with existing imports, 
    but uses TF-IDF for memory efficiency on free-tier hosting.
    """
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')

    def calculate_similarity(self, resume_text: str, jd_text: str) -> float:
        """
        Calculates cosine similarity using TF-IDF.
        This is extremely memory-efficient compared to Transformer models.
        """
        try:
            # Fit and transform the two texts
            tfidf_matrix = self.vectorizer.fit_transform([resume_text, jd_text])
            
            # Calculate cosine similarity between the two vectors
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            
            return float(similarity[0][0])
        except Exception as e:
            print(f"Similarity error: {e}")
            return 0.0

# Singleton instance
matcher = BERTMatcher()
