import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  Music, 
  Database, 
  History, 
  ChevronRight,
  UserCircle
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  // State untuk menyimpan data admin secara dinamis
  const [adminData, setAdminData] = useState({
    name: 'Administrator',
    email: 'admin@ralyticket.com'
  });

  useEffect(() => {
    // Mengambil data user yang disimpan saat login
    const savedUser = localStorage.getItem('user'); 
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setAdminData({
          name: parsedUser.name || 'Administrator',
          email: parsedUser.email || 'admin@ralyticket.com'
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Daftar menu navigasi
  const menus = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18}/> },
    { name: 'Manage Concert', path: '/concerts', icon: <Music size={18}/> },
    { name: 'Manage Ticket', path: '/tickets', icon: <Ticket size={18}/> },
    { name: 'Master Data', path: '/master-data', icon: <Database size={18}/> },
    { name: 'Order History', path: '/orders', icon: <History size={18}/> },
  ];

  // Fungsi untuk cek menu aktif
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-72 bg-[#E297C1] min-h-screen p-6 flex flex-col sticky top-0 h-screen shadow-[10px_0_30px_rgba(226,151,193,0.2)] z-50">
      
      {/* Brand Logo Section */}
      <div className="mb-12 px-2">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Music size={22} className="text-[#E297C1]" />
            </div>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Raly <span className="text-slate-900/30">Admin</span>
                </h1>
                <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Concert System v1.0</p>
            </div>
        </div>
      </div>

      {/* Profile Brief */}
      <div className="mb-10 px-4 py-4 bg-white/10 rounded-[24px] border border-white/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <UserCircle size={24} />
        </div>
        <div className="overflow-hidden">
            <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">
              {adminData.name}
            </p>
            <p className="text-[8px] font-medium text-white/50 truncate">
              {adminData.email}
            </p>
        </div>
      </div>

      {/* Navigation Links - Tanpa Efek Scroll */}
      <nav className="flex-1 space-y-3">
        <p className="px-4 text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-4">Main Navigation</p>
        {menus.map((item) => {
          const active = isActive(item.path);
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`group flex items-center justify-between px-5 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${
                active 
                  ? 'bg-white text-[#E297C1] shadow-[0_10px_20px_rgba(0,0,0,0.1)] translate-x-2' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:rotate-12'}`}>
                  {item.icon}
                </span>
                {item.name}
              </div>
              {active && <ChevronRight size={14} className="animate-pulse" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Decorative */}
      <div className="pt-8 border-t border-white/10 mt-auto px-4 opacity-20 pointer-events-none">
        <div className="h-1 w-full bg-white/30 rounded-full mb-1"></div>
        <div className="h-1 w-2/3 bg-white/30 rounded-full mb-4"></div>
        <p className="text-[8px] font-black text-white uppercase tracking-[0.3em]">
          &copy; 2026 Raly System
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;