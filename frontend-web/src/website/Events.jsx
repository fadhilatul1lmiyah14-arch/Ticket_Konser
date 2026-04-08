import React, { useState, useEffect } from 'react';
import { MapPin, Ticket, Filter, Loader2, ArrowUpDown, ChevronDown, Calendar, Music, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');
  const location = useLocation();

  // State Filter
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');

  // State Pagination (9 per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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
      hero_1: "TEMUKAN",
      hero_2: "BEATMU SEKARANG",
      loc_label: "Lokasi Konser",
      cat_label: "Genre / Kategori",
      sort_label: "Urutkan Berdasarkan",
      all: "Tampilkan Semua",
      found: "Item Ditemukan",
      filtering: "Menyaring Konser...",
      no_match: "Tidak Ada Event Ditemukan",
      sort_options: ["Terbaru Diupload", "Terlama Diupload", "Harga Tertinggi", "Harga Terendah"]
    },
    en: {
      hero_1: "FIND YOUR",
      hero_2: "BEAT NOW",
      loc_label: "Concert Location",
      cat_label: "Genre / Category",
      sort_label: "Sort By",
      all: "Show All",
      found: "Items Found",
      filtering: "Filtering Concerts...",
      no_match: "No Events Found",
      sort_options: ["Latest Upload", "Oldest Upload", "Highest Price", "Lowest Price"]
    }
  }[currentLang];

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang(localStorage.getItem('lang') || 'id');
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

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

  // Logika Filter & Sort
  const filteredEvents = (() => {
    let result = [...events].filter(event => {
      const eventLocName = event.location?.location_name || event.location || "";
      const eventCatName = event.category?.category_name || event.category || "";
      return (!selectedLocation || eventLocName === selectedLocation) && 
             (!selectedCategory || eventCatName === selectedCategory);
    });

    return result.sort((a, b) => {
      if (sortBy === 'terbaru') return b.id - a.id; 
      if (sortBy === 'terlama') return a.id - b.id;
      if (sortBy === 'termahal') return (Number(b.starting_price) || 0) - (Number(a.starting_price) || 0);
      if (sortBy === 'termurah') return (Number(a.starting_price) || 0) - (Number(b.starting_price) || 0);
      return 0;
    });
  })();

  // Logika Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentItems = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (num) => {
    setCurrentPage(num);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <div className="bg-[#020617] min-h-screen font-sans text-white">
        
        {/* 1. HERO SECTION */}
        <section className="px-4 md:px-10 pt-20 pb-10 max-w-7xl mx-auto">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-4xl md:text-7xl font-black text-white uppercase italic leading-none">
              {t.hero_1} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{t.hero_2}</span>
            </h2>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[30px] border border-white/10 p-4 shadow-2xl flex flex-col lg:flex-row items-center gap-4">
            <div className="bg-purple-600 text-white p-4 rounded-2xl hidden lg:block">
              <Filter size={20} />
            </div>
            
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              <FilterSelect icon={<MapPin size={18}/>} label={t.loc_label} options={locations} optionKey="location_name" value={selectedLocation} onChange={setSelectedLocation} allText={t.all} />
              <FilterSelect icon={<Ticket size={18}/>} label={t.cat_label} options={categories} optionKey="category_name" value={selectedCategory} onChange={setSelectedCategory} allText={t.all} />
              <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex items-center justify-between relative">
                <div className="flex items-center gap-3 w-full">
                  <ArrowUpDown size={18} className="text-purple-400"/>
                  <div className="text-left w-full">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.sort_label}</p>
                    <select className="bg-transparent outline-none font-bold text-xs text-white w-full cursor-pointer appearance-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="terbaru" className="bg-[#0f172a]">{t.sort_options[0]}</option>
                      <option value="terlama" className="bg-[#0f172a]">{t.sort_options[1]}</option>
                      <option value="termahal" className="bg-[#0f172a]">{t.sort_options[2]}</option>
                      <option value="termurah" className="bg-[#0f172a]">{t.sort_options[3]}</option>
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
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-xl md:text-2xl font-black uppercase italic">Explore Events</h2>
            <span className="bg-slate-800 text-[10px] px-3 py-1 rounded-full font-black text-purple-400 border border-slate-700">
              {filteredEvents.length} {t.found}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/5 rounded-[40px] border border-white/10 border-dashed">
              <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">{t.filtering}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {currentItems.length > 0 ? (
                  currentItems.map((event) => (
                    <EventCard key={event.id} event={event} getTranslation={getTranslation} lang={currentLang} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-slate-500 uppercase font-black tracking-widest">{t.no_match}</div>
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-3 rounded-xl bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-purple-600 transition-all"><ChevronLeft size={18}/></button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-white text-black' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-3 rounded-xl bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-purple-600 transition-all"><ChevronRight size={18}/></button>
                </div>
              )}
            </>
          )}
        </section>
        <div className="pb-20"></div>
      </div>
    </MainLayout>
  );
};

const FilterSelect = ({ icon, label, options, optionKey, value, onChange, allText }) => (
  <div className="bg-slate-900/50 p-3 rounded-2xl border border-white/5 flex items-center justify-between relative group hover:border-purple-500/50 transition-all">
    <div className="flex items-center gap-3 w-full">
      <div className="text-purple-400">{icon}</div>
      <div className="text-left w-full">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <select className="bg-transparent outline-none font-bold text-xs text-white w-full cursor-pointer appearance-none" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="" className="bg-[#0f172a]">{allText}</option>
          {options.map((opt) => (<option key={opt.id} value={opt[optionKey]} className="bg-[#0f172a]">{opt[optionKey]}</option>))}
        </select>
      </div>
    </div>
    <ChevronDown size={14} className="text-slate-500 absolute right-4 pointer-events-none" />
  </div>
);

const EventCard = ({ event, getTranslation, lang }) => {
  const navigate = useNavigate();
  const { id, title, location, category, event_date, start_time, images, starting_price, remaining_quota } = event;

  const formatIDR = (amount) => amount ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount).replace('Rp', 'RP.') : "IDR 0";
  
  const dateObj = event_date ? new Date(event_date) : null;
  const day = dateObj ? dateObj.getDate() : "??";
  const month = dateObj ? dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' }) : "TBA";
  const year = dateObj ? dateObj.getFullYear() : "2026";
  const quota = Number(remaining_quota) || 0;

  return (
    <div onClick={() => navigate(`/event/${id}`)} className="relative w-full max-w-[340px] h-[420px] rounded-[32px] overflow-hidden group cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-2">
      <img src={images?.[0] || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-[0.7]" alt="event" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
      
      <div className="absolute top-5 left-5 right-5 flex justify-between z-20">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black text-white">{formatIDR(starting_price)}</div>
        <div className={`px-3 py-1 rounded-lg text-[9px] font-black text-white backdrop-blur-md border ${quota > 0 ? 'bg-purple-600/60 border-purple-400/30' : 'bg-red-600/60 border-red-400/30'}`}>{quota > 0 ? `${quota} LEFT` : 'SOLD OUT'}</div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
          <span className="text-purple-400 text-[9px] font-black uppercase tracking-widest">{category?.category_name || category || 'EVENT'}</span>
        </div>
        <h3 className="text-xl font-black text-white uppercase italic leading-tight mb-4 line-clamp-2">{getTranslation(title)}</h3>
        
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <div className="bg-white text-black w-10 h-10 rounded-xl flex flex-col items-center justify-center">
              <span className="text-sm font-black leading-none">{day}</span>
              <span className="text-[7px] font-black uppercase">{month}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white text-[10px] font-black uppercase">{year}</span>
              <div className="flex items-center gap-1 text-slate-400 text-[9px] font-bold"><Clock size={10} className="text-purple-400"/>{start_time?.slice(0, 5) || "19:00"}</div>
            </div>
          </div>
          <div className="bg-white/10 p-2 rounded-full border border-white/20 group-hover:bg-white group-hover:text-black transition-all"><ChevronRight size={16} /></div>
        </div>
      </div>
    </div>
  );
};

export default Events;