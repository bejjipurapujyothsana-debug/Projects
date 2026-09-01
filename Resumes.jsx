import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Check, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const Resumes = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const urlJobId = searchParams.get('jobId');
  const [uploads, setUploads] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState('PDF');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    api.getJobs().then(data => {
      setJobs(data);
      // Priority: 1. URL param, 2. First job in list
      if (urlJobId) {
        setSelectedJobId(urlJobId);
      } else if (data.length > 0) {
        setSelectedJobId(data[0].id);
      }
    }).catch(console.error);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    if (!selectedJobId) {
      alert("Please select a job first. If none exist, request a recruiter to create one.");
      return;
    }
    
    // Process each file
    Array.from(files).forEach(async (file) => {
      if (!file.name.endsWith('.pdf')) {
        alert("Only PDF files are supported!");
        return;
      }

      const uploadId = Date.now() + Math.random();
      const newUpload = {
        id: uploadId,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        status: "Processing",
        date: "Just now"
      };
      
      setUploads(prev => [newUpload, ...prev]);

      try {
        await api.uploadResume(file, selectedJobId, token);
        
        setUploads(prev => prev.map(u => 
          u.id === uploadId ? { ...u, status: "Parsed" } : u
        ));
      } catch (err) {
        setUploads(prev => prev.map(u => 
          u.id === uploadId ? { ...u, status: "Error" } : u
        ));
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleLinkedinSubmit = async (e) => {
    e.preventDefault();
    if (!linkedinUrl.trim()) return;
    if (!selectedJobId) {
      alert("Please select a job first.");
      return;
    }

    const uploadId = Date.now() + Math.random();
    const newUpload = {
      id: uploadId,
      name: "LinkedIn Profile",
      size: "URL",
      status: "Processing",
      date: "Just now"
    };
    
    setUploads(prev => [newUpload, ...prev]);
    setLinkedinUrl('');

    try {
      await api.processLinkedin(linkedinUrl, selectedJobId, token);
      
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: "Parsed" } : u
      ));
    } catch (err) {
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: "Error" } : u
      ));
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-2 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Resumes</h2>
          <p className="text-slate-500 dark:text-slate-400">Upload and manage candidate resumes for AI screening.</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Job</label>
        <select 
          value={selectedJobId} 
          onChange={(e) => setSelectedJobId(e.target.value)}
          className="w-full md:w-1/2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white mb-6"
        >
          {jobs.length === 0 && <option value="">No jobs available</option>}
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
        
        {/* Toggle Mode */}
        <div className="flex gap-4 mb-4">
          <button 
            onClick={() => setUploadMode('PDF')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${uploadMode === 'PDF' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            PDF Resume
          </button>
          <button 
            onClick={() => setUploadMode('LINKEDIN')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${uploadMode === 'LINKEDIN' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            LinkedIn Profile
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {uploadMode === 'PDF' ? (
        <motion.div 
          variants={itemVariants} 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card p-10 flex flex-col items-center justify-center text-center border-dashed border-2 cursor-pointer transition-colors ${
            isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-purple-300 dark:border-purple-500/50 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/20'
          }`}
        >
          <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center mb-4">
            <UploadCloud size={36} className="text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Drag & Drop Resumes</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Upload PDF files here. Our AI will automatically extract skills, experience, and match them against your job requirements.
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf" 
            multiple 
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 font-medium">
            Browse Files
          </button>
        </motion.div>
      ) : (
        <motion.form variants={itemVariants} onSubmit={handleLinkedinSubmit} className="glass-card p-10 border border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-slate-800 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center mb-4">
            <FileText size={36} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Import from LinkedIn</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Paste the candidate's LinkedIn URL below. The AI will parse their profile directly.
          </p>
          <div className="flex w-full max-w-md gap-3">
             <input 
                type="url"
                required
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
             <button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl shadow-lg font-medium transition-transform hover:scale-105 active:scale-95">
                Parse
             </button>
          </div>
        </motion.form>
      )}

      {/* Upload History */}
      <motion.div variants={itemVariants} className="mt-8">
        <h3 className="text-lg font-bold dark:text-white mb-4">Recent Uploads {uploads.length === 0 && <span className="text-sm font-normal text-slate-400 ml-2">(Empty)</span>}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploads.map((file) => (
            <div key={file.id} className="glass-card p-4 flex items-center gap-4 animate-fade-in">
              <div className={`p-3 rounded-xl ${
                file.status === 'Parsed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                file.status === 'Processing' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <FileText size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{file.size}</span>
                  <span>•</span>
                  <span>{file.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {file.status === 'Parsed' && <Check size={18} className="text-green-500" />}
                {file.status === 'Processing' && <Clock size={18} className="text-blue-500 animate-spin" />}
                {file.status === 'Error' && <AlertCircle size={18} className="text-red-500" />}
                <span className={`text-sm font-medium ${
                  file.status === 'Parsed' ? 'text-green-600 dark:text-green-400' :
                  file.status === 'Processing' ? 'text-blue-600 dark:text-blue-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {file.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
};

export default Resumes;
