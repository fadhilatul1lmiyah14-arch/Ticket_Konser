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

// Import logo dari folder assets
import LogoImg from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

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
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20}/> },
    { name: 'Manage Concert', path: '/admin/manage-concert', icon: <Music size={20}/> },
    { name: 'Manage Ticket', path: '/admin/tickets', icon: <Ticket size={20}/> },
    { name: 'Order History', path: '/admin/orders', icon: <History size={20}/> },
    { name: 'Master Data', path: '/admin/master-data', icon: <Database size={20}/> },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* MOBILE TRIGGER */}
      <div className="lg:hidden fixed top-5 left-4 z-[70]">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-[#1A1A2E] text-[#E297C1] border border-white/10 shadow-lg active:scale-90 transition-all"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
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
        
        {/* Brand Logo & Toggle Button Area */}
        <div className={`flex items-center mb-10 mt-14 lg:mt-0 w-full ${isExpanded ? 'justify-between px-2' : 'justify-center'}`}>
          
          {isExpanded && (
            <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-500 overflow-hidden">
              {/* Container Logo Baru: Memberikan bingkai halus agar logo menyatu */}
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 shadow-inner group">
                <img 
                  src={LogoImg} 
                  alt="Logo" 
                  className="w-7 h-7 object-contain transition-all duration-500 brightness-110 saturate-125"
                  style={{ 
                    // Filter untuk membuat logo sedikit lebih 'glow' dan menyatu dengan warna teks
                    filter: 'drop-shadow(0 0 8px rgba(226, 151, 193, 0.4))' 
                  }}
                />
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-[15px] font-black text-white italic tracking-tighter uppercase leading-none whitespace-nowrap">
                  Raly <span className="text-[#E297C1]">Admin</span>
                </h1>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.25em] mt-1.5 whitespace-nowrap">
                  Control Panel
                </p>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-[#E297C1] transition-all duration-300 border border-white/5 hover:border-transparent ${!isExpanded ? 'mt-2' : ''}`}
          >
            {isExpanded ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 pr-1 custom-scrollbar overflow-y-auto w-full">
          {isExpanded && (
            <p className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 mt-2">
              Main Menu
            </p>
          )}
          
          {menus.map((item) => {
            const active = isActive(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`group flex items-center rounded-xl transition-all duration-300 relative ${
                  isExpanded ? 'px-4 py-3.5 gap-4' : 'p-3 justify-center mb-2'
                } ${
                  active 
                    ? 'bg-gradient-to-r from-[#E297C1] to-[#D17EAD] text-white shadow-[0_8px_20px_rgba(226,151,193,0.2)]' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                {active && isExpanded && (
                  <div className="absolute left-0 w-1 h-5 bg-white rounded-r-full shadow-[0_0_10px_white]" />
                )}
                
                <div className={`transition-all duration-300 shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[#E297C1]'}`}>
                  {item.icon}
                </div>
                
                {isExpanded && (
                  <span className={`font-bold text-[11px] uppercase tracking-wider animate-in fade-in duration-500 truncate ${active ? 'text-white' : 'group-hover:translate-x-1 transition-transform'}`}>
                    {item.name}
                  </span>
                )}

                {!isExpanded && (
                   <div className="hidden lg:block absolute left-16 bg-[#1A1A2E] border border-white/10 text-[#E297C1] text-[10px] font-black px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 z-50 uppercase tracking-widest shadow-2xl">
                      {item.name}
                   </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`pt-6 border-t border-white/5 mt-auto ${isExpanded ? 'px-4 pb-2' : 'flex justify-center pb-6'}`}>
          <div className="flex items-center gap-2">
             {isExpanded ? (
               <div className="flex flex-col opacity-20 hover:opacity-50 transition-opacity cursor-default">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Raly Studio</span>
                  <span className="text-[8px] font-medium text-white italic">Version 1.0.4</span>
               </div>
             ) : (
               <span className="text-[10px] font-black text-white/10 italic">'26</span>
             )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;