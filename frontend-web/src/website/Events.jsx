import React, { useState, useEffect } from 'react';
import { MapPin, Ticket, Filter, Loader2, ArrowUpDown, ChevronDown, Calendar, Music } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('search') || '';

        const [eventRes, locRes, catRes] = await Promise.all([
          api.get(`/customer/events?search=${encodeURIComponent(searchQuery)}`),
          api.get('/admin/locations'),
          api.get('/admin/categories')
        ]);

        setEvents(eventRes.data?.data || []);
        setLocations(locRes.data?.data || []);
        setCategories(catRes.data?.data || []);
      } catch (err) {
        console.error("Gagal mengambil data events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

  const getProcessedEvents = () => {
    let result = [...events];
    result = result.filter(event => {
      const eventLocName = event.location?.location_name || event.location || "";
      const eventCatName = event.category?.category_name || event.category || "";
      const matchesLocation = !selectedLocation || eventLocName === selectedLocation;
      const matchesCategory = !selectedCategory || eventCatName === selectedCategory;
      return matchesLocation && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === 'terbaru') return b.id - a.id; 
      if (sortBy === 'terlama') return a.id - b.id;
      if (sortBy === 'termahal') return (Number(b.starting_price) || 0) - (Number(a.starting_price) || 0);
      if (sortBy === 'termurah') return (Number(a.starting_price) || 0) - (Number(b.starting_price) || 0);
      return 0;
    });
  };

  const filteredEvents = getProcessedEvents();

  return (
    <MainLayout>
      <div className="bg-[#0f172a] min-h-screen font-sans text-white">
        
        {/* 1. HERO SECTION */}
        <section className="px-4 md:px-10 pt-16 md:pt-24 pb-8 md:pb-12 max-w-7xl mx-auto">
          <div className="mb-8 md:mb-12 text-center md:text-left relative">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-600/10 blur-[100px] rounded-full hidden md:block"></div>
            <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[1] md:leading-[0.9]">
              FIND YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 text-5xl md:text-8xl">BEAT NOW</span>
            </h2>
          </div>

          {/* FILTER BAR MODERN */}
          <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-[25px] md:rounded-[35px] border border-slate-700/50 p-4 md:p-5 shadow-2xl flex flex-col lg:flex-row items-center gap-4 md:gap-5">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-purple-500/20 hidden lg:block">
              <Filter size={22} />
            </div>
            
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 w-full">
              <FilterSelect 
                icon={<MapPin size={18}/>} 
                label="Lokasi Konser" 
                options={locations} 
                optionKey="location_name" 
                value={selectedLocation}
                onChange={setSelectedLocation}
              />
              <FilterSelect 
                icon={<Ticket size={18}/>} 
                label="Genre / Kategori" 
                options={categories} 
                optionKey="category_name" 
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
              <div className="bg-[#0f172a] p-3 md:p-4 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-purple-500 transition-all relative">
                <div className="flex items-center gap-3 w-full">
                  <div className="text-purple-500"><ArrowUpDown size={18}/></div>
                  <div className="text-left w-full">
                    <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Urutkan Berdasarkan</p>
                    <select 
                      className="bg-transparent border-none outline-none font-bold text-xs text-white w-full cursor-pointer appearance-none"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="terbaru" className="bg-[#1e293b]">Terbaru Diupload</option>
                      <option value="terlama" className="bg-[#1e293b]">Terlama Diupload</option>
                      <option value="termahal" className="bg-[#1e293b]">Harga Tertinggi</option>
                      <option value="termurah" className="bg-[#1e293b]">Harga Terendah</option>
                    </select>
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-500 absolute right-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. EXPLORE EVENTS LIST */}
        <section className="px-4 md:px-10 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12 gap-4">
            <div className="flex items-center gap-3 md:gap-4">
                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic">Explore Events</h2>
                <span className="bg-slate-800 text-[8px] md:text-[10px] px-3 py-1 rounded-full font-black text-purple-400 border border-slate-700 uppercase tracking-widest">
                  {filteredEvents.length} Items Found
                </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 md:py-32 bg-slate-900/30 rounded-[30px] md:rounded-[40px] border border-slate-800/50 border-dashed">
              <Loader2 className="animate-spin text-purple-500 mb-4" size={40} md:size={50} />
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Filtering Concerts...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 md:py-32 border-2 border-dashed border-slate-800 rounded-[30px] md:rounded-[50px] px-6">
                  <Music className="mx-auto text-slate-700 mb-4 opacity-20" size={40} md:size={48} />
                  <p className="text-slate-600 font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm">No Events Found</p>
                </div>
              )}
            </div>
          )}
        </section>
        
        <div className="pb-16 md:pb-24"></div>
      </div>
    </MainLayout>
  );
};

// HELPER COMPONENTS
const FilterSelect = ({ icon, label, options, optionKey, value, onChange }) => (
  <div className="bg-[#0f172a] p-3 md:p-4 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-purple-500 transition-all relative">
    <div className="flex items-center gap-3 w-full">
      <div className="text-purple-500">{icon}</div>
      <div className="text-left w-full">
        <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <select 
          className="bg-transparent border-none outline-none font-bold text-xs text-white w-full cursor-pointer appearance-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" className="bg-[#1e293b]">Tampilkan Semua</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt[optionKey]} className="bg-[#1e293b]">
              {opt[optionKey]}
            </option>
          ))}
        </select>
      </div>
    </div>
    <ChevronDown size={14} className="text-slate-500 absolute right-4 pointer-events-none" />
  </div>
);

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { 
    id, 
    title, 
    location, 
    category, 
    event_date, 
    images, 
    starting_price,
    remaining_quota 
  } = event;

  const formatIDR = (amount) => new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
  }).format(amount || 0);

  const formattedDate = event_date 
    ? new Date(event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : "Venue TBA";

  return (
    <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-[30px] md:rounded-[35px] overflow-hidden border border-slate-800 group hover:border-purple-500/50 hover:-translate-y-2 md:hover:-translate-y-3 transition-all duration-500 shadow-2xl flex flex-col h-full text-left">
      <div className="h-48 md:h-64 relative overflow-hidden p-2 md:p-3">
        <img 
          src={images?.[0] || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600"} 
          className="w-full h-full object-cover rounded-[20px] md:rounded-[25px] group-hover:scale-110 transition-transform duration-1000" 
          alt={title} 
        />
        <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-purple-600 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white shadow-lg border border-purple-400/30">
          {category || "CONCERT"}
        </div>
        <div className={`absolute top-4 right-4 md:top-6 md:right-6 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-[7px] md:text-[8px] font-bold uppercase tracking-tighter text-white border backdrop-blur-md ${
            remaining_quota > 0 ? 'bg-black/50 border-white/10' : 'bg-red-600 border-red-400'
        }`}>
            {remaining_quota > 0 ? `${remaining_quota} Slots Left` : 'Sold Out'}
        </div>
      </div>
      
      <div className="px-5 pb-6 md:px-7 md:pb-7 pt-2 flex flex-col flex-1">
        <h3 className="font-black text-xl md:text-2xl text-white leading-tight uppercase italic mb-4 md:mb-5 group-hover:text-purple-400 transition-colors line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
          {title}
        </h3>
        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-slate-400">
          <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
            <Calendar size={14} className="text-purple-500 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
            <MapPin size={14} className="text-purple-500 shrink-0" />
            <span className="line-clamp-1">{location || "Venue TBA"}</span>
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

export default Events;