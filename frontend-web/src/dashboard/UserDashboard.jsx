import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import LogoImg from "../assets/logo.png"; 
import api from "../api/axiosConfig"; 
import PremiumBackground from "../components/PremiumBackground";
import ThemeToggle from "../components/ThemeToggle";
import { 
  User, ShoppingBag, Ticket, LogOut, Menu as MenuIcon, 
  Loader2, ChevronRight, ShieldCheck, Home, LayoutDashboard, 
  ChevronLeft, Settings, HelpCircle, ChevronDown, Sun, Moon
} from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  // --- DARK MODE LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  // LOGIKA BAHASA & DROPDOWN
  const [lang, setLang] = useState(localStorage.getItem("lang") || "id");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const isUpdatingRef = useRef(false);

  // Aset Bendera Bulat
  const flags = {
    id: "https://flagcdn.com/w40/id.png",
    en: "https://flagcdn.com/w40/gb.png"
  };

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : false);
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

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

  // Light mode specific styles
  const sidebarClass = !isDarkMode 
    ? "bg-white/80 backdrop-blur-2xl border-slate-200" 
    : "bg-black/40 backdrop-blur-2xl border-white/10";
  
  const sidebarTextClass = !isDarkMode ? "text-slate-800" : "text-white";
  const sidebarLogoTextClass = !isDarkMode 
    ? "text-slate-800" 
    : "text-white";
  const sidebarBorderClass = !isDarkMode ? "border-slate-200" : "border-white/10";
  const sidebarIconBgClass = !isDarkMode 
    ? "bg-white/20 border-slate-300" 
    : "bg-white/10 border-white/20";
  
  const navLinkActiveClass = !isDarkMode 
    ? "bg-purple-500 text-white shadow-lg shadow-purple-200/40" 
    : "bg-purple-600 text-white shadow-lg shadow-purple-900/40";
  const navLinkInactiveClass = !isDarkMode 
    ? "text-slate-600 hover:bg-slate-100" 
    : "text-slate-400 hover:bg-white/5";
  const navIconActiveClass = !isDarkMode ? "text-white" : "text-white";
  const navIconInactiveClass = !isDarkMode ? "text-purple-500" : "text-purple-500";
  
  const headerClass = !isDarkMode 
    ? "bg-white/40 backdrop-blur-xl border-slate-200" 
    : "bg-black/20 backdrop-blur-xl border-white/10";
  const headerTitleClass = !isDarkMode ? "text-slate-800" : "text-white";
  const headerButtonClass = !isDarkMode 
    ? "text-slate-700 bg-white/20 border-slate-300 hover:bg-white/40" 
    : "text-white bg-white/10 border-white/10 hover:bg-white/20";
  const userTextClass = !isDarkMode ? "text-slate-800" : "text-white";
  const userRoleClass = !isDarkMode ? "text-purple-600" : "text-purple-400";
  const userAvatarBorderClass = !isDarkMode ? "border-purple-400/50" : "border-purple-500/50";
  const footerClass = !isDarkMode ? "border-slate-200 text-slate-500" : "border-white/5 text-slate-400";
  const logoutButtonClass = !isDarkMode 
    ? "bg-rose-100 border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white" 
    : "bg-rose-500/10 border-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white";
  const homeLinkClass = !isDarkMode 
    ? "text-emerald-600 hover:bg-emerald-50" 
    : "text-emerald-400 hover:bg-emerald-500/10";

  if (loading && !userData) {
    return (
      <PremiumBackground isLightMode={!isDarkMode}>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
          <Loader2 className="text-purple-500 animate-spin" size={48} />
          <p className={`text-[10px] font-black uppercase text-center tracking-[0.4em] opacity-50 italic ${!isDarkMode ? 'text-slate-600' : 'text-white'}`}>
            {lang === "id" ? "Menyinkronkan Profil..." : "Syncing Profile..."}
          </p>
        </div>
      </PremiumBackground>
    );
  }

  return (
    <PremiumBackground isLightMode={!isDarkMode}>
      <div className="flex min-h-screen font-sans overflow-x-hidden relative">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 h-screen flex flex-col z-[110] transition-all duration-300 border-r
          ${isSidebarCollapsed ? "w-20" : "w-72"} 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarClass}`}>
          
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:flex absolute -right-3 top-10 bg-purple-600 rounded-full p-1 border-4 border-[#0F172A] text-white z-50 hover:scale-110 transition-transform">
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div className={`p-6 flex items-center gap-3 border-b h-24 ${isSidebarCollapsed ? "justify-center" : ""} ${sidebarBorderClass}`}>
            <div className={`p-2 rounded-xl shrink-0 backdrop-blur-lg border ${sidebarIconBgClass}`}>
               <img src={LogoImg} alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            {!isSidebarCollapsed && <h1 className={`text-xl font-black tracking-tighter uppercase italic ${sidebarLogoTextClass}`}>RALY<span className="text-purple-500">TICKET</span></h1>}
          </div>

          <nav className="flex-1 px-3 mt-6 space-y-2 overflow-y-auto no-scrollbar">
            <Link to="/" className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] ${homeLinkClass} ${isSidebarCollapsed ? "justify-center" : ""}`}>
              <Home size={20} />
              {!isSidebarCollapsed && <span>{lang === "id" ? "Beranda" : "Back to Home"}</span>}
            </Link>
            <div className={`h-[1px] mx-2 my-4 ${sidebarBorderClass}`} />
            {menus.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className={`flex items-center p-4 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-[0.2em] 
                    ${isActive ? navLinkActiveClass : navLinkInactiveClass} 
                    ${isSidebarCollapsed ? "justify-center" : "gap-4"}`}
                >
                  <span className={isActive ? navIconActiveClass : navIconInactiveClass}>{item.icon}</span>
                  {!isSidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className={`p-4 border-t ${sidebarBorderClass}`}>
            <button onClick={handleLogout} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-[10px] transition-all ${logoutButtonClass}`}>
              <LogOut size={20} /> 
              {!isSidebarCollapsed && <span>{lang === "id" ? "Keluar" : "Logout"}</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"}`}>
          {/* Header */}
          <header className={`sticky top-0 z-50 px-4 md:px-10 py-5 flex items-center justify-between border-b ${headerClass}`}>
            <div className="flex items-center gap-4">
               <button onClick={() => setIsMobileMenuOpen(true)} className={`lg:hidden p-2 rounded-xl backdrop-blur-md ${headerButtonClass}`}>
                 <MenuIcon size={20} />
               </button>
               <h2 className={`text-xl md:text-2xl font-black uppercase italic tracking-tighter truncate ${headerTitleClass}`}>
                 {activeMenuName}
               </h2>
            </div>

            <div className="flex items-center gap-3">
                {/* THEME TOGGLE - Diletakkan di samping language */}
                <ThemeToggle variant="navbar" />

                {/* Language Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowLangDropdown(!showLangDropdown)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border shadow-sm transition-all group backdrop-blur-md ${headerButtonClass}`}
                  >
                    <img src={flags[lang]} alt={lang} className="w-5 h-5 rounded-full object-cover border border-white/20" />
                    <ChevronDown size={14} className={`text-purple-400 transition-transform duration-300 ${showLangDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showLangDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowLangDropdown(false)}></div>
                      <div className={`absolute right-0 mt-3 w-48 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in slide-in-from-top-2 ${!isDarkMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
                        <button 
                          onClick={() => changeLanguage('id')}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition ${lang === 'id' ? (isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600') : (isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')}`}
                        >
                          <img src={flags.id} alt="ID" className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Bahasa Indonesia</span>
                        </button>
                        <button 
                          onClick={() => changeLanguage('en')}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 transition ${lang === 'en' ? (isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-600') : (isDarkMode ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50')}`}
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
                     <span className={`text-[11px] font-black uppercase ${userTextClass}`}>{userData?.name || "User"}</span>
                     <span className={`text-[8px] font-black uppercase flex items-center justify-end gap-1 ${userRoleClass}`}><ShieldCheck size={10} /> {userData?.role || "CUSTOMER"}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden border-2 shadow-lg relative shrink-0 ${userAvatarBorderClass}`}>
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
            <Outlet context={{ userData, fetchUserData, lang, isDarkMode }} />
          </div>

          <footer className={`px-10 py-6 border-t flex flex-col md:flex-row gap-4 justify-between items-center opacity-60 ${footerClass}`}>
              <p className="text-[9px] font-black uppercase tracking-[0.4em]">RALY TICKET ENGINE © 2026</p>
              <div className="flex gap-8">
                 <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-colors">
                   <HelpCircle size={14} />
                   <span className="text-[9px] font-black uppercase">{lang === "id" ? "Bantuan" : "Help"}</span>
                 </div>
                 <div className="flex items-center gap-2 cursor-pointer hover:text-purple-400 transition-colors">
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