import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const Dashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        const cands = await api.getCandidates(token);
        setCandidates(cands);
      } catch (err) {
        console.error("Failed to load candidates", err);
        setError("Could not load dashboard data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false); // stop spinner if no token
    }
  }, [token]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const avgMatch = candidates.length > 0 
    ? Math.round(candidates.reduce((acc, c) => acc + c.match_score, 0) / candidates.length)
    : 0;

  const shortlisted = candidates.filter(c => c.match_score > 75).length;

  const stats = [
    { title: "Total Candidates", value: candidates.length, icon: <Users className="text-blue-500" />, color: "from-blue-500/20 to-blue-500/5" },
    { title: "Resumes Parsed", value: candidates.length, icon: <FileText className="text-purple-500" />, color: "from-purple-500/20 to-purple-500/5" },
    { title: "Shortlisted (>75%)", value: shortlisted, icon: <CheckCircle className="text-green-500" />, color: "from-green-500/20 to-green-500/5" },
    { title: "Avg. Match Score", value: `${avgMatch}%`, icon: <Clock className="text-orange-500" />, color: "from-orange-500/20 to-orange-500/5" },
  ];

  // Dummy chart data showing trends over "time" based on candidate scores
  const chartData = candidates.map((c, i) => ({
    name: `Cand ${i+1}`,
    score: c.match_score,
    exp: c.experience_years * 10 
  })).slice(0, 10); // Show max 10 on dashboard

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-2 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Overview</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.email}! Here's what's happening with your hiring process.</p>
        </div>
        {user?.role === 'recruiter' && (
          <button
            onClick={() => navigate('/jobs')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 font-medium flex items-center gap-2">
            <FileText size={18} />
            New Job Post
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">⚠️ {error}</div>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">Retry</button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={i} variants={itemVariants} className="glass-card p-6 flex flex-col h-full relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-white/50 dark:bg-black/20 rounded-xl backdrop-blur-sm shadow-sm border border-white/20 dark:border-white/5">
                    {stat.icon}
                  </div>
                </div>
                <div className="mt-auto relative z-10">
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column: Flow Chart */}
            <motion.div variants={itemVariants} className="glass-card col-span-2 p-6 flex flex-col">
              <h3 className="text-lg font-bold dark:text-white mb-4">Latest Candidate Trend</h3>
              {chartData.length > 0 ? (
                <div className="h-64 mt-4 text-xs font-medium w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white'}} />
                      <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">No data available yet</div>
              )}
            </motion.div>

            {/* Right Column: Recent Uploads snippet */}
            <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col space-y-4 shadow-inner bg-slate-50/50 dark:bg-slate-900/20">
               <h3 className="text-lg font-bold dark:text-white mb-2">Top Match Profiles</h3>
               {candidates.slice(0, 4).map((c, i) => (
                 <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800 dark:text-white truncate w-32">{c.name}</span>
                      <span className="text-xs text-slate-500">{c.experience_years} years exp</span>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-bold px-3 py-1 rounded-lg text-sm">
                      {Math.round(c.match_score)}%
                    </div>
                 </div>
               ))}
               {candidates.length === 0 && (
                 <div className="text-center text-slate-400 text-sm py-10">Upload resumes to see top matches.</div>
               )}
            </motion.div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Dashboard;
