import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, ShoppingBag, Ticket, Settings, LogOut, 
  Calendar, MapPin, QrCode, CheckCircle2, Star, ShieldCheck, ArrowRight
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profil Saya');
  
  // State untuk data user (Mengambil data nyata dari sistem login/register)
  const [userData, setUserData] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    role: 'New Member'
  });

  // Ambil data user dari localStorage saat komponen dimuat
  useEffect(() => {
    // Ambil token untuk proteksi (jika tidak ada, tendang ke login)
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // PERBAIKAN: Mengambil data yang benar-benar tersimpan di localStorage
    // Pastikan di Register/Login kamu menyimpan data dengan key 'userData'
    const savedUser = JSON.parse(localStorage.getItem('userData'));
    
    if (savedUser) {
      setUserData(savedUser);
    } else {
      // Jika data user tidak ditemukan tapi token ada, gunakan fallback netral
      setUserData({
        name: 'Authorized User',
        email: 'user@ralyticket.com',
        role: 'Member'
      });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const menus = [
    { name: 'Profil Saya', icon: <User size={20} /> },
    { name: 'Pesanan Saya', icon: <ShoppingBag size={20} /> },
    { name: 'Tiket Saya', icon: <Ticket size={20} /> },
    { name: 'Edit Akun', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans selection:bg-purple-100">
      
      {/* SIDEBAR - Gaya Premium RalyTicket */}
      <aside className="w-80 bg-[#1e1b4b] text-white hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl z-50">
        <div className="p-10">
          <div className="flex items-center gap-3 mb-16 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-purple-600 p-2 rounded-2xl group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-purple-500/20">
              <Ticket size={26} className="rotate-45" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">RALY<span className="text-purple-400">TICKET</span></h1>
          </div>
          
          <nav className="space-y-4">
            {menus.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.25em] relative overflow-hidden group ${
                  activeTab === item.name 
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-900/40 translate-x-2' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                {item.name}
                {activeTab === item.name && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-10 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 bg-rose-500/10 text-rose-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20 active:scale-95"
          >
            <LogOut size={18} />
            Logout Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 md:p-14 overflow-y-auto">
        
        {/* TOP BAR DASHBOARD */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-14 gap-6">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-3">
                {activeTab}
            </h2>
            <div className="flex items-center gap-3">
                <div className="h-1 w-10 bg-purple-600 rounded-full"></div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">User Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-5 bg-white p-3 pr-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 group hover:border-purple-200 transition-all">
            <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500 text-xl">
                {userData.name.charAt(0)}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{userData.name}</p>
                    <ShieldCheck size={14} className="text-emerald-500" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userData.role}</p>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          {/* TAB 1: PROFIL SAYA (NYATA) */}
          {activeTab === 'Profil Saya' && (
            <div className="space-y-10">
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <Star size={40} className="text-purple-50 opacity-10 rotate-12" />
                </div>

                <div className="relative group">
                  <div className="w-40 h-40 bg-slate-50 rounded-[3.5rem] flex items-center justify-center border-8 border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${userData.name}&background=6366f1&color=fff&size=256`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl border-8 border-white shadow-xl">
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                <div className="text-center lg:text-left flex-1">
                  <div className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                    Member Since Oct 2026
                  </div>
                  <h3 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter mb-3 leading-none">
                    {userData.name}
                  </h3>
                  <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-xs mb-8 flex items-center justify-center lg:justify-start gap-2">
                    <MapPin size={14} className="text-purple-600" /> Ambon, Indonesia
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 transition-colors shadow-lg active:scale-95">
                        Edit Profile
                    </button>
                    <button className="bg-white border-2 border-slate-100 text-slate-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors active:scale-95">
                        Verifikasi ID
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Upcoming Events', val: '02', sub: 'Ready to Rock', color: 'text-purple-600' },
                  { label: 'Order History', val: '12', sub: 'Completed Trans', color: 'text-slate-900' },
                  { label: 'Raly Points', val: '2.4K', sub: 'Claim Rewards', color: 'text-emerald-500' },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:bg-purple-600 transition-all duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 group-hover:text-purple-200">{s.label}</p>
                    <p className={`text-5xl font-black italic tracking-tighter mb-2 group-hover:text-white transition-colors ${s.color}`}>{s.val}</p>
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-[10px] font-bold text-slate-300 uppercase group-hover:text-purple-100">{s.sub}</p>
                        <ArrowRight size={16} className="text-slate-200 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PESANAN SAYA */}
          {activeTab === 'Pesanan Saya' && (
            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="p-8 md:p-12 border-b border-slate-50 flex justify-between items-center">
                  <h4 className="font-black uppercase italic tracking-tighter text-xl">Recent Transactions</h4>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-400">Total 12 Pesanan</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <tr>
                        <th className="px-12 py-8">Event Details</th>
                        <th className="px-12 py-8 text-center">Schedule</th>
                        <th className="px-12 py-8 text-center">Price</th>
                        <th className="px-12 py-8 text-right">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {[
                        { name: 'World of Dance Ambon', date: '25 Oct 2026', price: 'Rp 200.000', status: 'Success' },
                        { name: 'Coldplay World Tour', date: '12 Oct 2026', price: 'Rp 950.000', status: 'Success' },
                        { name: 'Tulus Tur Manusia', date: '05 Sep 2025', price: 'Rp 450.000', status: 'Expired' },
                    ].map((order, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-12 py-8">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 uppercase italic tracking-tighter text-base">{order.name}</p>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">ID: #ORD-{8234 + i}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-12 py-8 text-center">
                            <p className="text-xs font-black text-slate-500 uppercase">{order.date}</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">19:00 PM</p>
                        </td>
                        <td className="px-12 py-8 text-center">
                            <p className="text-sm font-black text-purple-600 italic tracking-tight">{order.price}</p>
                        </td>
                        <td className="px-12 py-8 text-right">
                            <span className={`px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${
                                order.status === 'Success' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}>
                            {order.status === 'Success' && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                            {order.status}
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TIKET SAYA */}
          {activeTab === 'Tiket Saya' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {[
                { title: 'World of Dance Ambon', date: '25 Oct 2026', seat: 'Regular Floor', color: 'from-purple-600 to-indigo-700' },
                { title: 'Coldplay World Tour', date: '12 Oct 2026', seat: 'VIP Section', color: 'from-slate-800 to-slate-900' },
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl hover:translate-y-[-5px] transition-all duration-500 border-l-8 border-l-purple-600">
                  <div className={`md:w-40 bg-gradient-to-br ${t.color} p-10 flex flex-col items-center justify-center text-white gap-4 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <QrCode size={60} className="relative z-10 group-hover:scale-110 transition-transform" />
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] relative z-10">Scan Venue</p>
                  </div>
                  <div className="p-10 flex-1 relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Ticket size={80} className="rotate-12" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter mb-6 leading-tight group-hover:text-purple-600 transition-colors">
                        {t.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Schedule</p>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-2"><Calendar size={12} className="text-purple-600" /> {t.date}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Seat Class</p>
                            <p className="text-xs font-bold text-purple-600 uppercase tracking-tighter">{t.seat}</p>
                        </div>
                    </div>
                    <button className="w-full bg-slate-50 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-purple-600 hover:text-white transition-all shadow-sm">
                      Open Digital Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: EDIT AKUN */}
          {activeTab === 'Edit Akun' && (
            <div className="bg-white p-12 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 max-w-3xl">
              <div className="mb-12">
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Security & Identity</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Manage your personal information safely</p>
              </div>
              <form className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Display Name</label>
                    <input 
                        type="text" 
                        defaultValue={userData.name} 
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-5 font-bold text-sm text-slate-900 focus:border-purple-600 focus:bg-white outline-none transition-all shadow-inner" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Public ID</label>
                    <input 
                        type="text" 
                        placeholder="@username"
                        className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-5 font-bold text-sm text-slate-900 focus:border-purple-600 focus:bg-white outline-none transition-all shadow-inner" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Primary Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={userData.email} 
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-5 font-bold text-sm text-slate-900 focus:border-purple-600 focus:bg-white outline-none transition-all shadow-inner" 
                  />
                </div>
                <div className="pt-6">
                  <button type="button" className="w-full bg-[#1e1b4b] text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-purple-600 shadow-2xl shadow-purple-900/30 active:scale-95 transition-all duration-300">
                    Save Changes & Sync Data
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;