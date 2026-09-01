import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('recruiter');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.register(email, password, role);
      // Auto-login or redirect to login
      navigate('/login');
    } catch (err) {
      setError("Registration failed. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
      
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-10 w-full max-w-md relative z-10 border border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-xl rounded-3xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl text-white mb-4 shadow-lg shadow-purple-500/30">
            <User size={32} />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Create Account
          </h2>
          <p className="text-slate-400 mt-2 text-sm text-center">Join SmartHire AI and find the best talent</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="gap-4 flex p-1 bg-slate-800/50 rounded-xl border border-slate-700">
             <button type="button" onClick={() => setRole('recruiter')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${role === 'recruiter' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Recruiter</button>
             <button type="button" onClick={() => setRole('candidate')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${role === 'candidate' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Candidate</button>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all placeholder:text-slate-600"
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 mt-4 rounded-xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : (
              <>Sign Up <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign in here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
