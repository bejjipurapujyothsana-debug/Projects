import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from resume_parser import extract_text_from_pdf
from utils import extract_skills, identify_missing_skills
from similarity import calculate_similarity

# --- PAGE CONFIG MUST BE FIRST ---
st.set_page_config(page_title="AI Resume Intelligence", page_icon="✨", layout="wide", initial_sidebar_state="expanded")

def categorize_resume(text):
    text = text.lower()
    if "machine learning" in text or "deep learning" in text:
        return "AI/ML"
    elif "web" in text or "react" in text:
        return "Web Development"
    elif "data analyst" in text or "sql" in text:
        return "Data Analytics"
    else:
        return "General"

def extract_experience(text):
    import re
    matches = re.findall(r'(\d+)\+?\s*years?', text.lower())
    if matches:
        return max([int(x) for x in matches])
    return 0

# --- CUSTOM CSS ---
def apply_custom_css():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    /* Global Styles */
    html, body, [class*="css"]  {
        font-family: 'Inter', sans-serif;
    }
    
    .stApp {
        background-color: #f8fafc;
        color: #0f172a;
    }
    
    /* Main Header Styling */
    .main-header {
        font-size: 2.75rem;
        font-weight: 800;
        background: linear-gradient(90deg, #2563eb, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0px;
        padding-bottom: 0px;
    }
    
    .sub-header {
        font-size: 1.1rem;
        color: #64748b;
        margin-bottom: 2rem;
        font-weight: 500;
    }
    
    /* Metrics Styling */
    div[data-testid="metric-container"] {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        padding: 1rem 1.5rem;
        border-radius: 1rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    div[data-testid="metric-container"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    [data-testid="stMetricValue"] {
        font-size: 2.2rem !important;
        font-weight: 800 !important;
        color: #1e293b !important;
    }
    
    [data-testid="stMetricLabel"] {
        font-size: 1rem !important;
        font-weight: 600 !important;
        color: #64748b !important;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    /* Card/Expander Styling */
    .streamlit-expanderHeader {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
        background-color: #ffffff;
        border-radius: 0.75rem;
    }
    
    .streamlit-expanderContent {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-top: none;
        border-bottom-left-radius: 0.75rem;
        border-bottom-right-radius: 0.75rem;
        padding: 1.5rem;
    }

    /* Badges */
    .badge-success {
        background-color: #dcfce7;
        color: #166534;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
        display: inline-block;
        margin: 0.25rem;
    }
    
    .badge-warning {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
        display: inline-block;
        margin: 0.25rem;
    }
    
    .badge-info {
        background-color: #dbeafe;
        color: #1e40af;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
        display: inline-block;
    }

    /* Sidebar Styling */
    section[data-testid="stSidebar"] {
        background-color: #ffffff;
        border-right: 1px solid #e2e8f0;
    }
    
    .sidebar-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 1.5rem;
    }
    </style>
    """, unsafe_allow_html=True)

apply_custom_css()

# --- MAIN APP UI ---

st.markdown('<h1 class="main-header">✨ AI Resume Screening Dashboard</h1>', unsafe_allow_html=True)
st.markdown('<p class="sub-header">Intelligently match candidates to your job descriptions using NLP and semantic analysis.</p>', unsafe_allow_html=True)
st.markdown("---")

# Layout: Sidebar for inputs
with st.sidebar:
    st.markdown('<div class="sidebar-title">📋 Input Center</div>', unsafe_allow_html=True)
    
    st.markdown("**1. Job Description**")
    jd_text = st.text_area("Paste the requirements here:", height=250, placeholder="E.g., We are looking for a Data Scientist with experience in Python, Machine Learning, and SQL...")
    
    st.markdown("**2. Candidate Resumes**")
    uploaded_files = st.file_uploader("Upload Resumes (PDF)", type=["pdf"], accept_multiple_files=True)
    
    st.markdown("---")
    st.markdown("**🔍 Advanced Filters**")
    search_query = st.text_input("Filter by Specific Skill", placeholder="E.g., Python, React")

if jd_text and uploaded_files:
    with st.spinner('Brainstorming and analyzing candidates... 🧠'):
        jd_skills = extract_skills(jd_text)
        results = []
        all_resumes_skills = [] # For Word Cloud

        for file in uploaded_files:
            # 1️⃣ Extract Resume Text
            resume_text = extract_text_from_pdf(file)

            # 2️⃣ Extract Skills
            res_skills = extract_skills(resume_text)
            all_resumes_skills.extend(res_skills)

            # 3️⃣ Semantic Similarity
            semantic_score = calculate_similarity(resume_text, jd_text)

            # 4️⃣ Skill Matching
            common_skills = set(res_skills).intersection(set(jd_skills))
            skill_score = (len(common_skills) / len(jd_skills)) * 100 if jd_skills else 0

            # 5️⃣ Final Hybrid Score
            final_score = round((semantic_score * 0.7) + (skill_score * 0.3), 2)

            category = categorize_resume(resume_text)
            experience = extract_experience(resume_text)

            # 7️⃣ Append Results
            results.append({
                "Candidate": file.name,
                "Score": final_score,
                "Category": category,
                "Experience": experience,
                "Matched": list(common_skills),
                "Missing": identify_missing_skills(res_skills, jd_skills),
                "All_Skills": res_skills
            })
        
        # Convert to DataFrame
        df = pd.DataFrame(results).sort_values(by="Score", ascending=False)

        # Apply Search Filter if query exists
        if search_query:
            df = df[df['All_Skills'].apply(lambda x: search_query.lower() in [s.lower() for s in x])]

        # --- TOP METRICS SECTION ---
        if not df.empty:
            m1, m2, m3, m4 = st.columns(4)
            m1.metric("Total Candidates", len(uploaded_files))
            m2.metric("Highest Match Score", f"{df.iloc[0]['Score']}%")
            m3.metric("Avg Match Score", f"{round(df['Score'].mean(), 1)}%")
            m4.metric("Top Candidate", df.iloc[0]['Candidate'].replace('.pdf', '')[:12] + '...')
            
            st.markdown("<br>", unsafe_allow_html=True)

            # --- VISUALIZATION SECTION ---
            st.markdown("### 📊 Distribution & Insights")
            col_chart, col_cloud = st.columns([1, 1])

            with col_chart:
                st.markdown("**Candidate Match Scores**")
                # Create a simple bar chart
                chart_df = df.set_index("Candidate")["Score"]
                st.bar_chart(chart_df, height=350, use_container_width=True)

            with col_cloud:
                st.markdown("**Global Talent Skill Cloud**")
                if all_resumes_skills:
                    # Generate Word Cloud from all resumes
                    cloud_text = " ".join(all_resumes_skills)
                    wordcloud = WordCloud(width=800, height=400, background_color='white', colormap='plasma').generate(cloud_text)
                    
                    fig, ax = plt.subplots(figsize=(8, 4))
                    ax.imshow(wordcloud, interpolation='bilinear')
                    ax.axis("off")
                    fig.patch.set_facecolor('white')
                    st.pyplot(fig)

            st.markdown("---")

            # --- DETAILED RANKING LIST ---
            st.markdown("### 🏆 Detailed Candidate Rankings")
            
            for index, row in df.iterrows():
                # Card header color based on score
                score_color = "#16a34a" if row['Score'] >= 75 else "#ca8a04" if row['Score'] >= 50 else "#dc2626"
                
                with st.expander(f"👤 {row['Candidate']} — Match: {row['Score']}%"):
                    
                    st.markdown(f"**Domain:** <span class='badge-info'>{row['Category']}</span> | **Experience:** {row['Experience']} Years", unsafe_allow_html=True)
                    st.markdown(f"<div style='margin-top: 10px; height: 8px; width: 100%; background-color: #e2e8f0; border-radius: 4px;'><div style='height: 100%; width: {row['Score']}%; background-color: {score_color}; border-radius: 4px;'></div></div>", unsafe_allow_html=True)
                    st.markdown("<br>", unsafe_allow_html=True)
                    
                    c1, c2 = st.columns(2)
                    with c1:
                        st.markdown("**✅ Skills Matched**")
                        if row['Matched']:
                            matched_html = "".join([f"<span class='badge-success'>{skill}</span>" for skill in row['Matched']])
                            st.markdown(matched_html, unsafe_allow_html=True)
                        else:
                            st.write("No matching skills found")
                    with c2:
                        st.markdown("**⚠ Missing Requirements**")
                        if row['Missing']:
                            missing_html = "".join([f"<span class='badge-warning'>{skill}</span>" for skill in row['Missing']])
                            st.markdown(missing_html, unsafe_allow_html=True)
                        else:
                            st.markdown("<span class='badge-success'>Candidate has all required skills!</span>", unsafe_allow_html=True)
        else:
            st.warning("No candidates found matching that specific skill filter.")

else:
    # Empty state UI
    st.markdown("""
    <div style="text-align: center; padding: 4rem 2rem; background-color: #ffffff; border-radius: 1rem; border: 1px dashed #cbd5e1; margin-top: 2rem;">
        <h2 style="color: #64748b; margin-bottom: 1rem;">Welcome to the Next-Gen Recruiting Assistant</h2>
        <p style="color: #94a3b8; font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
            To get started, please paste your <b>Job Description</b> and upload candidate <b>Resumes (PDF format)</b> using the sidebar on the left.
        </p>
    </div>
    """, unsafe_allow_html=True)