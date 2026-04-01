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
  ChevronRight,
  TrendingUp,
  X,
  Ticket
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const ManageConcert = () => {
  const navigate = useNavigate();
  
  // State Data
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // Sesuai backend: Admin route membutuhkan token di header
      const res = await api.get('/admin/events', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Backend kamu mengembalikan { status: "success", data: [...] }
      const eventData = res.data?.data || [];
      setConcerts(eventData);
      
    } catch (error) {
      console.error("Gagal mengambil data event:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  // 2. Delete Logic
  const handleDelete = async (id) => {
    if(window.confirm("Hapus konser ini? Seluruh data gambar dan tiket terkait akan hilang permanen.")) {
      try {
        const token = localStorage.getItem('adminToken');
        await api.delete(`/admin/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update state lokal agar tidak perlu refresh halaman
        setConcerts(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        alert("Gagal menghapus event. Silakan coba lagi.");
      }
    }
  };

  // 3. Search Logic
  // Di backend baru, 'location' sudah berupa string nama lokasi (bukan ID lagi)
  const filteredConcerts = useMemo(() => {
    return concerts.filter(c => {
      const search = searchQuery.toLowerCase();
      const title = (c?.title || "").toLowerCase();
      const locationName = (c?.location || "").toLowerCase();
      
      return title.includes(search) || locationName.includes(search);
    });
  }, [concerts, searchQuery]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#E297C1]" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Syncing with 2026 Database...</p>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-left">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3 justify-start">
               <span className="p-2 bg-slate-900 rounded-xl text-white shadow-xl"><Music size={16}/></span>
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Internal Control</h2>
            </div>
            <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
               Manage <span className="text-[#E297C1]">Events</span>
            </h1>
          </div>
          
          <button 
            onClick={() => navigate('/add-concert')}
            className="group bg-slate-900 text-white px-8 py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-[#E297C1] transition-all shadow-2xl active:scale-95"
          >
            <Plus size={18} /> Create New Event
          </button>
        </header>

        {/* SEARCH & STATS */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by concert title or city..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 focus:border-[#E297C1] rounded-[24px] py-6 px-16 outline-none font-bold transition-all shadow-sm text-slate-700"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-400">
                        <X size={20}/>
                    </button>
                )}
            </div>
            <div className="bg-white px-8 py-6 rounded-[24px] border border-slate-100 shadow-sm hidden md:flex items-center gap-4">
                <TrendingUp className="text-[#E297C1]" size={20}/>
                <span className="text-sm font-black text-slate-800 uppercase italic tracking-widest">{concerts.length} Active Events</span>
            </div>
        </div>

        {/* CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredConcerts.map((concert) => (
                <div key={concert.id} className="group bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                    
                    {/* Thumbnail menggunakan Array Images dari Backend */}
                    <div className="relative h-64 overflow-hidden">
                        <img 
                            src={concert.images && concert.images.length > 0 ? concert.images[0] : 'https://via.placeholder.com/600x400?text=No+Image'} 
                            alt={concert.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                        
                        {/* Status Label */}
                        <div className="absolute top-6 left-6">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 ${
                                concert.status === 'PUBLISH' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full bg-white ${concert.status === 'PUBLISH' ? 'animate-pulse' : ''}`}></div>
                                {concert.status || 'DRAFT'}
                            </span>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-2xl font-black text-white uppercase italic leading-tight tracking-tighter truncate">
                                {concert.title}
                            </h3>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6 flex-1 flex flex-col">
                        <div className="space-y-4 flex-1">
                            {/* Tanggal */}
                            <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                <div className="bg-slate-50 p-2.5 rounded-xl text-[#E297C1]"><Calendar size={16}/></div>
                                {concert.event_date ? new Date(concert.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : 'TBA'}
                            </div>

                            {/* Lokasi (Sudah otomatis nama dari Backend Join) */}
                            <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                <div className="bg-slate-50 p-2.5 rounded-xl text-[#E297C1]"><MapPin size={16}/></div>
                                <span className="truncate text-slate-800">{concert.location || "Location TBA"}</span>
                            </div>

                            {/* Harga & Kuota */}
                            <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                <div className="flex items-center gap-3 text-slate-900 font-black text-lg italic">
                                    <div className="bg-slate-50 p-2.5 rounded-xl text-[#E297C1]"><Ticket size={18}/></div>
                                    Rp {Number(concert.price || 0).toLocaleString('id-ID')}
                                </div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                    {concert.quota} / {concert.total_quota} Left
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-3 pt-6">
                            <button 
                                onClick={() => navigate(`/edit-concert/${concert.id}`)}
                                className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-50 rounded-3xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                            >
                                <Edit size={18}/>
                                <span className="text-[7px] font-black uppercase mt-1">Edit</span>
                            </button>
                            <button 
                                onClick={() => handleDelete(concert.id)}
                                className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-50 rounded-3xl text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            >
                                <Trash2 size={18}/>
                                <span className="text-[7px] font-black uppercase mt-1">Delete</span>
                            </button>
                            <button 
                                onClick={() => navigate(`/manage-ticket/${concert.id}`)}
                                className="flex flex-col items-center justify-center gap-2 py-4 bg-slate-50 rounded-3xl text-[#E297C1] hover:bg-[#E297C1] hover:text-white transition-all shadow-sm"
                            >
                                <ChevronRight size={18}/>
                                <span className="text-[7px] font-black uppercase mt-1">Tickets</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* EMPTY STATE */}
        {filteredConcerts.length === 0 && (
            <div className="mt-20 flex flex-col items-center">
                <div className="w-32 h-32 bg-slate-100 rounded-[50px] flex items-center justify-center mb-8 border-4 border-white shadow-xl">
                    <Search size={40} className="text-slate-300"/>
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-widest text-center">No Events Found</h3>
            </div>
        )}
      </main>
    </div>
  );
};

export default ManageConcert;