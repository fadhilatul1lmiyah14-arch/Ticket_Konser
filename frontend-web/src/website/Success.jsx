// Success.jsx - Tambahkan tombol di bagian bawah

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
  Clock,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { QRCodeCanvas } from 'qrcode.react'; 
import api from '../api/axiosConfig'; 
import PremiumBackground from '../components/PremiumBackground';

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState(false);
  
  // --- DARK MODE LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  // Ambil parameter ID dari URL
  const orderIdFromUrl = searchParams.get('external_id') || searchParams.get('order_id');

  // --- 1. PROTEKSI HALAMAN UTAMA ---
  useEffect(() => {
    if (!orderIdFromUrl) {
      navigate('/', { replace: true });
    }
  }, [orderIdFromUrl, navigate]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : false);
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

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
      back_orders: "Kembali ke Pesanan Saya",
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
      back_orders: "Back to My Orders",
      tba: "Details updated shortly"
    }
  };

  const t = translations[currentLang] || translations.id;

  // --- 3. FETCH DATA TIKET ---
  const fetchTicketDetails = useCallback(async (retryCount = 0) => {
    if (!orderIdFromUrl) return;

    try {
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
      if (retryCount < 5) {
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

  // Light mode specific styles
  const textMainClass = !isDarkMode ? "text-slate-800" : "text-white";
  const textMutedClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const borderClass = !isDarkMode ? "border-slate-200" : "border-slate-700";
  const cardClass = !isDarkMode 
    ? "bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl" 
    : "bg-slate-900/60 backdrop-blur-2xl border-slate-700 shadow-2xl";
  const successIconClass = !isDarkMode 
    ? "bg-emerald-100 border-emerald-300" 
    : "bg-emerald-500/10 border-emerald-500/20";
  const successIconColorClass = !isDarkMode ? "text-emerald-600" : "text-emerald-400";
  const gradientTextClass = !isDarkMode 
    ? "from-emerald-600 to-cyan-600 bg-clip-text text-transparent" 
    : "from-emerald-400 to-cyan-400 bg-clip-text text-transparent";
  const orderIdClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const badgeClass = !isDarkMode 
    ? "bg-purple-500 text-white" 
    : "bg-purple-600 text-white";
  const hashLabelClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const hashValueClass = !isDarkMode ? "text-slate-800" : "text-white";
  const eventTitleClass = !isDarkMode ? "text-slate-800" : "text-white";
  const borderDividerClass = !isDarkMode ? "border-slate-200" : "border-slate-700/50";
  const infoLabelClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const dateValueClass = !isDarkMode ? "text-slate-800" : "text-white";
  const gateTimeClass = !isDarkMode ? "text-purple-600" : "text-purple-400";
  const locationValueClass = !isDarkMode ? "text-slate-800" : "text-white";
  const addressClass = !isDarkMode ? "text-slate-500" : "text-slate-400";
  const dottedCircleClass = !isDarkMode 
    ? "bg-white border-slate-200" 
    : "bg-[#020617] border-slate-700";
  const dottedBorderClass = !isDarkMode ? "border-slate-200" : "border-slate-700";
  const qrContainerClass = !isDarkMode 
    ? "bg-white rounded-[2rem] shadow-2xl border-2 border-slate-200" 
    : "bg-white p-4 rounded-[2rem] shadow-2xl print:border-2 print:border-black";
  const ticketCodeClass = !isDarkMode ? "text-slate-800" : "text-white";
  const userBadgeClass = !isDarkMode 
    ? "bg-white/80 backdrop-blur-md border-slate-200 print:border print:border-black print:bg-white" 
    : "bg-slate-800/80 backdrop-blur-md border-slate-700 print:border print:border-black print:bg-white";
  const userIconClass = !isDarkMode ? "text-purple-600 print:text-black" : "text-purple-400 print:text-black";
  const userNameClass = !isDarkMode ? "text-slate-700 print:text-black" : "text-slate-200 print:text-black";
  const ticketTypeClass = !isDarkMode ? "text-purple-600" : "text-purple-400";
  const buttonDownloadClass = !isDarkMode 
    ? "bg-slate-100/80 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-slate-200" 
    : "bg-slate-800/60 backdrop-blur-md border-slate-700 text-white hover:bg-slate-700";
  const buttonPrintClass = !isDarkMode 
    ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white" 
    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white";
  const footerClass = !isDarkMode 
    ? "bg-white/60 border-t border-slate-200" 
    : "bg-black/60 border-t border-slate-800/50";
  const footerTextClass = !isDarkMode ? "text-slate-500 print:text-black" : "text-slate-500 print:text-white";
  const footerIconClass = !isDarkMode ? "text-emerald-600 print:text-black" : "text-emerald-500 print:text-white";
  const backHomeClass = !isDarkMode 
    ? "text-slate-500 hover:text-purple-600" 
    : "text-slate-500 hover:text-white";
  const backOrdersClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 text-slate-700 hover:bg-purple-500 hover:text-white hover:border-purple-500" 
    : "bg-white/5 border-white/10 text-white/80 hover:bg-purple-600 hover:text-white";

  // --- 5. RENDER LOGIC ---

  if (loading && orderIdFromUrl) {
    return (
      <MainLayout>
        <PremiumBackground isLightMode={!isDarkMode}>
          <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="animate-spin text-purple-500 mb-8" size={48} />
            <h2 className={`font-black uppercase italic tracking-widest ${textMainClass}`}>{t.validating}</h2>
            <p className={`text-[10px] uppercase mt-2 ${textMutedClass}`}>{t.no_refresh}</p>
          </div>
        </PremiumBackground>
      </MainLayout>
    );
  }

  if (error || !orderIdFromUrl) {
    return (
      <MainLayout>
        <PremiumBackground isLightMode={!isDarkMode}>
          <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-6 text-center">
            <AlertCircle size={64} className="text-red-500 mb-6" />
            <h2 className={`text-2xl font-black uppercase italic mb-4 ${textMainClass}`}>{t.pending_title}</h2>
            <p className={`text-sm mb-8 max-w-sm ${textMutedClass}`}>{t.pending_desc}</p>
            <button 
              onClick={() => navigate('/dashboard/tickets')} 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              {t.btn_my_tickets}
            </button>
          </div>
        </PremiumBackground>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PremiumBackground isLightMode={!isDarkMode}>
        <div className="bg-transparent min-h-screen py-8 md:py-12 px-4 print:bg-white print:p-0">
          <main className="max-w-2xl mx-auto">
            
            {/* HEADER - SEMBUNYIKAN SAAT CETAK */}
            <div className="text-center mb-10 print:hidden">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border mb-6 backdrop-blur-md ${successIconClass}`}>
                <CheckCircle2 size={32} className={successIconColorClass} />
              </div>
              <h1 className={`text-3xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-3 ${textMainClass}`}>
                {t.pay_success} <span className={`bg-gradient-to-r bg-clip-text text-transparent ${gradientTextClass}`}>{t.pay_secured}</span>
              </h1>
              <p className={`font-bold uppercase tracking-widest text-[10px] ${orderIdClass}`}>ORDER ID: {orderIdFromUrl}</p>
            </div>

            <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className={`relative rounded-[2.5rem] overflow-hidden border shadow-2xl print:shadow-none print:border-black print:rounded-none ${cardClass}`}>
                
                <div className="p-8 md:p-12 pb-6 print:text-black">
                  <div className="flex justify-between items-start mb-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest print:bg-black ${badgeClass}`}>
                      {t.official_tag}
                    </span>
                    <div className="text-right">
                      <p className={`text-[8px] font-bold uppercase ${hashLabelClass}`}>HASH</p>
                      <p className={`font-mono text-[10px] print:text-black ${hashValueClass}`}>{orderIdFromUrl?.substring(0, 12)}...</p>
                    </div>
                  </div>

                  <h2 className={`text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-8 leading-none print:text-black ${eventTitleClass}`}>
                    {getTranslation(ticketData?.event_name) || "EXCLUSIVE EVENT"}
                  </h2>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 border-y py-6 print:border-black ${borderDividerClass}`}>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 ${infoLabelClass} print:text-black`}>
                        <Calendar size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.date_label}</span>
                      </div>
                      <p className={`font-black text-sm uppercase print:text-black ${dateValueClass}`}>{formatDate(ticketData?.event_date)}</p>
                      <p className={`font-bold text-xs italic flex items-center gap-1 ${gateTimeClass}`}>
                        <Clock size={10} /> {t.gate_label} {ticketData?.start_time?.substring(0,5) || "18:00"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 ${infoLabelClass} print:text-black`}>
                        <MapPin size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t.venue_label}</span>
                      </div>
                      <p className={`font-black text-sm uppercase print:text-black truncate ${locationValueClass}`}>{getTranslation(ticketData?.location) || "Venue"}</p>
                      <p className={`font-bold text-[10px] italic print:text-black line-clamp-1 ${addressClass}`}>{getTranslation(ticketData?.address) || t.tba}</p>
                    </div>
                  </div>
                </div>

                {/* Dotted Line */}
                <div className="relative h-6 flex items-center justify-between print:block print:h-auto print:border-t print:border-dashed print:border-black print:my-2">
                  <div className={`w-10 h-10 rounded-full border -ml-5 print:hidden ${dottedCircleClass} ${dottedBorderClass}`}></div>
                  <div className={`flex-1 border-t-2 border-dashed mx-2 print:border-t print:border-black print:mx-0 ${dottedBorderClass} print:border-black`}></div>
                  <div className={`w-10 h-10 rounded-full border -mr-5 print:hidden ${dottedCircleClass} ${dottedBorderClass}`}></div>
                </div>

                <div className={`p-8 md:p-12 pt-4 ${!isDarkMode ? 'bg-white/40' : 'bg-black/40'} print:bg-white`}>
                  <div className="flex flex-col items-center">
                    <div className={qrContainerClass}>
                      <QRCodeCanvas id="qr-code-canvas" value={ticketData?.ticket_code || "VOID"} size={180} level="H" />
                    </div>
                    <div className="mt-8 text-center">
                      <p className={`font-mono text-2xl md:text-4xl font-black tracking-[0.4em] mb-4 print:text-black ${ticketCodeClass}`}>
                        {ticketData?.ticket_code || "--------"}
                      </p>
                      <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border print:border print:border-black print:bg-white ${userBadgeClass}`}>
                        <User size={14} className={userIconClass} />
                        <span className={`text-[11px] font-black uppercase tracking-widest print:text-black ${userNameClass}`}>
                          {ticketData?.customer_name} — <span className={ticketTypeClass}>{ticketData?.ticket_type}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* BUTTONS - SEMBUNYIKAN SAAT CETAK */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-12 print:hidden">
                    <button onClick={downloadQRCode} className={`flex-1 flex items-center justify-center gap-3 text-[11px] font-black uppercase backdrop-blur-md border py-4 rounded-2xl transition-all active:scale-95 ${buttonDownloadClass}`}>
                      <Download size={18} /> {t.save_img}
                    </button>
                    <button onClick={() => window.print()} className={`flex-1 flex items-center justify-center gap-3 text-[11px] font-black uppercase py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-all active:scale-95 ${buttonPrintClass}`}>
                      <Printer size={18} /> {t.print_pass}
                    </button>
                  </div>
                </div>

                {/* FOOTER - TETAP TAMPAK SAAT CETAK */}
                <div className={`py-4 px-10 border-t flex justify-between items-center print:bg-white print:border-black ${footerClass}`}>
                  <p className={`text-[8px] font-black uppercase tracking-widest print:text-black ${footerTextClass}`}>{t.footer_tag}</p>
                  <ShieldCheck size={16} className={`print:text-black ${footerIconClass}`} />
                </div>
              </div>
            </div>

            {/* BACK BUTTONS - SEMBUNYIKAN SAAT CETAK */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 print:hidden">
              {/* Tombol Kembali ke Dashboard Orders (BARU) */}
              <button 
                onClick={() => navigate('/dashboard/orders')} 
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all group border ${backOrdersClass}`}
              >
                <LayoutDashboard size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                {t.back_orders}
              </button>
              
              {/* Tombol Kembali ke Home */}
              <button 
                onClick={() => navigate('/')} 
                className={`inline-flex items-center gap-3 font-black uppercase tracking-widest text-[10px] transition-all group ${backHomeClass}`}
              >
                <HomeIcon size={16} className="group-hover:-translate-y-1 transition-transform" /> 
                {t.back_home}
              </button>
            </div>
          </main>
        </div>

        <style>{`
          @media print {
            /* Sembunyikan semua elemen yang tidak diperlukan saat cetak */
            header, 
            nav, 
            footer:not(.print\\:block), 
            .print\\:hidden,
            button,
            .fixed,
            [class*="fixed"],
            [class*="absolute"]:not(.print\\:block) {
              display: none !important;
            }
            
            /* Sembunyikan tombol theme toggle saat cetak */
            .fixed.bottom-8.right-8,
            button[class*="fixed"],
            .z-\\[100\\] {
              display: none !important;
            }
            
            /* Reset background dan warna untuk cetak */
            body, 
            html,
            .bg-transparent,
            .min-h-screen {
              background: white !important;
              background-color: white !important;
            }
            
            /* Pastikan konten utama terlihat */
            main, 
            .max-w-2xl,
            .relative,
            .rounded-\\[2\\.5rem\\] {
              background: white !important;
              color: black !important;
            }
            
            /* Warna teks menjadi hitam saat cetak */
            .print\\:text-black,
            .print\\:text-black * {
              color: black !important;
            }
            
            /* Border menjadi hitam saat cetak */
            .print\\:border-black,
            .print\\:border-black * {
              border-color: black !important;
            }
            
            /* Background putih untuk container QR */
            .print\\:bg-white {
              background: white !important;
            }
            
            /* Maksimalkan ukuran kontainer */
            .max-w-2xl {
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Hilangkan shadow dan efek blur saat cetak */
            .shadow-2xl,
            .shadow-xl,
            .backdrop-blur-2xl,
            .backdrop-blur-md,
            .backdrop-blur-xl {
              box-shadow: none !important;
              backdrop-filter: none !important;
            }
            
            /* QR Code tetap terlihat */
            canvas {
              display: block !important;
              margin: 0 auto !important;
            }
          }
        `}</style>
      </PremiumBackground>
    </MainLayout>
  );
};

export default Success;