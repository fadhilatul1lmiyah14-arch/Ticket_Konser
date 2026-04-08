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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    try {
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
        // Gunakan renderTitle agar pencarian juga bekerja pada teks yang sudah diparsing
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 text-left">
          {currentItems.map((concert) => {
              const totalQuota = Array.isArray(concert.ticket_types) 
                ? concert.ticket_types.reduce((acc, curr) => acc + (Number(curr.total_quota) || 0), 0)
                : 0;

              const prices = Array.isArray(concert.ticket_types) 
                ? concert.ticket_types.map(t => Number(t.price) || 0)
                : [];
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

              return (
                <div key={concert.id} className="group bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500 overflow-hidden flex flex-col h-full relative">
                    
                    {/* Image/Thumbnail */}
                    <div className="relative h-36 md:h-40 overflow-hidden bg-slate-100">
                        <img 
                            src={concert.images && concert.images.length > 0 ? concert.images[0] : (concert.image_url || 'https://via.placeholder.com/600x400?text=No+Image')} 
                            alt={renderTitle(concert.title)}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60"></div>
                        
                        {/* Status & Category Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                            <span className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg backdrop-blur-md ${
                                (concert.status === 'PUBLISHED' || concert.status === 'PUBLISH') ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'
                            }`}>
                                <div className={`w-1 h-1 rounded-full bg-white ${(concert.status === 'PUBLISHED' || concert.status === 'PUBLISH') ? 'animate-pulse' : ''}`}></div>
                                {concert.status || 'DRAFT'}
                            </span>
                            <span className="px-2 py-1 bg-white/90 backdrop-blur-md text-slate-900 rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                <Tag size={8} className="text-[#E297C1]"/>
                                {concert.category_name || concert.category?.category_name || 'Standard'}
                            </span>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 md:p-5 flex flex-col flex-1 relative">
                        <div className="absolute -top-7 right-4 bg-slate-900 text-white p-2 md:p-2.5 rounded-2xl shadow-xl border-2 border-white text-center min-w-[50px] md:min-w-[60px] z-10">
                            <span className="block text-xs md:text-sm font-black leading-none">
                              {totalQuota}
                            </span>
                            <span className="text-[5px] md:text-[6px] font-bold uppercase text-white/40 tracking-tighter">Total Seats</span>
                        </div>

                        {/* PERBAIKAN: Memanggil fungsi renderTitle agar JSON tidak tampil mentah */}
                        <h3 className="text-sm md:text-base font-black text-slate-900 uppercase italic leading-tight tracking-tighter truncate mb-3 mt-1">
                            {renderTitle(concert.title)}
                        </h3>

                        <div className="space-y-2 md:space-y-3 flex-1">
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[8px] md:text-[9px] uppercase tracking-wider">
                                <div className="bg-slate-50 p-1.5 rounded-lg text-[#E297C1] group-hover:bg-[#E297C1] group-hover:text-white transition-colors duration-300 shrink-0">
                                  <Calendar size={12}/>
                                </div>
                                <span className="truncate">
                                  {concert.event_date ? new Date(concert.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBA'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[8px] md:text-[9px] uppercase tracking-wider">
                                <div className="bg-slate-50 p-1.5 rounded-lg text-[#E297C1] group-hover:bg-[#E297C1] group-hover:text-white transition-colors duration-300 shrink-0">
                                  <MapPin size={12}/>
                                </div>
                                <span className="truncate">
                                  {concert.location_name || concert.location?.location_name || "TBA"}
                                </span>
                            </div>

                            <div className="pt-3 border-t border-slate-50 mt-3 flex items-end justify-between">
                                <div className="flex flex-col text-left">
                                    <span className="text-[6px] md:text-[7px] font-black text-slate-300 uppercase tracking-[0.1em] mb-0.5">Starts From</span>
                                    <span className="text-sm md:text-base font-black text-slate-900 italic tracking-tighter">
                                        Rp {minPrice.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button 
                                onClick={() => navigate(`/admin/edit-concert/${concert.id}`)}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-900 hover:text-white transition-all font-black text-[7px] md:text-[8px] uppercase tracking-[0.1em] shadow-sm active:scale-95"
                            >
                                <Edit size={12}/> Edit
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

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#E297C1] disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronLeft size={18}/>
            </button>
            
            <div className="flex gap-1.5 px-2 overflow-x-auto max-w-[200px] md:max-w-full no-scrollbar">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`flex-shrink-0 w-10 h-10 rounded-xl font-black text-[9px] transition-all active:scale-90 shadow-sm ${
                    currentPage === i + 1 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-400 border border-slate-100'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-[#E297C1] disabled:opacity-30 transition-all shadow-sm active:scale-90"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      )}

      {/* NO RESULTS VIEW */}
      {filteredAndSortedConcerts.length === 0 && (
          <div className="py-24 flex flex-col items-center px-6 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-[25px] flex items-center justify-center mb-6 shadow-inner">
                  <AlertCircle size={32} className="text-slate-200"/>
              </div>
              <h3 className="text-[9px] font-black text-slate-300 uppercase italic tracking-[0.3em] mb-2">Null Result</h3>
              <button onClick={() => setSearchQuery('')} className="text-[9px] font-black text-[#E297C1] uppercase tracking-widest border-b border-[#E297C1]">
                Reset Filters
              </button>
          </div>
      )}
    </div>
  );
};

export default ManageConcert;