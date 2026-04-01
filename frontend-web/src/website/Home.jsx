import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, ChevronRight, Loader2, Ticket } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mengambil data dari endpoint customer
        const eventRes = await api.get('/customer/events'); 
        const eventData = eventRes.data?.data || [];
        setEvents(eventData);
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
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/60 to-[#0f172a] z-10"></div>
        <div className="absolute inset-0 bg-purple-900/20 z-[5]"></div>
        <img 
          src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse duration-[10000ms]"
          alt="Concert Background"
        />
        
        <div className="relative z-20 text-center px-6 max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8 animate-bounce">
            <Ticket size={16} className="text-purple-400 rotate-12" />
            <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">
              The Best Music Experience 2026
            </span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85] mb-8 text-white text-center">
            EXPLORE THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400">
              VIBE HERE
            </span>
          </h1>
          
          <p className="text-slate-300 font-medium text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-center">
            Dapatkan akses eksklusif ke tiket konser artis favoritmu dengan sistem booking tercepat dan terpercaya di Indonesia.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6">
            <button 
              onClick={() => navigate('/events')}
              className="group bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all duration-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] flex items-center gap-3"
            >
              Get Tickets Now
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. EVENT TERBARU SECTION */}
      <section className="px-6 md:px-12 py-24 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div className="text-left">
              <span className="text-purple-500 font-black text-xs uppercase tracking-[0.4em] mb-3 block">Upcoming Gigs</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-white leading-none">
                Event Terbaru
              </h2>
              <div className="h-2 w-32 bg-gradient-to-r from-purple-600 to-pink-500 mt-4 rounded-full"></div>
            </div>
            <Link 
              to="/events" 
              className="group text-slate-400 font-bold text-sm flex items-center gap-2 hover:text-purple-400 transition-all uppercase tracking-[0.2em]"
            >
              Lihat Semua Event 
              <div className="bg-slate-800 p-2 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-all">
                <ChevronRight size={18} />
              </div>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-900/50 rounded-[40px] border border-slate-800">
              <Loader2 className="animate-spin text-purple-500 mb-6" size={56} />
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Events...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard 
                    key={event.id}
                    id={event.id} 
                    title={event.title} 
                    categoryName={event.category?.category_name || event.category_name || "CONCERT"} 
                    price={event.current_price || event.price} 
                    loc={
                      event.location?.location_name || 
                      event.locations?.location_name || 
                      event.location_name || 
                      "Venue TBA"
                    } 
                    date={event.event_date} 
                    img={event.images?.[0] || event.image} 
                    remaining_quota={event.remaining_quota}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-24 bg-slate-900/30 rounded-[40px] border border-dashed border-slate-800">
                  <p className="text-slate-500 font-bold uppercase tracking-[0.3em]">Belum ada jadwal konser tersedia.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

// COMPONENT: EVENT CARD (Design Matching Admin Dashboard)
const EventCard = ({ id, title, price, loc, date, img, categoryName, remaining_quota }) => {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(price || 0);

  const formattedDate = date 
    ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : "TBA / Coming Soon";

  return (
    <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-[35px] overflow-hidden border border-slate-800 group hover:border-purple-500/50 hover:-translate-y-3 transition-all duration-500 shadow-2xl flex flex-col h-full text-left">
      {/* Image Wrapper */}
      <div className="h-64 relative overflow-hidden p-3">
        <img 
          src={img || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600"} 
          className="w-full h-full object-cover rounded-[25px] group-hover:scale-110 transition-transform duration-1000" 
          alt={title} 
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600" }}
        />
        {/* Category Badge */}
        <div className="absolute top-6 left-6 bg-purple-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg border border-purple-400/30">
          {categoryName}
        </div>
        {/* Quota Badge */}
        {remaining_quota !== undefined && (
           <div className="absolute top-6 right-6 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-tighter text-white border border-white/10">
              {remaining_quota} Slots Left
           </div>
        )}
      </div>
      
      {/* Content */}
      <div className="px-7 pb-7 pt-2 flex flex-col flex-1">
        <h3 className="font-black text-2xl text-white leading-tight uppercase italic mb-5 group-hover:text-purple-400 transition-colors line-clamp-2 min-h-[3.5rem]">
          {title}
        </h3>
        
        <div className="space-y-4 mb-8 flex-1">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <Calendar size={14} className="text-purple-500 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <MapPin size={14} className="text-purple-500 shrink-0" />
            <span className="truncate">{loc}</span>
          </div>
        </div>
        
        {/* Card Footer */}
        <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
          <div className="text-left">
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mb-1">Price</p>
            <p className="text-white font-black text-xl italic tracking-tighter">
              {formattedPrice}
            </p>
          </div>
          <Link 
            to={`/concertdetail/${id}`} 
            className="bg-white text-black text-[10px] font-black px-7 py-3.5 rounded-xl hover:bg-purple-600 hover:text-white transition-all duration-300 uppercase tracking-widest shadow-xl active:scale-95"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;