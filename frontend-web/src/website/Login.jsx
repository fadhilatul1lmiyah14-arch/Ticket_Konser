import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axiosConfig'; 
import logo from '../assets/logo.png'; 

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login/customer', {
        email: email,
        password: password
      });

      const token = response.data.accessToken || response.data.token;
      const userData = response.data.user;

      if (token && userData) {
        localStorage.setItem('userToken', token); 
        localStorage.setItem('token', token);     
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/'); 
      } else {
        setError("Gagal mendapatkan akses dari server.");
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Email atau Password salah!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 sm:p-6 font-sans">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-[30px] md:rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500 text-left">
        
        {/* SISI KIRI: FORMULIR */}
        <div className="flex-1 p-8 sm:p-10 md:p-14 flex flex-col justify-center bg-white order-1">
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <img src={logo} alt="Logo" className="h-7 sm:h-8 w-auto object-contain" />
            <span className="font-black uppercase tracking-tighter text-slate-900 text-lg sm:text-xl">Raly Ticket</span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-purple-600 mb-2 italic uppercase leading-none">Sign in</h2>
            <p className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8">Access your digital tickets</p>
          </div>

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
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-2 border-slate-900 rounded-xl py-3 sm:py-3.5 px-12 outline-none focus:border-purple-600 font-bold transition-all text-slate-900 text-sm sm:text-base" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-2 border-slate-900 rounded-xl py-3 sm:py-3.5 px-12 outline-none focus:border-purple-600 font-bold transition-all text-slate-900 text-sm sm:text-base" 
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
                <span className="text-[10px] font-black text-purple-600 uppercase cursor-pointer hover:underline tracking-widest">Forgot Password?</span>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3.5 sm:py-4 rounded-full font-black uppercase tracking-widest shadow-lg shadow-purple-200 hover:bg-slate-900 transition-all active:scale-95 mt-4 flex items-center justify-center gap-3 text-xs sm:text-sm"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : "SIGN IN"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">- Or sign in with -</p>
            <button className="w-full border-2 border-slate-900 py-3 rounded-xl flex items-center justify-center gap-3 font-black hover:bg-slate-50 transition active:scale-95">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/auth_service_google.svg" className="w-5 h-5" alt="Google" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Sign in with google</span>
            </button>
          </div>
        </div>

        {/* SISI KANAN/BAWAH: PANEL UNGU */}
        <div className="w-full md:w-[350px] bg-purple-700 p-8 sm:p-10 flex flex-col items-center justify-center text-center text-white relative overflow-hidden order-2">
          {/* Ornamen Latar Belakang */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-600 rounded-full opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-800 rounded-full opacity-30"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black mb-3 italic uppercase leading-tight">New Here?</h2>
            <p className="text-xs sm:text-sm font-medium mb-6 sm:mb-8 leading-relaxed opacity-90 max-w-[250px] mx-auto md:max-w-none">
              Belum punya akun? Daftar sekarang dan amankan baris terdepan konser impianmu!
            </p>
            <button 
              onClick={() => navigate('/register')} 
              className="border-2 border-white px-8 sm:px-10 py-2.5 sm:py-3 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-purple-700 transition-all active:scale-95 text-[9px] sm:text-[10px]"
            >
              SIGN UP
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;