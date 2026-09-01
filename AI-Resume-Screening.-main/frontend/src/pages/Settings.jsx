import React from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Bell, Database } from 'lucide-react';

const Settings = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-2 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your AI configurations and platform preferences.</p>
        </div>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 font-medium flex items-center gap-2">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      {/* AI Settings */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <Database size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Screening Parameters</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Minimum Match Threshold (%)</label>
            <div className="mt-1 flex items-center gap-4">
              <input type="range" min="0" max="100" defaultValue="75" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-purple-600" />
              <span className="text-slate-700 dark:text-slate-300 font-bold w-12 text-right">75%</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Candidates below this match percentage will be automatically filtered out.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">NLP Model Selection</label>
              <select className="w-full p-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white">
                <option>GPT-4 (Highest Accuracy)</option>
                <option>GPT-3.5-Turbo (Fast & Cost-effective)</option>
                <option>Custom Fine-Tuned Model</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Strict Keyword Matching</label>
              <div className="flex items-center gap-3 mt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                </label>
                <span className="text-sm text-slate-600 dark:text-slate-400">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* API Integrations */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <Shield size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">API Keys & Integrations</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">OpenAI API Key</label>
            <input 
              type="password" 
              defaultValue="sk-................................" 
              className="w-full p-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Applicant Tracking System (ATS) Webhook URL</label>
            <input 
              type="text" 
              placeholder="https://your-ats.com/api/webhook/..." 
              className="w-full p-2.5 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
            <Bell size={20} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">New High-Match Candidate Alert</p>
              <p className="text-xs text-slate-500">Get notified when a candidate scores above 90%</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Daily Digest</p>
              <p className="text-xs text-slate-500">Receive a daily summary of newly parsed resumes.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
};

export default Settings;
