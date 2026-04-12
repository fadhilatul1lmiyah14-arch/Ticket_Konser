// src/components/ThemeToggle.jsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Star } from 'lucide-react';

const ThemeToggle = ({ variant = 'floating', className = '' }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    window.dispatchEvent(new Event('themeChanged'));
  };

  // Listen for theme changes from other components
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : false);
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  // Floating Button Style (untuk MainLayout)
  if (variant === 'floating') {
    return (
      <button 
        onClick={toggleTheme}
        className={`fixed bottom-8 right-8 z-[100] p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95 flex items-center justify-center border backdrop-blur-xl ${className}`}
      >
        {isDarkMode ? (
          <Sun size={24} className="text-amber-400 animate-spin-slow" />
        ) : (
          <Star size={24} fill="currentColor" className="text-purple-600 animate-pulse-slow" />
        )}
      </button>
    );
  }

  // Sidebar Button Style (untuk Dashboard)
  if (variant === 'sidebar') {
    return (
      <button 
        onClick={toggleTheme}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${className}`}
      >
        <div className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-purple-100 text-purple-600'}`}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </div>
        <span className={`text-[11px] font-black uppercase tracking-wider transition-colors duration-300 ${isDarkMode ? 'text-slate-400 group-hover:text-white' : 'text-slate-600 group-hover:text-purple-600'}`}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </span>
        <div className="flex-1"></div>
        <div className={`w-8 h-4 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-purple-600' : 'bg-slate-300'}`}>
          <div className={`w-3 h-3 rounded-full bg-white transition-all duration-300 mt-0.5 ${isDarkMode ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
        </div>
      </button>
    );
  }

  // Navbar Button Style (opsional)
  if (variant === 'navbar') {
    return (
      <button 
        onClick={toggleTheme}
        className={`p-2 rounded-xl transition-all duration-300 ${className}`}
      >
        {isDarkMode ? (
          <Sun size={20} className="text-amber-400" />
        ) : (
          <Moon size={20} className="text-purple-600" />
        )}
      </button>
    );
  }

  // Default style
  return (
    <button 
      onClick={toggleTheme}
      className={`p-3 rounded-xl transition-all duration-300 ${className}`}
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;