import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 
import { 
  Edit, 
  Trash2, 
  Plus, 
  Users, 
  Music, 
  Ticket, 
  ArrowUpRight,
  TrendingUp,
  Loader2,
  LogOut
} from 'lucide-react';
import Sidebar from '../components/Sidebar'; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [concerts, setConcerts] = useState([]);
  const [stats, setStats] = useState({
    totalConcert: 0,
    totalTickets: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Panggil endpoint statistik dashboard
        const response = await api.get('/admin/dashboard/stats');

        // MAPPING DATA: Kita buat fleksibel agar bisa baca snake_case (DB) atau camelCase (Elysia)
        const data = response.data.data || response.data;
        
        setConcerts(data.concerts || []);
        setStats({
          totalConcert: data.total_concert ?? data.totalConcerts ?? 0,
          totalTickets: data.total_tickets ?? data.totalTickets ?? 0,
          totalUsers: data.total_users ?? data.totalUsers ?? 0
        });
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Fungsi Hapus Event (Opsional jika ingin diaktifkan di dashboard)
  const handleDeleteEvent = async (id) => {
    if (window.confirm("Hapus event ini beserta seluruh datanya?")) {
      try {
        await api.delete(`/admin/events/${id}`);
        setConcerts(concerts.filter(c => c.id !== id));
      } catch (error) {
        alert("Gagal menghapus event.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#E297C1]" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">
            Syncing Data...<br/>Please Wait
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <h2 className="text-xs font-black text-[#E297C1] uppercase tracking-[0.4em]">Live System Overview</h2>
            </div>
            <h1 className="text-4xl font-black text-slate-800 uppercase italic leading-none">Admin Dashboard</h1>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/add-concert')}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-[#E297C1] transition-all shadow-2xl active:scale-95"
            >
              <Plus size={20} /> New Event
            </button>
            <button 
              onClick={handleLogout}
              className="p-4 bg-white border border-slate-100 text-rose-500 rounded-2xl hover:bg-rose-50 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Total Concert */}
          <div className="bg-[#E297C1] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden group transition-all hover:-translate-y-2">
            <div className="relative z-10">
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Music size={24} />
              </div>
              <p className="font-bold uppercase tracking-widest text-[10px] mb-1 opacity-80">Total Concert</p>
              <h3 className="text-5xl font-black italic">{stats.totalConcert}</h3>
            </div>
            <TrendingUp className="absolute right-6 top-6 text-white/10" size={80} />
          </div>

          {/* Tickets Sold */}
          <div className="bg-slate-900 p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden group transition-all hover:-translate-y-2">
            <div className="relative z-10">
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Ticket size={24} />
              </div>
              <p className="font-bold uppercase tracking-widest text-[10px] mb-1 opacity-80">Tickets Sold</p>
              <h3 className="text-5xl font-black italic">{stats.totalTickets}</h3>
            </div>
            <TrendingUp className="absolute right-6 top-6 text-white/10" size={80} />
          </div>

          {/* Total Users */}
          <div className="bg-[#E297C1] p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden group transition-all hover:-translate-y-2">
            <div className="relative z-10">
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <p className="font-bold uppercase tracking-widest text-[10px] mb-1 opacity-80">Total Users</p>
              <h3 className="text-5xl font-black italic">{stats.totalUsers}</h3>
            </div>
            <Users className="absolute right-6 top-6 text-white/10" size={80} />
          </div>
        </div>

        {/* Concert List Table */}
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-slate-800 uppercase italic tracking-tight">Recent Event Service Monitor</h3>
            <button 
              onClick={() => navigate('/concerts')}
              className="text-[10px] font-black uppercase text-[#E297C1] hover:text-slate-900 transition flex items-center gap-1"
            >
              View All <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Event Title</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">Quota (Rem/Total)</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {concerts.length > 0 ? concerts.map((item) => {
                  const remaining = item.remaining_quota ?? item.remainingQuota ?? 0;
                  const total = item.total_quota ?? item.totalQuota ?? 1;
                  const percentage = (remaining / total) * 100;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-5">
                        <span className="font-black text-slate-700 uppercase italic group-hover:text-[#E297C1] transition">
                          {item.title}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-bold text-sm">
                        {item.event_date ? new Date(item.event_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'No Date'}
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-black text-slate-700">
                              {remaining} / {total}
                            </span>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div 
                                  className="bg-[#E297C1] h-full transition-all duration-700" 
                                  style={{ width: `${percentage}%` }}
                               ></div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                          item.status?.toLowerCase() === 'published' 
                            ? 'text-green-500 border-green-200 bg-green-50' 
                            : 'text-amber-500 border-amber-200 bg-amber-50'
                        }`}>
                          {item.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => navigate(`/edit-concert/${item.id}`)}
                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"
                            title="Edit Event"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(item.id)}
                            className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition shadow-sm"
                            title="Delete Event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <Music size={40} />
                        <p className="font-black uppercase text-xs tracking-widest">No Active Events</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;