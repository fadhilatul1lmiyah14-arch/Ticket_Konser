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
  ArrowUpRight,
  ShieldCheck,
  Activity
} from "lucide-react";

const OrderSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const context = useOutletContext();
  const lang = context?.lang || "id";

  const t = useMemo(() => {
    const translations = {
      id: {
        loading: "Sinkronisasi...",
        statInvestment: "Total Investasi",
        statAction: "Menunggu Tindakan",
        statTotal: "Total Transaksi",
        statusPaid: "Berhasil",
        statusPending: "Pending",
        statusHistory: "Log Riwayat",
        historyTitle: "Riwayat Pesanan",
        historySub: "Kelola pesanan Anda",
        totalFound: "Ditemukan",
        empty: "Brankas Kosong",
        tickets: "Tiket",
        totalTrans: "Total",
        secure: "Sistem Manajemen Aset Digital Terenkripsi"
      },
      en: {
        loading: "Syncing...",
        statInvestment: "Total Investment",
        statAction: "Waiting Action",
        statTotal: "Total Transactions",
        statusPaid: "Success",
        statusPending: "Pending",
        statusHistory: "History Log",
        historyTitle: "Order History",
        historySub: "Manage bookings",
        totalFound: "Found",
        empty: "Empty Vault",
        tickets: "Tickets",
        totalTrans: "Total",
        secure: "Encrypted Digital Asset Management"
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
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white";
      case 'PENDING':
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white";
      case 'EXPIRED':
      case 'CANCELLED':
        return "bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
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
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-purple-500" size={32} />
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 italic">{t.loading}</p>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, curr) => acc + (curr.status === 'PAID' ? Number(curr.final_price || 0) : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-10">
      
      {/* --- STATS SUMMARY: COMPACT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-0">
        <div className="bg-white/5 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/10 relative overflow-hidden group">
          <TrendingUp size={60} className="absolute -top-2 -right-2 opacity-5 group-hover:scale-110 transition-transform text-white" />
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Activity size={10} className="text-emerald-500" /> {t.statInvestment}
          </p>
          <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter mb-2">
            Rp {totalSpent.toLocaleString('id-ID')}
          </h3>
          <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase italic">
            {t.statusPaid}
          </span>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-5 rounded-[1.5rem] border border-white/10 relative overflow-hidden group">
          <Clock size={60} className="absolute -top-2 -right-2 opacity-5 group-hover:scale-110 transition-transform text-white" />
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.statAction}</p>
          <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter mb-2">
            {pendingOrdersCount} <span className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Tasks</span>
          </h3>
          <span className="text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase italic">
            {t.statusPending}
          </span>
        </div>

        <div className="bg-purple-950/20 backdrop-blur-md p-5 rounded-[1.5rem] border border-purple-500/20 relative overflow-hidden group">
          <CreditCard size={60} className="absolute -top-2 -right-2 opacity-10 group-hover:scale-110 transition-transform text-purple-500" />
          <p className="text-[9px] font-black text-purple-400/60 uppercase tracking-widest mb-1">{t.statTotal}</p>
          <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter mb-2">
            {orders.length} <span className="text-[10px] font-bold text-slate-500 uppercase tracking-normal">Records</span>
          </h3>
          <span className="text-[8px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase italic">
            {t.statusHistory}
          </span>
        </div>
      </div>

      {/* --- ORDER VAULT LIST: STREAMLINED --- */}
      <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-xl overflow-hidden mx-2 md:mx-0">
        <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white text-slate-950 rounded-xl shadow-lg">
              <History size={18} />
            </div>
            <div>
              <h4 className="text-sm md:text-base font-black text-white uppercase italic tracking-tighter leading-none">{t.historyTitle}</h4>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">{t.historySub}</p>
            </div>
          </div>
          <span className="text-[8px] font-black text-purple-400 uppercase bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full tracking-widest">
            {orders.length} {t.totalFound}
          </span>
        </div>

        <div className="divide-y divide-white/5">
          {orders.length === 0 ? (
            <div className="py-20 flex flex-col items-center">
              <ShoppingBag size={40} className="text-slate-800 mb-3" />
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">{t.empty}</p>
            </div>
          ) : (
            orders.map((order) => {
              const eventName = typeof order.event_name === 'object' 
                ? (order.event_name[lang] || order.event_name['id'] || 'Event Booking') 
                : (order.event_name || 'Event Booking');

              return (
                <div 
                  key={order.id} 
                  onClick={() => handleOrderClick(order)}
                  className="group p-5 md:p-6 hover:bg-white/[0.03] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer relative"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Status Icon - Smaller Scale */}
                    <div className={`shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:scale-105 shadow-md ${getStatusStyles(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] font-black text-white/70 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md tracking-tighter">
                            #{String(order.id).substring(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[8px] font-bold text-slate-500 uppercase flex items-center gap-1">
                             <CalendarDays size={10} className="text-purple-500" />
                             {new Date(order.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                      </div>
                      <h5 className="text-base md:text-lg font-black text-white uppercase italic tracking-tighter group-hover:text-purple-400 transition-colors line-clamp-1">
                        {eventName}
                      </h5>
                      <div className="mt-1 flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                               {[...Array(Math.min(Number(order.quantity || 0), 2))].map((_, i) => (
                                  <div key={i} className="w-4 h-4 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center">
                                      <ArrowUpRight size={6} className="text-purple-400" />
                                  </div>
                               ))}
                          </div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{Number(order.quantity)} {t.tickets}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 border-t sm:border-t-0 pt-4 sm:pt-0 border-white/5">
                    <div className="sm:text-right">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center sm:justify-end gap-1 mb-0.5">
                         <CreditCard size={10} /> {t.totalTrans}
                      </p>
                      <p className="text-base font-black text-white italic tracking-tighter">
                        Rp {Number(order.final_price || 0).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider border transition-all ${getStatusStyles(order.status)}`}>
                        {String(order.status)}
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Branding - Minimalist */}
      <div className="flex flex-col items-center gap-2 py-6 opacity-30">
          <ShieldCheck size={16} className="text-slate-500" />
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] italic text-center">
            {t.secure}
          </p>
      </div>
    </div>
  );
};

export default OrderSection;