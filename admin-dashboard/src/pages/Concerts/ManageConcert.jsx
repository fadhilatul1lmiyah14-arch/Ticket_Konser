import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; 
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Loader2, 
  Music, 
  TrendingUp,
  X,
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  ArrowUpRight,
  Crown
} from 'lucide-react';

const ManageConcert = () => {
  const navigate = useNavigate();
  const mainContainerRef = useRef(null);
  
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      const eventData = res.data?.data || res.data || [];
      setConcerts(Array.isArray(eventData) ? eventData : []);
    } catch (error) {
      console.error("Gagal mengambil data event:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // AUTO SCROLL TO TOP SAAT PAGINATION BERUBAH - PERBAIKAN
  useEffect(() => {
    // Scroll ke container utama atau window
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    if(window.confirm("Peringatan Kritis: Hapus konser ini? Seluruh data gambar dan cast terkait akan hilang permanen dari database.")) {
      try {
        await api.delete(`/admin/events/${id}`);
        setConcerts(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error("Delete error:", error);
        alert("Gagal menghapus event. Pastikan tidak ada pesanan aktif terkait event ini.");
      }
    }
  };

  // HELPER UNTUK PARSING JUDUL MULTI-BAHASA
  const renderTitle = (titleRaw) => {
    if (!titleRaw) return "Untitled Event";
    try {
      if (typeof titleRaw === 'object') {
        return titleRaw.id || titleRaw.en || "Untitled Event";
      }
      const parsed = JSON.parse(titleRaw);
      return parsed.id || parsed.en || "Untitled Event";
    } catch (e) {
      return titleRaw || "Untitled Event";
    }
  };

  const filteredAndSortedConcerts = useMemo(() => {
    if (!Array.isArray(concerts)) return [];
    
    return [...concerts]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .filter(c => {
        const search = searchQuery.toLowerCase();
        const title = renderTitle(c?.title).toLowerCase();
        const locationName = (c?.location_name || c?.location?.location_name || c?.location || "").toLowerCase();
        const categoryName = (c?.category_name || c?.category?.category_name || c?.category || "").toLowerCase();
        return title.includes(search) || locationName.includes(search) || categoryName.includes(search);
      });
  }, [concerts, searchQuery]);

  const totalPages = Math.ceil(filteredAndSortedConcerts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedConcerts.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change dengan scroll ke atas - PERBAIKAN
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll ke container utama
    setTimeout(() => {
      if (mainContainerRef.current) {
        mainContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <div className="relative">
          <Loader2 className="animate-spin text-purple-500" size={48} />
          <Music className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" size={16} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic animate-pulse">Syncing Database...</p>
      </div>
    </div>
  );

  return (
    <div ref={mainContainerRef} className="animate-fade-in-up px-4 py-6 md:p-0 max-w-7xl mx-auto pb-20">
      
      {/* Premium Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-100/15 via-pink-100/10 to-transparent rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-indigo-100/15 via-purple-100/10 to-transparent rounded-full blur-[100px] animate-pulse-slow-delay"></div>
        <div className="absolute top-[15%] left-[5%] animate-float-slow">
          <Star size={16} className="text-purple-200/30" fill="currentColor" />
        </div>
        <div className="absolute bottom-[20%] right-[8%] animate-float-delay">
          <Star size={12} className="text-pink-200/30" fill="currentColor" />
        </div>
      </div>

      {/* HEADER SECTION */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-100 mb-3">
            <Sparkles size={12} className="text-purple-500 animate-pulse" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
            <h2 className="text-[8px] md:text-[9px] font-black text-purple-600 uppercase tracking-[0.3em]">Internal Control</h2>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none">
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient-x">Events</span>
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-3 rounded-full animate-slide-in"></div>
        </div>
        
        <button 
          onClick={() => navigate('/admin/add-concert')}
          className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 active:scale-95 group relative overflow-hidden"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          <Plus size={16} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" /> 
          <span className="relative z-10">New Event</span>
        </button>
      </header>

      {/* SEARCH BAR */}
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative flex-1 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-600 transition-colors" size={18} />
              <input 
                  type="text" 
                  placeholder="Search title, city, or category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-purple-100 focus:border-purple-400 rounded-2xl py-4 px-14 outline-none font-bold transition-all shadow-sm text-slate-700 text-sm placeholder:text-slate-300 focus:shadow-md"
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-400 hover:scale-110 transition-transform">
                      <X size={18}/>
                  </button>
              )}
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 rounded-2xl border border-purple-100 shadow-sm flex items-center justify-center gap-3 min-w-fit">
              <TrendingUp className="text-purple-500 animate-bounce" size={18}/>
              <span className="text-[9px] md:text-[10px] font-black text-slate-800 uppercase italic tracking-widest">{filteredAndSortedConcerts.length} Records Found</span>
          </div>
      </div>

      {/* CONCERT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 text-left">
          {currentItems.map((concert, idx) => {
              const totalQuota = Array.isArray(concert.ticket_types) 
                ? concert.ticket_types.reduce((acc, curr) => acc + (Number(curr.remaining_quota) || 0), 0)
                : 0;

              const prices = Array.isArray(concert.ticket_types) 
                ? concert.ticket_types.map(t => Number(t.price) || 0)
                : [];
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

              return (
                <div key={concert.id} className="group bg-white rounded-[24px] border border-purple-100 shadow-sm hover:shadow-xl hover:shadow-purple-200/30 transition-all duration-500 overflow-hidden flex flex-col h-full relative animate-scale-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    
                    {/* Image/Thumbnail */}
                    <div className="relative h-36 md:h-40 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                        <img 
                            src={concert.images && concert.images.length > 0 ? concert.images[0] : (concert.image_url || 'https://via.placeholder.com/600x400?text=No+Image')} 
                            alt={renderTitle(concert.title)}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-60"></div>
                        
                        {/* Status & Category Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg backdrop-blur-md ${
                                (concert.status === 'PUBLISHED' || concert.status === 'PUBLISH') 
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                            }`}>
                                <div className={`w-1 h-1 rounded-full bg-white ${(concert.status === 'PUBLISHED' || concert.status === 'PUBLISH') ? 'animate-pulse' : ''}`}></div>
                                {concert.status || 'DRAFT'}
                            </span>
                            <span className="px-2 py-1 bg-white/90 backdrop-blur-md text-slate-900 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                <Tag size={8} className="text-purple-500"/>
                                {concert.category_name || concert.category?.category_name || 'Standard'}
                            </span>
                        </div>
                        
                        {/* Crown Icon for Featured */}
                        <div className="absolute top-3 right-3">
                          <Crown size={16} className="text-amber-400 drop-shadow-lg animate-bounce-slow" />
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 md:p-5 flex flex-col flex-1 relative">
                        {/* BADGE TOTAL QUOTA */}
                        <div className="absolute -top-7 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 md:p-2.5 rounded-2xl shadow-xl border-2 border-white text-center min-w-[50px] md:min-w-[60px] z-10">
                            <span className="block text-xs md:text-sm font-black leading-none">
                              {totalQuota}
                            </span>
                            <span className="text-[5px] md:text-[6px] font-bold uppercase text-white/60 tracking-tighter">Total Quota</span>
                        </div>

                        <h3 className="text-sm md:text-base font-black text-slate-800 uppercase italic leading-tight tracking-tighter truncate mb-3 mt-1 group-hover:text-purple-600 transition-colors">
                            {renderTitle(concert.title)}
                        </h3>

                        <div className="space-y-2 md:space-y-3 flex-1">
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[8px] md:text-[9px] uppercase tracking-wider">
                                <div className="bg-purple-50 p-1.5 rounded-lg text-purple-500 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white transition-all duration-300 shrink-0">
                                  <Calendar size={12}/>
                                </div>
                                <span className="truncate">
                                  {concert.event_date ? new Date(concert.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[8px] md:text-[9px] uppercase tracking-wider">
                                <div className="bg-purple-50 p-1.5 rounded-lg text-purple-500 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white transition-all duration-300 shrink-0">
                                  <MapPin size={12}/>
                                </div>
                                <span className="truncate">
                                  {concert.location_name || concert.location?.location_name || "TBA"}
                                </span>
                            </div>

                            <div className="pt-3 border-t border-purple-100 mt-3 flex items-end justify-between">
                                <div className="flex flex-col text-left">
                                    <span className="text-[6px] md:text-[7px] font-black text-slate-300 uppercase tracking-[0.1em] mb-0.5">Starts From</span>
                                    <span className="text-sm md:text-base font-black text-slate-800 italic tracking-tighter">
                                        Rp {minPrice.toLocaleString('id-ID')}
                                    </span>
                                </div>
                                <ArrowUpRight size={16} className="text-purple-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button 
                                onClick={() => navigate(`/admin/edit-concert/${concert.id}`)}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-purple-50 rounded-xl text-purple-600 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all font-black text-[7px] md:text-[8px] uppercase tracking-[0.1em] shadow-sm active:scale-95 group/btn"
                            >
                                <Edit size={12} className="group-hover/btn:rotate-12 transition-transform"/> Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(concert.id)}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-[7px] md:text-[8px] uppercase tracking-[0.1em] shadow-sm active:scale-95"
                            >
                                <Trash2 size={12}/> Purge
                            </button>
                        </div>
                    </div>
                </div>
              );
          })}
      </div>

      {/* PAGINATION CONTROLS - Premium */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 bg-white border border-purple-100 rounded-xl text-purple-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 disabled:opacity-30 transition-all duration-300 shadow-sm active:scale-90"
            >
              <ChevronLeft size={18}/>
            </button>
            
            <div className="flex gap-1.5 px-2 overflow-x-auto max-w-[200px] md:max-w-full no-scrollbar">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl font-black text-[9px] transition-all duration-300 active:scale-90 shadow-sm ${
                    currentPage === i + 1 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105' 
                    : 'bg-white text-slate-500 border border-purple-100 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 bg-white border border-purple-100 rounded-xl text-purple-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 disabled:opacity-30 transition-all duration-300 shadow-sm active:scale-90"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
          
          {/* Page Info */}
          <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <span>Page {currentPage} of {totalPages}</span>
            <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
            <span>{filteredAndSortedConcerts.length} total events</span>
          </div>
        </div>
      )}

      {/* NO RESULTS VIEW */}
      {filteredAndSortedConcerts.length === 0 && (
          <div className="py-24 flex flex-col items-center px-6 text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-[25px] flex items-center justify-center mb-6 shadow-inner">
                  <AlertCircle size={32} className="text-purple-300"/>
              </div>
              <h3 className="text-[9px] font-black text-slate-400 uppercase italic tracking-[0.3em] mb-2">Null Result</h3>
              <button onClick={() => setSearchQuery('')} className="text-[9px] font-black text-purple-500 uppercase tracking-widest border-b border-purple-500 hover:text-purple-600 transition-colors">
                Reset Filters
              </button>
          </div>
      )}

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slide-in {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 5rem;
            opacity: 1;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes pulse-slow-delay {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes float-delay {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }
        
        .animate-scale-in-up {
          animation: scale-in-up 0.4s ease-out forwards;
          opacity: 0;
        }
        
        .animate-slide-in {
          animation: slide-in 0.8s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow-delay {
          animation: pulse-slow-delay 5s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float-delay 5s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ManageConcert;