import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, AlertCircle, Loader2, ArrowLeft, CreditCard, Smartphone, CheckCircle2 
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../api/axiosConfig'; 
import PremiumBackground from '../components/PremiumBackground';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- DARK MODE LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  // --- LOGIKA MULTI-BAHASA ---
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      setIsDarkMode(savedTheme ? savedTheme === 'dark' : false);
    };
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(localStorage.getItem('lang') || 'id');
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const t = useMemo(() => ({
    finalCheckout: currentLang === 'id' ? 'FINAL CHECKOUT' : 'PEMBAYARAN AKHIR',
    orderId: currentLang === 'id' ? 'ID PESANAN' : 'ORDER ID',
    eventSummary: currentLang === 'id' ? 'Ringkasan Event' : 'Event Summary',
    quantity: currentLang === 'id' ? 'Jumlah' : 'Quantity',
    securityTitle: currentLang === 'id' ? 'TRANSAKSI AMAN' : 'SECURE TRANSACTION',
    securityDesc: currentLang === 'id' ? 'Pembayaran Anda diproses melalui gateway terenkripsi keamanan tinggi.' : 'Your payment is processed through a high-security encrypted gateway.',
    grandTotal: currentLang === 'id' ? 'Total Bayar' : 'Grand Total',
    buyerInfo: currentLang === 'id' ? 'Informasi Pembeli' : 'Buyer Information',
    accHolder: currentLang === 'id' ? 'Pemilik Akun' : 'Account Holder',
    payNow: currentLang === 'id' ? 'BAYAR SEKARANG' : 'PAY SECURELY',
    processing: currentLang === 'id' ? 'MEMPROSES...' : 'PROCESSING...',
    deliveryNote: currentLang === 'id' ? 'Pengiriman instan. E-Tiket tersedia di dashboard setelah pembayaran.' : 'Instant delivery. E-Ticket available in dashboard after payment.'
  }), [currentLang]);

  // --- LOGIKA DATA CHECKOUT ---
  const [bookingData, setBookingData] = useState(() => {
    const stateData = location.state?.booking;
    if (stateData) {
      localStorage.setItem('active_checkout', JSON.stringify(stateData));
      return stateData;
    }
    const savedData = localStorage.getItem('active_checkout');
    try {
        return savedData ? JSON.parse(savedData) : null;
    } catch (e) {
        return null;
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!bookingData || !bookingData.order_id) {
      const timer = setTimeout(() => navigate('/events'), 1500);
      return () => clearTimeout(timer);
    }
    
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setBuyerInfo({
      fullName: savedUser.name || 'Customer',
      email: savedUser.email || '-',
      phone: savedUser.phone || 'Belum diatur'
    });
  }, [bookingData, navigate]);

  const handlePayNow = async () => {
    if (isProcessing) return;
    
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/payments/create-invoice', 
        { order_id: String(bookingData.order_id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = response.data;

      if (result.status === "success" && result.data?.payment_url) {
        localStorage.removeItem('active_checkout');
        setTimeout(() => {
          window.location.href = result.data.payment_url;
        }, 500);
      } else {
        throw new Error(result.message || (currentLang === 'id' ? "Gagal mendapatkan link pembayaran." : "Failed to get payment link."));
      }
    } catch (error) {
      console.error("Payment Error:", error);
      let errorMsg = "Payment gateway connection failed.";
      if (error.response) {
        errorMsg = error.response.data?.message || error.message;
      } else {
        errorMsg = error.message;
      }
      setErrorMessage(errorMsg);
      setIsProcessing(false);
    }
  };

  // Light mode specific styles
  const textMainClass = !isDarkMode ? "text-slate-800" : "text-white";
  const textMutedClass = !isDarkMode ? "text-slate-500" : "text-slate-400";
  const borderClass = !isDarkMode ? "border-slate-200" : "border-slate-800";
  
  const buttonBackClass = !isDarkMode 
    ? "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100" 
    : "bg-slate-900/80 border-slate-800 hover:bg-slate-800";
  
  const cardClass = !isDarkMode 
    ? "bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl" 
    : "bg-slate-900/40 backdrop-blur-2xl border-slate-800 shadow-xl";
  
  const orderIdClass = !isDarkMode ? "text-slate-500" : "text-slate-400";
  const eventTitleClass = !isDarkMode ? "text-slate-800" : "text-white";
  const quantityBoxClass = !isDarkMode 
    ? "bg-white/60 rounded-2xl border-slate-200" 
    : "bg-black/40 rounded-2xl border-slate-800";
  const quantityValueClass = !isDarkMode ? "text-purple-600" : "text-purple-400";
  
  const securityIconBgClass = !isDarkMode 
    ? "bg-purple-100 border-purple-300 text-purple-600" 
    : "bg-purple-500/10 border-purple-500/20 text-purple-500";
  const securityIconGlowClass = !isDarkMode ? "bg-purple-300 blur-3xl opacity-30" : "bg-purple-500 blur-3xl opacity-20";
  const securityTitleClass = !isDarkMode ? "text-slate-800" : "text-white";
  const securityDescClass = !isDarkMode ? "text-slate-600" : "text-slate-400";
  
  const totalBoxClass = !isDarkMode 
    ? "bg-white/60 rounded-[2rem] border-slate-200 shadow-xl" 
    : "bg-black/60 rounded-[2rem] border-slate-800 shadow-2xl";
  const totalLabelClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const totalValueClass = !isDarkMode 
    ? "bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent" 
    : "bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent";
  
  const buyerInfoBoxClass = !isDarkMode 
    ? "bg-white/60 rounded-2xl border-slate-200" 
    : "bg-black/40 rounded-2xl border-slate-800";
  const buyerLabelClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const buyerValueClass = !isDarkMode ? "text-slate-800" : "text-white";
  const buyerEmailClass = !isDarkMode ? "text-slate-600" : "text-slate-300";
  
  const buttonClass = !isDarkMode 
    ? "bg-purple-600 text-white hover:bg-white hover:text-slate-800 shadow-purple-200/30" 
    : "bg-purple-600 text-white hover:bg-white hover:text-black shadow-purple-900/20";
  const buttonDisabledClass = !isDarkMode 
    ? "bg-slate-200 text-slate-400 cursor-wait" 
    : "bg-slate-800 text-slate-500 cursor-wait";
  
  const errorClass = !isDarkMode 
    ? "bg-red-100/80 backdrop-blur-xl border-red-300 text-red-600" 
    : "bg-red-500/10 backdrop-blur-xl border-red-500/30 text-red-500";
  
  const deliveryNoteClass = !isDarkMode ? "text-slate-500" : "text-slate-500";

  if (!bookingData) {
    return (
      <MainLayout>
        <PremiumBackground isLightMode={!isDarkMode}>
          <div className="min-h-screen flex flex-col items-center justify-center bg-transparent p-6 text-center">
            <Loader2 className="animate-spin text-purple-500 mb-6" size={48} />
            <h2 className={`text-xl font-black uppercase italic tracking-tighter ${textMainClass}`}>Validating Session</h2>
          </div>
        </PremiumBackground>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PremiumBackground isLightMode={!isDarkMode}>
        <div className="min-h-screen bg-transparent pb-20 pt-6 md:pt-10 font-sans text-left">
          
          {/* --- Header --- */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-12 flex flex-row items-center gap-4 md:gap-6">
            <button 
              onClick={() => navigate(-1)} 
              className={`p-3 md:p-4 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-sm border transition-all active:scale-90 group ${buttonBackClass}`}
            >
               <ArrowLeft size={20} className={`md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform ${!isDarkMode ? 'text-slate-700' : 'text-white'}`} />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-purple-500 leading-none">
                {t.finalCheckout}
              </h1>
              <p className={`font-bold text-[8px] md:text-[10px] mt-1 md:mt-2 italic tracking-widest uppercase flex items-center gap-2 ${orderIdClass}`}>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {t.orderId}: {bookingData.order_id}
              </p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
            
            {/* COLUMN 1: EVENT INFO */}
            <div className="space-y-6">
              <div className={`rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border overflow-hidden ${cardClass}`}>
                <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 pb-4 italic border-b ${borderClass} ${textMutedClass}`}>{t.eventSummary}</h2>
                <div className="space-y-6">
                  <div className="relative rounded-2xl overflow-hidden h-44 shadow-inner border border-slate-700">
                    <img src={bookingData.image} className="w-full h-full object-cover" alt="Banner" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div>
                    <p className="text-purple-400 font-black text-[9px] uppercase tracking-widest mb-1 italic">{bookingData.ticket_name}</p>
                    <h3 className={`text-xl md:text-2xl font-black leading-tight uppercase italic tracking-tighter ${eventTitleClass}`}>{bookingData.event_name}</h3>
                  </div>
                  <div className={`p-4 rounded-2xl border ${quantityBoxClass}`}>
                    <p className={`text-[8px] font-black uppercase mb-1 ${totalLabelClass}`}>{t.quantity}</p>
                    <p className={`font-black text-xl ${quantityValueClass}`}>{bookingData.quantity}x</p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className={`backdrop-blur-xl border p-6 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 ${errorClass}`}>
                  <AlertCircle size={24} className="shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Error</p>
                    <p className="text-sm font-bold leading-tight">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 2: SECURITY */}
            <div className={`rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border flex flex-col justify-between space-y-8 ${cardClass}`}>
              <div className="text-center py-6">
                <div className="relative inline-block mb-6">
                  <div className={`absolute inset-0 blur-3xl animate-pulse ${securityIconGlowClass}`}></div>
                  <div className={`relative p-8 rounded-full border ${securityIconBgClass}`}>
                    <ShieldCheck size={54} strokeWidth={2.5} />
                  </div>
                </div>
                <p className={`font-black text-xl uppercase italic mb-3 tracking-tighter ${securityTitleClass}`}>{t.securityTitle}</p>
                <p className={`font-bold text-[10px] italic uppercase tracking-tighter leading-relaxed ${securityDescClass}`}>{t.securityDesc}</p>
                <div className={`flex justify-center gap-4 mt-6 ${!isDarkMode ? 'text-slate-400' : 'opacity-30'}`}>
                  <CreditCard size={20} /> <Smartphone size={20} /> <CheckCircle2 size={20} />
                </div>
              </div>

              <div className={`rounded-[2rem] p-8 shadow-xl border ${totalBoxClass}`}>
                <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 italic ${totalLabelClass}`}>{t.grandTotal}</p>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold opacity-30 italic">IDR</span>
                  <span className={`text-4xl font-black italic tracking-tighter bg-clip-text ${totalValueClass}`}>
                    {new Intl.NumberFormat('id-ID').format(bookingData.total_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 3: BUYER & ACTION */}
            <div className={`rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border flex flex-col ${cardClass}`}>
              <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-8 pb-4 italic border-b ${borderClass} ${textMutedClass}`}>{t.buyerInfo}</h2>
              <div className="space-y-6 flex-grow">
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ml-1 ${buyerLabelClass}`}>{t.accHolder}</p>
                  <div className={`p-5 rounded-2xl border ${buyerInfoBoxClass}`}>
                    <p className={`font-black text-lg italic uppercase tracking-tight truncate ${buyerValueClass}`}>{buyerInfo.fullName}</p>
                  </div>
                </div>
                <div>
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ml-1 ${buyerLabelClass}`}>Email</p>
                  <div className={`p-5 rounded-2xl border font-bold text-sm truncate ${buyerInfoBoxClass} ${buyerEmailClass}`}>
                    {buyerInfo.email}
                  </div>
                </div>
              </div>

              <button 
                disabled={isProcessing}
                onClick={handlePayNow}
                className={`mt-12 w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${
                  !isProcessing ? buttonClass : buttonDisabledClass
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-xs italic">{t.processing}</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-3 text-sm">
                    {t.payNow} <ShieldCheck size={20} />
                  </span>
                )}
              </button>
              <p className={`mt-8 text-[8px] text-center font-bold uppercase tracking-[0.2em] italic leading-relaxed ${deliveryNoteClass}`}>{t.deliveryNote}</p>
            </div>
            
          </div>
        </div>
      </PremiumBackground>
    </MainLayout>
  );
};

export default Checkout;