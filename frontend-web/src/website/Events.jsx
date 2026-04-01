import React, { useState, useEffect } from 'react';
import { MapPin, Ticket, Filter, Loader2, ArrowUpDown, ChevronDown, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Filter & Sort
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mengambil data dari endpoint sesuai backend
        const [eventRes, locRes, catRes] = await Promise.all([
          api.get('/customer/events'),
          api.get('/admin/locations'),
          api.get('/admin/categories')
        ]);

        // SINKRONISASI: Backend kita mengirim { status: "success", data: [...] }
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
  }, []);

  // Logika Filter & Sorting
  const getProcessedEvents = () => {
    let result = [...events];

    // 1. Filter
    result = result.filter(event => {
      // SINKRONISASI: Backend mengirim event.location.location_name
      const eventLocName = event.location?.location_name || "";
      const eventCatName = event.category?.category_name || "";
      
      const matchesLocation = !selectedLocation || eventLocName === selectedLocation;
      const matchesCategory = !selectedCategory || eventCatName === selectedCategory;
      return matchesLocation && matchesCategory;
    });

    // 2. Sorting
    return result.sort((a, b) => {
      if (sortBy === 'terbaru') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === 'terlama') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      if (sortBy === 'termahal') return (b.current_price || 0) - (a.current_price || 0);
      if (sortBy === 'termurah') return (a.current_price || 0) - (b.current_price || 0);
      return 0;
    });
  };

  const filteredEvents = getProcessedEvents();

  return (
    <MainLayout>
      <div className="bg-[#0f172a] min-h-screen font-sans text-white">
        
        {/* 1. HERO SECTION */}
        <section className="px-6 md:px-10 pt-20 pb-12 max-w-7xl mx-auto">
          <div className="mb-12 text-center md:text-left relative">
             <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-600/10 blur-[100px] rounded-full"></div>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-[0.9]">
              FIND YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 text-6xl md:text-8xl">BEAT NOW</span>
            </h2>
          </div>

          {/* FILTER BAR MODERN */}
          <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-[35px] border border-slate-700/50 p-5 shadow-2xl flex flex-col lg:flex-row items-center gap-5">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-purple-500/20 hidden lg:block">
              <Filter size={22} />
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              {/* Filter Lokasi */}
              <FilterSelect 
                icon={<MapPin size={18}/>} 
                label="Lokasi Konser" 
                options={locations} 
                optionKey="location_name" // Sesuai schema
                value={selectedLocation}
                onChange={setSelectedLocation}
              />
              {/* Filter Kategori */}
              <FilterSelect 
                icon={<Ticket size={18}/>} 
                label="Genre / Kategori" 
                options={categories} 
                optionKey="category_name" // Sesuai schema
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
              {/* Fitur Urutkan */}
              <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-purple-500 transition-all relative">
                <div className="flex items-center gap-3 w-full">
                  <div className="text-purple-500"><ArrowUpDown size={18}/></div>
                  <div className="text-left w-full">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Urutkan Berdasarkan</p>
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
        <section className="px-6 md:px-10 py-6 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
               <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Explore Events</h2>
               <span className="bg-slate-800 text-[10px] px-3 py-1 rounded-full font-black text-purple-400 border border-slate-700 uppercase tracking-widest">
                 {filteredEvents.length} Items Found
               </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-900/30 rounded-[40px] border border-slate-800/50 border-dashed">
              <Loader2 className="animate-spin text-purple-500 mb-4" size={50} />
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Filtering Concerts...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard 
                    key={event.id}
                    id={event.id} 
                    title={event.title} 
                    price={event.current_price} 
                    loc={event.location?.location_name || "TBA"} 
                    date={event.event_date} 
                    img={event.images?.[0]} 
                    category={event.category?.category_name}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-32 border-2 border-dashed border-slate-800 rounded-[50px]">
                  <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-sm">No Events Found in this Filter</p>
                </div>
              )}
            </div>
          )}
        </section>
        
        <div className="pb-24"></div>
      </div>
    </MainLayout>
  );
};

// HELPER COMPONENTS
const FilterSelect = ({ icon, label, options, optionKey, value, onChange }) => (
  <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-purple-500 transition-all relative">
    <div className="flex items-center gap-3 w-full">
      <div className="text-purple-500">{icon}</div>
      <div className="text-left w-full">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
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

const EventCard = ({ id, title, price, loc, date, img, category }) => {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(price || 0);

  // Perbaikan format tanggal agar tidak Invalid Date
  const formattedDate = date 
    ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
    : "TBA";

  return (
    <div className="bg-[#1e293b]/40 backdrop-blur-sm rounded-[45px] overflow-hidden border border-slate-800 hover:border-purple-500 hover:-translate-y-3 transition-all duration-500 group shadow-2xl flex flex-col h-full">
      <div className="h-52 relative overflow-hidden m-2.5 rounded-[38px]">
        <img 
          src={img || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=600"} 
          className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 group-hover:rotate-1" 
          alt={title} 
        />
        <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-xl uppercase tracking-widest">
          {category || "Musical"}
        </div>
      </div>
      
      <div className="p-7 flex flex-col flex-grow">
        <h3 className="font-black text-xl text-white leading-tight uppercase italic truncate mb-5 group-hover:text-purple-400 transition-colors">
          {title}
        </h3>
        
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="bg-slate-800 p-1 rounded-md">
                <MapPin size={12} className="text-purple-500" />
            </div>
            <span className="truncate">{loc}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="bg-slate-800 p-1 rounded-md">
                <Calendar size={12} className="text-purple-500" />
            </div>
            {formattedDate}
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-700/50 mt-auto">
          <div>
            <p className="text-purple-400 font-black text-lg italic tracking-tighter">{formattedPrice}</p>
          </div>
          
          <Link 
            to={`/concertdetail/${id}`}
            className="bg-purple-600 text-white text-[10px] font-black px-6 py-3 rounded-2xl hover:bg-white hover:text-black transition-all uppercase tracking-widest shadow-lg shadow-purple-900/20 active:scale-95"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Events;