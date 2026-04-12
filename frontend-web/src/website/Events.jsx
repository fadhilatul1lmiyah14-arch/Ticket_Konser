import React, { useState, useEffect } from 'react';
import { MapPin, Ticket, Filter, Loader2, ArrowUpDown, ChevronDown, Calendar, Music, Clock, ChevronRight, ChevronLeft, Sparkles, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';
import PremiumBackground from '../components/PremiumBackground'; 

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  const [searchKeyword, setSearchKeyword] = useState('');
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
      hero_2: "KONSERMU SEKARANG",
      search_placeholder: "Ketik nama artis atau konser idamanmu...",
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
      hero_2: "CONCERT NOW",
      search_placeholder: "Type your favorite artist or concert...",
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
        if(searchQuery) setSearchKeyword(searchQuery);

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
      const eventTitle = getTranslation(event.title).toLowerCase();
      const eventLocName = event.location?.location_name || event.location || "";
      const eventCatName = event.category?.category_name || event.category || "";
      
      return (
        eventTitle.includes(searchKeyword.toLowerCase()) &&
        (!selectedLocation || eventLocName === selectedLocation) && 
        (!selectedCategory || eventCatName === selectedCategory)
      );
    });

    return result.sort((a, b) => {
      if (sortBy === 'terbaru') return b.id - a.id; 
      if (sortBy === 'terlama') return a.id - b.id;
      if (sortBy === 'termahal') return (Number(b.starting_price) || 0) - (Number(a.starting_price) || 0);
      if (sortBy === 'termurah') return (Number(a.starting_price) || 0) - (Number(b.starting_price) || 0);
      return 0;
    });
  })();

  const handlePageChange = (num) => {
    setCurrentPage(num);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentItems = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Light mode specific styles
  const heroTextClass = !isDarkMode ? "text-slate-800" : "text-white";
  const badgeClass = !isDarkMode ? "bg-white/60 border-slate-200 text-slate-600" : "bg-white/5 border-white/10 text-white/70";
  const searchBarClass = !isDarkMode 
    ? "bg-white/80 backdrop-blur-3xl border-slate-200 shadow-xl" 
    : "bg-slate-900/60 backdrop-blur-3xl border-white/10";
  const searchInputClass = !isDarkMode ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-500";
  const filterBarClass = !isDarkMode 
    ? "bg-white/60 backdrop-blur-2xl border-slate-200 shadow-xl" 
    : "bg-white/5 backdrop-blur-2xl border-white/10";
  const filterSelectClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 hover:border-purple-300" 
    : "bg-slate-900/40 border-white/5 hover:border-purple-500/40";
  const selectTextClass = !isDarkMode ? "text-slate-800" : "text-white";
  const selectOptionClass = !isDarkMode ? "bg-white text-slate-800" : "bg-[#0f172a] text-white";
  const resultCountClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 text-slate-600" 
    : "bg-white/5 border-white/10 text-white/70";
  const loadingClass = !isDarkMode 
    ? "bg-white/40 border-slate-200" 
    : "bg-white/5 border-white/10";
  const paginationButtonClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 hover:bg-purple-500 hover:text-white hover:border-transparent" 
    : "bg-white/5 border-white/10 hover:bg-purple-600 hover:border-transparent";
  const paginationActiveClass = !isDarkMode 
    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md" 
    : "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]";
  const paginationInactiveClass = !isDarkMode 
    ? "text-slate-600 hover:text-purple-600 hover:bg-purple-50" 
    : "text-slate-400 hover:text-white hover:bg-white/5";

  return (
    <MainLayout>
      <PremiumBackground isLightMode={!isDarkMode}>
        
        {/* HERO SECTION - Light Mode Support */}
        <section className="px-6 md:px-10 pt-32 pb-10 max-w-7xl mx-auto">
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full mb-6 animate-[fadeInDown_0.8s_ease-out] ${badgeClass}`}>
              <Sparkles size={14} className="text-purple-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">World Tour 2026 Experience</span>
            </div>
            <h2 className={`text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter animate-[fadeInUp_1s_ease-out] ${heroTextClass}`}>
              {t.hero_1} <br />
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                {t.hero_2}
              </span>
            </h2>

            {/* SEARCH BAR */}
            <div className="mt-12 max-w-2xl mx-auto opacity-0 animate-[fadeInUp_1s_ease-out_0.3s_both]">
               <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <div className={`relative rounded-[2rem] p-2 flex items-center gap-4 hover:border-purple-400/60 transition-all duration-300 shadow-2xl border ${searchBarClass}`}>
                     <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl text-white shadow-lg shadow-purple-500/20">
                        <Search size={24} />
                     </div>
                     <input 
                        type="text"
                        placeholder={t.search_placeholder}
                        className={`bg-transparent border-none outline-none font-bold text-sm md:text-base w-full pr-6 ${searchInputClass}`}
                        value={searchKeyword}
                        onChange={(e) => {
                           setSearchKeyword(e.target.value);
                           setCurrentPage(1);
                        }}
                     />
                  </div>
               </div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className={`mt-10 rounded-[2.5rem] border p-5 shadow-2xl flex flex-col lg:flex-row items-center gap-4 group animate-[scaleIn_0.8s_ease-out_0.5s_both] ${filterBarClass}`}>
            <div className={`p-5 rounded-3xl hidden lg:flex items-center justify-center border transition-transform group-hover:rotate-12 ${!isDarkMode ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-white/5 text-purple-400 border-white/10'}`}>
              <Filter size={24} />
            </div>
            
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
              <FilterSelect 
                icon={<MapPin size={18}/>} 
                label={t.loc_label} 
                options={locations} 
                optionKey="location_name" 
                value={selectedLocation} 
                onChange={(val) => {setSelectedLocation(val); setCurrentPage(1);}} 
                allText={t.all} 
                isDarkMode={isDarkMode}
              />
              <FilterSelect 
                icon={<Ticket size={18}/>} 
                label={t.cat_label} 
                options={categories} 
                optionKey="category_name" 
                value={selectedCategory} 
                onChange={(val) => {setSelectedCategory(val); setCurrentPage(1);}} 
                allText={t.all} 
                isDarkMode={isDarkMode}
              />
              
              <div className={`p-3.5 rounded-3xl border flex items-center justify-between relative group/select transition-all duration-300 ${filterSelectClass}`}>
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-xl transition-colors group-hover/select:bg-purple-500/20 ${!isDarkMode ? 'bg-purple-100 text-purple-600' : 'bg-white/5 text-purple-400'}`}>
                    <ArrowUpDown size={18} className="group-hover/select:scale-110 transition-transform"/>
                  </div>
                  <div className="text-left w-full">
                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${!isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{t.sort_label}</p>
                    <select className={`bg-transparent outline-none font-bold text-xs w-full cursor-pointer appearance-none ${selectTextClass}`} value={sortBy} onChange={(e) => {setSortBy(e.target.value); setCurrentPage(1);}}>
                      <option value="terbaru" className={selectOptionClass}>{t.sort_options[0]}</option>
                      <option value="terlama" className={selectOptionClass}>{t.sort_options[1]}</option>
                      <option value="termahal" className={selectOptionClass}>{t.sort_options[2]}</option>
                      <option value="termurah" className={selectOptionClass}>{t.sort_options[3]}</option>
                    </select>
                  </div>
                </div>
                <ChevronDown size={14} className={`absolute right-6 pointer-events-none group-hover/select:translate-y-0.5 transition-transform ${!isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
            </div>
          </div>
        </section>

        {/* LIST SECTION */}
        <section className="px-6 md:px-10 py-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 opacity-0 animate-[fadeIn_1s_ease-out_0.7s_both]">
            <div className="flex items-center gap-4 group">
               <div className="w-2 h-8 bg-purple-600 rounded-full group-hover:h-10 transition-all duration-300"></div>
               <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter ${heroTextClass}`}>Explore Events</h2>
            </div>
            <div className={`border px-5 py-2 rounded-full flex items-center gap-3 self-start ${resultCountClass}`}>
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
               <span className="text-[10px] font-black uppercase tracking-widest">
                 {filteredEvents.length} {t.found}
               </span>
            </div>
          </div>

          {loading ? (
            <div className={`flex flex-col items-center justify-center py-40 rounded-[3rem] border border-dashed animate-pulse ${loadingClass}`}>
              <Loader2 className="animate-spin text-purple-500 mb-4" size={48} />
              <p className={`font-black uppercase tracking-[0.4em] text-[10px] ${!isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{t.filtering}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {currentItems.length > 0 ? (
                  currentItems.map((event, index) => (
                    <div key={event.id} className="w-full flex justify-center opacity-0 animate-[revealUp_0.6s_ease-out_both]" style={{ animationDelay: `${index * 0.1}s` }}>
                      <EventCard event={event} getTranslation={getTranslation} lang={currentLang} navigate={navigate} isDarkMode={isDarkMode} />
                    </div>
                  ))
                ) : (
                  <div className={`col-span-full py-32 uppercase font-black tracking-[0.5em] text-sm text-center border border-dashed rounded-[3rem] w-full ${!isDarkMode ? 'text-slate-400 border-slate-200' : 'text-slate-500 border-white/5'}`}>
                    {t.no_match}
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="mt-20 flex justify-center items-center gap-3 animate-[fadeInUp_1s_ease-out]">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1} 
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border disabled:opacity-20 transition-all shadow-xl group active:scale-90 ${paginationButtonClass}`}
                  >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
                  </button>
                  <div className={`flex items-center gap-2 border p-1.5 rounded-[1.25rem] ${!isDarkMode ? 'bg-white/60 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                    {[...Array(totalPages)].map((_, i) => (
                      <button 
                        key={i} 
                        onClick={() => handlePageChange(i + 1)} 
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all duration-300 transform active:scale-90 ${currentPage === i + 1 ? paginationActiveClass : paginationInactiveClass}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages} 
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border disabled:opacity-20 transition-all shadow-xl group active:scale-90 ${paginationButtonClass}`}
                  >
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
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </PremiumBackground>
    </MainLayout>
  );
};

const FilterSelect = ({ icon, label, options, optionKey, value, onChange, allText, isDarkMode }) => {
  const selectBgClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 hover:border-purple-300" 
    : "bg-slate-900/40 border-white/5 hover:border-purple-500/40";
  const iconBgClass = !isDarkMode 
    ? "bg-purple-100 text-purple-600" 
    : "bg-white/5 text-purple-400";
  const textClass = !isDarkMode ? "text-slate-800" : "text-white";
  const labelClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const optionClass = !isDarkMode ? "bg-white text-slate-800" : "bg-[#0f172a] text-white";

  return (
    <div className={`p-3.5 rounded-3xl border flex items-center justify-between relative group/item transition-all duration-300 ${selectBgClass}`}>
      <div className="flex items-center gap-3 w-full">
        <div className={`p-2 rounded-xl transition-all duration-300 group-hover/item:bg-purple-500/20 ${iconBgClass}`}>
          {icon}
        </div>
        <div className="text-left w-full">
          <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${labelClass}`}>{label}</p>
          <select className={`bg-transparent outline-none font-bold text-xs w-full cursor-pointer appearance-none ${textClass}`} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="" className={optionClass}>{allText}</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt[optionKey]} className={optionClass}>{opt[optionKey]}</option>
            ))}
          </select>
        </div>
      </div>
      <ChevronDown size={14} className={`absolute right-6 pointer-events-none group-hover/item:translate-y-0.5 transition-transform ${!isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
    </div>
  );
};

const EventCard = ({ event, getTranslation, lang, navigate, isDarkMode }) => {
  const { id, title, location, category, event_date, start_time, images, starting_price, remaining_quota } = event;
  const formatIDR = (amount) => amount ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount).replace('Rp', 'RP.') : "IDR 0";
  const dateObj = event_date ? new Date(event_date) : null;
  const day = dateObj ? dateObj.getDate().toString().padStart(2, '0') : "??";
  const month = dateObj ? dateObj.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short' }).toUpperCase() : "TBA";
  const year = dateObj ? dateObj.getFullYear() : "2026";
  const quota = Number(remaining_quota) || 0;
  const formattedTime = start_time ? start_time.slice(0, 5) : "19:00";
  const displayTitle = getTranslation(title);

  // Light mode card styles
  const cardBgClass = !isDarkMode 
    ? "bg-white border-slate-200 shadow-xl" 
    : "bg-[#0f172a] border-white/5";
  
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
      className={`relative w-full max-w-[320px] h-[440px] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(168,85,247,0.25)] border ${cardBgClass}`}
    >
      <img 
        src={images?.[0] || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=600"} 
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 brightness-[0.55] group-hover:brightness-[0.7]" 
        alt={displayTitle} 
      />
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

export default Events;