import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown,
  LogOut,
  User,
  Settings,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  Activity
} from 'lucide-react';
import { adminService } from '../api/adminService';
import { useConfig } from '../context/ConfigContext';

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  
  const { settings } = useConfig();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [adminData, setAdminData] = useState({
    name: 'Administrator',
    email: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  });

  const loadAdminData = () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setAdminData({
          name: parsedUser.name || 'Administrator',
          email: parsedUser.email || '',
          avatar: parsedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${parsedUser.name || 'Admin'}`
        });
      } catch (error) {
        console.error("Gagal memproses data user:", error);
      }
    }
  };

  const formatNotifTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta'
      }).replace('.', ':');
    } catch (e) {
      return '--:--';
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await adminService.getNotifications();
      if (response.data.status === "success") {
        setUnreadCount(response.data.unread_count);
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  };

  useEffect(() => {
    loadAdminData();
    const handleStorageChange = () => loadAdminData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleStorageChange);

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); 
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, []);

  const handleBellClick = async () => {
    setIsNotifOpen(!isNotifOpen);
    setIsDropdownOpen(false);
    
    if (!isNotifOpen && unreadCount > 0) {
      try {
        await adminService.markAllNotificationsAsRead();
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({...n, is_read: 1})));
      } catch (error) {
        console.error("Gagal update status baca:", error);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Peringatan: Sesi admin akan diakhiri. Lanjutkan Logout?")) {
      localStorage.clear();
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-purple-500/20 sticky top-0 z-[60] flex items-center justify-between px-4 md:px-8 shadow-lg">
      
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

      {/* 1. Kiri: Branding */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-md opacity-40"></div>
          <div className="relative p-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shrink-0 border border-purple-500/30">
            <ShieldCheck size={18} className="text-purple-400 md:w-5 md:h-5" />
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="text-[9px] md:text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-1 truncate flex items-center gap-1">
            <Sparkles size={8} className="text-purple-400" />
            Control Panel
          </h2>
          <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider truncate hidden xs:block">
            System Overview
          </p>
        </div>
      </div>

      {/* 2. Kanan: User Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={handleBellClick}
            className={`relative p-2 md:p-2.5 transition-all duration-300 rounded-xl ${
              isNotifOpen 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'text-white/40 bg-white/5 hover:text-purple-400 hover:bg-purple-500/10'
            }`}
          >
            <Bell size={18} className="md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-purple-500 to-pink-500 text-[8px] md:text-[9px] font-black text-white flex items-center justify-center rounded-full border-2 md:border-4 border-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 md:right-[-40px] mt-4 w-[280px] xs:w-85 bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/20 rounded-[24px] md:rounded-[28px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[70] origin-top-right">
              <div className="px-5 py-4 border-b border-purple-500/20 flex justify-between items-center bg-white/2">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-purple-400" />
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Live Activity</p>
                </div>
                <CheckCircle2 size={14} className="text-white/20" />
              </div>

              <div className="max-h-[350px] overflow-y-auto custom-scrollbar-notif">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-xs text-white/20 font-bold uppercase tracking-widest">No New Alerts</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`px-5 py-4 border-b border-purple-500/10 hover:bg-white/[0.02] transition-colors ${!notif.is_read ? 'bg-purple-500/5' : ''}`}>
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <h4 className="text-xs font-bold text-white/90 leading-tight flex-1">
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase shrink-0 mt-0.5">
                          <Clock size={10} />
                          <span>{formatNotifTime(notif.created_at)}</span>
                        </div>
                      </div>
                      <p className={`text-[11px] text-white/50 leading-relaxed transition-all duration-500 ${settings?.privacyMode ? 'blur-sm select-none opacity-40' : ''}`}>
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => { navigate('/admin/logs'); setIsNotifOpen(false); }}
                className="w-full py-3 bg-white/2 hover:bg-purple-500/10 text-[10px] font-black text-white/40 hover:text-purple-400 uppercase tracking-[0.2em] transition-all"
              >
                View All Logs
              </button>
            </div>
          )}
        </div>

        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent hidden xs:block" />

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
            className={`flex items-center gap-2 md:gap-3 p-1.5 md:pr-4 rounded-xl md:rounded-2xl transition-all duration-300 border ${
              isDropdownOpen 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur-sm opacity-60"></div>
              <div className="relative w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden border border-purple-500/30 shrink-0">
                <img src={adminData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            
            <div className="text-left hidden lg:block min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-wider leading-none mb-1 truncate ${isDropdownOpen ? 'text-white' : 'text-purple-400'}`}>
                Admin Node
              </p>
              <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                {adminData.name}
              </p>
            </div>

            <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-56 md:w-64 bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/20 rounded-[24px] md:rounded-[28px] shadow-2xl py-3 px-2 animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right z-[70]">
              <div className="px-5 py-4 border-b border-purple-500/20 mb-2">
                <p className="text-[9px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Authentication</p>
                <p className={`text-xs font-bold text-white/60 truncate transition-all ${settings?.privacyMode ? 'blur-sm select-none opacity-30' : ''}`}>
                  {adminData.email || 'system.admin@raly.id'}
                </p>
              </div>

              <div className="space-y-1">
                <button onClick={() => { navigate('/admin/profile'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl md:rounded-2xl text-white/60 hover:bg-purple-500/10 hover:text-white transition-all group">
                  <User size={16} className="text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-bold">Profile Details</span>
                </button>
              </div>

              <div className="h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent my-2 mx-3" />

              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-xl md:rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group">
                <LogOut size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
                <span className="text-xs font-black uppercase tracking-[0.15em]">Terminate Session</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Custom Scrollbar for Notifications */
        .custom-scrollbar-notif::-webkit-scrollbar {
          width: 3px;
        }
        
        .custom-scrollbar-notif::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar-notif::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
        }
        
        .custom-scrollbar-notif::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #c084fc, #f472b6);
        }
      `}</style>
    </header>
  );
};

export default Navbar;