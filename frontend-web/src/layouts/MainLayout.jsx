import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Instagram, Twitter, Facebook, Mail, User, LogOut, Search, X, Menu, Globe } from 'lucide-react';
import logo from '../assets/logo.png'; 

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const [hasCartItems, setHasCartItems] = useState(false);
  
  // --- LOGIKA MULTI-BAHASA ---
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'id');

  const toggleLanguage = () => {
    const newLang = lang === 'id' ? 'en' : 'id';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    window.dispatchEvent(new Event('languageChanged'));
  };

  const t = {
    id: {
      home: "Beranda",
      events: "Acara",
      search: "Cari Konser...",
      signin: "Masuk",
      account: "Akun",
      dashboard: "Panel Pengguna",
      logout: "Keluar",
      footer_desc: "Partner terpercaya Anda untuk mengamankan kursi terbaik di konser favorit. Aman, cepat, dan handal.",
      explore: "Eksplorasi",
      follow: "Ikuti Kami"
    },
    en: {
      home: "Home",
      events: "Events",
      search: "Search Events...",
      signin: "Sign In",
      account: "Account",
      dashboard: "User Dashboard",
      logout: "Logout",
      footer_desc: "Your trusted partner for securing the best seats at your favorite concerts. Secure, fast, and reliable.",
      explore: "Explore",
      follow: "Follow Us"
    }
  }[lang];

  const handleImageError = (e) => {
    e.target.style.opacity = '0';
  };

  // --- SYNC USER DATA (PERBAIKAN DI SINI) ---
  const syncUserData = useCallback(() => {
    // SINKRONISASI: Cek 'token' (sesuai Login.jsx) atau 'accessToken' sebagai fallback
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken'); 
    const storedUser = localStorage.getItem('user'); 
    
    if (token && storedUser) {
      setIsLoggedIn(true);
      try {
        const parsed = JSON.parse(storedUser);
        // Pastikan avatar terisi jika hanya ada seed
        if (parsed && !parsed.avatar && parsed.avatar_seed) {
            parsed.avatar = `https://api.dicebear.com/9.x/toon-head/svg?seed=${parsed.avatar_seed}`;
        }
        setUserData(parsed);
      } catch (e) {
        console.error("Error parsing user data", e);
        setUserData(null);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, []);

  const updateCartStatus = useCallback(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const parsed = JSON.parse(cartData);
        setHasCartItems(Array.isArray(parsed) ? parsed.length > 0 : !!parsed); 
      } catch (e) {
        setHasCartItems(false);
      }
    } else {
      setHasCartItems(false);
    }
  }, []);

  const getAvatarUrl = (seed) => 
    `https://api.dicebear.com/9.x/toon-head/svg?seed=${seed || 'Felix'}`;

  useEffect(() => {
    syncUserData();
    updateCartStatus();
    setIsMobileMenuOpen(false); 

    // Listeners untuk perubahan state global
    window.addEventListener('cartUpdated', updateCartStatus);
    window.addEventListener('storage', syncUserData);
    window.addEventListener('profileUpdated', syncUserData);
    // Tambahan: agar saat login sukses langsung berubah
    window.addEventListener('loginSuccess', syncUserData);

    return () => {
      window.removeEventListener('cartUpdated', updateCartStatus);
      window.removeEventListener('storage', syncUserData);
      window.removeEventListener('profileUpdated', syncUserData);
      window.removeEventListener('loginSuccess', syncUserData);
    };
  }, [location.pathname, syncUserData, updateCartStatus]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus 'token'
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    setShowDropdown(false);
    navigate('/login');
    window.dispatchEvent(new Event('storage'));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = navSearch.trim();
    if (term) {
      navigate(`/events?search=${encodeURIComponent(term)}`);
    } else {
      navigate('/events'); 
    }
    setIsMobileMenuOpen(false);
  };

  const clearSearch = () => {
    setNavSearch("");
    if (location.pathname === '/events') {
      navigate('/events');
    }
  };

  return (
    <div className="bg-[#0f172a] min-h-screen font-sans text-white flex flex-col text-left">
      {/* NAVBAR */}
      <nav className="bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 h-[73px]">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 group min-w-fit">
          <div className="group-hover:scale-110 transition-transform duration-300">
            <img src={logo} alt="Logo" className="h-8 md:h-10 w-auto object-contain" onError={handleImageError} />
          </div>
          <h1 className="text-lg md:text-2xl font-black tracking-tighter uppercase italic text-white leading-none">
            Raly Ticket
          </h1>
        </Link>

        {/* SEARCH DESKTOP */}
        <div className="hidden lg:flex flex-1 justify-center max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t.search} 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-11 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-bold text-white transition-all"
            />
            {navSearch && (
              <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        {/* NAV LINKS & ACTIONS */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.2em]">
            <Link to="/" className={`transition ${location.pathname === '/' ? 'text-purple-400' : 'text-white hover:text-purple-400'}`}>{t.home}</Link>
            <Link to="/events" className={`transition ${location.pathname === '/events' ? 'text-purple-400' : 'text-white hover:text-purple-400'}`}>{t.events}</Link>
          </div>
          
          {/* LANG TOGGLE */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-slate-800/40 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-all group"
          >
            <Globe size={14} className="text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{lang}</span>
          </button>

          {/* CART */}
          <Link to="/cart" className="relative text-white group p-2">
            <ShoppingCart size={22} className="cursor-pointer group-hover:text-purple-400 transition" />
            {hasCartItems && (
              <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600 border border-[#0f172a]"></span>
              </span>
            )}
          </Link>

          {/* AUTH SECTION - SEKARANG HARUSNYA MUNCUL ICON PROFILE */}
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 bg-slate-800/50 p-1 md:pr-4 rounded-full hover:bg-slate-800 transition border border-slate-700 group">
                <div className="bg-slate-900 w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-purple-500/30">
                  <img 
                    src={userData?.avatar || getAvatarUrl(userData?.avatar_seed)} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=6366f1&color=fff`; }}
                  />
                </div>
                <div className="hidden md:flex flex-col items-start leading-none text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.account}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter max-w-[80px] truncate">
                    {userData?.name || 'User'}
                  </span>
                </div>
              </button>

              {/* DROPDOWN MENU */}
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300 z-20 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 mb-1 text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated As</p>
                      <p className="text-xs font-black text-slate-900 truncate">{userData?.name || 'User'}</p>
                    </div>
                    <Link to="/dashboard/overview" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-5 py-3.5 text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition font-black text-[10px] uppercase tracking-widest">
                      <User size={16} /> {t.dashboard}
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3.5 text-red-500 hover:bg-red-50 transition font-black text-[10px] uppercase tracking-widest border-t border-slate-100 text-left">
                      <LogOut size={16} /> {t.logout}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:block bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 rounded-xl text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-purple-500/20">
              {t.signin}
            </Link>
          )}

          {/* MOBILE TOGGLE */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-white">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-[73px] bg-[#0f172a] z-[49] animate-in slide-in-from-right duration-300 md:hidden flex flex-col p-6 gap-8 text-left">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder={t.search} 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none text-white"
            />
          </form>

          <div className="flex flex-col gap-6 text-xl font-black uppercase tracking-[0.1em]">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`${location.pathname === '/' ? 'text-purple-400' : 'text-white'}`}>{t.home}</Link>
            <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className={`${location.pathname === '/events' ? 'text-purple-400' : 'text-white'}`}>{t.events}</Link>
            {isLoggedIn ? (
              <Link to="/dashboard/overview" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-400">{t.dashboard}</Link>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-500 pt-4 border-t border-slate-800">{t.signin}</Link>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-[73px]">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#0f172a] border-t border-slate-800 pt-16 pb-8 mt-20 font-sans text-white text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
                <span className="font-black uppercase tracking-tighter text-white text-lg md:text-xl italic">
                  Raly Ticket
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {t.footer_desc}
              </p>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs text-purple-400 mb-6">{t.explore}</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li onClick={() => navigate('/')} className="hover:text-purple-400 cursor-pointer transition-colors">{t.home}</li>
                <li onClick={() => navigate('/events')} className="hover:text-purple-400 cursor-pointer transition-colors">{t.events}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs text-purple-400 mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li className="flex items-center gap-2 break-all md:break-normal">
                  <Mail size={16} className="min-w-fit text-purple-500" /> help@ralyticket.com
                </li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-purple-400 cursor-pointer transition-colors">Privacy Policy</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs text-purple-400 mb-6">{t.follow}</h4>
              <div className="flex gap-4">
                {[Instagram, Twitter, Facebook].map((Icon, index) => (
                  <div key={index} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:border-purple-500 hover:text-purple-500 hover:-translate-y-1 cursor-pointer transition-all">
                    <Icon size={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-center md:text-left">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
              © 2026 RALY TICKET. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;