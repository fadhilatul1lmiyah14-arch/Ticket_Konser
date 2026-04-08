import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import api from "../api/axiosConfig";
import { 
  ShoppingBag, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  CalendarDays,
  CreditCard,
  TrendingUp,
  History,
  ArrowUpRight
} from "lucide-react";

const OrderSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Ambil konteks bahasa dari Dashboard
  const context = useOutletContext();
  const lang = context?.lang || "id";

  // Objek Terjemahan
  const t = useMemo(() => {
    const translations = {
      id: {
        loading: "Sinkronisasi Transaksi...",
        statInvestment: "Total Investasi",
        statAction: "Menunggu Tindakan",
        statTotal: "Total Transaksi",
        statusPaid: "Pembayaran Berhasil",
        statusPending: "Menunggu Persetujuan",
        statusHistory: "Log Riwayat",
        historyTitle: "Riwayat Pesanan",
        historySub: "Kelola pesanan Anda",
        totalFound: "Total Ditemukan",
        empty: "Brankas Kosong",
        tickets: "Tiket",
        totalTrans: "Total Transaksi",
        secure: "Manajemen Aset Digital Aman"
      },
      en: {
        loading: "Syncing Transactions...",
        statInvestment: "Total Investment",
        statAction: "Waiting Action",
        statTotal: "Total Transactions",
        statusPaid: "Success Payment",
        statusPending: "Pending Approval",
        statusHistory: "History Log",
        historyTitle: "Order History",
        historySub: "Manage bookings",
        totalFound: "Total Found",
        empty: "Empty Vault",
        tickets: "Tickets",
        totalTrans: "Total Transaction",
        secure: "Secure Digital Asset Management"
      }
    };
    return translations[lang] || translations.id;
  }, [lang]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/customer/orders");
        const sortedData = (res.data.data || []).sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setOrders(sortedData);
      } catch (err) {
        console.error("Gagal mengambil data pesanan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleOrderClick = (order) => {
    if (order.status === 'PAID' || order.status === 'PENDING') {
      navigate(`/payment-success?external_id=${order.id}`);
    }
  };

  const getStatusStyles = (status) => {
    switch (String(status)?.toUpperCase()) {
      case 'PAID':
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white";
      case 'PENDING':
        return "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white";
      case 'EXPIRED':
      case 'CANCELLED':
        return "bg-rose-500/10 text-rose-500 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (String(status)?.toUpperCase()) {
      case 'PAID': return <CheckCircle2 size={18} />;
      case 'PENDING': return <Clock size={18} />;
      default: return <XCircle size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-32">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t.loading}</p>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, curr) => acc + (curr.status === 'PAID' ? Number(curr.final_price || 0) : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 px-1 md:px-0">
      
      {/* --- STATS SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <TrendingUp size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">{t.statInvestment}</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 italic tracking-tighter">
            Rp {totalSpent.toLocaleString('id-ID')}
          </h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-tighter">{t.statusPaid}</span>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <Clock size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">{t.statAction}</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 italic tracking-tighter">
            {pendingOrdersCount} <span className="text-sm font-bold text-slate-400 uppercase tracking-normal">Orders</span>
          </h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 px-2 py-1 rounded-lg uppercase tracking-tighter">{t.statusPending}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-purple-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700 text-white">
            <CreditCard size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">{t.statTotal}</p>
          <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">
            {orders.length} <span className="text-sm font-bold text-slate-500 uppercase tracking-normal">Records</span>
          </h3>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[9px] font-black bg-white/10 text-purple-400 px-2 py-1 rounded-lg uppercase tracking-tighter italic font-black">{t.statusHistory}</span>
          </div>
        </div>
      </div>

      {/* --- ORDER LIST SECTION --- */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden">
        <div className="p-6 md:p-8 lg:p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-xl md:rounded-2xl text-white shadow-lg">
              <History size={20} />
            </div>
            <div>
              <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase italic tracking-tighter">{t.historyTitle}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t.historySub}</p>
            </div>
          </div>
          <span className="hidden sm:block text-[9px] font-black text-purple-600 uppercase border border-purple-100 px-4 py-2 rounded-full tracking-widest">
            {orders.length} {t.totalFound}
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {orders.length === 0 ? (
            <div className="py-20 md:py-24 flex flex-col items-center">
              <ShoppingBag size={48} className="text-slate-100 mb-4" />
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{t.empty}</p>
            </div>
          ) : (
            orders.map((order) => {
              // PERBAIKAN: Ambil nama event dari objek berdasarkan bahasa
              const eventName = typeof order.event_name === 'object' 
                ? (order.event_name[lang] || order.event_name['id'] || 'Event Booking') 
                : (order.event_name || 'Event Booking');

              return (
                <div 
                  key={order.id} 
                  onClick={() => handleOrderClick(order)}
                  className="group p-6 lg:p-10 hover:bg-slate-50/80 transition-all duration-500 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-8 cursor-pointer"
                >
                  <div className="flex items-start md:items-center gap-4 md:gap-6 w-full lg:w-auto">
                    {/* Status Icon */}
                    <div className={`shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] border flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-sm ${getStatusStyles(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <span className="text-[9px] md:text-[10px] font-black text-slate-900 bg-white border border-slate-200 px-2 md:px-3 py-1 rounded-lg shadow-sm whitespace-nowrap">
                            #{String(order.id).substring(0, 8)}
                          </span>
                          <div className="flex items-center gap-1.5 text-slate-400 border-l border-slate-200 pl-2 md:pl-3">
                             <CalendarDays size={12} />
                             <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">
                               {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                             </span>
                          </div>
                      </div>
                      <h5 className="text-lg md:text-xl font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-purple-600 transition-colors leading-tight line-clamp-1">
                        {eventName}
                      </h5>
                      <div className="mt-2 md:mt-3 flex items-center gap-4">
                          <div className="flex -space-x-2">
                               {[...Array(Math.min(Number(order.quantity || 0), 3))].map((_, i) => (
                                  <div key={i} className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center transition-transform group-hover:translate-x-1">
                                      <ArrowUpRight size={8} className="text-white" />
                                  </div>
                               ))}
                          </div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{Number(order.quantity)} {t.tickets}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full lg:w-auto lg:gap-12 border-t lg:border-t-0 pt-5 lg:pt-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.totalTrans}</p>
                      <p className="text-base md:text-lg font-black text-slate-900 italic tracking-tighter whitespace-nowrap">
                        Rp {Number(order.final_price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                      <div className={`text-[8px] md:text-[9px] font-black px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl uppercase tracking-[0.1em] md:tracking-[0.2em] border shadow-sm transition-all duration-500 ${getStatusStyles(order.status)}`}>
                        {String(order.status)}
                      </div>
                      <div className="p-2 md:p-3 bg-slate-50 text-slate-300 rounded-xl md:rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 group-hover:shadow-lg group-hover:shadow-purple-200 shrink-0">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 py-4 md:py-6">
          <div className="h-[1px] w-12 bg-slate-200 mb-2" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic text-center">
            {t.secure}
          </p>
      </div>
    </div>
  );
};

export default OrderSection;