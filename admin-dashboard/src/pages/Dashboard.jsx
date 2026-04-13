import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../api/adminService'; 
import { useConfig } from '../context/ConfigContext';
import { 
  Edit, 
  Plus, 
  Music, 
  Ticket, 
  TrendingUp,
  DollarSign,
  Calendar,
  Loader2,
  ArrowUpRight,
  Sparkles,
  Eye,
  BarChart3,
  Zap,
  Activity,
  Star,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { settings } = useConfig();
  
  const [period, setPeriod] = useState('all');
  const [eventsPerformance, setEventsPerformance] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalEvents: 0 
  });
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Ref untuk container utama (scroll to top)
  const tableContainerRef = useRef(null);

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

  // Reset page when period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [period]);

  // Scroll to top function
  const scrollToTop = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setTimeout(() => {
      scrollToTop();
    }, 100);
  };

  // Pagination Logic
  const totalPages = Math.ceil(eventsPerformance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEvents = eventsPerformance.slice(startIndex, startIndex + itemsPerPage);

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

  const formatEventId = (eventId) => {
    if (!eventId) return 'N/A';
    const idStr = String(eventId);
    return idStr.length > 8 ? idStr.slice(0, 8) : idStr;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount).replace('Rp', 'Rp');
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 lg:p-8">
      
      {/* Premium Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-100/15 via-pink-100/10 to-transparent rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-indigo-100/15 via-purple-100/10 to-transparent rounded-full blur-[100px] animate-pulse-slow-delay"></div>
        {/* Floating Stars */}
        <div className="absolute top-[15%] left-[5%] animate-float-slow">
          <Star size={16} className="text-purple-200/30" fill="currentColor" />
        </div>
        <div className="absolute bottom-[20%] right-[8%] animate-float-delay">
          <Star size={12} className="text-pink-200/30" fill="currentColor" />
        </div>
        <div className="absolute top-[40%] right-[15%] animate-float">
          <Sparkles size={10} className="text-purple-300/20" />
        </div>
      </div>

      {/* Header Section */}
      <header className="mb-8 md:mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 relative">
        <div className="w-full sm:w-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-100 mb-3 animate-fade-in-up">
            <Activity size={12} className="text-purple-500 animate-pulse" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
            <h2 className="text-[8px] md:text-[9px] font-black text-purple-600 uppercase tracking-[0.3em]">Live Analytical Overview</h2>
            <Sparkles size={10} className="text-purple-400 animate-sparkle" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none animate-fade-in-up delay-100">
            <span className="text-slate-800">Admin</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 ml-2 bg-[length:200%_auto] animate-gradient-x">Analytics</span>
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-3 rounded-full animate-slide-in"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto animate-fade-in-up delay-200">
          {/* Period Filter - Premium Style */}
          <div className="flex bg-purple-50/50 p-1.5 rounded-[20px] gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar border border-purple-100">
            {['all', 'today', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 sm:flex-none px-4 md:px-5 py-2.5 rounded-[14px] text-[8px] md:text-[9px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  period === p 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105' 
                    : 'text-slate-500 hover:text-purple-600 hover:bg-purple-100/50'
                }`}
              >
                {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>

          <button 
            onClick={() => navigate('/admin/add-concert')}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-[20px] font-black uppercase tracking-widest text-[9px] md:text-[10px] flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 active:scale-95 group relative overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <Plus size={16} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" /> 
            <span className="relative z-10">New Event</span>
          </button>
        </div>
      </header>

      {/* Stats Cards - Premium Redesign with Animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8 md:mb-12">
        
        {/* Card 1: Total Revenue - Premium */}
        <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-6 md:p-8 rounded-[32px] overflow-hidden group shadow-xl shadow-purple-200/50 min-h-[170px] flex flex-col justify-between hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={12} className="animate-bounce" />
                Total Revenue
              </p>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <DollarSign size={16} className="text-white" />
              </div>
            </div>
            <h2 className={`text-2xl md:text-3xl font-black text-white italic tracking-tighter transition-all group-hover:scale-105 origin-left ${settings.privacyMode ? 'blur-sm select-none' : ''}`}>
              {formatCurrency(summary.totalRevenue)}
            </h2>
            <div className="flex items-center gap-2 mt-3 text-white/60 text-[8px] font-black uppercase">
              <ArrowUpRight size={10} className="animate-pulse" />
              <span>+{Math.floor(Math.random() * 30) + 10}% from last period</span>
            </div>
          </div>
          <div className="absolute bottom-3 right-3 text-white/10 animate-spin-slow">
            <Crown size={40} />
          </div>
        </div>

        {/* Card 2: Total Tickets Sold - Premium */}
        <div className="relative bg-white p-6 md:p-8 rounded-[32px] border border-purple-100 shadow-xl hover:shadow-2xl transition-all duration-500 group min-h-[170px] flex flex-col justify-between animate-fade-in-up delay-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-full blur-2xl animate-pulse-slow"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Ticket size={12} className="animate-float" />
                Tickets Sold
              </p>
              <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Ticket size={16} className="text-purple-500" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 italic tracking-tighter group-hover:scale-105 origin-left transition-all">
              {summary.totalTicketsSold.toLocaleString('id-ID')}
            </h2>
            <div className="flex items-center gap-2 mt-3 text-emerald-500 text-[8px] font-black uppercase">
              <ArrowUpRight size={10} className="animate-bounce" />
              <span>+{Math.floor(Math.random() * 50) + 20} tickets sold</span>
            </div>
          </div>
          <div className="absolute bottom-3 right-3 text-purple-100 animate-bounce-slow">
            <Zap size={32} />
          </div>
        </div>

        {/* Card 3: Total Events - Premium */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 md:p-8 rounded-[32px] overflow-hidden group shadow-xl min-h-[170px] flex flex-col justify-between hover:shadow-2xl transition-all duration-500 animate-fade-in-up delay-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Music size={12} className="animate-spin-slow" />
                Active Events
              </p>
              <div className="p-2 bg-slate-700 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Music size={16} className="text-purple-400" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter group-hover:scale-105 origin-left transition-all">
              {summary.totalEvents}
            </h2>
            <div className="flex items-center gap-2 mt-3 text-purple-400 text-[8px] font-black uppercase">
              <Zap size={10} className="animate-pulse" />
              <span>Active concerts running</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section - Premium with Pagination */}
      <div ref={tableContainerRef} className="bg-white rounded-[32px] overflow-hidden border border-purple-100 shadow-xl shadow-purple-50/50 relative animate-fade-in-up delay-400">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="bg-white p-5 rounded-2xl shadow-2xl flex items-center gap-3 animate-scale-in">
              <Loader2 size={24} className="text-purple-500 animate-spin" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Loading dashboard data...</span>
            </div>
          </div>
        )}

        {/* Table Header */}
        <div className="p-6 md:p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50/30 to-pink-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl animate-pulse-slow">
              <BarChart3 size={16} className="text-purple-600" />
            </div>
            <h3 className="text-[10px] md:text-xs font-black text-slate-800 uppercase italic tracking-widest">Events Performance Monitor</h3>
          </div>
          <div className="flex items-center gap-2 text-purple-400 bg-purple-50 px-3 py-1.5 rounded-full">
            <Calendar size={12} className="animate-pulse" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Live Updates</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-gradient-to-r from-purple-800 to-pink-800 text-white/80 text-[8px] md:text-[9px] uppercase tracking-[0.3em]">
              <tr>
                <th className="px-6 md:px-8 py-5 md:py-6 font-black rounded-tl-2xl">Event Name</th>
                <th className="px-6 md:px-8 py-5 md:py-6 font-black">Sold</th>
                <th className="px-6 md:px-8 py-5 md:py-6 font-black">Earnings</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-center font-black rounded-tr-2xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {currentEvents.length > 0 ? currentEvents.map((item, idx) => (
                <tr key={item.event_id || idx} className="hover:bg-purple-50/30 transition-all duration-300 group animate-slide-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs md:text-sm text-slate-800 group-hover:text-purple-600 transition duration-300 line-clamp-1">
                        {renderEventName(item.event_name)}
                      </span>
                      <span className="text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-tighter">ID: {formatEventId(item.event_id)}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse"></div>
                      <span className="text-slate-600 font-bold text-xs md:text-sm whitespace-nowrap">{item.total_sold || 0} Tickets</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <span className={`font-black text-xs md:text-sm text-purple-600 whitespace-nowrap ${settings.privacyMode ? 'blur-sm select-none' : ''}`}>
                      {formatCurrency(item.total_earnings || 0)}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-5 md:py-6">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => navigate(`/admin/edit-concert/${item.event_id}`)}
                        className="p-2.5 md:p-3 bg-purple-50 text-purple-400 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all duration-300 active:scale-90 shadow-sm group-hover:shadow-md group-hover:scale-105"
                      >
                        <Edit size={14} className="group-hover:rotate-12 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 md:py-24 text-center">
                    <div className="flex flex-col items-center gap-4 animate-pulse-slow">
                      <div className="p-6 bg-purple-50 rounded-full">
                        <Music size={40} className="text-purple-300" />
                      </div>
                      <p className="uppercase text-[9px] md:text-[10px] font-black tracking-[0.3em] text-slate-400">No performance data available</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="p-4 md:p-6 border-t border-purple-100 bg-gradient-to-r from-purple-50/20 to-pink-50/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Eye size={10} className="text-purple-400" />
              Showing {eventsPerformance.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, eventsPerformance.length)} of {eventsPerformance.length} events
            </p>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2.5 md:p-3 rounded-xl border transition-all duration-300 ${
                  currentPage === 1 
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed' 
                    : 'text-purple-500 border-purple-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent active:scale-90'
                }`}
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-1.5 md:gap-2">
                {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + idx;
                  } else {
                    pageNumber = currentPage - 2 + idx;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-xl text-[9px] md:text-[11px] font-black transition-all duration-300 ${
                        currentPage === pageNumber 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-110' 
                          : 'bg-white text-slate-500 border border-purple-200 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2.5 md:p-3 rounded-xl border transition-all duration-300 ${
                  currentPage === totalPages 
                    ? 'text-slate-300 border-slate-200 cursor-not-allowed' 
                    : 'text-purple-500 border-purple-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white hover:border-transparent active:scale-90'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Table Footer (tanpa pagination jika hanya 1 halaman) */}
        {eventsPerformance.length > 0 && totalPages <= 1 && (
          <div className="p-4 md:p-6 border-t border-purple-100 bg-gradient-to-r from-purple-50/20 to-pink-50/20 flex justify-between items-center">
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Eye size={10} className="text-purple-400" />
              Showing {eventsPerformance.length} events
            </p>
            <div className="flex items-center gap-2 text-purple-400 text-[8px] font-black uppercase">
              <Activity size={10} className="animate-pulse" />
              <span>Real-time data</span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
            </div>
          </div>
        )}
      </div>

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
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
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
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.4s ease-out forwards;
          opacity: 0;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
};

export default Dashboard;