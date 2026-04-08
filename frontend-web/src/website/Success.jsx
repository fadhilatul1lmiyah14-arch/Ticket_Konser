import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  Download, 
  Home as HomeIcon, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  Printer, 
  Calendar, 
  MapPin, 
  User, 
  Clock 
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { QRCodeCanvas } from 'qrcode.react'; 
import api from '../api/axiosConfig'; 

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState(false);
  
  // Ambil parameter ID dari URL
  const orderIdFromUrl = searchParams.get('external_id') || searchParams.get('order_id');

  // --- 1. PROTEKSI HALAMAN UTAMA ---
  // Jika file ini terpanggil tanpa ID (misal user iseng buka /payment-success), 
  // langsung lempar ke halaman utama agar tidak muncul layar error "Verifikasi Tertunda".
  useEffect(() => {
    if (!orderIdFromUrl) {
      navigate('/', { replace: true });
    }
  }, [orderIdFromUrl, navigate]);

  // --- 2. SISTEM BAHASA ---
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');

  useEffect(() => {
    const handleLangChange = () => {
      setCurrentLang(localStorage.getItem('lang') || 'id');
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

  const translations = {
    id: {
      validating: "Memvalidasi Pembayaran...",
      no_refresh: "Mohon jangan muat ulang halaman ini",
      pending_title: "Verifikasi Tertunda",
      pending_desc: "Pembayaran terdeteksi tetapi tiket belum siap. Silakan cek dashboard dalam beberapa saat.",
      btn_my_tickets: "Ke Tiket Saya",
      pay_success: "PEMBAYARAN",
      pay_secured: "BERHASIL",
      official_tag: "Izin Masuk Resmi",
      date_label: "Tanggal & Waktu",
      gate_label: "Gerbang Dibuka",
      venue_label: "Lokasi & Alamat",
      save_img: "Simpan Gambar",
      print_pass: "Cetak Tiket",
      footer_tag: "BERLAKU UNTUK 1 ORANG • AMAN DENGAN RALY TICKET",
      back_home: "Kembali Jelajah",
      tba: "Detail segera diperbarui"
    },
    en: {
      validating: "Validating Payment...",
      no_refresh: "Please do not refresh this page",
      pending_title: "Verification Pending",
      pending_desc: "Payment detected but ticket is not yet ready. Please check dashboard in a few moments.",
      btn_my_tickets: "Go to My Tickets",
      pay_success: "PAYMENT",
      pay_secured: "SECURED",
      official_tag: "Official Admission",
      date_label: "Date & Time",
      gate_label: "Gate Opens",
      venue_label: "Venue & Address",
      save_img: "Save Image",
      print_pass: "Print Pass",
      footer_tag: "VALID FOR 1 PERSON • SECURED BY RALY TICKET",
      back_home: "Back to Explore",
      tba: "Details updated shortly"
    }
  };

  const t = translations[currentLang] || translations.id;

  // --- 3. FETCH DATA TIKET ---
  const fetchTicketDetails = useCallback(async (retryCount = 0) => {
    if (!orderIdFromUrl) return;

    try {
      // Sesuaikan endpoint dengan API kamu (biasanya detail per ID)
      const response = await api.get(`/customer/my-tickets/${orderIdFromUrl}`);
      const result = response.data;
      const data = result.data || result;

      if (data) {
        setTicketData(Array.isArray(data) ? data[0] : data);
        setLoading(false);
        setError(false);
      } else {
        throw new Error("Empty data");
      }
    } catch (err) {
      if (retryCount < 5) { // Coba lagi maksimal 5 kali (setiap 3 detik)
        setTimeout(() => fetchTicketDetails(retryCount + 1), 3000);
      } else {
        setLoading(false);
        setError(true);
      }
    }
  }, [orderIdFromUrl]);

  useEffect(() => {
    if (orderIdFromUrl) {
      fetchTicketDetails();
    }
  }, [orderIdFromUrl, fetchTicketDetails]);

  // --- 4. FORMATTERS & ACTIONS ---
  const getTranslation = (val) => {
    if (!val) return "";
    if (typeof val === 'object') return val[currentLang] || val['id'] || "";
    try {
      const parsed = JSON.parse(val);
      return parsed[currentLang] || parsed['id'] || val;
    } catch { return val; }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    return new Date(dateString).toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `TICKET-${orderIdFromUrl}.png`;
    link.click();
  };

  // --- 5. RENDER LOGIC ---

  // Jika sedang loading
  if (loading && orderIdFromUrl) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
          <Loader2 className="animate-spin text-purple-500 mb-8" size={48} />
          <h2 className="text-white font-black uppercase italic tracking-widest">{t.validating}</h2>
          <p className="text-slate-500 text-[10px] uppercase mt-2">{t.no_refresh}</p>
        </div>
      </MainLayout>
    );
  }

  // Jika error atau tidak ada ID
  if (error || !orderIdFromUrl) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-6 text-center">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h2 className="text-2xl font-black text-white uppercase italic mb-4">{t.pending_title}</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-sm">{t.pending_desc}</p>
          <button 
            onClick={() => navigate('/dashboard/tickets')} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            {t.btn_my_tickets}
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#020617] min-h-screen py-8 md:py-12 px-4 print:bg-white print:p-0">
        <main className="max-w-2xl mx-auto">
          
          <div className="text-center mb-10 print:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
              {t.pay_success} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{t.pay_secured}</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">ORDER ID: {orderIdFromUrl}</p>
          </div>

          <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative bg-[#1e293b] rounded-[2.5rem] overflow-hidden border border-slate-700 shadow-2xl print:shadow-none print:border-black print:rounded-none">
              
              <div className="p-8 md:p-12 pb-6 print:text-black">
                <div className="flex justify-between items-start mb-8">
                  <span className="px-4 py-1.5 bg-purple-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest print:bg-black">
                    {t.official_tag}
                  </span>
                  <div className="text-right">
                    <p className="text-slate-500 text-[8px] font-bold uppercase">HASH</p>
                    <p className="text-white font-mono text-[10px] print:text-black">{orderIdFromUrl?.substring(0, 12)}...</p>
                  </div>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none print:text-black">
                  {getTranslation(ticketData?.event_name) || "EXCLUSIVE EVENT"}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-y border-slate-700/50 py-6 print:border-black">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 print:text-black">
                      <Calendar size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.date_label}</span>
                    </div>
                    <p className="text-white font-black text-sm uppercase print:text-black">{formatDate(ticketData?.event_date)}</p>
                    <p className="text-purple-400 font-bold text-xs italic flex items-center gap-1">
                      <Clock size={10} /> {t.gate_label} {ticketData?.start_time?.substring(0,5) || "18:00"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 print:text-black">
                      <MapPin size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t.venue_label}</span>
                    </div>
                    <p className="text-white font-black text-sm uppercase print:text-black truncate">{getTranslation(ticketData?.location) || "Venue"}</p>
                    <p className="text-slate-400 font-bold text-[10px] italic print:text-black line-clamp-1">{getTranslation(ticketData?.address) || t.tba}</p>
                  </div>
                </div>
              </div>

              {/* Dotted Line */}
              <div className="relative h-6 flex items-center justify-between px-[-20px]">
                <div className="w-10 h-10 rounded-full bg-[#020617] -ml-5 border border-slate-700 print:bg-white print:border-black"></div>
                <div className="flex-1 border-t-2 border-dashed border-slate-700 mx-2 print:border-black"></div>
                <div className="w-10 h-10 rounded-full bg-[#020617] -mr-5 border border-slate-700 print:bg-white print:border-black"></div>
              </div>

              <div className="p-8 md:p-12 pt-4 bg-[#161e2e] print:bg-white">
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-[2rem] shadow-2xl print:border-2 print:border-black">
                    <QRCodeCanvas id="qr-code-canvas" value={ticketData?.ticket_code || "VOID"} size={180} level="H" />
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-white font-mono text-2xl md:text-4xl font-black tracking-[0.4em] mb-4 print:text-black">
                      {ticketData?.ticket_code || "--------"}
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-800 rounded-full print:border print:border-black print:bg-white">
                      <User size={14} className="text-purple-400 print:text-black" />
                      <span className="text-[11px] font-black text-slate-200 uppercase tracking-widest print:text-black">
                        {ticketData?.customer_name} — <span className="text-purple-400">{ticketData?.ticket_type}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-12 print:hidden">
                  <button onClick={downloadQRCode} className="flex-1 flex items-center justify-center gap-3 text-[11px] font-black uppercase text-white bg-slate-800 border border-slate-700 py-4 rounded-2xl hover:bg-slate-700 transition-all active:scale-95">
                    <Download size={18} /> {t.save_img}
                  </button>
                  <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-3 text-[11px] font-black uppercase text-white bg-gradient-to-r from-purple-600 to-indigo-600 py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-all active:scale-95">
                    <Printer size={18} /> {t.print_pass}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/80 py-4 px-10 border-t border-slate-800/50 flex justify-between items-center print:bg-black">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest print:text-white">{t.footer_tag}</p>
                <ShieldCheck size={16} className="text-emerald-500 print:text-white" />
              </div>
            </div>
          </div>

          <div className="mt-12 text-center print:hidden">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all group">
              <HomeIcon size={16} className="group-hover:-translate-y-1 transition-transform" /> 
              {t.back_home}
            </button>
          </div>
        </main>
      </div>

      <style>{`
        @media print {
          header, nav, footer, .print\\:hidden { display: none !important; }
          body { background: white !important; }
          .max-w-2xl { max-width: 100% !important; }
        }
      `}</style>
    </MainLayout>
  );
};

export default Success;