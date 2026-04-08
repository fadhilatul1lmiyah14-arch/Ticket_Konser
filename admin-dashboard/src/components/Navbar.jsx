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
  CheckCircle2
} from 'lucide-react';
import { adminService } from '../api/adminService';
import { useConfig } from '../context/ConfigContext'; 

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const context = useConfig();
  const settings = context?.settings || { notificationSound: 'muted', privacyMode: false };  
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [adminData, setAdminData] = useState({
    name: 'Administrator',
    email: '',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  });

  const playNotifSound = () => {
    if (settings.notificationSound === 'muted') return;
    const audio = new Audio(`/sounds/${settings.notificationSound}.mp3`);
    audio.play().catch(err => console.log("Audio play blocked by browser"));
  };

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

  // Fungsi Helper untuk memformat waktu secara akurat ke WIB (Local)
  const formatNotifTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta' // Memastikan waktu Indonesia
      }).replace('.', ':');
    } catch (e) {
      return '--:--';
    }
  };

  useEffect(() => {
    loadAdminData();
    const handleStorageChange = () => loadAdminData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleStorageChange);

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Dipercepat ke 10 detik agar lebih real-time
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleStorageChange);
    };
  }, [unreadCount]);

  const fetchNotifications = async () => {
    try {
      const response = await adminService.getNotifications();
      if (response.data.status === "success") {
        if (response.data.unread_count > unreadCount) {
          playNotifSound();
        }
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    }
  };

  const handleBellClick = async () => {
    setIsNotifOpen(!isNotifOpen);
    setIsDropdownOpen(false);
    if (!isNotifOpen && unreadCount > 0) {
      try {
        await adminService.markAllNotificationsAsRead();
        setUnreadCount(0);
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
    <header className="h-20 bg-[#1A1A2E] border-b border-white/5 sticky top-0 z-[60] flex items-center justify-between px-4 md:px-8">
      
      {/* 1. Kiri: Branding */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="p-2 bg-[#E297C1]/10 rounded-lg shrink-0">
          <ShieldCheck size={18} className="text-[#E297C1] md:w-5 md:h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-none mb-1 truncate">Control Panel</h2>
          <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-wider truncate hidden xs:block">System Overview</p>
        </div>
      </div>

      {/* 2. Kanan: User Actions */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Notification Bell Container */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={handleBellClick}
            className={`relative p-2 md:p-2.5 transition-all duration-300 rounded-xl ${
              isNotifOpen ? 'bg-[#E297C1] text-white shadow-[0_0_15px_rgba(226,151,193,0.3)]' : 'text-white/40 bg-white/5 hover:text-[#E297C1] hover:bg-[#E297C1]/10'
            }`}
          >
            <Bell size={18} className="md:w-5 md:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 bg-[#E297C1] text-[8px] md:text-[9px] font-black text-white flex items-center justify-center rounded-full border-2 md:border-4 border-[#1A1A2E]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* DROPDOWN NOTIFIKASI - Perbaikan Posisi & Alignment */}
          {isNotifOpen && (
            <div className="absolute right-0 md:right-[-40px] mt-4 w-[300px] xs:w-85 bg-[#1A1A2E] border border-white/10 rounded-[24px] md:rounded-[28px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-[70] origin-top-right">
              <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/2">
                <p className="text-[10px] font-black text-[#E297C1] uppercase tracking-[0.2em]">Live Activity</p>
                <CheckCircle2 size={14} className="text-white/20" />
              </div>

              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-xs text-white/20 font-bold uppercase tracking-widest">No New Alerts</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${!notif.is_read ? 'bg-[#E297C1]/5' : ''}`}>
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <h4 className="text-xs font-bold text-white/90 leading-tight flex-1">
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase shrink-0 mt-0.5">
                          <Clock size={10} />
                          <span>{formatNotifTime(notif.created_at)}</span>
                        </div>
                      </div>
                      <p className={`text-[11px] text-white/50 leading-relaxed ${settings.privacyMode ? 'privacy-blur' : ''}`}>
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              
              <button className="w-full py-3 bg-white/2 hover:bg-white/5 text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] transition-all">
                View All Logs
              </button>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-[1px] h-8 bg-white/10 hidden xs:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
            className={`flex items-center gap-2 md:gap-3 p-1.5 md:pr-4 rounded-xl md:rounded-2xl transition-all duration-300 border ${
              isDropdownOpen 
                ? 'bg-[#E297C1] border-[#E297C1] shadow-[0_0_20px_rgba(226,151,193,0.3)]' 
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-[#0F0F1E] overflow-hidden border border-white/10 shrink-0">
              <img 
                src={adminData.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="text-left hidden lg:block min-w-0">
              <p className={`text-[10px] font-black uppercase tracking-wider leading-none mb-1 truncate ${isDropdownOpen ? 'text-white' : 'text-[#E297C1]'}`}>
                Admin Node
              </p>
              <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                {adminData.name}
              </p>
            </div>

            <ChevronDown size={14} className={`text-white/40 transition-transform duration-300 shrink-0 ${isDropdownOpen ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-56 md:w-64 bg-[#1A1A2E] border border-white/10 rounded-[24px] md:rounded-[28px] shadow-2xl py-3 px-2 animate-in fade-in slide-in-from-top-2 duration-300 origin-top-right z-[70]">
              <div className="px-5 py-4 border-b border-white/5 mb-2">
                <p className="text-[9px] font-black text-[#E297C1] uppercase tracking-[0.2em] mb-1">Authentication</p>
                <p className={`text-xs font-bold text-white truncate opacity-60 ${settings.privacyMode ? 'privacy-blur' : ''}`}>
                  {adminData.email || 'system.admin@raly.id'}
                </p>
              </div>

              <div className="space-y-1">
                <button onClick={() => {
                    navigate('/admin/profile'); 
                    setIsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl md:rounded-2xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
                >
                  <User size={16} className="text-[#E297C1] shrink-0" />
                  <span className="text-xs font-bold">Profile Details</span>
                </button>

                <button 
                  onClick={() => {
                    navigate('/admin/preferences');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl md:rounded-2xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Settings size={16} className="text-[#E297C1] shrink-0" />
                  <span className="text-xs font-bold">Preferences</span>
                </button>
              </div>

              <div className="h-[1px] bg-white/5 my-2 mx-3" />

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl md:rounded-2xl text-red-400 hover:bg-red-500/10 transition-all group"
              >
                <LogOut size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
                <span className="text-xs font-black uppercase tracking-[0.15em]">Terminate Session</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;