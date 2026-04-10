import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext, Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig"; 
import { 
  Ticket, ShoppingBag, Clock, ArrowRight, 
  Activity, Loader2, TrendingUp, Zap
} from "lucide-react";

const DashboardOverview = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const lang = context?.lang || "id";
  const userData = context?.userData || null;
  
  const [dataStats, setDataStats] = useState({
    totalTickets: 0,
    activeOrders: 0,
    pendingPayments: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const formatEventName = (nameData) => {
    if (!nameData) return "Unnamed Event";
    try {
      const parsed = typeof nameData === 'string' ? JSON.parse(nameData) : nameData;
      return parsed[lang] || parsed.id || parsed.en || "Unnamed Event";
    } catch (e) {
      return String(nameData);
    }
  };

  const t = useMemo(() => {
    const translations = {
      id: {
        title: "Ringkasan",
        subtitle: "Rencanakan, lacak, dan nikmati event Anda dengan mudah.",
        accountStatus: "Status Akun",
        memberType: "Member Resmi",
        statTickets: "Total Tiket",
        statPaid: "Pesanan Lunas",
        statPending: "Pending",
        welcome: "Halo,",
        verified: "Akun Terverifikasi",
        bannerText: "Cek koleksi tiketmu atau temukan konser musik dan event seru lainnya yang akan datang.",
        findEvent: "Cari Event Baru",
        activity: "Aktivitas",
        noActivity: "Belum ada aktivitas",
        justNow: "Baru saja",
        totalLabel: "Total",
        loadingText: "Memuat Data..."
      },
      en: {
        title: "Overview",
        subtitle: "Plan, track, and enjoy your events with ease.",
        accountStatus: "Account Status",
        memberType: "Official Member",
        statTickets: "Total Tickets",
        statPaid: "Paid Orders",
        statPending: "Pending",
        welcome: "Hello,",
        verified: "Verified Account",
        bannerText: "Check your ticket collection or find exciting music concerts and other upcoming events.",
        findEvent: "Find New Events",
        activity: "Activity",
        noActivity: "No activity yet",
        justNow: "Just now",
        totalLabel: "Total",
        loadingText: "Loading Data..."
      }
    };
    return translations[lang] || translations.id;
  }, [lang]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }

      try {
        setLoading(true);
        const [ticketsRes, ordersRes] = await Promise.allSettled([
          api.get("/customer/tickets"), 
          api.get("/customer/orders")    
        ]);

        const tickets = ticketsRes.status === 'fulfilled' ? (ticketsRes.value.data?.data || []) : [];
        const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.data || []) : [];

        setDataStats({
          totalTickets: tickets.length,
          activeOrders: orders.filter(o => ["PAID", "SUCCESS", "COMPLETED"].includes(o.status)).length,
          pendingPayments: orders.filter(o => ["PENDING", "UNPAID"].includes(o.status)).length,
          recentActivity: orders.slice(0, 5)
        });
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      
      {/* Header Section - Premium Glass */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white uppercase italic leading-none">{t.title}</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 bg-black/20 p-2 pr-5 rounded-2xl border border-white/5">
            <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-600/20">
              <Zap size={18} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">{t.accountStatus}</p>
              <p className="text-xs font-black text-white uppercase italic leading-none">{t.memberType}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label={t.statTickets} value={dataStats.totalTickets} icon={<Ticket />} color="text-purple-400" bgColor="bg-purple-600" loading={loading} totalLabel={t.totalLabel} />
            <StatCard label={t.statPaid} value={dataStats.activeOrders} icon={<TrendingUp />} color="text-emerald-400" bgColor="bg-emerald-500" loading={loading} totalLabel={t.totalLabel} />
            <StatCard label={t.statPending} value={dataStats.pendingPayments} icon={<Clock />} color="text-amber-400" bgColor="bg-amber-500" loading={loading} totalLabel={t.totalLabel} />
          </div>

          {/* Banner Welcome - Deep Glass */}
          <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden border border-white/10 shadow-2xl group">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">{t.verified}</span>
              </div>
              
              <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
                {t.welcome} <br />
                <span className="text-purple-500">{userData?.name?.split(' ')[0] || "User"}!</span>
              </h3>
              
              <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
                {t.bannerText}
              </p>

              <div className="pt-4">
                <Link to="/events" className="inline-flex items-center gap-3 bg-purple-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-purple-900 transition-all shadow-xl active:scale-95">
                  {t.findEvent} <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-purple-600/20 rounded-full blur-[120px] group-hover:bg-purple-500/30 transition-colors" />
            <div className="absolute bottom-[-10%] left-[20%] w-40 h-40 bg-blue-500/10 rounded-full blur-[80px]" />
          </div>
        </div>

        {/* Right Column (Recent Activity) */}
        <div className="lg:col-span-4">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-600/20"><Activity size={18} /></div>
                <h4 className="font-black text-white uppercase italic text-xl tracking-tight">{t.activity}</h4>
              </div>
            </div>

            <div className="space-y-8 relative">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="text-purple-500 animate-spin" size={32} />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.loadingText}</p>
                </div>
              ) : dataStats.recentActivity.length > 0 ? (
                dataStats.recentActivity.map((act, i) => (
                  <div key={act.id || i} className="pl-8 border-l-2 border-white/5 relative group pb-2">
                    {/* Dot on timeline */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-900 border-2 border-slate-700 rounded-full group-hover:border-purple-500 group-hover:bg-purple-500 group-hover:scale-125 transition-all duration-300" />
                    
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-wider">
                      {act.created_at ? new Date(act.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' }) : t.justNow}
                    </p>
                    
                    <p className="text-sm font-black text-white uppercase italic line-clamp-1 group-hover:text-purple-400 transition-colors">
                      {formatEventName(act.event?.title || act.event_name || `Order #${String(act.id).slice(-5)}`)}
                    </p>
                    
                    <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                      ["PAID", "SUCCESS", "COMPLETED"].includes(act.status) 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : act.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-slate-400'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${["PAID", "SUCCESS"].includes(act.status) ? 'bg-emerald-400' : 'bg-current'}`} />
                      {act.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-24 opacity-20 flex flex-col items-center gap-4">
                  <div className="p-6 bg-white/5 rounded-full">
                    <ShoppingBag size={48} className="text-white" strokeWidth={1.5} />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{t.noActivity}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-komponen StatCard Premium
const StatCard = ({ label, value, icon, color, bgColor, loading, totalLabel }) => (
  <div className="bg-white/5 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/10 shadow-xl hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl ${bgColor} text-white shadow-lg shadow-black/20`}>
          {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-white transition-colors">
           <ArrowRight size={14} className="-rotate-45" />
        </div>
      </div>
      
      <p className="text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">{label}</p>
      
      <div className="flex items-baseline gap-2">
        <h4 className="text-4xl font-black text-white italic tracking-tighter">
          {loading ? "..." : value}
        </h4>
        <span className="text-[10px] font-bold text-slate-600 uppercase italic tracking-tighter">{totalLabel}</span>
      </div>
    </div>

    {/* Decorative background shape */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${bgColor} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
  </div>
);

export default DashboardOverview;