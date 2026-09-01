const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  // Auth
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    if (!response.ok) throw new Error("Login failed");
    return response.json(); // { access_token, token_type }
  },

  register: async (email, password, role = "recruiter") => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, role }),
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  },

  // Jobs
  getJobs: async () => {
    const response = await fetch(`${API_BASE_URL}/jobs/`);
    if (!response.ok) throw new Error("Failed to fetch jobs");
    return response.json();
  },

  createJob: async (jobData, token) => {
    const response = await fetch(`${API_BASE_URL}/jobs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) throw new Error("Failed to create job");
    return response.json();
  },

  // Resumes
  uploadResume: async (file, jobId, token) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_id", jobId);

    const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });
    if (!response.ok) throw new Error("Upload failed");
    return response.json();
  },
  // Candidates
  processLinkedin: async (linkedinUrl, jobId, token) => {
    const response = await fetch(`${API_BASE_URL}/resumes/linkedin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ linkedin_url: linkedinUrl, job_id: parseInt(jobId) }),
    });
    if (!response.ok) throw new Error("LinkedIn processing failed");
    return response.json();
  },
  getCandidates: async (token) => {
    const response = await fetch(`${API_BASE_URL}/candidates/`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Failed to fetch candidates");
    return response.json();
  },
  deleteCandidate: async (id, token) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Failed to delete candidate");
    return response.json();
  },
  emailCandidate: async (id, subject, body, token) => {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ subject, body })
    });
    if (!response.ok) throw new Error("Failed to email candidate");
    return response.json();
  }
};
