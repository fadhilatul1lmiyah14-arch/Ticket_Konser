import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronRight, Loader2, Music2, QrCode, User, Music, Mic2, Clock, Headphones, Sparkles, Star, CalendarDays, Ticket, Shield, Zap, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';
import PremiumBackground from '../components/PremiumBackground';
import FAQ from '../components/FAQ';
import Features from '../components/Features';

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');
  const [qrHover, setQrHover] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  // Refs untuk scroll animation
  const heroRef = useRef(null);
  const eventSectionRef = useRef(null);
  const featuresRef = useRef(null);
  const faqRef = useRef(null);

  // Helper untuk mendapatkan terjemahan yang benar
  const getTranslation = (data) => {
    const lang = currentLang;
    if (!data) return "";
    
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parsed[lang] || parsed['id'] || data;
      } catch (e) {
        return data;
      }
    }
    if (typeof data === 'object') {
      return data[lang] || data['id'] || "";
    }
    return data;
  };

  const t = {
    id: {
      hero_tag: "Pengalaman Musik Terbaik 2026",
      hero_title_1: "JELAJAHI",
      hero_title_2: "SUASANANYA",
      hero_desc: "Dapatkan akses eksklusif ke tiket konser artis favoritmu dengan sistem booking tercepat dan terpercaya di Indonesia.",
      hero_btn: "Ambil Tiket Sekarang",
      upcoming: "Konser Mendatang",
      new_event: "Event Terbaru",
      view_all: "Lihat Semua",
      sync: "Menyingkronkan Acara...",
      no_event: "Belum ada jadwal konser tersedia.",
      premium_badge: "PREMIUM ACCESS",
      fans_count: "Penggemar Global",
      joined: "BERGABUNG",
      scan_text: "SCAN UNTUK MASUK",
      ticket_id: "ID TIKET",
      valid_until: "BERLAKU HINGGA"
    },
    en: {
      hero_tag: "The Best Music Experience 2026",
      hero_title_1: "EXPLORE THE",
      hero_title_2: "VIBE HERE",
      hero_desc: "Get exclusive access to your favorite artist's concert tickets with the fastest and most reliable booking system in Indonesia.",
      hero_btn: "Get Tickets Now",
      upcoming: "Upcoming Gigs",
      new_event: "Latest Events",
      view_all: "View All",
      sync: "Synchronizing Events...",
      no_event: "No concert schedules available yet.",
      premium_badge: "PREMIUM ACCESS",
      fans_count: "Global Fans",
      joined: "JOINED",
      scan_text: "SCAN TO ENTER",
      ticket_id: "TICKET ID",
      valid_until: "VALID UNTIL"
    }
  }[currentLang];

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
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleLangChange = () => {
      setCurrentLang(localStorage.getItem('lang') || 'id');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('languageChanged', handleLangChange);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('languageChanged', handleLangChange);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/customer/events'); 
        if (response.data && (response.data.status === "success" || response.data.data)) {
          const data = response.data.data || [];
          const sortedData = [...data].sort((a, b) => b.id - a.id);
          setEvents(sortedData.slice(0, 6)); 
        }
      } catch (err) {
        console.error("Gagal mengambil data dari backend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Scroll Animation menggunakan Intersection Observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const sections = [eventSectionRef.current, featuresRef.current, faqRef.current];
    sections.forEach(section => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // LIGHT MODE STYLES - PUTIH BERSIH & PREMIUM
  const heroBgClass = !isDarkMode ? "bg-white" : "bg-[#020617]";
  const textMainClass = !isDarkMode ? "text-slate-800" : "text-white";
  const textSecondaryClass = !isDarkMode ? "text-slate-600" : "text-slate-300";
  const textMutedClass = !isDarkMode ? "text-slate-500" : "text-slate-400";
  
  // Badge & Button styles
  const badgeBgClass = !isDarkMode ? "bg-white/80 border-slate-200" : "bg-white/5 border-white/10";
  const badgeTextClass = !isDarkMode ? "text-slate-700" : "text-white/80";
  const buttonBgClass = !isDarkMode ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "bg-gradient-to-r from-purple-600 to-pink-600";
  
  // User avatar circle
  const avatarCircleClass = !isDarkMode ? "bg-white/80" : "bg-gradient-to-br from-slate-800 to-slate-900";
  
  // Marquee text
  const marqueeTextClass = !isDarkMode ? "text-slate-200" : "text-white";

  return (
    <MainLayout>
      <PremiumBackground isLightMode={!isDarkMode}>
        {/* HERO SECTION - LIGHT MODE PUTIH BERSIH */}
        <section ref={heroRef} className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 pt-28 pb-12 lg:py-0 ${heroBgClass}`}>
          
          {/* PREMIUM BACKGROUND LAYER - Light Mode sangat soft */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Animated Gradient Orbs - Light Mode sangat soft */}
            <div className="absolute inset-0">
              <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[100px] md:blur-[150px] animate-pulse ${!isDarkMode ? 'bg-purple-200/20' : 'bg-purple-900/50'}`} style={{ animationDuration: '15s' }}></div>
              <div className={`absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full blur-[100px] md:blur-[130px] animate-pulse ${!isDarkMode ? 'bg-indigo-200/15' : 'bg-indigo-900/40'}`} style={{ animationDuration: '18s', animationDelay: '1s' }}></div>
              <div className={`absolute top-[30%] right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] md:blur-[120px] animate-pulse ${!isDarkMode ? 'bg-pink-200/12' : 'bg-pink-800/30'}`} style={{ animationDuration: '20s', animationDelay: '2s' }}></div>
            </div>

            {/* Premium Grid Pattern - Light Mode sangat soft */}
            <div className="absolute inset-0 opacity-[0.02]" 
                 style={{ 
                   backgroundImage: `repeating-linear-gradient(transparent, transparent 2px, rgba(139, 92, 246, 0.15) 2px, rgba(139, 92, 246, 0.15) 4px), 
                                     repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139, 92, 246, 0.15) 2px, rgba(139, 92, 246, 0.15) 4px)`,
                   backgroundSize: '40px 40px'
                 }}>
            </div>

            {/* Interactive Mouse-Follow Glow - Light Mode sangat soft */}
            <div 
              className={`hidden lg:block absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-700 ease-out ${!isDarkMode ? 'bg-purple-300/10' : 'bg-purple-600/20'}`}
              style={{ 
                transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)`,
                left: 0, top: 0 
              }}
            ></div>

            {/* Floating Stars Particles - Light Mode soft */}
            <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animation: `floatStar ${8 + i * 1.5}s infinite ease-out`,
                          animationDelay: `${i * 0.5}s`
                        }}
                    >
                        <Star size={Math.random() * 6 + 2} className={`${!isDarkMode ? 'text-purple-300/20' : 'text-white/20'}`} />
                    </div>
                ))}
            </div>
          </div>

          {/* MARQUEE BACKGROUND TEXT */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full opacity-[0.03] select-none pointer-events-none overflow-hidden">
            <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite]">
              <span className={`text-[120px] md:text-[200px] lg:text-[300px] font-black tracking-tighter px-4 ${marqueeTextClass}`}>✦ RALY TICKET • WORLD TOUR 2026 • PREMIUM EXPERIENCE ✦ </span>
              <span className={`text-[120px] md:text-[200px] lg:text-[300px] font-black tracking-tighter px-4 ${marqueeTextClass}`}>✦ RALY TICKET • WORLD TOUR 2026 • PREMIUM EXPERIENCE ✦ </span>
            </div>
          </div>

          <div className="relative z-20 container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">
              
              {/* LEFT CONTENT - Light Mode */}
              <div className="w-full lg:w-[60%] text-center lg:text-left order-2 lg:order-1 animate-fade-in-up">
                <div className={`inline-flex items-center gap-3 backdrop-blur-sm border p-1 pr-4 md:pr-6 rounded-full mb-6 md:mb-8 relative overflow-hidden group ${badgeBgClass} ${!isDarkMode ? 'border-slate-200' : 'border-white/10'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-[8px] md:text-[9px] font-black px-3 md:px-4 py-1.5 md:py-2 rounded-full uppercase tracking-wider text-white shadow-lg shadow-purple-500/30 flex items-center gap-2">
                    <Sparkles size={12} />
                    NEW 2026
                  </span>
                  <span className={`${badgeTextClass} text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2`}>
                    <Music2 size={12} />
                    {t.hero_tag}
                  </span>
                </div>

                <h1 className={`text-4xl sm:text-6xl md:text-8xl lg:text-[80px] font-black leading-[1.1] md:leading-[1.05] tracking-[-0.03em] mb-6 md:mb-8 ${textMainClass}`}>
                  {t.hero_title_1} <br />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                      {t.hero_title_2}
                    </span>
                    <div className={`absolute -inset-1 blur-2xl -z-0 ${!isDarkMode ? 'bg-gradient-to-r from-purple-200/30 to-pink-200/30' : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'}`}></div>
                  </span>
                </h1>

                <p className={`${textSecondaryClass} text-base md:text-xl max-w-xl mx-auto lg:mx-0 mb-10 md:mb-12 leading-relaxed border-l-0 lg:border-l-2 border-purple-500 lg:pl-6 font-medium`}>
                  {t.hero_desc}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                  <button 
                    onClick={() => document.getElementById('event-list')?.scrollIntoView({ behavior: 'smooth' })}
                    className={`w-full sm:w-auto group relative px-10 py-5 text-white font-black uppercase text-xs tracking-[0.2em] rounded-full overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-1 active:scale-95 ${buttonBgClass}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {t.hero_btn} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>
                  
                  <div className="flex items-center gap-5 py-2 hover:scale-105 transition-transform duration-300">
                      <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-purple-500/50 flex items-center justify-center shadow-xl hover:-translate-y-1 transition-transform ${avatarCircleClass}`}>
                            <User size={16} className="text-purple-500" />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col text-left">
                         <span className={`${textMainClass} text-sm font-black tracking-wider`}>25K+ {t.joined}</span>
                         <span className="text-[10px] text-purple-500 font-bold uppercase tracking-wider">{t.fans_count}</span>
                      </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CONTENT: PREMIUM QR CARD - Light Mode Premium */}
              <div className="w-full lg:w-[35%] relative order-1 lg:order-2 flex justify-center lg:justify-end px-4 md:px-0 animate-fade-in-right">
                <div className="relative group perspective-2000 w-full max-w-[320px] md:max-w-[360px]">
                  {/* Outer Glow Effect */}
                  <div className={`absolute -inset-10 md:-inset-15 rounded-full blur-[80px] md:blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${!isDarkMode ? 'bg-gradient-to-r from-purple-300/20 via-pink-300/20 to-indigo-300/20' : 'bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-indigo-600/30'}`}></div>
                  
                  {/* Rotating Rings */}
                  <div className={`absolute -inset-4 rounded-full border ${!isDarkMode ? 'border-purple-200/40' : 'border-purple-500/20'} animate-[spin_8s_linear_infinite]`}></div>
                  <div className={`absolute -inset-8 rounded-full border ${!isDarkMode ? 'border-pink-200/20' : 'border-pink-500/10'} animate-[spin_12s_linear_infinite_reverse]`}></div>

                  {/* Main Ticket Card Container */}
                  <div className={`relative w-full backdrop-blur-xl border rounded-[2.5rem] md:rounded-[3rem] p-5 md:p-6 shadow-2xl transition-all duration-700 ease-out lg:group-hover:rotate-0 lg:group-hover:scale-105 lg:-rotate-3 group-hover:border-purple-500/60 group-hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] overflow-hidden ${!isDarkMode ? 'bg-white border-slate-200' : 'bg-gradient-to-br from-[#0f172a] via-[#1a1a3e] to-[#1e1b4b] border-white/15'}`}>
                    
                    {/* Notches */}
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 md:w-5 h-8 md:h-10 rounded-r-full border-y border-r z-30 -ml-[1px] ${!isDarkMode ? 'bg-white border-slate-200' : 'bg-[#020617] border-white/10'}`}></div>
                    <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 md:w-5 h-8 md:h-10 rounded-l-full border-y border-l z-30 -mr-[1px] ${!isDarkMode ? 'bg-white border-slate-200' : 'bg-[#020617] border-white/10'}`}></div>
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 md:w-10 h-4 md:h-5 rounded-b-full border-x border-b z-30 -mt-[1px] ${!isDarkMode ? 'bg-white border-slate-200' : 'bg-[#020617] border-white/10'}`}></div>
                    
                    <div className={`h-full flex flex-col justify-between border border-dashed rounded-2xl p-4 md:p-5 relative overflow-hidden ${!isDarkMode ? 'border-slate-200' : 'border-white/15'}`}>
                      
                      {/* Animated Scan Line */}
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-purple-500/80 to-transparent -translate-y-full group-hover:translate-y-[500px] transition-transform duration-[3000ms] ease-out"></div>
                      
                      {/* Header Section */}
                      <div className="space-y-4 md:space-y-5 relative z-10">
                        <div className="flex justify-between items-start">
                          <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl border ${!isDarkMode ? 'bg-purple-50 border-purple-200' : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30'}`}>
                            <Ticket className={`${!isDarkMode ? 'text-purple-600' : 'text-purple-400'}`} size={20} />
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] md:text-[9px] font-black text-purple-500 tracking-[0.3em] uppercase mb-1">{t.premium_badge}</p>
                            <p className={`text-[9px] md:text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm px-3 py-1.5 rounded-full border ${!isDarkMode ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-white bg-white/10 border-white/10'}`}>
                              ✦ VIP PASS ✦
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 ${textMutedClass}`}>
                            <Shield size={10} />
                            {t.ticket_id}: #RLY-2026-{Math.floor(Math.random() * 10000)}
                          </p>
                          <p className={`text-2xl md:text-3xl font-black leading-none uppercase tracking-tight transition-all duration-500 ${!isDarkMode ? 'text-slate-800 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600' : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400'}`}>
                            {t.hero_title_2}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <p className={`text-[7px] md:text-[8px] uppercase tracking-wider ${textMutedClass}`}>{t.valid_until}: 31 DEC 2026</p>
                            <div className="flex items-center gap-1">
                              <Zap size={10} className="text-purple-500" />
                              <p className="text-[7px] md:text-[8px] text-purple-500 font-bold">ULTRA ACCESS</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QR CODE SECTION */}
                      <div className="flex flex-col items-center gap-4 relative z-10 mt-5">
                        <div className={`w-full h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent`}></div>
                        
                        <div className="relative" onMouseEnter={() => setQrHover(true)} onMouseLeave={() => setQrHover(false)}>
                          <div className={`absolute -inset-3 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 transition-opacity duration-500 blur-md ${qrHover ? 'opacity-100' : ''}`}></div>
                          
                          <div className={`relative bg-white p-4 md:p-5 rounded-xl md:rounded-2xl shadow-2xl transition-all duration-500 ${qrHover ? 'scale-110 rotate-3 shadow-[0_0_40px_rgba(168,85,247,0.6)]' : ''}`}>
                            <QrCode size={60} className="text-[#020617]" />
                            <div className={`absolute inset-0 overflow-hidden rounded-xl md:rounded-2xl pointer-events-none ${qrHover ? 'opacity-100' : 'opacity-0'}`}>
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent animate-[scanQR_1.5s_ease-in-out_infinite]"></div>
                            </div>
                            <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-purple-500 rounded-tl-sm"></div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-purple-500 rounded-tr-sm"></div>
                            <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-purple-500 rounded-bl-sm"></div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-purple-500 rounded-br-sm"></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                          <p className={`font-mono text-[8px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase transition-colors duration-300 ${textMutedClass} group-hover:text-purple-500`}>
                            {t.scan_text}
                          </p>
                          <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        
                        <div className="flex gap-[1.5px] md:gap-[2px] justify-center">
                          {[...Array(15)].map((_, i) => (
                            <div key={i} className={`w-0.5 h-3 rounded-full transition-all duration-300 group-hover:bg-purple-500 ${!isDarkMode ? 'bg-slate-300' : 'bg-slate-600'} ${qrHover ? `h-4` : ''}`} style={{ transitionDelay: `${i * 20}ms` }}></div>
                          ))}
                        </div>
                        
                        <div className={`flex justify-between w-full text-[7px] md:text-[8px] font-mono pt-2 border-t ${!isDarkMode ? 'text-slate-400 border-slate-200' : 'text-slate-500 border-white/10'}`}>
                          <span>GATE A</span>
                          <span>PREMIUM</span>
                          <span>SEAT: A-01</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Decor Elements */}
                  <div className="absolute -top-6 md:-top-10 -right-6 md:-right-10 bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-2xl animate-bounce z-30">
                     <Mic2 className="text-white" size={18} />
                  </div>
                  <div className="absolute -bottom-6 md:-bottom-8 -left-6 md:-left-10 bg-gradient-to-br from-indigo-600 to-blue-600 p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-2xl animate-bounce z-30 hidden sm:block" style={{ animationDelay: '1s' }}>
                     <Headphones className="text-white" size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes floatStar {
              0% { transform: translateY(0) rotate(0deg); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes gradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes scanQR {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100%); }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .perspective-2000 { perspective: 2000px; }
            
            /* Animasi Fade In */
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeInRight {
              from { opacity: 0; transform: translateX(40px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            
            .animate-fade-in-up {
              animation: fadeInUp 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
            }
            .animate-fade-in-right {
              animation: fadeInRight 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
            }
            
            /* Scroll Reveal Animation */
            .scroll-reveal {
              opacity: 0;
              transform: translateY(40px);
              transition: all 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1);
            }
            .scroll-reveal.scroll-visible {
              opacity: 1;
              transform: translateY(0);
            }
            .scroll-reveal-delay-1 { transition-delay: 0.1s; }
            .scroll-reveal-delay-2 { transition-delay: 0.2s; }
            .scroll-reveal-delay-3 { transition-delay: 0.3s; }
          `}</style>
        </section>

        {/* EVENT TERBARU SECTION - Light Mode Premium */}
        <section 
          ref={eventSectionRef} 
          id="event-list" 
          className="relative py-20 md:py-28 overflow-hidden scroll-reveal"
        >
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
              <div className="text-center md:text-left">
                <div className={`inline-flex items-center gap-2 backdrop-blur-sm border px-4 py-1.5 rounded-full mb-4 ${!isDarkMode ? 'bg-white/60 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                  <Sparkles size={14} className="text-purple-500 animate-pulse" />
                  <span className={`font-black text-[10px] uppercase tracking-[0.3em] ${textMutedClass}`}>{t.upcoming}</span>
                </div>
                <h2 className={`text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none ${textMainClass}`}>{t.new_event}</h2>
                <div className="h-1.5 w-32 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 mt-6 rounded-full mx-auto md:mx-0"></div>
              </div>
              
              <Link to="/events" className={`group backdrop-blur-sm border pl-6 pr-2 py-2 rounded-full flex items-center gap-4 transition-all duration-300 ${!isDarkMode ? 'bg-white/60 border-slate-200 hover:bg-white/80' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                <span className={`font-black text-xs uppercase tracking-[0.2em] ${textMainClass}`}>{t.view_all}</span>
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2.5 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform"><ChevronRight size={18} /></div>
              </Link>
            </div>

            {loading ? (
              <div className={`flex flex-col items-center justify-center py-40 backdrop-blur-sm rounded-[3rem] border border-dashed animate-pulse ${!isDarkMode ? 'bg-white/40 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <Loader2 className="animate-spin text-purple-500 mb-6" size={50} />
                <p className={`font-black uppercase tracking-[0.3em] text-[11px] mt-4 ${textMutedClass}`}>{t.sync}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10 justify-items-center">
                {events.length > 0 ? (
                  events.slice(0, 6).map((event, index) => (
                    <div 
                      key={event.id} 
                      className="w-full flex justify-center opacity-0 animate-[revealUp_0.6s_ease-out_forwards] scroll-reveal scroll-reveal-delay-1" 
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <EventCard event={event} getTranslation={getTranslation} lang={currentLang} isDarkMode={isDarkMode} />
                    </div>
                  ))
                ) : (
                  <div className={`col-span-full w-full text-center py-28 backdrop-blur-sm rounded-[3rem] border border-dashed px-6 ${!isDarkMode ? 'bg-white/40 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                    <Music2 size={50} className={`mx-auto mb-5 opacity-30 ${!isDarkMode ? 'text-purple-300' : 'text-slate-600'}`} />
                    <p className={`text-sm font-bold uppercase tracking-[0.2em] ${textMutedClass}`}>{t.no_event}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <style>{`
            @keyframes revealUp { from { opacity: 0; transform: translateY(50px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
        </section>
        
        {/* FEATURES COMPONENT WITH LIGHT MODE & SCROLL REVEAL */}
        <div ref={featuresRef} className="scroll-reveal scroll-reveal-delay-2">
          <Features isDarkMode={isDarkMode} />
        </div>
        
        {/* FAQ COMPONENT WITH LIGHT MODE & SCROLL REVEAL */}
        <div ref={faqRef} className="scroll-reveal scroll-reveal-delay-3">
          <FAQ isDarkMode={isDarkMode} />
        </div>
        
      </PremiumBackground>
    </MainLayout>
  );
};

/* --- PREMIUM EVENT CARD COMPONENT WITH LIGHT MODE SUPPORT --- */
const EventCard = ({ event, getTranslation, lang, isDarkMode }) => {
  const navigate = useNavigate();
  const { id, title, location, category, event_date, start_time, images, starting_price, remaining_quota } = event;

  const formatIDR = (amount) => {
    if (!amount) return "IDR 0";
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount).replace('Rp', 'RP.');
  };
  
  const dateObj = event_date ? new Date(event_date) : null;
  const day = dateObj ? dateObj.getDate().toString().padStart(2, '0') : "??";
  const month = dateObj ? dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' }).toUpperCase() : "TBA";
  const year = dateObj ? dateObj.getFullYear() : "2026";
  const quota = Number(remaining_quota) || 0;
  const formattedTime = start_time ? start_time.slice(0, 5) : "19:00";
  const displayTitle = getTranslation(title);

  // Card styles based on theme
  const cardBgClass = !isDarkMode 
    ? "bg-white border-slate-200 shadow-xl" 
    : "bg-[#0f172a] border-white/5";
  
  // LIGHT MODE: Tidak pakai overlay putih, hanya gradient gelap minimal
  const overlayClass = !isDarkMode 
    ? "bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-90" 
    : "bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-95";
  
  const priceBadgeClass = !isDarkMode 
    ? "bg-white/90 border-slate-200 text-slate-700 shadow-md" 
    : "bg-black/60 border-white/10 text-white";
  
  const quotaBadgeClass = !isDarkMode 
    ? (quota > 0 ? "bg-purple-500 text-white border-purple-300 shadow-md" : "bg-red-500 text-white border-red-300 shadow-md")
    : (quota > 0 ? "bg-purple-600/60 border-purple-400/30 text-white" : "bg-red-600/60 border-red-400/30 text-white");
  
  const titleClass = !isDarkMode 
    ? "text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400" 
    : "text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-300";
  
  const locationClass = !isDarkMode 
    ? "text-slate-200 bg-black/30 backdrop-blur-sm border-white/20 group-hover:bg-black/50" 
    : "text-slate-300 bg-white/5 border-white/10 group-hover:bg-white/10";
  
  const dateBoxClass = !isDarkMode 
    ? "bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg" 
    : "bg-white text-black";
  
  const dividerClass = !isDarkMode ? "border-white/15" : "border-white/10";
  const timeClass = !isDarkMode ? "text-slate-300" : "text-slate-300";
  const yearClass = !isDarkMode ? "text-slate-400" : "text-slate-400";
  const arrowClass = !isDarkMode 
    ? "bg-black/30 border-white/20 backdrop-blur-sm" 
    : "bg-white/5 border-white/10";
  
  const categoryTextClass = !isDarkMode ? "text-purple-300" : "text-purple-400";
  const mapPinClass = !isDarkMode ? "text-purple-400" : "text-purple-500";

  return (
    <div 
      onClick={() => navigate(`/event/${id}`)} 
      className={`relative w-full max-w-[320px] h-[440px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(168,85,247,0.25)] border ${cardBgClass}`}
    >
      <img src={images?.[0] || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 brightness-[0.55] group-hover:brightness-[0.7]" alt={displayTitle} />
      <div className={`absolute inset-0 transition-opacity duration-500 group-hover:opacity-70 ${overlayClass}`}></div>
      <div className="absolute inset-0 rounded-[2.5rem] border-2 border-transparent group-hover:border-purple-500/40 transition-all duration-700 pointer-events-none z-30"></div>
      
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
        <div className={`backdrop-blur-sm border px-3 py-1 rounded-full shadow-lg transform transition-transform group-hover:scale-110 ${priceBadgeClass}`}>
          <p className="text-[10px] font-black tracking-wider">{formatIDR(starting_price)}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-sm border shadow-lg transform transition-all duration-500 group-hover:translate-x-1 ${quotaBadgeClass}`}>
          {quota > 0 ? `${quota} LEFT` : 'SOLD OUT'}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transform -translate-x-4 group-hover:translate-x-0 transition-transform duration-500"></div>
            <span className={`${categoryTextClass} text-[9px] font-black uppercase tracking-[0.25em] translate-x-[-8px] group-hover:translate-x-0 transition-transform duration-500 delay-75`}>
              {category?.category_name || category || "CONCERT"}
            </span>
          </div>
          <h3 className={`text-xl font-black leading-[1.2] uppercase tracking-tight line-clamp-2 transition-all duration-300 ${titleClass}`}>
            {displayTitle}
          </h3>
          <div className={`flex items-center gap-2 backdrop-blur-sm border w-fit px-3 py-1.5 rounded-full mt-1 transition-colors ${locationClass}`}>
            <MapPin size={10} className={`${mapPinClass} animate-bounce`} />
            <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[150px]">{location?.location_name || location || "Location TBA"}</span>
          </div>
          <div className={`flex items-center justify-between mt-4 pt-4 border-t ${dividerClass}`}>
            <div className="flex items-center gap-3">
              <div className={`flex flex-col items-center justify-center w-[45px] h-[45px] rounded-2xl shadow-xl transform transition-all duration-500 group-hover:rotate-[10deg] group-hover:bg-purple-500 group-hover:text-white ${dateBoxClass}`}>
                  <span className="text-base font-black leading-none">{day}</span>
                  <span className="text-[8px] font-black uppercase leading-none mt-0.5">{month}</span>
              </div>
              <div className="flex flex-col">
                  <span className={`${yearClass} text-[10px] font-black uppercase tracking-widest`}>{year}</span>
                  <div className="flex items-center gap-1.5"><Clock size={10} className="text-purple-400" /><span className={`text-[9px] font-bold uppercase tracking-widest ${timeClass}`}>{formattedTime}</span></div>
              </div>
            </div>
            <div className={`backdrop-blur-sm p-2 rounded-full border group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-pink-600 group-hover:border-transparent group-hover:scale-125 transition-all duration-500 shadow-lg ${arrowClass}`}>
              <ChevronRight size={16} className="text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;