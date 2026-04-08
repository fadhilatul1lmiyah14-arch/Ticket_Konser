import React, { useState, useEffect } from 'react';
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
  ChevronRight
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
      return (
        (t.event_title || '').toLowerCase().includes(search) ||
        (t.customer_name || '').toLowerCase().includes(search) ||
        (t.order_id || '').toString().includes(search)
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
        <Loader2 className="animate-spin text-[#E297C1] mx-auto mb-6" size={56} strokeWidth={3} />
        <p className="font-black text-slate-400 uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Ticket Records...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-sans antialiased text-slate-900">
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
        
        {/* HEADER */}
        <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 mb-2">
               <div className="h-1 w-8 bg-[#E297C1] rounded-full"></div>
               <h2 className="text-[10px] font-black text-[#E297C1] uppercase tracking-[0.4em]">Inventory Control</h2>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
              Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-[#E297C1]">Tickets</span>
            </h1>
          </div>
        </header>

        {/* TOOLBAR */}
        <div className="mb-8 flex flex-col xl:flex-row gap-6 items-center justify-between">
          <div className="relative w-full xl:max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Search by Ticket ID, Event, or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-[20px] sm:rounded-[24px] py-4 sm:py-5 px-16 outline-none focus:ring-2 focus:ring-[#E297C1]/20 font-bold shadow-sm transition-all text-sm placeholder:text-slate-300"
            />
          </div>
          
          <div className="w-full xl:w-auto flex items-center justify-center md:justify-start gap-3 bg-white px-6 py-4 rounded-[20px] shadow-sm border border-slate-100">
              <ShieldAlert size={18} className="text-[#E297C1]" />
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Database Integrity</p>
                <p className="text-[10px] font-black text-slate-800 uppercase italic">Paid & Verified Only</p>
              </div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[24px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-6 md:px-10 py-6 md:py-8">Identity</th>
                  <th 
                    className="px-6 md:px-10 py-6 md:py-8 cursor-pointer hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('event_title')}
                  >
                    <div className="flex items-center gap-2">Event Asset <ArrowUpDown size={12} className="text-[#E297C1]"/></div>
                  </th>
                  <th className="px-6 md:px-10 py-6 md:py-8">Customer Details</th>
                  <th 
                    className="px-6 md:px-10 py-6 md:py-8 cursor-pointer hover:bg-slate-800 transition-colors"
                    onClick={() => handleSort('purchase_date')}
                  >
                    <div className="flex items-center gap-2">Issuance Date <ArrowUpDown size={12} className="text-[#E297C1]"/></div>
                  </th>
                  <th className="px-6 md:px-10 py-6 md:py-8 text-center">Security Status</th>
                  <th className="px-6 md:px-10 py-6 md:py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentTickets.length > 0 ? currentTickets.map((ticket) => (
                  <tr key={ticket.order_id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">ID TICKET</span>
                        <span className="font-black text-[#E297C1] text-sm italic tracking-tight">
                          #{ticket.order_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase italic text-sm tracking-tight group-hover:text-[#E297C1] transition-colors">
                          {ticket.event_title || 'Unnamed Event'}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{ticket.ticket_category}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-[#E297C1] group-hover:text-white transition-all">
                          {(ticket.customer_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-600 uppercase text-xs tracking-wide truncate max-w-[120px]">
                          {ticket.customer_name || 'Unknown Customer'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-10 py-6 md:py-7">
                      <span className="text-slate-400 text-[11px] font-black uppercase tracking-tighter whitespace-nowrap">
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
                          className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
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
                         <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Ticket size={32} className="text-slate-200" />
                         </div>
                         <p className="font-black text-slate-400 uppercase italic tracking-[0.3em] text-sm mb-2">Null Result</p>
                         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No tickets match your query or database is empty.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY FOOTER & PAGINATION */}
        <div className="mt-8 md:mt-10 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-100 pt-8">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Issued: {filteredTickets.length}</span>
               </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1 overflow-x-auto">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-[10px] font-black transition-all ${
                        currentPage === i + 1 ? 'bg-[#E297C1] text-white' : 'bg-white text-slate-400 border border-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <p className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] md:tracking-[0.5em] text-center">
              System Node: RALY-V3.2.0 • Gate Control Active
            </p>
        </div>
      </main>
    </div>
  );
};

export default ManageTicket;