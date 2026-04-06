import React, { useState, useEffect } from 'react'; 
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
  Mail
} from 'lucide-react';

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // --- State untuk Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

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

  // --- Filter Data Logic ---
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.id?.toString() || '').includes(search) || 
      (order.customer_name || '').toLowerCase().includes(search) ||
      (order.event_title || '').toLowerCase().includes(search) ||
      (order.customer_email || '').toLowerCase().includes(search);
                          
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // --- Pagination Calculation ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="relative mb-6">
        <Loader2 className="animate-spin text-[#E297C1]" size={64} strokeWidth={1} />
        <TrendingUp className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" size={20} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse text-center px-4">Synchronizing Records...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans p-4 sm:p-6 md:p-10 relative overflow-x-hidden text-slate-900">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-[#E297C1]/5 blur-[80px] md:blur-[120px] rounded-full -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-500/5 blur-[80px] md:blur-[120px] rounded-full -z-10"></div>

        {/* HEADER */}
        <header className="mb-8 md:mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
          <div className="animate-in slide-in-from-left duration-700 w-full xl:w-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-[2px] w-8 bg-[#E297C1]"></div>
              <h2 className="text-[10px] font-black text-[#E297C1] uppercase tracking-[0.5em]">Financial Ledger</h2>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight md:leading-none">
              Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-400">History</span>
            </h1>
          </div>
          
          <div className="w-full xl:w-auto overflow-x-auto no-scrollbar">
            <div className="bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-xl shadow-slate-200/50 border border-white flex min-w-max gap-1 animate-in slide-in-from-right duration-700">
              {['All', 'PAID', 'PENDING', 'EXPIRED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 sm:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                    statusFilter === s 
                    ? 'bg-slate-900 text-white shadow-lg scale-105' 
                    : 'text-slate-400 hover:bg-white hover:text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* SEARCH BAR */}
        <div className="mb-8 animate-in fade-in duration-1000">
          <div className="relative group max-w-2xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#E297C1] to-indigo-400 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative">
              <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} md:size={20} />
              <input 
                type="text" 
                placeholder="Search transaction ID, name, or event..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-2xl py-4 md:py-5 px-12 md:px-16 outline-none focus:ring-4 focus:ring-[#E297C1]/10 focus:border-[#E297C1] font-bold text-slate-700 shadow-sm transition-all text-sm md:text-base"
              />
            </div>
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[24px] md:rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 md:px-10 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em]">Reference</th>
                  <th className="px-6 md:px-8 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em]">Client Information</th>
                  <th className="px-6 md:px-8 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em]">Event Summary</th>
                  <th className="px-6 md:px-8 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em]">Total Billing</th>
                  <th className="px-6 md:px-8 py-5 md:py-7 text-[10px] font-black uppercase tracking-[0.3em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentOrders.length > 0 ? currentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-[#F8FAFC] transition-all duration-300">
                    <td className="px-6 md:px-10 py-5">
                      <span className="font-black text-[#E297C1] italic tracking-tighter text-base md:text-lg">#{order.id}</span>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-8 w-8 md:h-10 md:w-10 bg-slate-900 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] md:text-[10px] font-black shadow-lg group-hover:scale-110 transition-transform">
                          {(order.customer_name || '??').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-800 uppercase italic leading-none mb-1 group-hover:text-[#E297C1] transition-colors truncate">
                            {order.customer_name || 'Anonymous'}
                          </span>
                          <div className="flex items-center gap-1 text-slate-400">
                            <Mail size={10} className="flex-shrink-0" />
                            <span className="text-[9px] md:text-[10px] font-bold tracking-tight truncate">{order.customer_email || 'No Email'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs md:text-sm font-black text-slate-800 uppercase italic tracking-tight mb-1 truncate max-w-[150px] md:max-w-[200px]">
                            {order.event_title || 'N/A'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] md:text-[9px] font-black text-slate-500 uppercase">
                            {order.quantity || 0} Tickets
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex flex-col leading-none">
                        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase mb-1">Amount Due</span>
                        <span className="font-black text-slate-900 text-base md:text-lg tracking-tighter">
                          Rp {(Number(order.total_price) || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className={`flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase px-4 md:px-5 py-1.5 md:py-2 rounded-2xl border-2 w-fit shadow-sm transition-all duration-500 ${
                        order.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-rose-50 text-rose-600 border-rose-100'
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
                      <div className="flex flex-col items-center opacity-20">
                        <Filter size={64} className="mb-4 text-slate-300" />
                        <h3 className="text-2xl font-black text-slate-400 uppercase italic tracking-widest">No Records Found</h3>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* PAGINATION CONTROLS */}
          <div className="bg-slate-50/50 p-6 md:p-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} Entries
            </p>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2.5 md:p-3 rounded-xl border transition-all ${
                    currentPage === 1 ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-white hover:shadow-md active:scale-90'
                  }`}
                >
                  <ChevronLeft size={18} md:size={20} />
                </button>

                <div className="flex gap-1 md:gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    // Logic to show limited pages on mobile could be added here
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-xl text-[10px] md:text-xs font-black transition-all ${
                        currentPage === i + 1 
                        ? 'bg-[#E297C1] text-white shadow-lg shadow-[#E297C1]/30 scale-110' 
                        : 'bg-white text-slate-400 border border-slate-100 hover:border-[#E297C1]/50 hidden sm:flex items-center justify-center'
                      } ${currentPage === i + 1 ? 'flex items-center justify-center' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 md:p-3 rounded-xl border transition-all ${
                    currentPage === totalPages ? 'text-slate-200 border-slate-100 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-white hover:shadow-md active:scale-90'
                  }`}
                >
                  <ChevronRight size={18} md:size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default OrderHistory;