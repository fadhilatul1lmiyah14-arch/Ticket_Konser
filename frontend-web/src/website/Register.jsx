import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import api from '../api/axiosConfig'; 
import logo from '../assets/logo.png'; 
import PremiumBackground from '../components/PremiumBackground';

const Register = () => {
  const navigate = useNavigate();

  // State untuk bahasa (default ambil dari localStorage jika ada)
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // State untuk form & feedback
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Aset Bendera Bulat
  const flags = {
    id: "https://flagcdn.com/w40/id.png",
    en: "https://flagcdn.com/w40/gb.png"
  };

  // Kamus Terjemahan
  const translations = {
    id: {
      createAcc: "Buat Akun",
      desc: "Bergabunglah dan dapatkan pengalaman konser terbaikmu",
      namePlace: "Nama Lengkap",
      emailPlace: "Alamat Email",
      passPlace: "Kata Sandi",
      btnSignUp: "DAFTAR SEKARANG",
      orSign: "- Atau daftar dengan -",
      googleSign: "Daftar dengan Google",
      isMember: "Sudah Member?",
      descMember: "Sudah punya akun? Masuk untuk melanjutkan pesanan tiket konser impianmu.",
      logIn: "MASUK",
      errEmpty: "Harap isi semua data!",
      errServer: "Gagal daftar. Pastikan koneksi backend aktif!"
    },
    en: {
      createAcc: "Create Account",
      desc: "Join us and get your best concert experience",
      namePlace: "Full Name",
      emailPlace: "Email Address",
      passPlace: "Password",
      btnSignUp: "SIGN UP NOW",
      orSign: "- Or sign up with -",
      googleSign: "Sign up with Google",
      isMember: "Member?",
      descMember: "Already have an account? Log in to continue your dream concert ticket order.",
      logIn: "LOG IN",
      errEmpty: "Please fill in all fields!",
      errServer: "Failed to register. Make sure backend connection is active!"
    }
  };

  const getTranslation = (key) => translations[lang][key] || key;

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    setShowLangDropdown(false);
    window.dispatchEvent(new Event('languageChanged'));
  };

  // Handle perubahan input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fungsi saat tombol SIGN UP diklik
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError(getTranslation('errEmpty'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log("Register Berhasil:", response.data);
      
      navigate('/login', { 
        state: { registeredEmail: formData.email, message: "Registrasi berhasil! Silakan login." } 
      });

    } catch (err) {
      console.error("Error Register:", err);
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      setError(serverMessage || getTranslation('errServer'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Container Utama */}
        <div className="max-w-4xl w-full bg-slate-900/40 backdrop-blur-2xl rounded-[40px] md:rounded-[50px] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-white/10 relative animate-in fade-in zoom-in duration-500">
          
          {/* BAGIAN FORM (KANAN) */}
          <div className="flex-1 p-8 sm:p-10 md:p-14 text-left relative">
            
            {/* NEW DROP DOWN LANGUAGE SELECTOR - Top Right */}
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

            {/* Logo & Brand */}
            <div className="flex items-center gap-2 mb-10">
              <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
              <span className="font-black uppercase tracking-tighter text-white text-xl">Raly Ticket</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-purple-500 mb-2 italic uppercase leading-none">
              {getTranslation('createAcc')}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
              {getTranslation('desc')}
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  name="name"
                  placeholder={getTranslation('namePlace')} 
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-black/20 border-2 border-slate-700/50 rounded-2xl py-3.5 px-12 outline-none focus:border-purple-500 focus:bg-black/40 transition font-bold text-white text-sm"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  name="email"
                  placeholder={getTranslation('emailPlace')} 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/20 border-2 border-slate-700/50 rounded-2xl py-3.5 px-12 outline-none focus:border-purple-500 focus:bg-black/40 transition font-bold text-white text-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  placeholder={getTranslation('passPlace')} 
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/20 border-2 border-slate-700/50 rounded-2xl py-3.5 px-12 outline-none focus:border-purple-500 focus:bg-black/40 transition font-bold text-white text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-purple-500 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-4 rounded-full font-black uppercase tracking-widest shadow-xl shadow-purple-900/20 hover:bg-white hover:text-purple-700 transition mt-6 active:scale-95 flex items-center justify-center gap-3 text-sm"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : getTranslation('btnSignUp')}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">
                {getTranslation('orSign')}
              </p>
              <button type="button" className="w-full border-2 border-slate-700/50 bg-black/10 py-3.5 rounded-2xl flex items-center justify-center gap-3 font-black text-white hover:bg-white hover:text-black transition-all active:scale-95 text-xs sm:text-sm">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/auth_service_google.svg" className="w-5 h-5" alt="Google" />
                <span className="font-black uppercase tracking-wider">{getTranslation('googleSign')}</span>
              </button>
            </div>
          </div>

          {/* BAGIAN INFO (KIRI) */}
          <div className="bg-purple-700/40 backdrop-blur-xl w-full md:w-[380px] p-10 md:p-14 flex flex-col items-center justify-center text-center text-white relative overflow-hidden order-1 border-r border-white/10">
            {/* Decorative Circles */}
            <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 -mr-16 -mb-16 w-48 h-48 bg-purple-800 rounded-full opacity-30 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-4 italic uppercase leading-tight">
                {getTranslation('isMember')}
              </h2>
              <p className="text-sm font-medium mb-10 leading-relaxed opacity-80 max-w-[250px] mx-auto">
                {getTranslation('descMember')}
              </p>
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="border-2 border-white px-12 py-3.5 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-purple-900 transition active:scale-95 text-[11px]"
              >
                {getTranslation('logIn')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </PremiumBackground>
  );
};

export default Register;