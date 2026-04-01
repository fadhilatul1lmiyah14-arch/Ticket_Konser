import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Instagram, Twitter, Facebook, Mail, User, LogOut, Search, X } from 'lucide-react';
import logo from '../assets/logo.png'; 

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('userData');
    
    if (token && storedUser) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUser));
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
    setShowDropdown(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/events?search=${navSearch}`);
    }
  };

  return (
    <div className="bg-[#0f172a] min-h-screen font-sans text-white flex flex-col">
      {/* --- NAVBAR MODERN --- */}
      <nav className="bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
        
        {/* LOGO & BRAND (DIPERBESAR) */}
        <Link to="/" className="flex items-center gap-3 group min-w-fit">
          <div className="group-hover:scale-110 transition-transform duration-300">
            {/* Ukuran logo diperbesar ke h-10 */}
            <img src={logo} alt="Raly Ticket Logo" className="h-10 w-auto object-contain" />
          </div>
          {/* Ukuran teks diperbesar ke text-2xl */}
          <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
            Raly Ticket
          </h1>
        </Link>

        {/* SEARCH BAR */}
        <div className="hidden lg:flex flex-1 justify-center max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search Here..." 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-12 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-bold text-white transition-all"
            />
            {navSearch && (
              <button 
                type="button" 
                onClick={() => setNavSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
          </form>
        </div>

        {/* MENU NAVIGASI */}
        <div className="flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`transition ${location.pathname === '/' ? 'text-purple-400' : 'text-white hover:text-purple-400'}`}>Home</Link>
            <Link to="/events" className={`transition ${location.pathname === '/events' ? 'text-purple-400' : 'text-white hover:text-purple-400'}`}>Events</Link>
          </div>
          
          <Link to="/cart" className="relative text-white group">
            <ShoppingCart size={24} className="cursor-pointer group-hover:text-purple-400 transition" />
            <span className="absolute -top-2 -right-2 bg-purple-600 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-[#0f172a]">0</span>
          </Link>

          {/* KONDISI LOGIN/REGISTER */}
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-slate-800 p-1.5 pr-4 rounded-full hover:bg-slate-700 transition border border-slate-700 shadow-lg"
              >
                <div className="bg-purple-600 p-2 rounded-full shadow-lg shadow-purple-500/20">
                  <User size={18} className="text-white" />
                </div>
                <span className="text-[11px] font-black text-white uppercase tracking-tighter max-w-[120px] truncate">
                  {userData?.name || 'My Account'}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl py-2 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-xs font-bold text-purple-600 truncate">{userData?.email}</p>
                  </div>

                  <Link 
                    to="/dashboard" 
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition font-bold text-xs uppercase tracking-widest"
                  >
                    <User size={16} /> User Dashboard
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition font-bold text-xs uppercase tracking-widest border-t border-slate-100"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-gradient-to-r from-purple-600 to-indigo-600 px-7 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-purple-500/20 text-white font-black uppercase text-xs tracking-widest">
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1">
        {children}
      </main>

      {/* --- FOOTER MODERN --- */}
      <footer className="w-full bg-white border-t border-slate-200 pt-16 pb-8 mt-20 font-sans text-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-4">
                {/* Logo di footer juga diperbesar */}
                <img src={logo} alt="Raly Ticket Logo" className="h-9 w-auto object-contain" />
                <span className="font-black uppercase tracking-tighter text-slate-900 text-xl">
                  Raly Ticket
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Your trusted partner for securing the best seats at your favorite concerts. Secure, fast, and reliable.
              </p>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-900 mb-6">Explore</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li onClick={() => navigate('/')} className="hover:text-purple-600 cursor-pointer transition-colors">Home</li>
                <li onClick={() => navigate('/events')} className="hover:text-purple-600 cursor-pointer transition-colors">Events</li>
                
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-900 mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li className="flex items-center gap-2">
                  <Mail size={16} /> help@ralyticket.com
                </li>
                <li className="hover:text-purple-600 cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-purple-600 cursor-pointer transition-colors">Privacy Policy</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs text-slate-900 mb-6">Follow Us</h4>
              <div className="flex gap-4">
                {[Instagram, Twitter, Facebook].map((Icon, index) => (
                  <div key={index} className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:border-purple-600 hover:text-purple-600 cursor-pointer transition-all">
                    <Icon size={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">
              © 2026 RALY TICKET. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-slate-900">Terms</span>
              <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-slate-900">Privacy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;