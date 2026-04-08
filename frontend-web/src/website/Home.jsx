import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronRight, Loader2, Music2, QrCode, User, Music, Mic2, Clock,Headphones } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');
  const scrollRef = useRef(null);

  // Helper untuk mendapatkan terjemahan yang benar
  const getTranslation = (data, field = 'id') => {
    const lang = currentLang;
    if (!data) return "";
    
    // Jika data adalah string (mungkin JSON string dari backend)
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parsed[lang] || parsed['id'] || data;
      } catch (e) {
        return data;
      }
    }
    // Jika data sudah berupa objek
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
      no_event: "Belum ada jadwal konser tersedia."
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
      no_event: "No concert schedules available yet."
    }
  }[currentLang];

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
          // Tetap membatasi 6 kartu terbaru
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

  return (
    <MainLayout>
{/* 1. HERO SECTION - ULTIMATE HYPER-DYNAMIC EDITION */}
<section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] pt-24 lg:pt-0">
  
  {/* --- STRATEGIC BACKGROUND LAYER --- */}
  <div className="absolute inset-0 z-0 pointer-events-none">
    
    {/* 1. Base Aurora Mesh - Gradasi warna yang bergerak sangat lambat */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-purple-900/40 rounded-full blur-[120px] animate-mesh-1"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/30 rounded-full blur-[100px] animate-mesh-2"></div>
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-pink-900/20 rounded-full blur-[80px] animate-mesh-3"></div>
    </div>

    {/* 2. Professional Grid with Fade - Menghilang di bagian bawah agar elegan */}
    <div className="absolute inset-0 opacity-[0.12]" 
         style={{ 
           backgroundImage: `linear-gradient(to bottom, transparent, #020617), radial-gradient(#4f46e5 0.8px, transparent 0.8px)`, 
           backgroundSize: '100% 100%, 40px 40px' 
         }}>
    </div>

    {/* 3. Subtle Texture Overlay (Festival Vibe) */}
    <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay grayscale">
      <img 
        src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2070" 
        alt="Texture"
        className="w-full h-full object-cover scale-110 animate-subtle-zoom"
      />
    </div>

    {/* 4. Interactive Mouse-Follow Glow - Lebih responsif */}
    <div 
      className="absolute w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] transition-transform duration-700 ease-out z-10"
      style={{ 
        transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
        left: 0, top: 0 
      }}
    ></div>

    {/* 5. Floating Bokeh Particles - Bintik cahaya yang lebih besar & soft */}
    <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
            <div 
                key={i}
                className="absolute bg-gradient-to-br from-white/10 to-transparent rounded-full blur-sm animate-float-bokeh"
                style={{
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${i * 1.5}s`,
                    animationDuration: `${15 + i * 2}s`
                }}
            />
        ))}
    </div>
  </div>

  {/* --- MARQUEE BACKGROUND TEXT --- */}
  <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full opacity-[0.02] select-none pointer-events-none overflow-hidden">
    <div className="flex whitespace-nowrap animate-marquee-fast">
      <span className="text-[250px] font-black text-white px-4">RALY TICKET • WORLD TOUR • 2026 • </span>
      <span className="text-[250px] font-black text-white px-4">RALY TICKET • WORLD TOUR • 2026 • </span>
    </div>
  </div>

  <div className="relative z-20 container mx-auto px-6">
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
      
      {/* LEFT CONTENT */}
      <div className="w-full lg:w-[60%] text-left order-2 lg:order-1">
        
        {/* Shimmer Badge */}
        <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl border border-white/10 p-1 pr-5 rounded-full mb-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer transition-all duration-1000"></div>
          <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter text-white shadow-lg shadow-purple-500/20">
            NEW UPDATE 2026
          </span>
          <span className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em]">
            {t.hero_tag}
          </span>
        </div>

        {/* Headline - Sized to fit perfectly */}
        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black leading-[1] tracking-[-0.05em] text-white mb-10 group">
          {t.hero_title_1} <br />
          <span className="relative inline-block py-2 overflow-hidden">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 italic group-hover:tracking-wider transition-all duration-700">
              {t.hero_title_2}
            </span>
            <div className="absolute inset-x-0 bottom-4 h-4 bg-purple-500/30 blur-xl -z-0 animate-pulse"></div>
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-lg max-w-xl mb-12 leading-relaxed border-l-2 border-purple-500/30 pl-8 font-medium">
          {t.hero_desc}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-8">
          <button 
            onClick={() => document.getElementById('event-list')?.scrollIntoView({ behavior: 'smooth' })}
            className="group relative px-10 py-5 bg-white text-[#020617] font-black uppercase text-[11px] tracking-[0.3em] overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:-translate-y-1 active:scale-95"
          >
            <div className="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 flex items-center gap-3">
              {t.hero_btn} <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
            </span>
          </button>
          
          {/* Social Proof */}
          <div className="flex items-center gap-4 py-2 hover:scale-105 transition-transform duration-300">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center shadow-lg transform hover:-translate-y-1 transition-transform">
                    <User size={16} className="text-purple-400" />
                  </div>
                ))}
             </div>
             <div className="flex flex-col">
                <span className="text-white text-xs font-black tracking-tight tracking-widest">10K+ JOINED</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Global Fans</span>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT: THE TICKET */}
      <div className="w-full lg:w-[35%] relative order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-in-right">
        <div className="relative group perspective-2000">
          
          {/* 3D Moving Glow Behind Card */}
          <div className="absolute -inset-10 bg-gradient-to-r from-purple-600/20 via-transparent to-pink-600/20 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-spin-slow"></div>

          {/* Ticket Card */}
          <div className="relative w-full max-w-[320px] aspect-[1/1.45] bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-1000 ease-out hover:rotate-0 hover:scale-[1.05] -rotate-6 group-hover:border-purple-500/50">
            
            {/* Cutouts with inner glow */}
            <div className="absolute -left-[20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-[#020617] rounded-full border border-white/10 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]"></div>
            <div className="absolute -right-[20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-[#020617] rounded-full border border-white/10 shadow-[inset_0_0_10px_rgba(168,85,247,0.2)]"></div>
            
            <div className="h-full flex flex-col justify-between border-[1px] border-dashed border-white/10 rounded-3xl p-6 relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
              
              {/* Scanline Effect */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent -translate-y-full group-hover:animate-scan transition-all"></div>

              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-purple-500/10 rounded-2xl border border-white/5 animate-bounce-slow">
                    <Music className="text-purple-400" size={24} />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-purple-500 tracking-[0.3em] uppercase mb-1">Access</p>
                    <p className="text-[11px] font-bold text-white tracking-widest uppercase">VIP PASS</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] italic opacity-80">Official Ticket</p>
                  <p className="text-2xl font-black text-white leading-none uppercase tracking-tighter group-hover:text-purple-400 transition-colors duration-500">
                    {t.hero_title_2}
                  </p>
                </div>
              </div>

              {/* QR Section with Glow */}
              <div className="flex flex-col items-center gap-5 relative z-10">
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <div className="bg-white p-4 rounded-3xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-[0_0_30px_rgba(255,255,255,0.2)] relative">
                  <QrCode size={60} className="text-[#020617]" />
                </div>
                <p className="font-mono text-[9px] text-slate-500 tracking-[0.4em] uppercase">Stage: A-22</p>
              </div>
            </div>
          </div>

          {/* Floating Accessories */}
          <div className="absolute -top-6 -right-6 bg-[#020617]/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 animate-float shadow-2xl z-30">
             <Mic2 className="text-pink-500" size={24} />
          </div>
          <div className="absolute -bottom-4 -left-10 bg-[#020617]/80 backdrop-blur-xl p-2.5 rounded-xl border border-white/10 animate-float-slow shadow-2xl z-30 hidden lg:block">
             <Headphones className="text-indigo-400" size={20} />
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* CSS ANIMATIONS */}
  <style jsx>{`
    @keyframes mesh-1 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(10%, 10%); } }
    @keyframes mesh-2 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-15%, -5%); } }
    @keyframes mesh-3 { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(5%, -15%); } }
    
    @keyframes float-bokeh {
      0% { transform: translateY(0) scale(1); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
    }
    @keyframes marquee-fast {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes scan {
      0% { transform: translateY(0); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(300px); opacity: 0; }
    }
    @keyframes subtle-zoom {
      0% { transform: scale(1.1); }
      100% { transform: scale(1.2); }
    }
    @keyframes spin-slow {
      to { transform: rotate(360deg); }
    }

    .animate-mesh-1 { animation: mesh-1 15s ease-in-out infinite; }
    .animate-mesh-2 { animation: mesh-2 18s ease-in-out infinite; }
    .animate-mesh-3 { animation: mesh-3 20s ease-in-out infinite; }
    .animate-float-bokeh { animation: float-bokeh infinite ease-in-out; }
    .animate-marquee-fast { animation: marquee-fast 30s linear infinite; }
    .animate-scan { animation: scan 3s infinite linear; }
    .animate-subtle-zoom { animation: subtle-zoom 20s infinite alternate ease-in-out; }
    .animate-spin-slow { animation: spin-slow 15s linear infinite; }

    .animate-float { animation: float 5s infinite ease-in-out; }
    .animate-float-slow { animation: float-slow 7s infinite ease-in-out; }
    .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
    
    .perspective-2000 { perspective: 2000px; }
  `}</style>
</section>

      {/* 2. EVENT TERBARU SECTION - DIUBAH KE GRID (SCROLL KEBAWAH) */}
      <section id="event-list" className="py-16 md:py-24 bg-[#020617]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-12">
          <div className="flex justify-between items-end mb-12">
            <div className="text-left">
              <span className="text-purple-500 font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mb-3 block">{t.upcoming}</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
                {t.new_event}
              </h2>
              <div className="h-2 w-24 bg-gradient-to-r from-purple-600 to-pink-500 mt-4 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]"></div>
            </div>
            
            <div className="flex items-center gap-4">
               <Link 
                to="/events" 
                className="group text-slate-400 font-bold text-xs md:text-sm flex items-center gap-2 hover:text-purple-400 transition-all uppercase tracking-[0.2em]"
              >
                {t.view_all}
                <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </div>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-900/50 rounded-[30px] border border-slate-800">
              <Loader2 className="animate-spin text-purple-500 mb-6" size={40} />
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">{t.sync}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="w-full flex justify-center">
                    <EventCard event={event} getTranslation={getTranslation} lang={currentLang} />
                  </div>
                ))
              ) : (
                <div className="col-span-full w-full text-center py-20 bg-slate-900/30 rounded-[30px] border border-dashed border-slate-800 px-6">
                  <Music2 size={40} className="mx-auto text-slate-700 mb-4 opacity-20" />
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">{t.no_event}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

/* --- ENHANCED EVENT CARD --- */
const EventCard = ({ event, getTranslation, lang }) => {
  const navigate = useNavigate();
  
  const { 
    id, 
    title, 
    location, 
    category,
    event_date, 
    start_time,
    images, 
    starting_price, 
    remaining_quota
  } = event;

  const formatIDR = (amount) => {
    if (!amount) return "IDR 0";
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(amount).replace('Rp', 'RP.');
  };
  
  const dateObj = event_date ? new Date(event_date) : null;
  const day = dateObj ? dateObj.getDate() : "??";
  const month = dateObj ? dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' }) : "TBA";
  const year = dateObj ? dateObj.getFullYear() : "2026";
  
  const locationName = location || "Location TBA";
  const categoryName = category || "CONCERT";
  const quota = Number(remaining_quota) || 0;
  const formattedTime = start_time ? start_time.slice(0, 5) : "19:00";

  const displayTitle = getTranslation(title);

  return (
    <div 
      onClick={() => navigate(`/event/${id}`)}
      className="relative w-full max-w-[340px] h-[440px] rounded-[32px] overflow-hidden group cursor-pointer shadow-xl transition-all duration-700 hover:-translate-y-3 hover:shadow-purple-500/10"
    >
      <img 
        src={images?.[0] || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600"} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.7] group-hover:brightness-[0.85]" 
        alt={displayTitle} 
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 transition-all duration-500"></div>

      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl shadow-lg">
          <p className="text-[10px] font-black uppercase tracking-widest text-white">
            {formatIDR(starting_price)}
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-xl border shadow-lg ${quota > 0 ? 'bg-purple-600/60 border-purple-400/30' : 'bg-red-600/60 border-red-400/30'}`}>
          {quota > 0 ? `${quota} LEFT` : 'SOLD OUT'}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-3 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
            <span className="text-purple-400 text-[9px] font-black uppercase tracking-[0.3em]">
              {categoryName}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white leading-tight uppercase italic tracking-tighter line-clamp-2">
            {displayTitle}
          </h3>

          <div className="flex items-center gap-2 text-slate-200 bg-white/5 backdrop-blur-sm border border-white/5 w-fit px-2.5 py-1 rounded-lg">
            <MapPin size={12} className="text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[180px]">{locationName}</span>
          </div>

          <div className="flex items-center justify-between mt-2 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center bg-white text-black w-[42px] h-[42px] rounded-[15px] shadow-xl">
                  <span className="text-base font-black leading-none">{day}</span>
                  <span className="text-[8px] font-black uppercase leading-none mt-0.5">{month}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-white text-[11px] font-black uppercase tracking-widest">{year}</span>
                  <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                    <Clock size={10} className="text-purple-400" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{formattedTime}</span>
                  </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 group-hover:bg-white group-hover:text-black transition-all duration-500">
              <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;