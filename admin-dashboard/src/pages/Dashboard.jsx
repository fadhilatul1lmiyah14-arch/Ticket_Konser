import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../api/adminService'; 
import { useConfig } from '../context/ConfigContext'; // Import Hook Config
import { 
  Edit, 
  Plus, 
  Music, 
  Ticket, 
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { settings } = useConfig(); // Ambil settings untuk Privacy Mode
  
  const [period, setPeriod] = useState('all'); // State untuk filter waktu
  const [eventsPerformance, setEventsPerformance] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalEvents: 0 
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getStats(period);
      const data = response.data;

      if (data.status === "success") {
        setEventsPerformance(data.events_performance || []);
        setSummary({
          totalRevenue: Number(data.summary?.total_revenue) || 0,
          totalTicketsSold: Number(data.summary?.total_tickets_sold) || 0,
          totalEvents: data.events_performance?.length || 0
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  // Fungsi pembantu untuk merender Nama Event dari JSON Object
  const renderEventName = (nameData) => {
    if (typeof nameData === 'string') {
      try {
        const parsed = JSON.parse(nameData);
        return parsed.id || parsed.en || nameData;
      } catch (e) {
        return nameData;
      }
    }
    if (typeof nameData === 'object' && nameData !== null) {
      return nameData.id || nameData.en || "Unnamed Event";
    }
    return "Unnamed Event";
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 lg:p-0">
      {/* Header */}
      <header className="mb-8 md:mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="w-full sm:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 bg-[#E297C1] rounded-full animate-pulse"></span>
            <h2 className="text-[9px] md:text-[10px] font-black text-[#E297C1] uppercase tracking-[0.3em] md:tracking-[0.5em]">Live Analytical Overview</h2>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Admin <span className="text-slate-200">Analytics</span>
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-[18px] md:rounded-[20px] gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['all', 'today', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-[12px] md:rounded-[15px] text-[8px] md:text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  period === p 
                    ? 'bg-white text-[#E297C1] shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button 
            onClick={() => navigate('/admin/add-concert')}
            className="w-full sm:w-auto bg-[#E297C1] text-white px-6 md:px-8 py-3 md:py-4 rounded-[18px] md:rounded-[20px] font-black uppercase tracking-widest text-[9px] md:text-[10px] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-[0_15px_30px_rgba(226,151,193,0.2)] active:scale-95"
          >
            <Plus size={16} className="md:w-[18px]" /> New Event
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
        {/* Card 1: Total Revenue */}
        <div className="bg-[#E297C1] p-6 md:p-8 rounded-[30px] md:rounded-[40px] relative overflow-hidden group shadow-xl shadow-pink-100 min-h-[160px] md:min-h-[180px] flex flex-col justify-center">
            <div className="relative z-10">
               <p className="text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-widest mb-3 md:mb-4">Total Revenue</p>
               <h2 className={`text-2xl md:text-3xl font-black text-white italic transition-all group-hover:scale-105 origin-left ${settings.privacyMode ? 'privacy-blur' : ''}`}>
                 {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalRevenue)}
               </h2>
            </div>
            <DollarSign className="absolute -right-4 -bottom-4 text-white/20 w-24 h-24 md:w-32 md:h-32 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>

        {/* Card 2: Total Tickets Sold */}
        <div className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 relative overflow-hidden group shadow-xl shadow-slate-100 min-h-[160px] md:min-h-[180px] flex flex-col justify-center">
            <div className="relative z-10">
               <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Tickets Sold</p>
               <h2 className="text-5xl md:text-6xl font-black text-slate-900 italic transition-all group-hover:scale-105 origin-left">
                 {summary.totalTicketsSold}
               </h2>
            </div>
            <Ticket className="absolute -right-4 -bottom-4 text-slate-50 w-24 h-24 md:w-32 md:h-32 transform rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            <TrendingUp className="absolute top-6 md:top-8 right-6 md:right-8 text-[#E297C1]/30 animate-bounce" size={28} />
        </div>

        {/* Card 3: Total Events */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-[30px] md:rounded-[40px] relative overflow-hidden group shadow-xl shadow-slate-200 min-h-[160px] md:min-h-[180px] flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <div className="relative z-10">
               <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 md:mb-4">Active Events</p>
               <h2 className="text-5xl md:text-6xl font-black text-white italic transition-all group-hover:scale-105 origin-left">
                 {summary.totalEvents}
               </h2>
            </div>
            <Music className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24 md:w-32 md:h-32 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[30px] md:rounded-[40px] overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <Loader2 size={32} className="text-[#E297C1] animate-spin" />
          </div>
        )}

        <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase italic tracking-widest">Events Performance Monitor</h3>
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={14} />
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Live Updates</span>
          </div>
        </div>
        
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-900 text-white/50 text-[8px] md:text-[9px] uppercase tracking-[0.3em]">
              <tr>
                <th className="px-6 md:px-8 py-5 md:py-6 font-black">Event Name</th>
                <th className="px-6 md:px-8 py-5 md:py-6 font-black">Sold</th>
                <th className="px-6 md:px-8 py-5 md:py-6 font-black">Earnings</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-center font-black">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {eventsPerformance.length > 0 ? eventsPerformance.map((item) => (
                <tr key={item.event_id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs md:text-sm text-slate-800 group-hover:text-[#E297C1] transition duration-300 line-clamp-1">
                        {renderEventName(item.event_name)}
                      </span>
                      <span className="text-[8px] md:text-[9px] text-slate-300 font-black uppercase tracking-tighter">ID: {item.event_id}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></div>
                      <span className="text-slate-500 font-bold text-xs md:text-sm whitespace-nowrap">{item.total_sold} Tickets</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <span className={`text-[#E297C1] font-black text-xs md:text-sm whitespace-nowrap ${settings.privacyMode ? 'privacy-blur' : ''}`}>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.total_earnings)}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => navigate(`/admin/edit-concert/${item.event_id}`)}
                        className="p-2.5 md:p-3 bg-slate-100 text-slate-400 rounded-[12px] md:rounded-[15px] hover:bg-[#E297C1] hover:text-white transition-all active:scale-90 shadow-sm"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 md:py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Music size={40} />
                      <p className="uppercase text-[9px] md:text-[10px] font-black tracking-[0.3em]">No performance data available</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;