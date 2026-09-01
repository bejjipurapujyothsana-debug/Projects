import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Star, MapPin, Briefcase, FileArchive } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { useLocation, useSearchParams } from 'react-router-dom';

const Candidates = () => {
  const { token } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlJobId = searchParams.get('jobId');
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(urlJobId || 'All');
  
  // Initialize searchTerm from URL if available
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [showFilter, setShowFilter] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeActionId, setActiveActionId] = useState(null);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [emailModal, setEmailModal] = useState({ show: false, candidate: null, subject: '', body: '' });
  const [sendingEmail, setSendingEmail] = useState(false);
  
  const handleDelete = async (id) => {
    try {
      await api.deleteCandidate(id, token);
      setCandidates(candidates.filter(c => c.id !== id));
      setActiveActionId(null);
    } catch (err) {
      alert("Failed to delete candidate");
    }
  };

  const openEmailModal = (cand) => {
    const job = jobs.find(j => j.id === cand.job_id);
    const jobTitle = job ? job.title : "Position";
    
    let subject = "";
    let body = "";

    if (cand.match_score >= 85) {
      subject = `Interview Invitation: ${jobTitle} Role at SmartHire`;
      body = `Dear ${cand.name},\n\nI hope this email finds you well.\n\nOur AI-driven screening has identified your profile as a top match (${Math.round(cand.match_score)}% score) for the ${jobTitle} position. We were particularly impressed with your experience.\n\nWe would love to schedule a technical interview to discuss your background in more detail. Please let us know your availability for next week.\n\nBest regards,\nThe SmartHire Recruitment Team`;
    } else if (cand.match_score <= 50) {
      subject = `Status Update - ${jobTitle} Position`;
      body = `Dear ${cand.name},\n\nThank you for your interest in the ${jobTitle} position and for taking the time to apply.\n\nAfter reviewing your application, we have decided to move forward with other candidates whose qualifications more closely align with our current needs. We will keep your profile in our talent pool for future opportunities.\n\nWe wish you the best in your career pursuits.\n\nBest regards,\nRecruitment Team`;
    } else {
      subject = `Following up on your application for ${jobTitle}`;
      body = `Dear ${cand.name},\n\nThank you for applying for the ${jobTitle} role. Your application is currently being reviewed by our team.\n\nWe will be in touch shortly with any updates regarding the next steps in the process.\n\nBest regards,\nRecruitment Team`;
    }

    setEmailModal({ show: true, candidate: cand, subject, body });
    setActiveActionId(null);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      await api.emailCandidate(emailModal.candidate.id, emailModal.subject, emailModal.body, token);
      alert("Email dispatched successfully!");
      setEmailModal({ ...emailModal, show: false });
    } catch (err) {
      alert("Failed to send email. Please check your connection.");
    } finally {
      setSendingEmail(false);
    }
  };
  
  // Listen for URL changes (e.g. if user searches again from header while on the page)
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('query');
    if (q) setSearchTerm(q);
  }, [location.search]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [candidateData, jobData] = await Promise.all([
          api.getCandidates(token),
          api.getJobs()
        ]);
        setCandidates(candidateData);
        setJobs(jobData);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadData();
  }, [token]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const filteredCandidates = candidates
    .filter(c => {
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = (c.name || '').toLowerCase().includes(searchLower);
      const skillsMatch = (c.matched_skills || '').toLowerCase().includes(searchLower) || (c.missing_skills || '').toLowerCase().includes(searchLower);
      const matchesSearch = nameMatch || skillsMatch;
      
      // Job Filter
      const matchesJob = selectedJobId === 'All' || c.job_id.toString() === selectedJobId;
      
      // Status Logic mirroring the UI implementation
      let status = 'In Review';
      if (c.match_score >= 85) status = 'Shortlisted';
      else if (c.match_score <= 50) status = 'Rejected';
      
      const matchesMinScore = c.match_score >= minScore;
      const matchesStatus = statusFilter === 'All' || status === statusFilter;

      return matchesSearch && matchesMinScore && matchesStatus && matchesJob;
    })
    .sort((a, b) => b.match_score - a.match_score); // Ensure best matches always on top

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-2 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Candidates</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage and review applicant profiles.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidates..." 
              className="pl-10 pr-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white w-48"
            />
          </div>
          <select 
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white text-sm font-medium"
          >
            <option value="All">All Job Roles</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2 rounded-xl border transition-colors ${showFilter ? 'bg-purple-100 border-purple-300 text-purple-600 dark:bg-purple-900/30 dark:border-purple-700/50 dark:text-purple-400' : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'}`}
          >
            <Filter size={20} />
          </button>
          
          {showFilter && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-14 right-2 w-64 glass-card p-4 shadow-xl z-50 border border-slate-200 dark:border-slate-700"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Min Match Score: {minScore}%
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm dark:text-white"
                >
                  <option value="All">All Candidates</option>
                  <option value="Shortlisted">Shortlisted (&gt;85%)</option>
                  <option value="In Review">In Review</option>
                  <option value="Rejected">Rejected (&lt;50%)</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div></div>
          ) : filteredCandidates.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <FileArchive size={48} className="mb-4 opacity-50" />
                <p>No candidates found matching your criteria.</p>
             </div>
          ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm">
                <th className="p-4 font-medium">Candidate</th>
                <th className="p-4 font-medium">Applied Position</th>
                <th className="p-4 font-medium">Match Score</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-sm">
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{cand.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {cand.experience_years} years experience
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {jobs.find(j => j.id === cand.job_id)?.title || "Unknown Position"}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cand.matched_skills.split(",").slice(0, 2).map((skill, i) => (
                          skill && <span key={i} className="text-[9px] bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-800/50">{skill}</span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${cand.match_score > 90 ? 'bg-green-500' : cand.match_score > 75 ? 'bg-blue-500' : 'bg-orange-500'}`} 
                          style={{ width: `${cand.match_score}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-sm dark:text-white">{Math.round(cand.match_score)}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      cand.match_score >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      cand.match_score <= 50 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {cand.match_score >= 85 ? "Shortlisted" : cand.match_score <= 50 ? "Rejected" : "In Review"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        <Star size={18} />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setActiveActionId(activeActionId === cand.id ? null : cand.id)}
                          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {activeActionId === cand.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 text-left overflow-hidden text-sm"
                          >
                            <button onClick={() => { setActiveCandidate(cand); setActiveActionId(null); }} className="w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors text-left">
                              View Full Profile
                            </button>
                            <button onClick={() => openEmailModal(cand)} className="w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors text-left">
                              Send Email
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-700 w-full"></div>
                            <button onClick={() => handleDelete(cand.id)} className="w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors text-left font-medium">
                              Reject / Delete
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </motion.div>

      {/* View Profile Modal */}
      {activeCandidate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button onClick={() => setActiveCandidate(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
              ✕
            </button>
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {activeCandidate.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">{activeCandidate.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400">{activeCandidate.experience_years} years of experience</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">Match Score</h3>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Math.round(activeCandidate.match_score)}%</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-500 mb-2">Fraud Status</h3>
                  <div className={`text-lg font-bold ${activeCandidate.fraud_status === 'Clean' ? 'text-green-500' : 'text-orange-500'}`}>
                    {activeCandidate.fraud_status || "Verified"}
                  </div>
                </div>
              </div>
              
              <h3 className="font-bold text-lg dark:text-white mb-3">Matched Skills</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                 {(activeCandidate.matched_skills || '').split(',').map((skill, i) => skill && (
                    <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">{skill}</span>
                 ))}
                 {!activeCandidate.matched_skills && <span className="text-sm text-slate-500">None found</span>}
              </div>
              
              <h3 className="font-bold text-lg dark:text-white mb-3">Missing Required Skills</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                 {(activeCandidate.missing_skills || '').split(',').map((skill, i) => skill && (
                    <span key={i} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium border border-red-200 dark:border-red-800">{skill}</span>
                 ))}
                 {!activeCandidate.missing_skills && <span className="text-sm text-slate-500">Candidate meets all requirements</span>}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setActiveCandidate(null)} className="px-6 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium transition-colors">
                Close
              </button>
              <button onClick={() => { setActiveCandidate(null); openEmailModal(activeCandidate); }} className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors shadow-sm">
                Email Candidate
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Email Draft Modal */}
      {emailModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold dark:text-white">Review Email Draft</h2>
                <p className="text-xs text-slate-500 mt-1">Editing draft for {emailModal.candidate.email}</p>
              </div>
              <button onClick={() => setEmailModal({ ...emailModal, show: false })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subject Line</label>
                <input 
                  type="text"
                  value={emailModal.subject}
                  onChange={e => setEmailModal({ ...emailModal, subject: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Body</label>
                <textarea 
                  rows={10}
                  value={emailModal.body}
                  onChange={e => setEmailModal({ ...emailModal, body: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button onClick={() => setEmailModal({ ...emailModal, show: false })} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSendEmail} 
                disabled={sendingEmail}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 shadow-lg"
              >
                {sendingEmail ? "Dispatching..." : "Send Email"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Candidates;
