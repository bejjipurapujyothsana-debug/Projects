import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, X, CheckCircle, ChevronRight, Trash2, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const Jobs = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
  });

  const fetchJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.requirements) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.createJob(form, token);
      setSuccess(true);
      setForm({ title: '', description: '', requirements: '' });
      await fetchJobs();
      setTimeout(() => {
        setSuccess(false);
        setShowModal(false);
      }, 1500);
    } catch (err) {
      setError('Failed to create job. Make sure you are logged in as a Recruiter.');
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-2 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Job Descriptions</h2>
          <p className="text-slate-500 dark:text-slate-400">Create and manage job postings. Resumes are screened against these JDs.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 font-medium flex items-center gap-2"
        >
          <Plus size={18} /> New Job
        </button>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : jobs.length === 0 ? (
        <motion.div variants={itemVariants} className="glass-card p-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
            <Briefcase size={32} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-bold dark:text-white mb-2">No Job Descriptions Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first job posting to start screening resumes against it.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-transform"
          >
            Create First Job
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <motion.div 
              key={job.id} 
              variants={itemVariants} 
              onClick={() => navigate(`/resumes?jobId=${job.id}`)}
              className="glass-card p-6 flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20">
                    <Briefcase size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{job.title}</h3>
                    <span className="text-xs text-slate-400">Job ID #{job.id}</span>
                  </div>
                </div>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full font-medium">Active</span>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{job.description}</p>

              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.split(',').map((skill, i) => (
                    <span key={i} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full font-medium">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/candidates?query=&jobId=${job.id}`); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:scale-105 transition-transform"
                >
                  <Users size={14} />
                  View Rankings
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/resumes?jobId=${job.id}`); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:scale-105 transition-transform"
                >
                  <Briefcase size={14} />
                  Upload Resumes
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-lg border border-slate-200 dark:border-slate-700"
            >
              {success ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <CheckCircle size={60} className="text-green-500 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold dark:text-white">Job Created!</h3>
                  <p className="text-slate-400 mt-1">Your new JD is active and ready for resume screening.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">Create New Job Description</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <X size={20} className="text-slate-500" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Job Title *</label>
                      <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Senior Machine Learning Engineer"
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Job Description *</label>
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        placeholder="Describe the role, responsibilities, and what you are looking for..."
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Required Skills / Requirements *</label>
                      <textarea
                        name="requirements"
                        value={form.requirements}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Python, React, Machine Learning, SQL, Docker, AWS, FastAPI, Git..."
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                      />
                      <p className="text-xs text-slate-400 mt-1.5">💡 Comma-separated skills. The AI uses this to match and score resumes.</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
                      >
                        {submitting ? 'Creating...' : 'Create Job'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Jobs;
