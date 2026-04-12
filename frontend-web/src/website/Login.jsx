import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, ChevronDown, Sun, Moon, Sparkles, Home, X } from 'lucide-react';
import api from '../api/axiosConfig'; 
import logo from '../assets/logo.png'; 
import PremiumBackground from '../components/PremiumBackground';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [lang, setLang] = useState(localStorage.getItem('lang') || 'id'); 
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  // Aset Bendera Bulat
  const flags = {
    id: "https://flagcdn.com/w40/id.png",
    en: "https://flagcdn.com/w40/gb.png"
  };

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : false);
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  // Cek jika user sudah login
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    setShowLangDropdown(false);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const translations = {
    id: {
      signInTitle: "MASUK",
      access: "AKSES TIKET DIGITAL ANDA",
      emailPlace: "Alamat Email",
      passPlace: "Kata Sandi",
      forgot: "LUPA KATA SANDI?",
      forgotTitle: "RESET KATA SANDI",
      forgotDesc: "Masukkan email terdaftar untuk menerima instruksi reset.",
      btnSend: "KIRIM INSTRUKSI",
      btnSignIn: "MASUK",
      newHere: "BARU DI SINI?",
      descNew: "Belum punya akun? Daftar sekarang dan amankan baris terdepan konser impianmu!",
      signUp: "DAFTAR SEKARANG",
      errAuth: "Email atau Password salah!",
      errServer: "Gagal mendapatkan akses dari server.",
      backToHome: "Kembali ke Beranda"
    },
    en: {
      signInTitle: "SIGN IN",
      access: "ACCESS YOUR DIGITAL TICKETS",
      emailPlace: "Email Address",
      passPlace: "Password",
      forgot: "FORGOT PASSWORD?",
      forgotTitle: "RESET PASSWORD",
      forgotDesc: "Enter your registered email to receive reset instructions.",
      btnSend: "SEND INSTRUCTIONS",
      btnSignIn: "SIGN IN",
      newHere: "NEW HERE?",
      descNew: "Don't have an account? Register now and secure the front row of your dream concert!",
      signUp: "SIGN UP",
      errAuth: "Incorrect Email or Password!",
      errServer: "Failed to get access from server.",
      backToHome: "Back to Home"
    }
  };

  const getTranslation = (key) => translations[lang][key] || key;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      const response = await api.post('/auth/login/customer', {
        email: email,
        password: password
      });

      const data = response.data;
      const token = data.accessToken || data.token || data.data?.token;
      const userData = data.user || data.data?.user;

      if (token) {
        localStorage.setItem('token', token); 
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        window.dispatchEvent(new Event("storage"));
        navigate('/', { replace: true });
      } else {
        setError(data.message || getTranslation('errAuth'));
      }
    } catch (err) {
      console.error("Login Error Details:", err.response?.data);
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           getTranslation('errServer');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = async (e) => {
  e.preventDefault();
  setForgotLoading(true);
  setForgotMessage({ type: '', text: '' });

  try {
    const response = await api.post('/auth/forgot-password', { email: forgotEmail });
    setForgotMessage({ type: 'success', text: response.data.message });
    // Tutup modal otomatis setelah 3 detik jika berhasil
    setTimeout(() => {
      setIsModalOpen(false);
      setForgotEmail('');
      setForgotMessage({ type: '', text: '' });
    }, 3000);
  } catch (err) {
    setForgotMessage({ 
      type: 'error', 
      text: err.response?.data?.error || "Gagal memproses permintaan." 
    });
  } finally {
    setForgotLoading(false);
  }
};

  // Light mode specific styles
  const cardClass = !isDarkMode 
    ? "bg-white/60 backdrop-blur-2xl border-slate-200" 
    : "bg-slate-900/40 backdrop-blur-2xl border-white/10";
  
  const logoTextClass = !isDarkMode 
    ? "bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent" 
    : "text-white";
  
  const titleClass = !isDarkMode ? "text-purple-600" : "text-purple-500";
  const subtitleClass = !isDarkMode ? "text-slate-500" : "text-slate-400";
  
  const inputClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 focus:border-purple-500 focus:bg-white/80 text-slate-800 placeholder:text-slate-400" 
    : "bg-black/20 border-slate-700/50 focus:border-purple-500 focus:bg-black/40 text-white";
  
  const inputIconClass = !isDarkMode ? "text-slate-400" : "text-slate-500";
  
  const forgotClass = !isDarkMode 
    ? "text-purple-500 hover:text-slate-800" 
    : "text-purple-400 hover:text-white";
  
  const buttonClass = !isDarkMode 
    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-white hover:to-white hover:text-purple-600 shadow-lg shadow-purple-200/50" 
    : "bg-purple-600 text-white hover:bg-white hover:text-purple-700 shadow-xl shadow-purple-900/20";
  
  const rightPanelClass = !isDarkMode 
    ? "bg-gradient-to-br from-purple-500 to-indigo-600 backdrop-blur-xl" 
    : "bg-purple-700/40 backdrop-blur-xl";
  
  const rightPanelTitleClass = !isDarkMode ? "text-white" : "text-white";
  const rightPanelDescClass = !isDarkMode ? "text-white/80" : "text-white/80";
  const rightPanelButtonClass = !isDarkMode 
    ? "border-white text-white hover:bg-white hover:text-purple-600" 
    : "border-white text-white hover:bg-white hover:text-purple-900";
  
  const errorClass = !isDarkMode 
    ? "bg-red-100/80 border-l-4 border-red-500 text-red-600" 
    : "bg-red-500/10 border-l-4 border-red-500 text-red-400";
  
  const langButtonClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 hover:bg-white/80" 
    : "bg-black/30 border-white/10 hover:bg-black/50";
  
  const langDropdownClass = !isDarkMode 
    ? "bg-white border-slate-200 shadow-xl" 
    : "bg-slate-900 border-white/10 shadow-2xl";
  
  const langOptionClass = !isDarkMode 
    ? "text-slate-600 hover:bg-slate-100" 
    : "text-slate-300 hover:bg-white/5";
  const langActiveClass = !isDarkMode 
    ? "bg-purple-100 text-purple-600" 
    : "bg-purple-600/20 text-purple-400";
  
  const backButtonClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 text-slate-700 hover:bg-purple-100 hover:text-purple-600 hover:border-purple-300" 
    : "bg-white/5 border-white/10 text-white/80 hover:bg-purple-600 hover:text-white hover:border-purple-500";

  return (
    <PremiumBackground isLightMode={!isDarkMode}>
      {/* Theme Toggle - Floating Button */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle variant="navbar" />
      </div>

      {/* Tombol Kembali ke Beranda - Pojok Kiri Atas */}
      <div className="fixed top-6 left-6 z-50">
        <button
          onClick={() => navigate('/')}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 active:scale-95 hover:shadow-lg ${backButtonClass}`}
        >
          <Home size={18} />
          <span className="text-[11px] font-black uppercase tracking-wider hidden sm:inline">
            {getTranslation('backToHome')}
          </span>
        </button>
      </div>

      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans text-left">
        <div className={`flex flex-col md:flex-row w-full max-w-4xl rounded-[40px] md:rounded-[50px] shadow-2xl overflow-hidden border animate-in fade-in zoom-in duration-500 relative ${cardClass}`}>
          
          {/* Sisi Kiri: Form Login */}
          <div className="flex-1 p-8 sm:p-10 md:p-14 flex flex-col justify-center order-1 relative">
            
            {/* Dropdown Bahasa */}
            <div className="absolute top-8 right-8 z-30">
              <button 
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border backdrop-blur-md transition-all active:scale-95 ${langButtonClass}`}
              >
                <img src={flags[lang]} alt={lang} className="w-5 h-5 rounded-full object-cover border border-white/20" />
                <ChevronDown size={14} className={`text-purple-400 transition-transform duration-300 ${showLangDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showLangDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangDropdown(false)}></div>
                  <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2 border ${langDropdownClass}`}>
                    <button 
                      type="button"
                      onClick={() => changeLanguage('id')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition ${lang === 'id' ? langActiveClass : langOptionClass}`}
                    >
                      <img src={flags.id} alt="ID" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bahasa Indonesia</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => changeLanguage('en')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition ${lang === 'en' ? langActiveClass : langOptionClass}`}
                    >
                      <img src={flags.en} alt="EN" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[10px] font-black uppercase tracking-widest">English</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-10">
              <div className="relative">
                <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
                <Sparkles size={10} className="absolute -top-1 -right-1 text-purple-400 animate-pulse" />
              </div>
              <span className={`font-black uppercase tracking-tighter text-xl ${logoTextClass}`}>Raly Ticket</span>
            </div>

            <h2 className={`text-4xl sm:text-5xl font-black mb-2 italic uppercase leading-none ${titleClass}`}>
              {getTranslation('signInTitle')}
            </h2>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-10 ${subtitleClass}`}>
              {getTranslation('access')}
            </p>

            {error && (
              <div className={`mb-6 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-3 ${errorClass}`}>
                <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-purple-500 ${inputIconClass}`} size={18} />
                <input 
                  type="email" 
                  placeholder={getTranslation('emailPlace')} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full border-2 rounded-2xl py-3.5 px-12 outline-none font-bold transition-all text-sm ${inputClass}`} 
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-purple-500 ${inputIconClass}`} size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={getTranslation('passPlace')} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full border-2 rounded-2xl py-3.5 px-12 outline-none font-bold transition-all text-sm ${inputClass}`} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-purple-500 ${inputIconClass}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
              </div>
              
              <div className="flex justify-end pt-1">
                <span onClick={() => setIsModalOpen(true)} className={`text-[10px] font-black uppercase cursor-pointer transition-colors tracking-widest ${forgotClass}`}>
                  {getTranslation('forgot')}
                </span>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 rounded-full font-black uppercase tracking-widest transition-all active:scale-95 mt-6 flex items-center justify-center gap-3 text-sm relative overflow-hidden group ${buttonClass}`}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10 flex items-center gap-3">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : getTranslation('btnSignIn')}
                </span>
              </button>
            </form>
          </div>

          {/* Sisi Kanan: Info Register - Premium Gradient */}
          <div className={`w-full md:w-[380px] p-10 md:p-14 flex flex-col items-center justify-center text-center relative overflow-hidden order-2 border-l border-white/10 ${rightPanelClass}`}>
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-indigo-500/20 animate-pulse"></div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500 rounded-full opacity-30 blur-3xl animate-ping" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-pink-500 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500 rounded-full opacity-20 blur-2xl animate-spin-slow"></div>
            
            {/* Floating Stars */}
            <div className="absolute top-10 left-10 text-white/20 animate-float">
              <Sparkles size={24} />
            </div>
            <div className="absolute bottom-10 right-10 text-white/20 animate-float-delay">
              <Sparkles size={16} />
            </div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 animate-bounce-slow">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className={`text-3xl sm:text-4xl font-black mb-4 italic uppercase leading-tight ${rightPanelTitleClass}`}>
                {getTranslation('newHere')}
              </h2>
              <p className={`text-sm font-medium mb-10 leading-relaxed max-w-[250px] mx-auto ${rightPanelDescClass}`}>
                {getTranslation('descNew')}
              </p>
              <button 
                type="button"
                onClick={() => navigate('/register')} 
                className={`border-2 px-12 py-3.5 rounded-full font-black uppercase tracking-widest transition-all active:scale-95 text-[11px] relative overflow-hidden group ${rightPanelButtonClass}`}
              >
                <span className="absolute inset-0 w-full h-full bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                <span className="relative z-10 group-hover:text-purple-600 transition-colors">
                  {getTranslation('signUp')}
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>
      {isModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    {/* Overlay klik luar untuk tutup */}
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
    
    <div className={`relative w-full max-w-md rounded-[32px] p-8 border animate-in zoom-in duration-300 ${!isDarkMode ? "bg-white border-slate-200 shadow-2xl" : "bg-slate-900 border-white/10 shadow-2xl"}`}>
      <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-purple-500 transition-colors">
        <X size={20} />
      </button>
      
      <div className="text-center mb-8">
        {/* Menggunakan translation untuk Judul */}
        <h3 className={`text-2xl font-black italic uppercase ${!isDarkMode ? "text-slate-800" : "text-white"}`}>
          {getTranslation('forgotTitle')}
        </h3>
        {/* Menggunakan translation untuk Deskripsi */}
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
          {getTranslation('forgotDesc')}
        </p>
      </div>

      {forgotMessage.text && (
        <div className={`mb-6 p-3 rounded-xl text-[10px] font-black uppercase text-center ${forgotMessage.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
          {forgotMessage.text}
        </div>
      )}

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="relative">
          <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${inputIconClass}`} size={18} />
          <input 
            type="email" 
            placeholder={getTranslation('emailPlace')} // Placeholder juga ikut bahasa
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            required
            className={`w-full border-2 rounded-2xl py-3.5 px-12 outline-none font-bold text-sm ${inputClass}`} 
          />
        </div>
        <button 
          type="submit" 
          disabled={forgotLoading}
          className={`w-full py-4 rounded-full font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 text-sm ${buttonClass}`}
        >
          {/* Menggunakan translation untuk Tombol */}
          {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : getTranslation('btnSend')}
        </button>
      </form>
    </div>
  </div>
)}

      <style>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(10deg); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-10deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 5s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </PremiumBackground>
  );
};

export default Login;