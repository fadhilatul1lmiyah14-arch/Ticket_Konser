import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import api from '../api/axiosConfig'; 
import logo from '../assets/logo.png'; 
import PremiumBackground from '../components/PremiumBackground';

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

  // Aset Bendera Bulat
  const flags = {
    id: "https://flagcdn.com/w40/id.png",
    en: "https://flagcdn.com/w40/gb.png"
  };

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
      btnSignIn: "MASUK",
      orSign: "- ATAU MASUK DENGAN -",
      googleSign: "MASUK DENGAN GOOGLE",
      newHere: "BARU DI SINI?",
      descNew: "Belum punya akun? Daftar sekarang dan amankan baris terdepan konser impianmu!",
      signUp: "DAFTAR SEKARANG",
      errAuth: "Email atau Password salah!",
      errServer: "Gagal mendapatkan akses dari server."
    },
    en: {
      signInTitle: "SIGN IN",
      access: "ACCESS YOUR DIGITAL TICKETS",
      emailPlace: "Email Address",
      passPlace: "Password",
      forgot: "FORGOT PASSWORD?",
      btnSignIn: "SIGN IN",
      orSign: "- OR SIGN IN WITH -",
      googleSign: "SIGN IN WITH GOOGLE",
      newHere: "NEW HERE?",
      descNew: "Don't have an account? Register now and secure the front row of your dream concert!",
      signUp: "SIGN UP",
      errAuth: "Incorrect Email or Password!",
      errServer: "Failed to get access from server."
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

  return (
    <PremiumBackground>
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans text-left">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-slate-900/40 backdrop-blur-2xl rounded-[40px] md:rounded-[50px] shadow-2xl overflow-hidden border border-white/10 animate-in fade-in zoom-in duration-500 relative">
          
          {/* Sisi Kiri: Form Login */}
          <div className="flex-1 p-8 sm:p-10 md:p-14 flex flex-col justify-center order-1 relative">
            
            {/* Dropdown Bahasa Baru */}
            <div className="absolute top-8 right-8 z-30">
              <button 
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center gap-2 bg-black/30 px-2 py-1.5 rounded-xl border border-white/10 backdrop-blur-md hover:bg-black/50 transition-all active:scale-95"
              >
                <img src={flags[lang]} alt={lang} className="w-5 h-5 rounded-full object-cover border border-white/20" />
                <ChevronDown size={14} className={`text-white transition-transform duration-300 ${showLangDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showLangDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowLangDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2">
                    <button 
                      type="button"
                      onClick={() => changeLanguage('id')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition ${lang === 'id' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-300 hover:bg-white/5'}`}
                    >
                      <img src={flags.id} alt="ID" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bahasa Indonesia</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => changeLanguage('en')}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 transition ${lang === 'en' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-300 hover:bg-white/5'}`}
                    >
                      <img src={flags.en} alt="EN" className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[10px] font-black uppercase tracking-widest">English</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mb-10">
              <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
              <span className="font-black uppercase tracking-tighter text-white text-xl">Raly Ticket</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-purple-500 mb-2 italic uppercase leading-none">
              {getTranslation('signInTitle')}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
              {getTranslation('access')}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  placeholder={getTranslation('emailPlace')} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/20 border-2 border-slate-700/50 rounded-2xl py-3.5 px-12 outline-none focus:border-purple-500 focus:bg-black/40 font-bold transition-all text-white text-sm" 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={getTranslation('passPlace')} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/20 border-2 border-slate-700/50 rounded-2xl py-3.5 px-12 outline-none focus:border-purple-500 focus:bg-black/40 font-bold transition-all text-white text-sm" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-500 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="flex justify-end pt-1">
                <span className="text-[10px] font-black text-purple-400 uppercase cursor-pointer hover:text-white transition-colors tracking-widest">
                  {getTranslation('forgot')}
                </span>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-4 rounded-full font-black uppercase tracking-widest shadow-xl shadow-purple-900/20 hover:bg-white hover:text-purple-700 transition-all active:scale-95 mt-6 flex items-center justify-center gap-3 text-sm"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : getTranslation('btnSignIn')}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">{getTranslation('orSign')}</p>
              <button type="button" className="w-full border-2 border-slate-700/50 bg-black/10 py-3.5 rounded-2xl flex items-center justify-center gap-3 font-black text-white hover:bg-white hover:text-black transition-all active:scale-95">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/auth_service_google.svg" className="w-5 h-5" alt="Google" />
                <span className="text-xs font-black uppercase tracking-wider">{getTranslation('googleSign')}</span>
              </button>
            </div>
          </div>

          {/* Sisi Kanan: Info Register */}
          <div className="w-full md:w-[380px] bg-purple-700/40 backdrop-blur-xl p-10 md:p-14 flex flex-col items-center justify-center text-center text-white relative overflow-hidden order-2 border-l border-white/10">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-800 rounded-full opacity-30 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 italic uppercase leading-tight">{getTranslation('newHere')}</h2>
              <p className="text-sm font-medium mb-10 leading-relaxed opacity-80 max-w-[250px] mx-auto">{getTranslation('descNew')}</p>
              <button 
                type="button"
                onClick={() => navigate('/register')} 
                className="border-2 border-white px-12 py-3.5 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-purple-900 transition-all active:scale-95 text-[11px]"
              >
                {getTranslation('signUp')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </PremiumBackground>
  );
};

export default Login;