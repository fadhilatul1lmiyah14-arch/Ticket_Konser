import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axiosConfig'; 
import logo from '../assets/logo.png'; 

const Register = () => {
  const navigate = useNavigate();

  // State untuk form & feedback
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      setError("Harap isi semua data!");
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
      setError(serverMessage || "Gagal daftar. Pastikan koneksi backend aktif!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 font-sans">
      {/* Container Utama - Responsive Grid */}
      <div className="max-w-4xl w-full bg-white rounded-[30px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-slate-100">
        
        {/* BAGIAN FORM (KANAN) */}
        <div className="flex-1 p-8 sm:p-10 md:p-16 text-left">
          {/* Logo & Brand - Centered on Mobile */}
          <div className="flex items-center justify-center md:justify-start gap-2 mb-8 md:mb-10">
            <div className="p-0.5">
              <img src={logo} alt="Logo" className="h-7 sm:h-8 w-auto object-contain" />
            </div>
            <span className="font-black uppercase tracking-tighter text-slate-900 text-lg sm:text-xl">Raly Ticket</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-purple-600 mb-3 italic uppercase text-center md:text-left">Create Account</h2>
          <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-8 text-center md:text-left">Join us and get your best concert experience</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignUp}>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                name="name"
                placeholder="Full Name" 
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl py-3 px-12 outline-none focus:border-purple-600 transition font-bold text-slate-900 text-sm"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl py-3 px-12 outline-none focus:border-purple-600 transition font-bold text-slate-900 text-sm"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl py-3 px-12 outline-none focus:border-purple-600 transition font-bold text-slate-900 text-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3.5 sm:py-4 rounded-full font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition mt-6 active:scale-95 flex items-center justify-center gap-3 text-xs sm:text-sm"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : "SIGN UP NOW"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">- Or sign up with -</p>
            <button className="w-full border-2 border-slate-900 py-3 rounded-xl flex items-center justify-center gap-3 font-black hover:bg-slate-50 transition text-sm">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/auth_service_google.svg" className="w-5 h-5" alt="Google" />
              <span className="text-xs sm:text-sm">Sign up with Google</span>
            </button>
          </div>
        </div>

        {/* BAGIAN UNGU (KIRI/BAWAH) */}
        <div className="bg-purple-700 w-full md:w-72 lg:w-80 p-8 sm:p-10 flex flex-col items-center justify-center text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 italic uppercase leading-tight">Member?</h2>
          <p className="text-xs sm:text-sm font-medium mb-6 sm:mb-8 leading-relaxed opacity-80 italic max-w-[250px] md:max-w-none">
            Sudah punya akun? Masuk untuk melanjutkan pesanan tiket konser impianmu.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="border-2 border-white px-8 sm:px-10 py-2.5 sm:py-3 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-purple-700 transition text-[10px] sm:text-xs"
          >
            LOG IN
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;