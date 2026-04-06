import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; 
import { 
  Lock, 
  Mail, 
  Ticket, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Loader2
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
             throw new Error("ROLE_TIDAK_SESUAI");
          }
        }

        // Redirect ke Admin Dashboard
        navigate('/admin/dashboard'); 
      } else {
        setError("GAGAL: Token tidak ditemukan dalam respon server.");
      }
      
    } catch (err) {
      if (err.message === "ROLE_TIDAK_SESUAI") {
        setError("AKSES DITOLAK: AKUN ANDA BUKAN ROLE ADMIN!");
      } else if (!err.response) {
        setError('KONEKSI GAGAL: SERVER TIDAK MERESPON!');
      } else if (err.response.status === 401) {
        setError('EMAIL ATAU PASSWORD SALAH!');
      } else {
        setError(err.response.data?.error || err.response.data?.message || 'TERJADI KESALAHAN');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#E297C1]/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/40 rounded-full blur-[80px] md:blur-[120px]"></div>

      {/* Main Container */}
      <div className="max-w-[480px] w-full bg-white rounded-[40px] sm:rounded-[56px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden border border-white p-8 sm:p-12 relative z-10 h-fit">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <div className="bg-[#E297C1] p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] mb-4 sm:mb-6 shadow-2xl shadow-pink-200 transform -rotate-6 hover:rotate-0 transition-all duration-500 cursor-pointer group">
            <Ticket size={36} className="text-white group-hover:scale-110 transition-transform sm:w-[42px] sm:h-[42px]" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-black uppercase italic text-slate-900 tracking-tighter leading-none">Raly Admin</h1>
            <div className="flex items-center justify-center gap-2 mt-2 sm:mt-3">
              <ShieldCheck size={14} className="text-[#E297C1]" />
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] sm:tracking-[0.4em]">Secure Access Point</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl sm:rounded-3xl flex items-center gap-3 text-rose-600 animate-in fade-in zoom-in duration-300">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight leading-tight">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Credential ID</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] sm:rounded-[24px] py-4 sm:py-5 pl-14 sm:pl-16 pr-6 outline-none focus:border-[#E297C1] focus:bg-white font-bold transition-all shadow-inner text-sm sm:text-base"
                required
              />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] sm:rounded-[24px] py-4 sm:py-5 pl-14 sm:pl-16 pr-14 sm:pr-16 outline-none focus:border-[#E297C1] focus:bg-white font-bold transition-all shadow-inner text-sm sm:text-base"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#E297C1] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 sm:py-6 rounded-[24px] sm:rounded-[28px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-[11px] shadow-2xl transition-all flex items-center justify-center gap-3 mt-4 sm:mt-8 active:scale-[0.96] ${
              isLoading 
                ? 'bg-slate-100 text-slate-400 cursor-wait' 
                : 'bg-slate-900 text-white hover:bg-[#E297C1] hover:shadow-pink-100'
            }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Authorize Session <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div className="mt-8 sm:mt-12 text-center border-t border-slate-50 pt-6 sm:pt-8">
          <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] sm:tracking-[0.3em]">
            &copy; 2026 Raly Ticket System &bull; V.1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;