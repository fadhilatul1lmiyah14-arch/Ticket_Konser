import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music, 
  Database, 
  History, 
  Menu, 
  X,
  Ticket 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State untuk Collapse/Expand Sidebar (Desktop)
  const [isExpanded, setIsExpanded] = useState(true);
  // State tambahan untuk mobile toggle
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Menutup sidebar otomatis saat navigasi di mobile agar konten kelihatan
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Efek untuk menangani ukuran layar otomatis
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsExpanded(true); 
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menus = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: <LayoutDashboard size={20}/> 
    },
    { 
      name: 'Manage Concert', 
      path: '/admin/manage-concert', 
      icon: <Music size={20}/> 
    },
    { 
      name: 'Manage Ticket', 
      path: '/admin/tickets', 
      icon: <Ticket size={20}/> 
    },
    { 
      name: 'Order History', 
      path: '/admin/orders', 
      icon: <History size={20}/> 
    },
    { 
      name: 'Master Data', 
      path: '/admin/master-data', 
      icon: <Database size={20}/> 
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* MOBILE TRIGGER - Menyesuaikan dengan Navbar di gambar */}
      <div className="lg:hidden fixed top-5 left-4 z-[70]">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-[#1A1A2E] text-[#E297C1] border border-white/10 shadow-lg active:scale-90 transition-all"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE OVERLAY - Agar konten di belakang tidak bisa diinteraksi saat menu buka */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* MAIN SIDEBAR */}
      <aside 
        className={`bg-[#1A1A2E] flex flex-col fixed lg:sticky top-0 h-screen transition-all duration-500 ease-in-out z-[66] border-r border-white/5 
          ${isExpanded ? 'w-64 p-6' : 'w-20 p-4 items-center'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        
        {/* Brand Logo & Toggle Button */}
        <div className={`flex items-center mb-10 mt-14 lg:mt-0 ${isExpanded ? 'justify-between px-2' : 'justify-center'}`}>
          {isExpanded && (
            <div className="flex items-center gap-3 animate-in fade-in duration-500">
              <div className="w-9 h-9 bg-[#E297C1] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(226,151,193,0.3)] transform rotate-6 hover:rotate-0 transition-transform shrink-0">
                <Music size={20} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-sm font-black text-white italic tracking-tighter uppercase leading-none whitespace-nowrap">
                  Raly <span className="text-[#E297C1]">Admin</span>
                </h1>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 whitespace-nowrap">Management</p>
              </div>
            </div>
          )}
          
          {/* Toggle Button Desktop */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden lg:block p-2 rounded-xl bg-white/5 text-white hover:bg-[#E297C1] transition-all duration-300"
          >
            {isExpanded ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 pr-1 custom-scrollbar overflow-y-auto w-full">
          {isExpanded && (
            <p className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Main Navigation</p>
          )}
          
          {menus.map((item) => {
            const active = isActive(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`group flex items-center rounded-xl transition-all duration-500 relative ${
                  isExpanded ? 'px-4 py-4 gap-4' : 'p-3 justify-center mb-2'
                } ${
                  active 
                    ? 'bg-[#E297C1] text-white shadow-[0_10px_25px_rgba(226,151,193,0.25)]' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                {/* Active Indicator */}
                {active && isExpanded && (
                  <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
                )}
                
                <div className={`transition-all duration-500 shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`}>
                  {item.icon}
                </div>
                
                {isExpanded && (
                  <span className="font-black text-[10px] uppercase tracking-[0.15em] animate-in fade-in slide-in-from-left-4 duration-500 truncate">
                    {item.name}
                  </span>
                )}

                {/* Tooltip Desktop Only */}
                {!isExpanded && (
                   <div className="hidden lg:block absolute left-16 bg-[#E297C1] text-white text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 z-50 uppercase tracking-widest whitespace-nowrap shadow-xl">
                      {item.name}
                   </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`pt-6 border-t border-white/5 mt-auto ${isExpanded ? 'px-4' : 'flex justify-center'}`}>
          <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] italic whitespace-nowrap">
            {isExpanded ? '© 2026 Raly • v1.0' : "'26"}
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;