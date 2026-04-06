import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, ChevronRight, Loader2, Ticket, Music2, Headphones, Music, Radio, Mic2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/customer/events'); 
        if (response.data.status === "success") {
          const data = response.data.data || [];
          const sortedData = [...data].sort((a, b) => b.id - a.id);
          setEvents(sortedData); 
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
      {/* 1. HERO SECTION - INTERACTIVE & GRAPHIC ELEMENTS */}
      <section className="relative min-h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden bg-[#020617] pt-16 md:pt-0">
        
        {/* Decorative Graphic Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          
          {/* Interactive Mouse Follow Glow */}
          <div 
            className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] transition-transform duration-300 ease-out"
            style={{ 
              transform: `translate(${mousePos.x - 300}px, ${mousePos.y - 300}px)`,
            }}
          ></div>

          {/* Glowing Blobs Static */}
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px]"></div>

          {/* Music Elements with Hover Parallax Effect */}
          <div 
            className="absolute inset-0 transition-transform duration-500 ease-out"
            style={{ transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.02}px, ${(mousePos.y - window.innerHeight / 2) * 0.02}px)` }}
          >
            <Music className="absolute top-20 left-[10%] text-purple-500/30 animate-bounce duration-[3000ms]" size={60} />
            <Headphones className="absolute top-40 right-[12%] text-pink-500/20 -rotate-12 animate-pulse" size={80} />
            <Mic2 className="absolute bottom-32 left-[15%] text-indigo-500/30 rotate-12" size={50} />
            <Radio className="absolute bottom-20 right-[10%] text-purple-500/20 animate-bounce duration-[4000ms]" size={70} />
          </div>

          {/* Geometric Ornaments */}
          <div className="absolute top-1/4 left-[5%] w-16 h-1.5 bg-gradient-to-r from-pink-500 to-transparent rounded-full rotate-45 opacity-40"></div>
          <div className="absolute top-1/3 right-[15%] w-10 h-10 border-4 border-purple-500/20 rounded-full"></div>
          <div className="absolute bottom-1/4 left-[20%] w-20 h-20 border-2 border-white/5 rounded-3xl rotate-12"></div>

          {/* Bottom Visualizer Overlay */}
          <div className="absolute bottom-0 left-0 w-full flex items-end justify-center gap-1 opacity-20 h-32">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 md:w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-full animate-bounce" 
                style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 md:px-6 max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full mb-8 shadow-2xl">
            <Ticket size={16} className="text-purple-400 rotate-12" />
            <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
              The Best Music Experience 2026
            </span>
          </div>
          
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter uppercase leading-[0.85] mb-8 text-white drop-shadow-2xl">
              EXPLORE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                VIBE HERE
              </span>
            </h1>
            <div className="absolute -bottom-2 left-0 w-full h-2 bg-gradient-to-r from-transparent via-pink-500/50 to-transparent blur-sm"></div>
          </div>
          
          <p className="text-slate-400 font-medium text-sm md:text-xl mt-8 mb-12 max-w-2xl mx-auto leading-relaxed px-4">
            Dapatkan akses eksklusif ke tiket konser artis favoritmu dengan sistem booking tercepat dan terpercaya di Indonesia.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <button 
              onClick={() => document.getElementById('event-list')?.scrollIntoView({ behavior: 'smooth' })}
              className="group bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest hover:bg-purple-600 hover:text-white transition-all duration-500 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex items-center gap-3 active:scale-95"
            >
              Get Tickets Now
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. EVENT TERBARU SECTION */}
      <section id="event-list" className="px-4 md:px-12 py-16 md:py-24 bg-[#020617]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
            <div className="text-left w-full md:w-auto">
              <span className="text-purple-500 font-black text-[10px] md:text-xs uppercase tracking-[0.4em] mb-2 md:mb-3 block">Upcoming Gigs</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
                Event Terbaru
              </h2>
              <div className="h-1.5 md:h-2 w-24 md:w-32 bg-gradient-to-r from-purple-600 to-pink-500 mt-3 md:mt-4 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]"></div>
            </div>
            <Link 
              to="/events" 
              className="group text-slate-400 font-bold text-xs md:text-sm flex items-center gap-2 hover:text-purple-400 transition-all uppercase tracking-[0.2em]"
            >
              Lihat Semua Event 
              <div className="bg-slate-900 p-2 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ChevronRight size={16} md:size={18} />
              </div>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-slate-900/50 rounded-[30px] md:rounded-[40px] border border-slate-800">
              <Loader2 className="animate-spin text-purple-500 mb-4 md:mb-6" size={40} md:size={56} />
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Synchronizing Events...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard 
                    key={event.id}
                    event={event} 
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-20 md:py-24 bg-slate-900/30 rounded-[30px] md:rounded-[40px] border border-dashed border-slate-800 px-6">
                  <Music2 size={40} md:size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">Belum ada jadwal konser tersedia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { id, title, location, category, event_date, images, starting_price, remaining_quota } = event;
  const formatIDR = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0);
  const formattedDate = event_date ? new Date(event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "Venue TBA";
  const quota = Number(remaining_quota) || 0;

  return (
    <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-[30px] md:rounded-[35px] overflow-hidden border border-slate-800 group hover:border-purple-500/50 hover:-translate-y-2 md:hover:-translate-y-3 transition-all duration-500 shadow-xl flex flex-col h-full text-left">
      <div className="h-48 md:h-64 relative overflow-hidden p-2 md:p-3">
        <img 
          src={images?.[0] || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600"} 
          className="w-full h-full object-cover rounded-[20px] md:rounded-[25px] group-hover:scale-110 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0" 
          alt={title} 
        />
        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-purple-600 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white shadow-lg border border-purple-400/30">
          {category || "CONCERT"}
        </div>
        <div className={`absolute top-4 right-4 md:top-6 md:right-6 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[7px] md:text-[8px] font-bold uppercase tracking-tighter text-white border backdrop-blur-md ${quota > 0 ? 'bg-black/50 border-white/10' : 'bg-red-600 border-red-400'}`}>
            {quota > 0 ? `${quota} Slots Left` : 'Sold Out'}
        </div>
      </div>
      <div className="px-5 pb-6 md:px-7 md:pb-7 pt-2 flex flex-col flex-1">
        <h3 className="font-black text-xl md:text-2xl text-white leading-tight uppercase italic mb-4 md:mb-5 group-hover:text-purple-400 transition-colors line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
          {title}
        </h3>
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
          <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={12} className="text-purple-500 shrink-0 md:w-3.5 md:h-3.5" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <MapPin size={12} className="text-purple-500 shrink-0 md:w-3.5 md:h-3.5" />
            <span className="line-clamp-1">{location || "Location TBA"}</span>
          </div>
        </div>
        <div className="pt-5 md:pt-6 border-t border-slate-800 flex justify-between items-center">
          <div className="text-left">
            <p className="text-slate-500 text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] mb-1">Starts From</p>
            <p className="text-white font-black text-lg md:text-xl italic tracking-tighter">
              {starting_price > 0 ? formatIDR(starting_price) : "TBA"}
            </p>
          </div>
          <button 
            onClick={() => navigate(`/event/${id}`)}
            className="bg-white text-black text-[9px] md:text-[10px] font-black px-5 py-3 md:px-7 md:py-3.5 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 uppercase tracking-widest shadow-xl active:scale-95"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;