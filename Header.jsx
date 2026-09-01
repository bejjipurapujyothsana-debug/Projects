import React, { useState } from 'react';
import { Bell, Search, User, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ darkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/candidates?query=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <header className="h-20 px-6 flex items-center justify-between glass z-10 m-4 rounded-3xl">
      <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl w-96 border border-slate-200 dark:border-slate-700 transition-all focus-within:ring-2 focus-within:ring-purple-500">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search candidates, jobs... (press Enter)" 
          className="bg-transparent border-none outline-none w-full text-slate-700 dark:text-slate-200"
        />
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          {darkMode ? <Sun size={20} className="text-orange-400" /> : <Moon size={20} className="text-indigo-600" />}
        </button>
        
        <button className="relative p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 relative group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white shadow-md cursor-pointer hover:shadow-lg transition-shadow">
            <User size={20} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email || 'Recruiter Admin'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role || 'Premium Account'}</p>
          </div>
          
          <button 
            onClick={logout}
            className="ml-2 p-2 text-slate-400 hover:text-red-500 transition-colors tooltip"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
