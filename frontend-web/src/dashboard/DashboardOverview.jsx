import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import api from "../api/axiosConfig"; 
import { 
  Ticket, 
  ShoppingBag, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Activity,
  Loader2,
  TrendingUp,
  Zap
} from "lucide-react";

const DashboardOverview = () => {
  const { userData } = useOutletContext();
  
  const [dataStats, setDataStats] = useState({
    totalTickets: 0,
    activeOrders: 0,
    pendingPayments: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

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
      console.error("Dashboard Stats Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700 p-2 md:p-4">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Dashboard</h2>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">
            Plan, track, and enjoy your events with ease.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 self-start sm:self-center">
           <div className="bg-purple-600 p-2 rounded-xl text-white">
              <Zap size={18} fill="currentColor" />
           </div>
           <div className="pr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Status Akun</p>
              <p className="text-xs font-black text-slate-900 uppercase italic">Official Member</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <StatCard 
              label="Total Tiket" 
              value={dataStats.totalTickets} 
              icon={<Ticket />} 
              color="text-purple-600" 
              bgColor="bg-purple-600"
              loading={loading}
            />
            <StatCard 
              label="Pesanan Lunas" 
              value={dataStats.activeOrders} 
              icon={<TrendingUp />} 
              color="text-emerald-500" 
              bgColor="bg-emerald-500"
              loading={loading}
            />
            <StatCard 
              label="Pending" 
              value={dataStats.pendingPayments} 
              icon={<Clock />} 
              color="text-amber-500" 
              bgColor="bg-amber-500"
              loading={loading}
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          {/* Large Welcome Banner */}
          <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white shadow-2xl shadow-purple-900/20">
            <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10 rotate-12 pointer-events-none">
              <Sparkles className="w-32 h-32 md:w-44 md:h-44 lg:w-64 lg:h-64" />
            </div>
            <div className="relative z-10 space-y-4 md:space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-md border border-white/10">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Verified Account</span>
              </div>
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-tight md:leading-none">
                Halo, {userData?.name?.split(' ')[0] || "User"}!
              </h3>
              <p className="text-slate-400 font-medium max-w-md text-xs md:text-sm leading-relaxed italic">
                Cek koleksi tiketmu atau temukan konser musik dan event seru lainnya yang akan datang.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/events" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-900 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-purple-500 hover:text-white transition-all group">
                  Cari Event Baru <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          
          {/* Recent Activity */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 md:mb-8">
               <div className="flex items-center gap-3">
                  <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg">
                    <Activity size={18} />
                  </div>
                  <h4 className="font-black text-slate-900 uppercase italic tracking-tighter text-base md:text-lg">Aktivitas</h4>
               </div>
               <Link to="/dashboard/orders" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <ArrowRight size={18} className="text-slate-400" />
               </Link>
            </div>

            <div className="space-y-6 flex-1">
              {loading ? (
                <div className="flex justify-center py-12 md:py-20"><Loader2 className="animate-spin text-purple-600" /></div>
              ) : dataStats.recentActivity.length > 0 ? (
                dataStats.recentActivity.map((activity, idx) => (
                  <div key={idx} className="group relative pl-6 border-l-2 border-slate-100 hover:border-purple-500 transition-colors pb-2">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-slate-200 rounded-full group-hover:border-purple-500 transition-colors" />
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                       {activity.created_at ? new Date(activity.created_at).toLocaleDateString() : 'Baru saja'}
                    </p>
                    <p className="text-xs md:text-sm font-black text-slate-800 uppercase italic tracking-tight line-clamp-1">
                       {activity.event_name || (activity.id ? `Order #${activity.id.slice(0, 5)}` : 'Order Baru')}
                    </p>
                    <div className={`inline-block mt-2 px-2 md:px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase ${
                      activity.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center opacity-40 grayscale">
                  <ShoppingBag size={40} className="mb-4 text-slate-300" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Belum ada aktivitas</p>
                </div>
              )}
            </div>

            {/* Bottom decorative card */}
            <div className="mt-6 md:mt-8 p-5 md:p-6 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[1.5rem] md:rounded-[2rem] text-white overflow-hidden relative group">
               <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                  <Zap size={80} md:size={100} fill="currentColor" />
               </div>
               <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Exclusive Offer</p>
               <p className="text-xs md:text-sm font-black italic uppercase leading-tight">Dapatkan diskon 10% untuk event perdana!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bgColor, loading, className }) => (
  <div className={`bg-white p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl ${bgColor} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="bg-slate-50 p-1.5 rounded-lg">
        <TrendingUp size={12} className={color} />
      </div>
    </div>
    <div>
      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-3xl md:text-4xl font-black text-slate-900 italic tracking-tighter leading-none">
          {loading ? "..." : value}
        </h4>
        <span className="text-[9px] md:text-[10px] font-bold text-slate-300 uppercase italic">Total</span>
      </div>
    </div>
  </div>
);

export default DashboardOverview;