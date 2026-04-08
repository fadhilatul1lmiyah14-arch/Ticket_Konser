import React, { useState, useEffect, useMemo } from "react";
import { useOutletContext, Link } from "react-router-dom";
import api from "../api/axiosConfig"; 
import { 
  Ticket, ShoppingBag, Clock, ArrowRight, Sparkles,
  Activity, Loader2, TrendingUp, Zap
} from "lucide-react";

const DashboardOverview = () => {
  // Ambil context. Pastikan lang didefinisikan, jika tidak default ke "id"
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

  // Pakai useMemo untuk mencegah re-render object yang tidak perlu
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
        offerTitle: "Penawaran Eksklusif",
        offerDesc: "Dapatkan diskon 10% untuk event perdana!",
        totalLabel: "Total"
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
        offerTitle: "Exclusive Offer",
        offerDesc: "Get 10% discount for your first event!",
        totalLabel: "Total"
      }
    };
    return translations[lang] || translations.id;
  }, [lang]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
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
          activeOrders: orders.filter(o => o.status === "PAID").length,
          pendingPayments: orders.filter(o => o.status === "PENDING").length,
          recentActivity: orders.slice(0, 4) 
        });
      } catch (error) {
        console.error("Stats Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic">{t.title}</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <div className="bg-purple-600 p-2 rounded-xl text-white"><Zap size={18} fill="currentColor" /></div>
            <div className="pr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase">{t.accountStatus}</p>
              <p className="text-xs font-black text-slate-900 uppercase italic">{t.memberType}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label={t.statTickets} value={dataStats.totalTickets} icon={<Ticket />} color="text-purple-600" bgColor="bg-purple-600" loading={loading} totalLabel={t.totalLabel} />
            <StatCard label={t.statPaid} value={dataStats.activeOrders} icon={<TrendingUp />} color="text-emerald-500" bgColor="bg-emerald-500" loading={loading} totalLabel={t.totalLabel} />
            <StatCard label={t.statPending} value={dataStats.pendingPayments} icon={<Clock />} color="text-amber-500" bgColor="bg-amber-500" loading={loading} totalLabel={t.totalLabel} />
          </div>

          {/* Banner */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] font-black uppercase tracking-widest">{t.verified}</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
                {t.welcome} {userData?.name?.split(' ')[0] || "User"}!
              </h3>
              <p className="text-slate-400 max-w-md text-sm italic">{t.bannerText}</p>
              <Link to="/events" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-purple-500 hover:text-white transition-all">
                {t.findEvent} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-slate-900 p-2 rounded-xl text-white"><Activity size={18} /></div>
              <h4 className="font-black text-slate-900 uppercase italic text-lg">{t.activity}</h4>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-600" /></div>
              ) : dataStats.recentActivity.length > 0 ? (
                dataStats.recentActivity.map((act, i) => (
                  <div key={i} className="pl-6 border-l-2 border-slate-100 relative">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-slate-200 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">
                      {act.created_at ? new Date(act.created_at).toLocaleDateString() : t.justNow}
                    </p>
                    {/* PERBAIKAN: Pastikan ini string */}
                    <p className="text-sm font-black text-slate-800 uppercase italic line-clamp-1">
                      {typeof act.event_name === 'string' ? act.event_name : `Order #${act.id?.slice(0,5)}`}
                    </p>
                    <div className="inline-block mt-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                      {String(act.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 opacity-30">
                  <p className="text-[10px] font-black uppercase">{t.noActivity}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bgColor, loading, totalLabel }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${bgColor} text-white`}>{React.cloneElement(icon, { size: 18 })}</div>
      <TrendingUp size={12} className={color} />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{String(label)}</p>
    <div className="flex items-baseline gap-2">
      <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter">{loading ? "..." : value}</h4>
      <span className="text-[10px] font-bold text-slate-300 uppercase italic">{String(totalLabel)}</span>
    </div>
  </div>
);

export default DashboardOverview;