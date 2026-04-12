import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Instagram, Twitter, Facebook, Mail, User, LogOut, X, Menu, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png'; 
import PremiumBackground from '../components/PremiumBackground';
import ThemeToggle from '../components/ThemeToggle'; // IMPORT THEME TOGGLE

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasCartItems, setHasCartItems] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  // --- MULTI-LANGUAGE LOGIC ---
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'id');

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    setShowLangDropdown(false);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const t = {
    id: { 
      home: "Beranda", events: "Acara", signin: "Masuk", account: "Akun", 
      dashboard: "Dasbor Pengguna", logout: "Keluar", explore: "Eksplorasi", follow: "Ikuti",
      footer_desc: "Partner terpercaya Anda untuk mengamankan kursi terbaik di konser favorit." 
    },
    en: { 
      home: "Home", events: "Events", signin: "Sign In", account: "Account", 
      dashboard: "UserDashboard", logout: "Logout", explore: "Explore", follow: "Follow",
      footer_desc: "Your trusted partner for securing the best seats at your favorite concerts." 
    }
  }[lang];

  const flags = { 
    id: "https://flagcdn.com/w80/id.png", 
    en: "https://flagcdn.com/w80/gb.png" 
  };

  const syncUserData = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken'); 
    const storedUser = localStorage.getItem('user'); 
    if (token && storedUser) {
      setIsLoggedIn(true);
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && !parsed.avatar && parsed.avatar_seed) {
            parsed.avatar = `https://api.dicebear.com/9.x/toon-head/svg?seed=${parsed.avatar_seed}`;
        }
        setUserData(parsed);
      } catch (e) { setIsLoggedIn(false); }
    } else { setIsLoggedIn(false); }
  }, []);

  const updateCartStatus = useCallback(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const parsed = JSON.parse(cartData);
        setHasCartItems(Array.isArray(parsed) ? parsed.length > 0 : !!parsed); 
      } catch (e) { setHasCartItems(false); }
    } else { setHasCartItems(false); }
  }, []);

  useEffect(() => {
    syncUserData();
    updateCartStatus();
    setIsMobileMenuOpen(false); 
    window.addEventListener('cartUpdated', updateCartStatus);
    window.addEventListener('storage', syncUserData);
    return () => {
      window.removeEventListener('cartUpdated', updateCartStatus);
      window.removeEventListener('storage', syncUserData);
    };
  }, [location.pathname, syncUserData, updateCartStatus]);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : false);
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserData(null);
    setShowDropdown(false);
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
  };

  const themeClass = isDarkMode 
    ? "bg-[#020617] text-white" 
    : "bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] text-slate-800"; 
  
  const navClass = isDarkMode 
    ? "bg-[#020617]/80 backdrop-blur-xl border-slate-800" 
    : "bg-white/85 backdrop-blur-xl border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)]";

  const dropdownClass = isDarkMode
    ? "bg-[#0f172a]/95 backdrop-blur-xl border-white/10"
    : "bg-white/95 backdrop-blur-xl border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)]";

  const mobileMenuClass = isDarkMode
    ? "bg-[#020617]"
    : "bg-white/95 backdrop-blur-xl";

  const footerClass = isDarkMode
    ? "bg-transparent border-slate-800 text-white"
    : "bg-white/70 backdrop-blur-sm border-slate-100 text-slate-800";

  return (
    <div className={`${themeClass} min-h-screen font-sans flex flex-col transition-all duration-500 relative`}>
      <PremiumBackground isLightMode={!isDarkMode}>
        
        {/* THEME TOGGLE - MENGGUNAKAN COMPONENT */}
        <ThemeToggle variant="floating" />

        {/* NAVBAR */}
        <nav className={`${navClass} border-b px-4 md:px-8 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 h-[73px] transition-all duration-500`}>
          
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="h-8 md:h-10 w-auto group-hover:rotate-6 transition-transform" />
            <h1 className={`text-lg md:text-2xl font-black tracking-tighter uppercase italic transition-colors duration-300 ${isDarkMode ? 'text-white' : 'bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent'}`}>
              Raly Ticket
            </h1>
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em]">
              <Link to="/" className={`transition-all duration-300 ${location.pathname === '/' ? 'text-purple-600' : (isDarkMode ? 'text-white/70 hover:text-purple-400' : 'text-slate-500 hover:text-purple-600')}`}>{t.home}</Link>
              <Link to="/events" className={`transition-all duration-300 ${location.pathname === '/events' ? 'text-purple-600' : (isDarkMode ? 'text-white/70 hover:text-purple-400' : 'text-slate-500 hover:text-purple-600')}`}>{t.events}</Link>
            </div>

            {/* Lang Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className={`flex items-center gap-2 border px-2.5 py-1.5 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-slate-900/40 border-slate-700 hover:border-slate-500' : 'bg-white/60 border-slate-200 hover:border-purple-300 backdrop-blur-sm'}`}
              >
                <div className={`w-5 h-5 rounded-full overflow-hidden border shadow-sm ${isDarkMode ? 'border-slate-600' : 'border-white'}`}>
                  <img src={flags[lang]} alt={lang} className="w-full h-full object-cover scale-125" />
                </div>
                <ChevronDown size={14} className={isDarkMode ? 'text-white/60' : 'text-slate-500'} />
              </button>

              {showLangDropdown && (
                <div className={`absolute right-0 mt-3 w-48 rounded-2xl shadow-2xl py-2 border animate-in fade-in zoom-in-95 duration-200 z-20 backdrop-blur-xl ${dropdownClass}`}>
                  {['id', 'en'].map((l) => (
                    <button key={l} onClick={() => changeLanguage(l)} className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${lang === l ? 'text-purple-600 bg-purple-50/80' : (isDarkMode ? 'text-white/80 hover:bg-white/5' : 'text-slate-600 hover:bg-purple-50/50')}`}>
                      <div className={`w-5 h-5 rounded-full overflow-hidden border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                        <img src={flags[l]} alt={l} className="w-full h-full object-cover scale-125" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider">{l === 'id' ? 'Indonesia' : 'English'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className={`relative p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'text-white/80 hover:bg-slate-800/50' : 'text-slate-600 hover:bg-purple-50/50'}`}>
              <ShoppingCart size={20} />
              {hasCartItems && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
                </span>
              )}
            </Link>

            {/* Auth */}
            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setShowDropdown(!showDropdown)} className={`flex items-center gap-3 p-1 rounded-xl border transition-all duration-300 md:pr-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-slate-500' : 'bg-white/60 border-slate-200 hover:border-purple-300 backdrop-blur-sm shadow-sm'}`}>
                  <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${isDarkMode ? 'border-slate-700' : 'border-purple-400/30'}`}>
                    <img src={userData?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className={`hidden md:block text-[10px] font-black uppercase tracking-tight ${isDarkMode ? 'text-white/80' : 'text-slate-700'}`}>{userData?.name?.split(' ')[0]}</span>
                  <ChevronDown size={12} className={isDarkMode ? 'text-white/50' : 'text-slate-400'} />
                </button>

                {showDropdown && (
                  <div className={`absolute right-0 mt-3 w-60 rounded-2xl shadow-2xl py-2 border z-20 backdrop-blur-xl ${dropdownClass}`}>
                    <Link to="/dashboard/overview" onClick={() => setShowDropdown(false)} className={`flex items-center gap-3 px-5 py-3.5 font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${isDarkMode ? 'text-slate-300 hover:text-purple-400 hover:bg-white/5' : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50/80'}`}>
                      <User size={16} /> {t.dashboard}
                    </Link>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-5 py-4 transition-all duration-200 font-black text-[10px] uppercase tracking-widest text-left ${isDarkMode ? 'text-red-400 hover:bg-red-500/10 border-t border-white/10' : 'text-red-500 hover:bg-red-50/80 border-t border-slate-100'}`}>
                      <LogOut size={16} /> {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hidden md:block bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 rounded-xl text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-purple-500/25 hover:scale-105 hover:shadow-purple-500/40 transition-all duration-300">
                {t.signin}
              </Link>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 transition-all">
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className={`fixed inset-0 top-[73px] z-[49] animate-in slide-in-from-right duration-300 md:hidden flex flex-col p-8 gap-8 backdrop-blur-xl ${mobileMenuClass}`}>
             <div className="flex flex-col gap-6 text-2xl font-black uppercase tracking-tighter">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`transition-all ${location.pathname === '/' ? 'text-purple-600' : (isDarkMode ? 'text-white' : 'text-slate-700')}`}>{t.home}</Link>
                <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className={`transition-all ${location.pathname === '/events' ? 'text-purple-600' : (isDarkMode ? 'text-white' : 'text-slate-700')}`}>{t.events}</Link>
                {!isLoggedIn && <Link to="/login" className="text-purple-600">{t.signin}</Link>}
             </div>
          </div>
        )}

        <main className="flex-1 pt-[73px] min-h-[calc(100vh-73px)] overflow-visible">
          {children}
        </main>

        {/* FOOTER */}
        <footer className={`w-full border-t pt-20 pb-12 mt-20 relative z-10 transition-all duration-500 ${footerClass}`}>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="Logo" className="h-8 w-auto" />
                <span className={`font-black uppercase italic text-xl ${isDarkMode ? 'text-white' : 'bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent'}`}>Raly Ticket</span>
              </div>
              <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.footer_desc}</p>
            </div>
            
            <div>
              <h4 className="font-black uppercase tracking-widest text-[11px] text-purple-600 mb-8">{t.explore}</h4>
              <ul className={`space-y-4 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <li onClick={() => navigate('/')} className="hover:text-purple-500 cursor-pointer transition-all duration-200">{t.home}</li>
                <li onClick={() => navigate('/events')} className="hover:text-purple-500 cursor-pointer transition-all duration-200">{t.events}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-[11px] text-purple-600 mb-8">Support</h4>
              <ul className={`space-y-4 text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <li className="flex items-center gap-2"><Mail size={16} className="text-purple-500" /> help@ralyticket.com</li>
                <li className="hover:text-purple-500 cursor-pointer transition-all duration-200">Privacy Policy</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-[11px] text-purple-600 mb-8">{t.follow}</h4>
              <div className="flex gap-4">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <div key={i} className={`w-12 h-12 rounded-2xl border flex items-center justify-center cursor-pointer transition-all duration-300 ${isDarkMode ? 'bg-slate-900/50 border-slate-700 hover:border-purple-500 hover:bg-slate-800' : 'bg-white/50 border-slate-200 hover:border-purple-400 hover:shadow-lg hover:bg-purple-50/50'}`}>
                    <Icon size={20} className="text-purple-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={`max-w-7xl mx-auto px-6 mt-16 pt-8 border-t text-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>© 2026 RALY TICKET. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      </PremiumBackground>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;