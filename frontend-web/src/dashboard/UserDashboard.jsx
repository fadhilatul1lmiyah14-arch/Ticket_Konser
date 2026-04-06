import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import LogoImg from "../assets/logo.png"; 
import api from "../api/axiosConfig"; 
import { 
  User, ShoppingBag, Ticket, LogOut, Menu as MenuIcon, 
  Loader2, ChevronRight, ShieldCheck, Home, LayoutDashboard, 
  ChevronLeft, Settings, HelpCircle, X
} from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  const isUpdatingRef = useRef(false);

  // 1. Load dari LocalStorage
  const loadLocalData = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && !parsed.avatar && parsed.avatar_seed) {
            parsed.avatar = `https://api.dicebear.com/9.x/toon-head/svg?seed=${parsed.avatar_seed}`;
        }
        setUserData(parsed);
      } catch (e) {
        console.error("Gagal parse data local:", e);
      }
    }
  }, []);

  // 2. Fetch dari API dengan Proteksi Lock
  const fetchUserData = useCallback(async () => {
    if (isUpdatingRef.current) return;

    try {
      const response = await api.get("/auth/me");
      const user = response.data?.user;
      
      if (user) {
        setUserData(prev => {
            if (!prev || prev.avatar_seed !== user.avatar_seed || prev.name !== user.name) {
                const updatedUser = { ...user };
                if (!updatedUser.avatar) {
                    updatedUser.avatar = `https://api.dicebear.com/9.x/toon-head/svg?seed=${user.avatar_seed}`;
                }
                localStorage.setItem("user", JSON.stringify(updatedUser));
                return updatedUser;
            }
            return prev;
        });
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadLocalData();
    fetchUserData();

    const handleUpdate = () => {
      isUpdatingRef.current = true;
      const updatedLocal = localStorage.getItem("user");
      if (updatedLocal) {
        setUserData(JSON.parse(updatedLocal));
      }
      setTimeout(() => {
        isUpdatingRef.current = false;
        fetchUserData();
      }, 1500);
    };

    window.addEventListener('profileUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [fetchUserData, loadLocalData]);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const menus = [
    { name: "Overview", path: "/dashboard/overview", icon: <LayoutDashboard size={20} /> },
    { name: "Profil Saya", path: "/dashboard/profile", icon: <User size={20} /> },
    { name: "Pesanan Saya", path: "/dashboard/orders", icon: <ShoppingBag size={20} /> },
    { name: "Tiket Saya", path: "/dashboard/tickets", icon: <Ticket size={20} /> },
  ];

  const activeMenuName = menus.find(m => location.pathname.includes(m.path))?.name || "Dashboard";

  if (loading && !userData) return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4 p-6">
        <Loader2 className="text-purple-500 animate-spin" size={48} />
        <p className="text-white text-[10px] font-black uppercase text-center tracking-[0.4em] opacity-50 italic">
          Syncing Profile...
        </p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans overflow-x-hidden relative">
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden transition-opacity duration-300" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-[#0F172A] text-white flex flex-col z-[110] transition-all duration-300 ease-in-out 
        ${isSidebarCollapsed ? "w-20" : "w-72"} 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Toggle Collapse Desktop */}
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex absolute -right-3 top-10 bg-purple-600 rounded-full p-1 border-4 border-[#F8FAFC] text-white z-50 transition-transform hover:scale-110">
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Close Mobile Menu */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden absolute right-4 top-6 text-slate-400 hover:text-white">
          <X size={24} />
        </button>

        <div className={`p-6 flex items-center gap-3 border-b border-white/5 h-24 ${isSidebarCollapsed ? "justify-center" : ""}`}>
          <div className="bg-white/10 p-2 rounded-xl">
             <img src={LogoImg} alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          {!isSidebarCollapsed && <h1 className="text-xl font-black tracking-tighter uppercase italic">RALY<span className="text-purple-500">TICKET</span></h1>}
        </div>

        <nav className="flex-1 px-3 mt-6 space-y-2 overflow-y-auto no-scrollbar">
          <Link to="/" className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] text-emerald-400 hover:bg-emerald-500/10 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <Home size={20} />
            {!isSidebarCollapsed && <span>Back to Home</span>}
          </Link>
          <div className="h-[1px] bg-white/5 mx-2 my-4" />
          {menus.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center p-4 rounded-2xl transition-all duration-300 font-bold text-[10px] uppercase tracking-[0.2em] ${isActive ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "text-slate-400 hover:bg-white/5"} ${isSidebarCollapsed ? "justify-center" : "gap-4"}`}>
                <span className={isActive ? "text-white" : "text-purple-500"}>{item.icon}</span>
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all">
            <LogOut size={20} /> 
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full
        ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
        
        {/* Header */}
        <header className="sticky top-0 bg-[#F8FAFC]/90 backdrop-blur-xl z-50 px-4 md:px-6 lg:px-10 py-4 md:py-5 flex items-center justify-between border-b border-slate-200/60">
          <div className="flex items-center gap-3 md:gap-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
               <MenuIcon size={20} />
             </button>
             <h2 className="text-lg md:text-xl lg:text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none truncate max-w-[150px] sm:max-w-none">
               {activeMenuName}
             </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
             <div className="flex items-center gap-3 md:gap-4 pl-3 md:pl-4 border-l border-slate-200">
               <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[11px] font-black text-slate-900 uppercase truncate max-w-[120px] lg:max-w-[150px]">{userData?.name || "User"}</span>
                  <span className="text-[8px] font-black text-purple-600 uppercase flex items-center justify-end gap-1"><ShieldCheck size={10} /> {userData?.role || "CUSTOMER"}</span>
               </div>
               
               <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-lg relative shrink-0">
                  <img 
                    key={userData?.avatar_seed || 'default'} 
                    src={userData?.avatar || `https://api.dicebear.com/9.x/toon-head/svg?seed=${userData?.avatar_seed || 'Felix'}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${userData?.name}&background=6366f1&color=fff`; }} 
                  />
               </div>
             </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-10 w-full max-w-full">
          <Outlet context={{ userData, fetchUserData }} />
        </div>

        {/* Footer */}
        <footer className="px-6 lg:px-10 py-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center opacity-40">
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.4em] text-center">RALY TICKET ENGINE © 2026</p>
            <div className="flex gap-6 md:gap-8">
               <div className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-purple-600 transition-colors">
                 <HelpCircle size={14} />
                 <span className="text-[9px] font-black uppercase">Help</span>
               </div>
               <div className="flex items-center gap-2 text-slate-500 cursor-pointer hover:text-purple-600 transition-colors">
                 <Settings size={14} />
                 <span className="text-[9px] font-black uppercase">Settings</span>
               </div>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default UserDashboard;