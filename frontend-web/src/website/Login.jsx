import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axiosConfig'; 
import logo from '../assets/logo.png'; 

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [lang, setLang] = useState('id'); 
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cek jika user sudah login, langsung lempar ke dashboard atau home
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      navigate('/dashboard/overview', { replace: true });
    }
  }, [navigate]);

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
      // Bersihkan data lama agar tidak konflik
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      const response = await api.post('/auth/login/customer', {
        email: email,
        password: password
      });

      const data = response.data;

      // Logika penentuan token yang fleksibel sesuai response backend
      const token = data.accessToken || data.token || (data.status === "success" && data.data?.token);

      if (token) {
        // 1. Simpan Token
        localStorage.setItem('accessToken', token); 
        
        // 2. Simpan User Data jika ada
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        } else if (data.data?.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        // 3. Trigger Navbar update tanpa reload halaman
        window.dispatchEvent(new Event("storage"));

        // 4. Navigasi: Jika ada 'from', balik ke sana. Jika tidak, ke Home.
        const origin = location.state?.from?.pathname || '/';
        navigate(origin, { replace: true });
        
      } else {
        setError(data.message || getTranslation('errAuth'));
      }

    } catch (err) {
      console.error("Login Error Details:", err.response?.data);
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           getTranslation('errAuth');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 sm:p-6 font-sans text-left">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[40px] md:rounded-[50px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500 relative">
        
        <div className="flex-1 p-8 sm:p-10 md:p-14 flex flex-col justify-center bg-white order-1 relative">
          
          <div className="absolute top-8 right-8 flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-sm z-20">
            <button 
              type="button"
              onClick={() => setLang('id')}
              className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${lang === 'id' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >ID</button>
            <button 
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >EN</button>
          </div>

          <div className="flex items-center gap-2 mb-10">
            <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
            <span className="font-black uppercase tracking-tighter text-slate-900 text-xl">Raly Ticket</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-purple-600 mb-2 italic uppercase leading-none">
            {getTranslation('signInTitle')}
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
            {getTranslation('access')}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase tracking-widest">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignIn}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                placeholder={getTranslation('emailPlace')} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-2 border-slate-900 rounded-2xl py-3.5 px-12 outline-none focus:border-purple-600 font-bold transition-all text-slate-900 text-sm" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder={getTranslation('passPlace')} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-2 border-slate-900 rounded-2xl py-3.5 px-12 outline-none focus:border-purple-600 font-bold transition-all text-slate-900 text-sm" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="flex justify-end pt-1">
              <span className="text-[10px] font-black text-purple-600 uppercase cursor-pointer hover:underline tracking-widest">
                {getTranslation('forgot')}
              </span>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-4 rounded-full font-black uppercase tracking-widest shadow-lg shadow-purple-200 hover:bg-slate-900 transition-all active:scale-95 mt-6 flex items-center justify-center gap-3 text-sm"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : getTranslation('btnSignIn')}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">{getTranslation('orSign')}</p>
            <button type="button" className="w-full border-2 border-slate-900 py-3.5 rounded-2xl flex items-center justify-center gap-3 font-black hover:bg-slate-50 transition active:scale-95">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/auth_service_google.svg" className="w-5 h-5" alt="Google" />
              <span className="text-xs font-black uppercase tracking-wider">{getTranslation('googleSign')}</span>
            </button>
          </div>
        </div>

        <div className="w-full md:w-[380px] bg-purple-700 p-10 md:p-14 flex flex-col items-center justify-center text-center text-white relative overflow-hidden order-2">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-600 rounded-full opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-800 rounded-full opacity-30"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-4 italic uppercase leading-tight">{getTranslation('newHere')}</h2>
            <p className="text-sm font-medium mb-10 leading-relaxed opacity-90 max-w-[250px] mx-auto">{getTranslation('descNew')}</p>
            <button 
              type="button"
              onClick={() => navigate('/register')} 
              className="border-2 border-white px-12 py-3.5 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-purple-700 transition-all active:scale-95 text-[11px]"
            >
              {getTranslation('signUp')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;