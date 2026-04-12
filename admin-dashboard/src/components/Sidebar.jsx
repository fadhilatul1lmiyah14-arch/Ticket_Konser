import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Music, 
  Database, 
  History, 
  Menu, 
  X,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen
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
      {/* MOBILE TRIGGER - Premium Style */}
      <div className="lg:hidden fixed top-5 left-4 z-[70]">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-gradient-to-br from-purple-900 to-indigo-900 text-purple-300 border border-purple-500/30 shadow-lg active:scale-90 transition-all duration-300 backdrop-blur-sm"
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

      {/* MAIN SIDEBAR - Premium Glass Effect */}
      <aside 
        className={`bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col fixed lg:sticky top-0 h-screen transition-all duration-500 ease-in-out z-[66] border-r border-purple-500/20 shadow-2xl
          ${isExpanded ? 'w-64 p-6' : 'w-20 p-4 items-center'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >        
        {/* Decorative Glow Effect */}
        <div className="absolute top-20 -left-20 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 w-40 h-40 bg-pink-600/20 rounded-full blur-3xl"></div>
        
        {/* Brand Logo & Toggle Button Area */}
        <div className={`flex items-center mb-10 mt-14 lg:mt-0 w-full relative ${isExpanded ? 'justify-between px-2' : 'justify-center'}`}>
          
          {isExpanded && (
            <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-500 overflow-hidden">
              {/* Container Logo Premium */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-60"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-xl flex items-center justify-center shrink-0 shadow-lg group">
                  <img 
                    src={LogoImg} 
                    alt="Logo" 
                    className="w-7 h-7 object-contain transition-all duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-[15px] font-black uppercase italic tracking-tighter leading-none">
                  <span className="text-white">Raly</span> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Admin</span>
                </h1>
                <p className="text-[8px] font-bold text-purple-400/50 uppercase tracking-[0.25em] mt-1.5 whitespace-nowrap flex items-center gap-1">
                  <Sparkles size={8} className="text-purple-400" />
                  Control Panel
                </p>
              </div>
            </div>
          )}
          
          {/* Toggle Button - Menggunakan Icon Menu untuk Collapse dan X untuk Expand */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-xl bg-white/5 text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all duration-300 border border-white/10 hover:border-transparent ${!isExpanded ? 'mt-2' : ''}`}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isExpanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 pr-1 custom-scrollbar overflow-y-auto w-full">
          {isExpanded && (
            <div className="flex items-center gap-2 px-4 mb-4 mt-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
              <p className="text-[9px] font-black text-purple-400/60 uppercase tracking-[0.4em]">
                Main Menu
              </p>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></div>
            </div>
          )}
          
          {menus.map((item) => {
            const active = isActive(item.path);
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`group flex items-center rounded-xl transition-all duration-300 relative overflow-hidden ${
                  isExpanded ? 'px-4 py-3.5 gap-4' : 'p-3 justify-center mb-2'
                } ${
                  active 
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white shadow-lg shadow-purple-500/10' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                )}
                
                {/* Hover Background Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300 ${!active && 'group-hover:opacity-100'}`} />
                
                <div className={`relative z-10 transition-all duration-300 shrink-0 ${active ? 'scale-110 text-purple-400' : 'group-hover:scale-110 group-hover:text-purple-400'}`}>
                  {item.icon}
                </div>
                
                {isExpanded && (
                  <span className={`relative z-10 font-bold text-[11px] uppercase tracking-wider animate-in fade-in duration-500 truncate ${active ? 'text-white' : 'group-hover:translate-x-1 transition-transform'}`}>
                    {item.name}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                {!isExpanded && (
                   <div className="hidden lg:block absolute left-full ml-2 bg-slate-800 border border-purple-500/30 text-purple-300 text-[10px] font-black px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 z-50 uppercase tracking-widest shadow-2xl whitespace-nowrap">
                      {item.name}
                   </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - Premium Version */}
        <div className={`pt-6 border-t border-purple-500/20 mt-auto ${isExpanded ? 'px-4 pb-2' : 'flex justify-center pb-6'}`}>
          <div className="flex items-center gap-2">
             {isExpanded ? (
               <div className="flex flex-col opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-default">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                    <span className="text-[9px] font-black text-purple-300/80 uppercase tracking-[0.2em]">Raly Studio</span>
                  </div>
                  <span className="text-[7px] font-medium text-white/40 italic mt-1">Version 2.0.0</span>
               </div>
             ) : (
               <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-purple-400/40 italic">'26</span>
                 <div className="w-1 h-1 bg-purple-400/30 rounded-full mt-1"></div>
               </div>
             )}
          </div>
        </div>
      </aside>

      <style>{`
        /* Custom Scrollbar for Sidebar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #c084fc, #f472b6);
        }
      `}</style>
    </>
  );
};

export default Sidebar;