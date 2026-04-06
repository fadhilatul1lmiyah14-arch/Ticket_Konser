import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronRight
} from 'lucide-react';

const ManageConcert = () => {
  const navigate = useNavigate();
  
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/events');
      const eventData = res.data?.data || res.data || [];
      setConcerts(eventData);
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

  // AUTO SCROLL TO TOP saat pindah halaman
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Reset ke halaman 1 jika user mencari sesuatu
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

  // 1. Filter & Sort Logic
  const filteredAndSortedConcerts = useMemo(() => {
    return [...concerts]
      .sort((a, b) => b.id - a.id) // Terbaru di atas
      .filter(c => {
        const search = searchQuery.toLowerCase();
        const title = (c?.title || "").toLowerCase();
        const locationName = (c?.location_name || c?.location?.location_name || c?.location || "").toLowerCase();
        const categoryName = (c?.category_name || c?.category?.category_name || c?.category || "").toLowerCase();
        return title.includes(search) || locationName.includes(search) || categoryName.includes(search);
      });
  }, [concerts, searchQuery]);

  // 2. Pagination Calculation
  const totalPages = Math.ceil(filteredAndSortedConcerts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedConcerts.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-[#E297C1]" size={48} />
          <Music className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-200" size={16} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic animate-pulse">Syncing Database...</p>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 px-4 py-6 md:p-0 max-w-7xl mx-auto pb-20">
      {/* HEADER SECTION */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <div className="flex items-center gap-3 mb-2 md:mb-3">
             <span className="p-2 bg-slate-900 rounded-xl text-white shadow-lg shadow-slate-200"><Music size={14}/></span>
             <h2 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.5em]">Internal Control</h2>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              Manage <span className="text-[#E297C1]">Events</span>
          </h1>
        </div>
        
        <button 
          onClick={() => navigate('/admin/add-concert')}
          className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-[#E297C1] transition-all shadow-xl shadow-slate-200 active:scale-95 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" /> New Event
        </button>
      </header>

      {/* SEARCH BAR */}
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                  type="text" 
                  placeholder="Search title, city, or category..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-100 focus:border-[#E297C1] rounded-2xl py-4 px-14 outline-none font-bold transition-all shadow-sm text-slate-700 text-sm placeholder:text-slate-300"
              />
              {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-400 hover:scale-110 transition-transform">
                      <X size={18}/>
                  </button>
              )}
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center gap-3 min-w-fit">
              <TrendingUp className="text-[#E297C1]" size={18}/>
              <span className="text-[9px] md:text-[10px] font-black text-slate-800 uppercase italic tracking-widest">{filteredAndSortedConcerts.length} Records Found</span>
          </div>
      </div>

      {/* CONCERT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 text-left">
          {currentItems.map((concert) => (
              <div key={concert.id} className="group bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 overflow-hidden flex flex-col h-full relative">
                  
                  {/* Image/Thumbnail */}
                  <div className="relative h-48 md:h-56 overflow-hidden bg-slate-100">
                      <img 
                          src={concert.images && concert.images.length > 0 ? concert.images[0] : (concert.image_url || 'https://via.placeholder.com/600x400?text=No+Image')} 
                          alt={concert.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60"></div>
                      
                      {/* Status & Category Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl backdrop-blur-md ${
                              concert.status === 'PUBLISHED' || concert.status === 'PUBLISH' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
                          }`}>
                              <div className={`w-1 h-1 rounded-full bg-white ${(concert.status === 'PUBLISHED' || concert.status === 'PUBLISH') ? 'animate-pulse' : ''}`}></div>
                              {concert.status || 'DRAFT'}
                          </span>
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                              <Tag size={10} className="text-[#E297C1]"/>
                              {concert.category_name || concert.category?.category_name || 'Standard'}
                          </span>
                      </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 flex flex-col flex-1 relative">
                      {/* Quota Bubble */}
                      <div className="absolute -top-10 right-6 md:right-8 bg-slate-900 text-white p-3 md:p-4 rounded-3xl shadow-xl border-4 border-white text-center min-w-[70px] md:min-w-[80px] z-10">
                          <span className="block text-base md:text-lg font-black leading-none">
                            {concert.remaining_quota ?? concert.total_quota ?? 0}
                          </span>
                          <span className="text-[6px] md:text-[7px] font-bold uppercase text-white/40 tracking-tighter">Seats Left</span>
                      </div>

                      <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase italic leading-none tracking-tighter truncate mb-5 mt-1">
                          {concert.title}
                      </h3>

                      <div className="space-y-3 md:space-y-4 flex-1">
                          <div className="flex items-center gap-3 md:gap-4 text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-wider">
                              <div className="bg-slate-50 p-2 md:p-2.5 rounded-xl text-[#E297C1] group-hover:bg-[#E297C1] group-hover:text-white transition-colors duration-300 shrink-0">
                                <Calendar size={14}/>
                              </div>
                              <span className="truncate">
                                {concert.event_date ? new Date(concert.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : 'To Be Announced'}
                              </span>
                          </div>

                          <div className="flex items-center gap-3 md:gap-4 text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-wider">
                              <div className="bg-slate-50 p-2 md:p-2.5 rounded-xl text-[#E297C1] group-hover:bg-[#E297C1] group-hover:text-white transition-colors duration-300 shrink-0">
                                <MapPin size={14}/>
                              </div>
                              <span className="truncate">
                                {concert.location_name || concert.location?.location_name || "Virtual/TBA"}
                              </span>
                          </div>

                          <div className="pt-4 md:pt-6 border-t border-slate-50 mt-4 md:mt-6 flex items-end justify-between">
                              <div className="flex flex-col text-left">
                                  <span className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Pricing Starts From</span>
                                  <span className="text-xl md:text-2xl font-black text-slate-900 italic tracking-tighter">
                                      Rp {Number(concert.current_price || concert.price || concert.starting_price || 0).toLocaleString('id-ID')}
                                  </span>
                              </div>
                          </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 md:gap-4 pt-6 md:pt-8">
                          <button 
                              onClick={() => navigate(`/admin/edit-concert/${concert.id}`)}
                              className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 rounded-2xl text-slate-600 hover:bg-slate-900 hover:text-white transition-all font-black text-[8px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-sm active:scale-95"
                          >
                              <Edit size={14}/> Edit Node
                          </button>
                          <button 
                              onClick={() => handleDelete(concert.id)}
                              className="flex items-center justify-center gap-2 py-3.5 bg-rose-50 rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-[8px] md:text-[9px] uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-sm active:scale-95"
                          >
                              <Trash2 size={14}/> Purge
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#E297C1] disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={20}/>
            </button>
            
            <div className="flex gap-2 px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-12 h-12 rounded-2xl font-black text-[10px] transition-all active:scale-90 shadow-sm ${
                    currentPage === i + 1 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#E297C1] disabled:opacity-30 disabled:hover:text-slate-400 transition-all shadow-sm active:scale-90"
            >
              <ChevronRight size={20}/>
            </button>
          </div>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      {/* NO RESULTS VIEW */}
      {filteredAndSortedConcerts.length === 0 && (
          <div className="py-24 md:py-32 flex flex-col items-center animate-in zoom-in duration-500 px-6 text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-[30px] md:rounded-[35px] flex items-center justify-center mb-6 md:mb-8 shadow-inner">
                  <AlertCircle size={40} className="text-slate-200"/>
              </div>
              <h3 className="text-[10px] md:text-xs font-black text-slate-300 uppercase italic tracking-[0.3em] md:tracking-[0.5em] mb-2">Null Result Detected</h3>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Try adjusting your search parameters</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 md:mt-8 text-[9px] md:text-[10px] font-black text-[#E297C1] uppercase tracking-widest border-b-2 border-[#E297C1] pb-1 hover:text-slate-900 hover:border-slate-900 transition-all"
              >
                Reset Search Filters
              </button>
          </div>
      )}
    </div>
  );
};

export default ManageConcert;