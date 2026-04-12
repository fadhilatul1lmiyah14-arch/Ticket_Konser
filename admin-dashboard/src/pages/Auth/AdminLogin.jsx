import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; 
import logo from '../../assets/logo.png'; 
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Loader2,
  Sparkles,
  Music2
} from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login/admin', {
        email: email,
        password: password
      });

      const token = response.data.accessToken || response.data.token;
      const user = response.data.user;

      if (token) {
        localStorage.setItem('adminToken', token);
        
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('adminEmail', user.email);
          localStorage.setItem('adminRole', user.role);
          
          if (user.role?.toUpperCase() !== 'ADMIN') {
             throw new Error("ROLE_NOT_AUTHORIZED");
          }
        }

        navigate('/admin/dashboard'); 
      } else {
        setError("FAILED: Token not found in server response.");
      }
      
    } catch (err) {
      if (err.message === "ROLE_NOT_AUTHORIZED") {
        setError("ACCESS DENIED: YOUR ACCOUNT IS NOT ADMIN!");
      } else if (!err.response) {
        setError("CONNECTION FAILED: SERVER NOT RESPONDING!");
      } else if (err.response.status === 401) {
        setError("INCORRECT EMAIL OR PASSWORD!");
      } else {
        setError(err.response.data?.error || err.response.data?.message || "SOMETHING WENT WRONG");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Premium Background Decor - Soft Music Inspired */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Gradient Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-100/40 via-pink-100/30 to-transparent rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-indigo-100/30 via-purple-100/20 to-transparent rounded-full blur-[100px]"></div>
        
        {/* Floating Music Notes Decor */}
        <div className="absolute top-[15%] left-[5%] opacity-10 animate-float-slow">
          <Music2 size={40} className="text-purple-400" />
        </div>
        <div className="absolute bottom-[20%] right-[8%] opacity-10 animate-float-delay">
          <Music2 size={32} className="text-pink-400" />
        </div>
        <div className="absolute top-[40%] right-[15%] opacity-5 animate-float">
          <Sparkles size={24} className="text-purple-500" />
        </div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" 
             style={{ 
               backgroundImage: `repeating-linear-gradient(transparent, transparent 2px, rgba(139, 92, 246, 0.3) 2px, rgba(139, 92, 246, 0.3) 4px), 
                                 repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 92, 246, 0.3) 2px, rgba(139, 92, 246, 0.3) 4px)`,
               backgroundSize: '40px 40px'
             }}>
        </div>
      </div>

      {/* Main Container - Premium Glass Effect */}
      <div className="max-w-[480px] w-full bg-white/95 backdrop-blur-sm rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] overflow-hidden border border-purple-100/50 p-8 sm:p-12 relative z-10 animate-fade-in-up">
        
        {/* Decorative Top Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 rounded-full"></div>
        
        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5 group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-white to-purple-50 p-4 rounded-3xl shadow-lg border border-purple-100">
              <img 
                src={logo} 
                alt="Raly Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="bg-purple-500 rounded-full p-1.5 shadow-lg">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Raly Admin
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-purple-400"></div>
              <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">SECURE ACCESS POINT</p>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-purple-400"></div>
            </div>
          </div>
        </div>

        {/* Error Alert - Premium Style */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50/80 backdrop-blur-sm border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={16} className="text-rose-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-tight leading-tight flex-1">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-[0.2em] flex items-center gap-2">
              <Mail size={12} className="text-purple-400" />
              EMAIL ADDRESS
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              <input 
                type="email" 
                placeholder="admin@ralyticket.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-purple-400 focus:bg-white font-medium transition-all text-sm text-slate-700 placeholder:text-slate-400"
                required
              />
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-500 ml-4 tracking-[0.2em] flex items-center gap-2">
              <Lock size={12} className="text-purple-400" />
              PASSWORD
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-14 outline-none focus:border-purple-400 focus:bg-white font-medium transition-all text-sm text-slate-700 placeholder:text-slate-400"
                required
              />
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mt-6 active:scale-[0.97] relative overflow-hidden group ${
              isLoading 
                ? 'bg-slate-100 text-slate-400 cursor-wait' 
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-200/50'
            }`}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            {isLoading ? (
              <Loader2 className="animate-spin relative z-10" size={20} />
            ) : (
              <>
                <span className="relative z-10 flex items-center gap-3">
                  ACCESS DASHBOARD <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            <div className="w-1 h-1 bg-pink-400 rounded-full"></div>
            <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
          </div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
            © 2026 RALY TICKET SYSTEM • ADMIN PORTAL v.2.0
          </p>
          <p className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-1">
            POWERED BY RALY TICKET ENGINE
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }
        
        @keyframes float-delay {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-delay 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float {
          animation: float-slow 4s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;