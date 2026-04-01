import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axiosConfig'; 
import logo from '../assets/logo.png'; // Import logo sesuai file path kamu

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
  const [showPassword, setShowPassword] = useState(false); // State untuk lensa password

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
    
    // Validasi Sederhana
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Harap isi semua data!");
      setIsLoading(false);
      return;
    }

    try {
      /**
       * PERBAIKAN: 
       * Pastikan endpoint ini sesuai dengan backend kamu. 
       * Jika menggunakan axiosConfig, pastikan baseURL-nya http://192.168.0.242:3000
       */
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      console.log("Register Berhasil:", response.data);
      
      // Redirect ke login setelah sukses
      navigate('/login', { 
        state: { registeredEmail: formData.email, message: "Registrasi berhasil! Silakan login." } 
      });

    } catch (err) {
      console.error("Error Register:", err);
      // Menangkap pesan error dari backend (misal: Email sudah terdaftar)
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      setError(serverMessage || "Gagal daftar. Pastikan koneksi backend aktif!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
      {/* Container Utama */}
      <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-slate-100">
        
        {/* BAGIAN FORM (KANAN) */}
        <div className="flex-1 p-10 md:p-16 text-left">
          <div className="flex items-center gap-2 mb-10">
            <div className="p-0.5">
              <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
            </div>
            <span className="font-black uppercase tracking-tighter text-slate-900 text-xl">Raly Ticket</span>
          </div>

          <h2 className="text-3xl font-black text-purple-600 mb-4 italic uppercase">Create Account</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Join us and get your best concert experience</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignUp}>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="text" 
                name="name"
                placeholder="Full Name" 
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl py-3 px-12 outline-none focus:border-purple-600 transition font-bold text-slate-900"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl py-3 px-12 outline-none focus:border-purple-600 transition font-bold text-slate-900"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl py-3 px-12 outline-none focus:border-purple-600 transition font-bold text-slate-900"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-purple-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-4 rounded-full font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition mt-6 active:scale-95 flex items-center justify-center gap-3"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : "SIGN UP NOW"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">- Or sign up with -</p>
            <button className="w-full border-2 border-slate-900 py-3 rounded-xl flex items-center justify-center gap-3 font-black hover:bg-slate-50 transition text-sm">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/auth_service_google.svg" className="w-5 h-5" alt="Google" />
              Sign up with Google
            </button>
          </div>
        </div>

        {/* BAGIAN UNGU (KIRI) */}
        <div className="bg-purple-700 w-full md:w-80 p-10 flex flex-col items-center justify-center text-center text-white">
          <h2 className="text-3xl font-black mb-4 italic uppercase leading-tight">Member?</h2>
          <p className="text-sm font-medium mb-8 leading-relaxed opacity-80 italic">
            Sudah punya akun? Masuk untuk melanjutkan pesanan tiket konser impianmu.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="border-2 border-white px-10 py-3 rounded-full font-black uppercase tracking-widest hover:bg-white hover:text-purple-700 transition text-xs"
          >
            LOG IN
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;