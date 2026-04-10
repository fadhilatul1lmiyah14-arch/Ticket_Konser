import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import LogoImg from "../assets/logo.png"; 
import api from "../api/axiosConfig"; 
import PremiumBackground from "../components/PremiumBackground";
import { 
  User, ShoppingBag, Ticket, LogOut, Menu as MenuIcon, 
  Loader2, ChevronRight, ShieldCheck, Home, LayoutDashboard, 
  ChevronLeft, Settings, HelpCircle, ChevronDown
} from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  // LOGIKA BAHASA & DROPDOWN
  const [lang, setLang] = useState(localStorage.getItem("lang") || "id");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const isUpdatingRef = useRef(false);

  // Aset Bendera Bulat
  const flags = {
    id: "https://flagcdn.com/w40/id.png",
    en: "https://flagcdn.com/w40/gb.png"
  };

  useEffect(() => {
    const handleLangChange = () => {
      setLang(localStorage.getItem("lang") || "id");
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    setShowLangDropdown(false);
    window.dispatchEvent(new Event("languageChanged"));
  };

  const loadLocalData = useCallback(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed) {
          const hasCustomization = parsed.avatar && (parsed.avatar.includes('?') || parsed.avatar.includes('&'));
          if (!hasCustomization && parsed.avatar_seed) {
            parsed.avatar = `https://api.dicebear.com/9.x/toon-head/svg?seed=${parsed.avatar_seed}`;
          }
          setUserData(parsed);
        }
        setLoading(false); 
      } catch (e) {
        console.error("Gagal parse data local:", e);
      }
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) { navigate("/login"); return; }
    if (isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    try {
      const response = await api.get("/auth/me");
      const user = response.data?.user || response.data?.data;
      if (user) {
        const updatedUser = { ...user };
        const hasCustomization = updatedUser.avatar && (updatedUser.avatar.includes('?') || updatedUser.avatar.includes('&'));
        if (!hasCustomization) {
          updatedUser.avatar = `https://api.dicebear.com/9.x/toon-head/svg?seed=${user.avatar_seed || 'Felix'}`;
        }
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserData(updatedUser);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/login");
      }
    } finally {
      setLoading(false);
      isUpdatingRef.current = false;
    }
  }, [navigate]);

  useEffect(() => {
    loadLocalData();
    const handleUpdate = () => loadLocalData();
    window.addEventListener('profileUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadLocalData]);

  const handleLogout = () => {
    const msg = lang === "id" ? "Apakah Anda yakin ingin keluar?" : "Are you sure you want to logout?";
    if (window.confirm(msg)) {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  };

  const menus = [
    { name: lang === "id" ? "Ringkasan" : "Overview", path: "/dashboard/overview", icon: <LayoutDashboard size={20} /> },
    { name: lang === "id" ? "Profil Saya" : "My Profile", path: "/dashboard/profile", icon: <User size={20} /> },
    { name: lang === "id" ? "Pesanan Saya" : "My Orders", path: "/dashboard/orders", icon: <ShoppingBag size={20} /> },
    { name: lang === "id" ? "Tiket Saya" : "My Tickets", path: "/dashboard/tickets", icon: <Ticket size={20} /> },
  ];

  const activeMenu = menus.find(m => location.pathname === m.path) || 
                    menus.find(m => location.pathname.startsWith(m.path));
  const activeMenuName = activeMenu ? activeMenu.name : "Dashboard";

  if (loading && !userData) {
    return (
      <PremiumBackground>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
          <Loader2 className="text-purple-500 animate-spin" size={48} />
          <p className="text-white text-[10px] font-black uppercase text-center tracking-[0.4em] opacity-50 italic">
            {lang === "id" ? "Menyinkronkan Profil..." : "Syncing Profile..."}
          </p>
        </div>
      </PremiumBackground>
    );
  }

  return (
    <PremiumBackground>
      <div className="flex min-h-screen font-sans overflow-x-hidden relative">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-screen bg-black/40 backdrop-blur-2xl text-white flex flex-col z-[110] transition-all duration-300 border-r border-white/10
          ${isSidebarCollapsed ? "w-20" : "w-72"} 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex absolute -right-3 top-10 bg-purple-600 rounded-full p-1 border-4 border-[#0F172A] text-white z-50 hover:scale-110 transition-transform">
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className={`p-6 flex items-center gap-3 border-b border-white/10 h-24 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <div className="bg-white/10 p-2 rounded-xl shrink-0 backdrop-blur-lg border border-white/20">
               <img src={LogoImg} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            {!isSidebarCollapsed && <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">RALY<span className="text-purple-500">TICKET</span></h1>}
          </div>

          <nav className="flex-1 px-3 mt-6 space-y-2 overflow-y-auto no-scrollbar">
            <Link to="/" className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] text-emerald-400 hover:bg-emerald-500/10 ${isSidebarCollapsed ? "justify-center" : ""}`}>
              <Home size={20} />
              {!isSidebarCollapsed && <span>{lang === "id" ? "Beranda" : "Back to Home"}</span>}
            </Link>
            <div className="h-[1px] bg-white/5 mx-2 my-4" />
            {menus.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`flex items-center p-4 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-[0.2em] 
                    ${isActive ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40" : "text-slate-400 hover:bg-white/5"} 
                    ${isSidebarCollapsed ? "justify-center" : "gap-4"}`}
                >
                  <span className={isActive ? "text-white" : "text-purple-500"}>{item.icon}</span>
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all">
              <LogOut size={20} /> 
              {!isSidebarCollapsed && <span>{lang === "id" ? "Keluar" : "Logout"}</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
          {/* Header */}
          <header className="sticky top-0 bg-black/20 backdrop-blur-xl z-50 px-4 md:px-10 py-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-4">
               <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-white bg-white/10 border border-white/10 rounded-xl backdrop-blur-md">
                 <MenuIcon size={20} />
               </button>
               <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter truncate">
                 {activeMenuName}
               </h2>
            </div>

            <div className="flex items-center gap-5">
                {/* NEW DROP DOWN LANGUAGE SELECTOR */}
                <div className="relative">
                  <button 
                    onClick={() => setShowLangDropdown(!showLangDropdown)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 shadow-sm transition-all group backdrop-blur-md"
                  >
                    <img src={flags[lang]} alt={lang} className="w-5 h-5 rounded-full object-cover border border-white/20" />
                    <ChevronDown size={14} className={`text-purple-400 transition-transform duration-300 ${showLangDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showLangDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowLangDropdown(false)}></div>
                      <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={() => changeLanguage('id')}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition ${lang === 'id' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                          <img src={flags.id} alt="ID" className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Bahasa Indonesia</span>
                        </button>
                        <button 
                          onClick={() => changeLanguage('en')}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition ${lang === 'en' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-300 hover:bg-white/5'}`}
                        >
                          <img src={flags.en} alt="EN" className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-[10px] font-black uppercase tracking-widest">English</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

               <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                  <div className="hidden sm:flex flex-col text-right">
                     <span className="text-[11px] font-black text-white uppercase">{userData?.name || "User"}</span>
                     <span className="text-[8px] font-black text-purple-400 uppercase flex items-center justify-end gap-1"><ShieldCheck size={10} /> {userData?.role || "CUSTOMER"}</span>
                  </div>
                  <div className="w-10 h-10 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-purple-500/50 shadow-lg relative shrink-0">
                     <img 
                      key={userData?.avatar}
                      src={userData?.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${userData?.name}&background=6366f1&color=fff`; }} 
                     />
                  </div>
               </div>
            </div>
          </header>
          
          <div className="flex-1 p-4 md:p-10 w-full max-w-full">
            <Outlet context={{ userData, fetchUserData, lang }} />
          </div>

          <footer className="px-10 py-6 border-t border-white/5 flex flex-col md:flex-row gap-4 justify-between items-center opacity-60">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">RALY TICKET ENGINE © 2026</p>
              <div className="flex gap-8">
                 <div className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-purple-400 transition-colors">
                   <HelpCircle size={14} />
                   <span className="text-[9px] font-black uppercase">{lang === "id" ? "Bantuan" : "Help"}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-purple-400 transition-colors">
                   <Settings size={14} />
                   <span className="text-[9px] font-black uppercase">{lang === "id" ? "Pengaturan" : "Settings"}</span>
                 </div>
              </div>
          </footer>
        </main>
      </div>
    </PremiumBackground>
  );
};

export default UserDashboard;