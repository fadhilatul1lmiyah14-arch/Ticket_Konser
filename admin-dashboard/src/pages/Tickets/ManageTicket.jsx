import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; 
import { 
  Trash2, 
  Ticket, 
  Search, 
  Loader2, 
  CheckCircle,
  QrCode,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  TrendingUp,
  Mail
} from 'lucide-react';

const ManageTicket = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'purchase_date', direction: 'desc' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Ref untuk container utama
  const containerRef = useRef(null);

  // Auto scroll to top function
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  // 1. Fetch Data
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/admin/dashboard/tickets'); 
        if (response.data && response.data.status === "success") {
          setTickets(response.data.data || []);
        }
      } catch (error) {
        console.error("Gagal mengambil data tiket:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Helper function to handle JSON names
  const renderEventTitle = (titleData) => {
    if (!titleData) return 'Unnamed Event';
    
    if (typeof titleData === 'object') {
      return titleData.id || titleData.en || 'Unnamed Event';
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

  // 2. Delete/Revoke Logic
  const handleDelete = async (id) => {
    if(window.confirm("PERINGATAN: Menghapus tiket ini akan membatalkan akses QR Code customer secara permanen. Lanjutkan?")) {
      try {
        await api.delete(`/admin/tickets/${id}`);
        setTickets(tickets.filter(t => t.order_id !== id));
      } catch (error) {
        alert("Gagal menghapus tiket. Pastikan koneksi stabil atau hubungi developer.");
      }
    }
  };

  // Sorting Logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter & Sort Processing
  const filteredTickets = tickets
    .filter(t => {
      const search = searchTerm.toLowerCase();
      const eventTitle = renderEventTitle(t.event_title).toLowerCase();
      const customerName = (t.customer_name || '').toLowerCase();
      const orderId = (t.order_id || '').toString().toLowerCase();

      return (
        eventTitle.includes(search) ||
        customerName.includes(search) ||
        orderId.includes(search)
      );
    })
    .sort((a, b) => {
      const valA = a[sortConfig.key] || '';
      const valB = b[sortConfig.key] || '';
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Render Status Badge
  const renderStatus = (status) => {
    const isUsed = status?.toUpperCase() === 'USED';
    return (
      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border whitespace-nowrap ${
        isUsed 
        ? 'bg-slate-100 text-slate-400 border-slate-200' 
        : 'bg-emerald-50 text-emerald-500 border-emerald-100'
      }`}>
        {isUsed ? <Clock size={12}/> : <CheckCircle size={12}/>}
        {status || 'ACTIVE'}
      </span>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="text-center">
        <Loader2 className="animate-spin text-purple-500 mx-auto mb-6" size={56} strokeWidth={3} />
        <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Ticket Records...</p>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="bg-white min-h-screen font-sans antialiased text-slate-900 animate-fade-in-up">
      
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

      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
        
        {/* HEADER */}
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="w-full md:w-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-100 mb-3">
              <Sparkles size={12} className="text-purple-500 animate-pulse" />
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
              <h2 className="text-[8px] md:text-[9px] font-black text-purple-600 uppercase tracking-[0.3em]">Inventory Control</h2>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic leading-none tracking-tighter">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient-x">Tickets</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-3 rounded-full animate-slide-in"></div>
          </div>
        </header>

        {/* TOOLBAR - SEARCH & BADGE SAMPINGAN */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between animate-fade-in-up delay-100">
          <div className="relative w-full sm:flex-1">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative">
              <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-purple-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by Ticket ID, Event, or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-purple-100 rounded-2xl py-4 md:py-5 px-12 md:px-16 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 font-bold text-slate-700 shadow-sm transition-all text-sm md:text-base placeholder:text-slate-300"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 px-6 py-4 rounded-2xl shadow-sm border border-purple-100">
              <ShieldAlert size={18} className="text-purple-500" />
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-500 uppercase leading-none mb-1">Database Integrity</p>
                <p className="text-[10px] font-black text-purple-600 uppercase italic">Paid & Verified Only</p>
              </div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[24px] md:rounded-[40px] shadow-2xl shadow-purple-100/40 border border-purple-100 overflow-hidden animate-fade-in-up delay-200">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gradient-to-r from-purple-800 to-pink-800 text-white text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-6 md:px-10 py-6 md:py-8 rounded-tl-2xl">Identity</th>
                  <th 
                    className="px-6 md:px-10 py-6 md:py-8 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => handleSort('event_title')}
                  >
                    <div className="flex items-center gap-2">Event Asset <ArrowUpDown size={12} className="text-purple-300"/></div>
                  </th>
                  <th className="px-6 md:px-10 py-6 md:py-8">Customer Details</th>
                  <th 
                    className="px-6 md:px-10 py-6 md:py-8 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => handleSort('purchase_date')}
                  >
                    <div className="flex items-center gap-2">Issuance Date <ArrowUpDown size={12} className="text-purple-300"/></div>
                  </th>
                  <th className="px-6 md:px-10 py-6 md:py-8 text-center">Security Status</th>
                  <th className="px-6 md:px-10 py-6 md:py-8 text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {currentTickets.length > 0 ? currentTickets.map((ticket, idx) => (
                  <tr key={ticket.order_id} className="group hover:bg-purple-50/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">ID TICKET</span>
                        <span className="font-black text-purple-500 text-sm italic tracking-tight">
                          #{ticket.order_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase italic text-sm tracking-tight group-hover:text-purple-600 transition-colors">
                          {renderEventTitle(ticket.event_title)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{ticket.ticket_category}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-purple-500 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white transition-all">
                          {(ticket.customer_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-600 uppercase text-xs tracking-wide truncate max-w-[120px] group-hover:text-purple-600 transition-colors">
                          {ticket.customer_name || 'Unknown Customer'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <span className="text-slate-500 text-[11px] font-black uppercase tracking-tighter whitespace-nowrap">
                        {ticket.purchase_date 
                          ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(ticket.purchase_date)) 
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <div className="flex justify-center">
                        {renderStatus(ticket.status)}
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <div className="flex justify-end gap-3">
                        <button 
                          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-purple-50 text-purple-400 rounded-xl hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all shadow-sm"
                          title="Verify Details"
                        >
                          <ExternalLink size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ticket.order_id)}
                          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm hover:shadow-rose-100"
                          title="Revoke Access"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="py-24 md:py-32 text-center">
                       <div className="flex flex-col items-center max-w-xs mx-auto px-6">
                         <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                            <Ticket size={32} className="text-purple-300" />
                         </div>
                         <p className="font-black text-slate-400 uppercase italic tracking-[0.3em] text-sm mb-2">Null Result</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No tickets match your query or database is empty.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY FOOTER & PAGINATION - SAMA DENGAN ORDER HISTORY */}
        <div className="mt-8 md:mt-10 bg-gradient-to-r from-purple-50/20 to-pink-50/20 p-6 md:p-8 rounded-[24px] border border-purple-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Issued: {filteredTickets.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Tickets: {filteredTickets.filter(t => t.status !== 'USED').length}</span>
            </div>
          </div>

          {/* Pagination Controls - SAMA DENGAN ORDER HISTORY */}
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

          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">
            System Node: RALY-V3.2.0 • Gate Control Active
          </p>
        </div>
      </main>

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

export default ManageTicket;