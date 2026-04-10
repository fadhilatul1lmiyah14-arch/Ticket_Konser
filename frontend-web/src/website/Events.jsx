import React, { useState, useEffect } from 'react';
import { MapPin, Ticket, Filter, Loader2, ArrowUpDown, ChevronDown, Calendar, Music, Clock, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';
import PremiumBackground from '../components/PremiumBackground'; // Import background baru

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');
  const location = useLocation();

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const getTranslation = (data) => {
    const lang = currentLang;
    if (!data) return "";
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return parsed[lang] || parsed['id'] || data;
      } catch (e) { return data; }
    }
    return data[lang] || data['id'] || "";
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
    const handleLangChange = () => setCurrentLang(localStorage.getItem('lang') || 'id');
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
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.search]);

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

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentItems = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (num) => {
    setCurrentPage(num);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <MainLayout>
      <PremiumBackground> {/* Membungkus seluruh halaman dengan background terpisah */}
        
        {/* HERO SECTION */}
        <section className="px-6 md:px-10 pt-32 pb-16 max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6 animate-[fadeInDown_0.8s_ease-out]">
              <Sparkles size={14} className="text-purple-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">World Tour 2026 Experience</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white uppercase leading-[0.9] tracking-tighter animate-[fadeInUp_1s_ease-out]">
              {t.hero_1} <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                {t.hero_2}
              </span>
            </h2>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-5 shadow-2xl flex flex-col lg:flex-row items-center gap-4 group animate-[scaleIn_0.8s_ease-out_0.2s_both]">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-5 rounded-3xl hidden lg:flex items-center justify-center shadow-lg shadow-purple-500/20 transform transition-transform group-hover:rotate-12">
              <Filter size={24} />
            </div>
            
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              <FilterSelect icon={<MapPin size={18}/>} label={t.loc_label} options={locations} optionKey="location_name" value={selectedLocation} onChange={setSelectedLocation} allText={t.all} />
              <FilterSelect icon={<Ticket size={18}/>} label={t.cat_label} options={categories} optionKey="category_name" value={selectedCategory} onChange={setSelectedCategory} allText={t.all} />
              
              <div className="bg-slate-900/40 p-3.5 rounded-3xl border border-white/5 flex items-center justify-between relative hover:border-purple-500/40 transition-all duration-300 group/select hover:bg-slate-900/60">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-white/5 rounded-xl group-hover/select:bg-purple-500/20 transition-colors text-purple-400">
                    <ArrowUpDown size={18} className="group-hover/select:scale-110 transition-transform"/>
                  </div>
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
                <ChevronDown size={14} className="text-slate-500 absolute right-6 pointer-events-none group-hover/select:translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* EXPLORE EVENTS LIST */}
        <section className="px-6 md:px-10 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_both]">
            <div className="flex items-center gap-4 group">
               <div className="w-2 h-8 bg-purple-600 rounded-full group-hover:h-10 transition-all duration-300"></div>
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Explore Events</h2>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full flex items-center gap-3 self-start">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
               <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                 {filteredEvents.length} {t.found}
               </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[3rem] border border-white/10 border-dashed animate-pulse">
              <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
              <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">{t.filtering}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {currentItems.length > 0 ? (
                  currentItems.map((event, index) => (
                    <div 
                      key={event.id} 
                      className="w-full flex justify-center opacity-0 animate-[revealUp_0.6s_ease-out_both]" 
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <EventCard event={event} getTranslation={getTranslation} lang={currentLang} navigate={navigate} />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-32 text-slate-500 uppercase font-black tracking-[0.5em] text-sm text-center border border-white/5 rounded-[3rem] w-full">
                    {t.no_match}
                  </div>
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-3 animate-[fadeInUp_1s_ease-out]">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-purple-600 hover:border-transparent transition-all shadow-xl group active:scale-90">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
                  </button>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-[1.25rem]">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all duration-300 transform active:scale-90 ${currentPage === i + 1 ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-110' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-purple-600 hover:border-transparent transition-all shadow-xl group active:scale-90">
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
        <div className="pb-32"></div>

        <style>{`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
          @keyframes revealUp { from { opacity: 0; transform: translateY(50px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
      </PremiumBackground>
    </MainLayout>
  );
};

/* --- SUBCOMPONENTS (TETAP SAMA AGAR FUNGSI TERJAGA) --- */
const FilterSelect = ({ icon, label, options, optionKey, value, onChange, allText }) => (
  <div className="bg-slate-900/40 p-3.5 rounded-3xl border border-white/5 flex items-center justify-between relative group/item hover:border-purple-500/40 transition-all duration-300 hover:bg-slate-900/60">
    <div className="flex items-center gap-3 w-full">
      <div className="p-2 bg-white/5 rounded-xl group-hover/item:bg-purple-500/20 transition-all duration-300 text-purple-400">
        {icon}
      </div>
      <div className="text-left w-full">
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <select className="bg-transparent outline-none font-bold text-xs text-white w-full cursor-pointer appearance-none" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="" className="bg-[#0f172a]">{allText}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt[optionKey]} className="bg-[#0f172a]">{opt[optionKey]}</option>
          ))}
        </select>
      </div>
    </div>
    <ChevronDown size={14} className="text-slate-500 absolute right-6 pointer-events-none group-hover/item:translate-y-0.5 transition-transform" />
  </div>
);

const EventCard = ({ event, getTranslation, lang, navigate }) => {
  const { id, title, location, category, event_date, start_time, images, starting_price, remaining_quota } = event;
  const formatIDR = (amount) => amount ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount).replace('Rp', 'RP.') : "IDR 0";
  const dateObj = event_date ? new Date(event_date) : null;
  const day = dateObj ? dateObj.getDate() : "??";
  const month = dateObj ? dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' }) : "TBA";
  const year = dateObj ? dateObj.getFullYear() : "2026";
  const quota = Number(remaining_quota) || 0;

  return (
    <div onClick={() => navigate(`/event/${id}`)} className="relative w-full max-w-[320px] h-[440px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(168,85,247,0.3)] bg-[#0f172a] border border-white/5">
      <img src={images?.[0] || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600"} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 brightness-[0.5] group-hover:brightness-[0.7]" alt="event" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent opacity-95 transition-opacity duration-500 group-hover:opacity-80"></div>
      <div className="absolute inset-0 rounded-[2.5rem] border-2 border-transparent group-hover:border-purple-500/40 transition-all duration-700 pointer-events-none z-30 shadow-[inset_0_0_20px_rgba(168,85,247,0)] group-hover:shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]"></div>
      <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-white text-[10px] font-black">{formatIDR(starting_price)}</div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white backdrop-blur-md border ${quota > 0 ? 'bg-purple-600/60 border-purple-400/30' : 'bg-red-600/60 border-red-400/30'}`}>{quota > 0 ? `${quota} LEFT` : 'SOLD OUT'}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <span className="text-purple-400 text-[9px] font-black uppercase tracking-[0.25em]">{category?.category_name || category || "CONCERT"}</span>
          </div>
          <h3 className="text-xl font-black text-white leading-[1.2] uppercase line-clamp-2">{getTranslation(title)}</h3>
          <div className="flex items-center gap-2 text-slate-300 bg-white/5 backdrop-blur-lg border border-white/10 w-fit px-3 py-1.5 rounded-full mt-1">
            <MapPin size={10} className="text-purple-500" />
            <span className="text-[9px] font-bold uppercase truncate max-w-[150px]">{location?.location_name || location || "Location TBA"}</span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center justify-center bg-white text-black w-[45px] h-[45px] rounded-2xl">
                  <span className="text-base font-black">{day}</span>
                  <span className="text-[8px] font-black uppercase">{month}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-white/60 text-[10px] font-black">{year}</span>
                  <div className="flex items-center gap-1.5 text-slate-300"><Clock size={10} className="text-purple-500" /><span className="text-[9px] font-bold">{start_time?.slice(0, 5) || "19:00"}</span></div>
              </div>
            </div>
            <div className="bg-white/5 p-2 rounded-full border border-white/10 group-hover:bg-purple-600 transition-all"><ChevronRight size={16} className="text-white" /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;