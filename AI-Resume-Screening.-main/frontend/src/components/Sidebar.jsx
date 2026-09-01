import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, Sparkles, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Jobs', icon: <Briefcase size={20} />, path: '/jobs' },
    { name: 'Candidates', icon: <Users size={20} />, path: '/candidates' },
    { name: 'Resumes', icon: <FileText size={20} />, path: '/resumes' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-64 h-full  border-r border-white/20 dark:border-slate-800/50 flex flex-col glass z-20 m-4 rounded-3xl"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-xl text-white">
          <Sparkles size={24} />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
          SmartHire AI
        </h1>
      </div>

      <nav className="flex-1 px-4 mt-6 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-500/5 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-md">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Platform Status</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium">AI Models Online</span>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
