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
  Activity,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

const OrderSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const navigate = useNavigate();
  
  const context = useOutletContext();
  const lang = context?.lang || "id";
  const isDarkMode = context?.isDarkMode !== undefined ? context?.isDarkMode : true;

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
        secure: "Sistem Manajemen Aset Digital Terenkripsi",
        page: "Halaman",
        of: "dari",
        prev: "Sebelumnya",
        next: "Selanjutnya"
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
        secure: "Encrypted Digital Asset Management",
        page: "Page",
        of: "of",
        prev: "Previous",
        next: "Next"
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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
    scrollToTop();
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
    scrollToTop();
  };

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

  // Light mode specific styles
  const statsCardClass = !isDarkMode 
    ? "bg-white/60 backdrop-blur-md border-slate-200" 
    : "bg-white/5 backdrop-blur-md border-white/10";
  const statsTextClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const statsValueClass = !isDarkMode ? "text-slate-800" : "text-white";
  const statsIconClass = !isDarkMode ? "text-slate-300" : "text-white";
  
  const vaultCardClass = !isDarkMode 
    ? "bg-white/60 backdrop-blur-xl border-slate-200 shadow-lg" 
    : "bg-white/5 backdrop-blur-xl border-white/10 shadow-xl";
  const vaultHeaderClass = !isDarkMode ? "bg-white/40 border-slate-200" : "bg-white/[0.02] border-white/5";
  const vaultTitleClass = !isDarkMode ? "text-slate-800" : "text-white";
  const vaultSubtitleClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const vaultBadgeClass = !isDarkMode 
    ? "bg-purple-100 text-purple-600 border-purple-200" 
    : "bg-purple-500/10 text-purple-400 border-purple-500/20";
  const vaultDividerClass = !isDarkMode ? "border-slate-200" : "border-white/5";
  const vaultItemClass = !isDarkMode 
    ? "hover:bg-slate-50/50" 
    : "hover:bg-white/[0.03]";
  const orderIdClass = !isDarkMode 
    ? "bg-white/80 border-slate-200 text-slate-600" 
    : "bg-white/5 border-white/10 text-white/70";
  const orderDateClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const orderNameClass = !isDarkMode 
    ? "text-slate-800 group-hover:text-purple-600" 
    : "text-white group-hover:text-purple-400";
  const orderQuantityClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const orderTotalClass = !isDarkMode ? "text-slate-800" : "text-white";
  const emptyIconClass = !isDarkMode ? "text-slate-300" : "text-slate-800";
  const emptyTextClass = !isDarkMode ? "text-slate-400" : "text-slate-600";
  
  const paginationClass = !isDarkMode 
    ? "bg-white/60 backdrop-blur-sm border-slate-200" 
    : "bg-white/5 backdrop-blur-sm border-white/10";
  const paginationButtonClass = !isDarkMode 
    ? "bg-white/80 border-slate-200 text-slate-600 hover:bg-purple-500 hover:text-white hover:border-purple-500" 
    : "bg-white/5 border-white/10 text-slate-400 hover:bg-purple-600 hover:text-white hover:border-purple-600";
  const paginationActiveClass = !isDarkMode 
    ? "bg-purple-500 text-white border-purple-500 shadow-md" 
    : "bg-purple-600 text-white border-purple-600 shadow-md";
  const paginationTextClass = !isDarkMode ? "text-slate-500" : "text-slate-500";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="animate-spin text-purple-500" size={32} />
        <p className={`text-[9px] font-black uppercase tracking-[0.4em] italic ${!isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{t.loading}</p>
      </div>
    );
  }

  const totalSpent = orders.reduce((acc, curr) => acc + (curr.status === 'PAID' ? Number(curr.final_price || 0) : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-10">
      
      {/* --- STATS SUMMARY: COMPACT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-0">
        <div className={`p-5 rounded-[1.5rem] border relative overflow-hidden group ${statsCardClass}`}>
          <TrendingUp size={60} className={`absolute -top-2 -right-2 opacity-5 group-hover:scale-110 transition-transform ${statsIconClass}`} />
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-2 ${statsTextClass}`}>
            <Activity size={10} className="text-emerald-500" /> {t.statInvestment}
          </p>
          <h3 className={`text-xl md:text-2xl font-black italic tracking-tighter mb-2 ${statsValueClass}`}>
            Rp {totalSpent.toLocaleString('id-ID')}
          </h3>
          <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase italic">
            {t.statusPaid}
          </span>
        </div>

        <div className={`p-5 rounded-[1.5rem] border relative overflow-hidden group ${statsCardClass}`}>
          <Clock size={60} className={`absolute -top-2 -right-2 opacity-5 group-hover:scale-110 transition-transform ${statsIconClass}`} />
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${statsTextClass}`}>{t.statAction}</p>
          <h3 className={`text-xl md:text-2xl font-black italic tracking-tighter mb-2 ${statsValueClass}`}>
            {pendingOrdersCount} <span className="text-[10px] font-bold uppercase tracking-normal">Tasks</span>
          </h3>
          <span className="text-[8px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase italic">
            {t.statusPending}
          </span>
        </div>

        <div className={`p-5 rounded-[1.5rem] border relative overflow-hidden group ${!isDarkMode ? 'bg-purple-100/40 border-purple-300/50' : 'bg-purple-950/20 border-purple-500/20'}`}>
          <CreditCard size={60} className={`absolute -top-2 -right-2 opacity-10 group-hover:scale-110 transition-transform text-purple-500 ${statsIconClass}`} />
          <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${!isDarkMode ? 'text-purple-500' : 'text-purple-400/60'}`}>{t.statTotal}</p>
          <h3 className={`text-xl md:text-2xl font-black italic tracking-tighter mb-2 ${statsValueClass}`}>
            {orders.length} <span className="text-[10px] font-bold uppercase tracking-normal">Records</span>
          </h3>
          <span className="text-[8px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase italic">
            {t.statusHistory}
          </span>
        </div>
      </div>

      {/* --- ORDER VAULT LIST: STREAMLINED --- */}
      <div className={`rounded-[2rem] border shadow-xl overflow-hidden mx-2 md:mx-0 ${vaultCardClass}`}>
        <div className={`p-5 md:p-6 border-b flex items-center justify-between ${vaultHeaderClass}`}>
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl shadow-lg ${!isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-950'}`}>
              <History size={18} />
            </div>
            <div>
              <h4 className={`text-sm md:text-base font-black uppercase italic tracking-tighter leading-none ${vaultTitleClass}`}>{t.historyTitle}</h4>
              <p className={`text-[8px] font-bold uppercase tracking-[0.2em] mt-1 ${vaultSubtitleClass}`}>{t.historySub}</p>
            </div>
          </div>
          <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest ${vaultBadgeClass}`}>
            {orders.length} {t.totalFound}
          </span>
        </div>

        <div className={`divide-y ${vaultDividerClass}`}>
          {orders.length === 0 ? (
            <div className="py-20 flex flex-col items-center">
              <ShoppingBag size={40} className={`mb-3 ${emptyIconClass}`} />
              <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${emptyTextClass}`}>{t.empty}</p>
            </div>
          ) : (
            currentOrders.map((order) => {
              const eventName = typeof order.event_name === 'object' 
                ? (order.event_name[lang] || order.event_name['id'] || 'Event Booking') 
                : (order.event_name || 'Event Booking');

              return (
                <div 
                  key={order.id} 
                  onClick={() => handleOrderClick(order)}
                  className={`group p-5 md:p-6 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer relative ${vaultItemClass}`}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* Status Icon */}
                    <div className={`shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:scale-105 shadow-md ${getStatusStyles(order.status)}`}>
                      {getStatusIcon(order.status)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md tracking-tighter border ${orderIdClass}`}>
                            #{String(order.id).substring(0, 8).toUpperCase()}
                          </span>
                          <span className={`text-[8px] font-bold uppercase flex items-center gap-1 ${orderDateClass}`}>
                             <CalendarDays size={10} className="text-purple-500" />
                             {new Date(order.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                      </div>
                      <h5 className={`text-base md:text-lg font-black uppercase italic tracking-tighter transition-colors line-clamp-1 ${orderNameClass}`}>
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
                          <p className={`text-[8px] font-black uppercase tracking-widest ${orderQuantityClass}`}>{Number(order.quantity)} {t.tickets}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 border-t sm:border-t-0 pt-4 sm:pt-0 border-white/5">
                    <div className="sm:text-right">
                      <p className={`text-[8px] font-black uppercase tracking-widest flex items-center sm:justify-end gap-1 mb-0.5 ${orderQuantityClass}`}>
                         <CreditCard size={10} /> {t.totalTrans}
                      </p>
                      <p className={`text-base font-black italic tracking-tighter ${orderTotalClass}`}>
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

        {/* --- PAGINATION --- */}
        {orders.length > 0 && totalPages > 1 && (
          <div className={`p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${vaultHeaderClass}`}>
            <div className={`text-[9px] font-black uppercase tracking-wider ${paginationTextClass}`}>
              {t.page} {currentPage} {t.of} {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <button
                onClick={handleFirstPage}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${paginationButtonClass}`}
              >
                <ChevronsLeft size={16} />
              </button>
              
              {/* Previous Page Button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${paginationButtonClass}`}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1.5">
                {(() => {
                  const maxVisible = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  
                  const pages = [];
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                  
                  return pages.map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-xl border font-black text-xs transition-all duration-300 ${
                        currentPage === page 
                          ? paginationActiveClass
                          : paginationButtonClass
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}
              </div>
              
              {/* Next Page Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${paginationButtonClass}`}
              >
                <ChevronRight size={16} />
              </button>
              
              {/* Last Page Button */}
              <button
                onClick={handleLastPage}
                disabled={currentPage === totalPages}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${paginationButtonClass}`}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding - Minimalist */}
      <div className="flex flex-col items-center gap-2 py-6 opacity-30">
          <ShieldCheck size={16} className="text-slate-500" />
          <p className={`text-[8px] font-black uppercase tracking-[0.4em] italic text-center ${!isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            {t.secure}
          </p>
      </div>
    </div>
  );
};

export default OrderSection;