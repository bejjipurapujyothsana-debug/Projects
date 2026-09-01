from sentence_transformers import SentenceTransformer, util

# This will download the "brain" of your AI the first time you run it
model = SentenceTransformer('all-MiniLM-L6-v2')

def calculate_similarity(resume_text, jd_text):
    embeddings = model.encode([resume_text, jd_text])
    cos_sim = util.cos_sim(embeddings[0], embeddings[1])
    return round(float(cos_sim) * 100, 2)