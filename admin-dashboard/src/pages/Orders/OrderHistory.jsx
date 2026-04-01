import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; // Pakai instance api biar token otomatis
import { 
  Search, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Filter, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 1. Fetch Data dari Backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/admin/orders');
        // Pastikan mengambil array data yang benar dari response Elysia
        const data = response.data.data || response.data.orders || response.data;
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal mengambil data pesanan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // 2. Logika Pencarian & Filter Status
  const filteredOrders = orders.filter(order => {
    const id = order.id?.toString().toLowerCase() || '';
    const userName = order.user_name?.toLowerCase() || order.userName?.toLowerCase() || '';
    const eventName = order.event_name?.toLowerCase() || order.eventName?.toLowerCase() || '';
    
    const matchesSearch = id.includes(searchTerm.toLowerCase()) || 
                          userName.includes(searchTerm.toLowerCase()) ||
                          eventName.includes(searchTerm.toLowerCase());
                          
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#E297C1] mx-auto mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Transactions...</p>
      </div>
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-xs font-black text-[#E297C1] uppercase tracking-[0.4em] mb-1">Financial Records</h2>
            <h1 className="text-4xl font-black text-slate-800 uppercase italic leading-none">Order History</h1>
          </div>
          
          {/* Status Filter Pills */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
            {['All', 'PAID', 'PENDING', 'EXPIRED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                  statusFilter === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </header>

        {/* Search & Utility */}
        <div className="mb-8 flex gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-5 top-4 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Order ID, Customer, or Event..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-[20px] py-4 px-14 outline-none focus:border-[#E297C1] font-bold shadow-sm transition-all"
            />
          </div>
          <button className="bg-white p-4 rounded-[20px] border-2 border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>

        {/* Table Orders */}
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Reference</th>
                  <th className="px-8 py-6">Customer</th>
                  <th className="px-8 py-6">Event Details</th>
                  <th className="px-8 py-6">Total Amount</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-[#E297C1] italic">#{order.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : 'No Date'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                          {(order.user_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-black text-slate-700 uppercase italic leading-tight">
                          {order.user_name || order.userName || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 uppercase italic">
                          {order.event_name || order.eventName || 'Event Deleted'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                          {order.quantity}x Ticket(s)
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-slate-900 tracking-tight">
                        Rp {(order.total_price || order.totalPrice || 0).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-4 py-1.5 rounded-full border w-fit ${
                        order.status === 'PAID' || order.status === 'SETTLED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {order.status === 'PAID' || order.status === 'SETTLED' ? <CheckCircle size={12} /> : 
                         order.status === 'PENDING' ? <Clock size={12} /> : <XCircle size={12} />}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        {/* Tombol ke detail order internal */}
                        <button 
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition shadow-sm"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {/* Tombol ke Invoice Xendit (External) */}
                        {order.invoice_url && (
                          <a 
                            href={order.invoice_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#E297C1] hover:text-white transition shadow-sm"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <XCircle size={48} className="mb-2" />
                        <p className="text-slate-400 font-black uppercase italic tracking-[0.2em]">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <footer className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] text-center">
          Raly Ticket Management System • Transaction Ledger
        </footer>
      </main>
    </div>
  );
};

export default OrderHistory;