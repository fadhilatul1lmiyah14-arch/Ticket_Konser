import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; 
import { 
  Search, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Filter, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Mail,
  Sparkles,
  Star,
  Crown,
  ArrowUpRight
} from 'lucide-react';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Ref untuk container utama
  const containerRef = useRef(null);

  // --- State untuk Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  // Auto scroll to top function
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/dashboard/orders');
        const data = response.data?.data || response.data || [];
        const sortedData = [...data].sort((a, b) => b.id - a.id);
        setOrders(sortedData);
      } catch (error) {
        console.error("Gagal mengambil data pesanan:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // Helper function to handle JSON event titles
  const renderEventTitle = (titleData) => {
    if (!titleData) return 'N/A';
    if (typeof titleData === 'object') {
      return titleData.id || titleData.en || 'N/A';
    }
    if (typeof titleData === 'string' && titleData.startsWith('{')) {
      try {
        const parsed = JSON.parse(titleData);
        return parsed.id || parsed.en || titleData;
      } catch (e) {
        return titleData;
      }
    }
    return titleData;
  };

  // Filter Data Logic
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const eventTitle = renderEventTitle(order.event_title).toLowerCase();
    
    const matchesSearch = 
      (order.id?.toString() || '').includes(search) || 
      (order.customer_name || '').toLowerCase().includes(search) ||
      eventTitle.includes(search) ||
      (order.customer_email || '').toLowerCase().includes(search);
                          
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handle page change dengan scroll ke atas
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  // Reset page ketika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="relative mb-6">
        <Loader2 className="animate-spin text-purple-500" size={64} strokeWidth={1} />
        <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse text-center px-4">Synchronizing Records...</p>
    </div>
  );

  return (
    <div ref={containerRef} className="bg-white min-h-screen font-sans p-4 sm:p-6 md:p-10 relative overflow-x-hidden text-slate-900 animate-fade-in-up">
      
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

      {/* HEADER */}
      <header className="mb-8 md:mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="animate-in slide-in-from-left duration-700 w-full xl:w-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-100 mb-3">
            <Sparkles size={12} className="text-purple-500 animate-pulse" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
            <h2 className="text-[8px] md:text-[9px] font-black text-purple-600 uppercase tracking-[0.3em]">Financial Ledger</h2>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight md:leading-none">
            Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient-x">History</span>
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-3 rounded-full animate-slide-in"></div>
        </div>
      </header>

      {/* SEARCH BAR & FILTER - DITEMUKAN DALAM SATU BARIS */}
      <div className="mb-8 animate-fade-in-up delay-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative group flex-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative">
              <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
              <input 
                type="text" 
                placeholder="Search transaction ID, name, or event..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-purple-100 rounded-2xl py-4 md:py-5 px-12 md:px-16 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 font-bold text-slate-700 shadow-sm transition-all text-sm md:text-base"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-purple-50/50 border border-purple-100 flex gap-1 animate-in slide-in-from-right duration-700">
            {['All', 'PAID', 'PENDING', 'EXPIRED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 sm:px-6 py-2.5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                  statusFilter === s 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105' 
                    : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-[24px] md:rounded-[40px] shadow-2xl shadow-purple-100/40 border border-purple-100 overflow-hidden animate-fade-in-up delay-200">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gradient-to-r from-purple-800 to-pink-800 text-white">
                <th className="px-6 md:px-10 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em] rounded-tl-2xl">Reference</th>
                <th className="px-6 md:px-8 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em]">Client Information</th>
                <th className="px-6 md:px-8 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em]">Event Summary</th>
                <th className="px-6 md:px-8 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em]">Total Billing</th>
                <th className="px-6 md:px-8 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em] rounded-tr-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {currentOrders.length > 0 ? currentOrders.map((order, idx) => (
                <tr key={order.id} className="group hover:bg-purple-50/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <td className="px-6 md:px-10 py-5">
                    <span className="font-black text-purple-500 italic tracking-tighter text-base md:text-lg">#{order.id}</span>
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] md:text-[10px] font-black shadow-lg group-hover:scale-110 transition-transform">
                        {(order.customer_name || '??').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-slate-800 uppercase italic leading-none mb-1 group-hover:text-purple-600 transition-colors truncate">
                          {order.customer_name || 'Anonymous'}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Mail size={10} className="flex-shrink-0 text-purple-400" />
                          <span className="text-[9px] md:text-[10px] font-bold tracking-tight truncate">{order.customer_email || 'No Email'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs md:text-sm font-black text-slate-800 uppercase italic tracking-tight mb-1 truncate max-w-[150px] md:max-w-[200px] group-hover:text-purple-600 transition-colors">
                        {renderEventTitle(order.event_title)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-50 rounded text-[8px] md:text-[9px] font-black text-purple-500 uppercase">
                          {order.quantity || 0} Tickets
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-1">Amount Due</span>
                      <span className="font-black text-slate-900 text-base md:text-lg tracking-tighter">
                        Rp {(Number(order.total_price) || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <div className={`flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase px-4 md:px-5 py-1.5 md:py-2 rounded-2xl border-2 w-fit shadow-sm transition-all duration-500 ${
                      order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                      order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                      'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {order.status === 'PAID' ? <CheckCircle size={12} strokeWidth={3} /> : 
                       order.status === 'PENDING' ? <Clock size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                      {order.status}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-purple-50 rounded-full">
                        <Filter size={40} className="text-purple-300" />
                      </div>
                      <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-widest">No Records Found</h3>
                      <p className="text-[9px] text-slate-400">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION CONTROLS - Premium */}
        <div className="bg-gradient-to-r from-purple-50/20 to-pink-50/20 p-6 md:p-8 border-t border-purple-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center md:text-left">
            Showing {filteredOrders.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} Entries
          </p>
          
          {totalPages > 1 && (
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
          )}
        </div>
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
            width: 4rem;
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
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;