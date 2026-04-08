import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, AlertCircle, Loader2, ArrowLeft, CreditCard, Smartphone, CheckCircle2 
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../api/axiosConfig'; 

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- LOGIKA MULTI-BAHASA ---
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(localStorage.getItem('lang') || 'id');
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const t = useMemo(() => ({
    finalCheckout: currentLang === 'id' ? 'FINAL CHECKOUT' : 'FINAL CHECKOUT',
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
      
      /** * PERBAIKAN: Endpoint disesuaikan dengan backend Elysia kamu (/payments/create-invoice)
       * Payload order_id dikirim sebagai string sesuai validasi t.String() di backend.
       */
      const response = await api.post('/payments/create-invoice', 
        { order_id: String(bookingData.order_id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = response.data;

      // Sesuai struktur return backend: { status: "success", data: { payment_url: ... } }
      if (result.status === "success" && result.data?.payment_url) {
        localStorage.removeItem('active_checkout');
        
        // Beri jeda sedikit untuk user melihat transisi
        setTimeout(() => {
          window.location.href = result.data.payment_url;
        }, 500);
      } else {
        throw new Error(result.message || (currentLang === 'id' ? "Gagal mendapatkan link pembayaran." : "Failed to get payment link."));
      }
    } catch (error) {
      console.error("Payment Error:", error);
      
      // Error handling yang lebih spesifik untuk debugging
      let errorMsg = "Payment gateway connection failed.";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMsg = "Endpoint API tidak ditemukan (404). Pastikan route /payments/create-invoice sudah terdaftar di backend.";
        } else {
          errorMsg = error.response.data?.message || error.message;
        }
      } else {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
          <Loader2 className="animate-spin text-indigo-600 mb-6" size={48} />
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Validating Session</h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f8fafc] pb-20 pt-6 md:pt-10 font-sans text-slate-900 text-left">
        
        {/* --- Header --- */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-12 flex flex-row items-center gap-4 md:gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-90 group"
          >
             <ArrowLeft size={20} className="md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-indigo-700 leading-none">
              {t.finalCheckout}
            </h1>
            <p className="text-slate-400 font-bold text-[8px] md:text-[10px] mt-1 md:mt-2 italic tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t.orderId}: {bookingData.order_id}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* COLUMN 1: EVENT INFO */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 overflow-hidden">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-slate-400 border-b border-slate-50 pb-4 italic">{t.eventSummary}</h2>
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-100 shadow-inner">
                  <img src={bookingData.image} className="w-full h-full object-cover" alt="Banner" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
                <div>
                  <p className="text-indigo-600 font-black text-[9px] uppercase tracking-widest mb-1 italic">{bookingData.ticket_name}</p>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">{bookingData.event_name}</h3>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{t.quantity}</p>
                  <p className="font-black text-xl text-indigo-600">{bookingData.quantity}x</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-100 text-red-700 p-6 rounded-3xl flex items-start gap-4">
                <AlertCircle size={24} className="shrink-0 mt-1" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Error</p>
                  <p className="text-sm font-bold leading-tight">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: SECURITY */}
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 flex flex-col justify-between space-y-8">
            <div className="text-center py-6">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-indigo-50 p-8 rounded-full text-indigo-600 border border-indigo-100">
                  <ShieldCheck size={54} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-slate-900 font-black text-xl uppercase italic mb-3 tracking-tighter">{t.securityTitle}</p>
              <p className="text-slate-400 font-bold text-[10px] italic uppercase tracking-tighter">{t.securityDesc}</p>
              <div className="flex justify-center gap-4 mt-6 opacity-30">
                <CreditCard size={20} /> <Smartphone size={20} /> <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-[2rem] p-8 text-white shadow-2xl">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mb-3 italic">{t.grandTotal}</p>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold opacity-30 italic">IDR</span>
                <span className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-300">
                  {new Intl.NumberFormat('id-ID').format(bookingData.total_price)}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: BUYER & ACTION */}
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-slate-400 border-b border-slate-50 pb-4 italic">{t.buyerInfo}</h2>
            <div className="space-y-6 flex-grow">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.accHolder}</p>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-black text-slate-800 text-lg italic uppercase tracking-tight truncate">{buyerInfo.fullName}</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</p>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 font-bold text-sm truncate">
                  {buyerInfo.email}
                </div>
              </div>
            </div>

            <button 
              disabled={isProcessing}
              onClick={handlePayNow}
              className={`mt-12 w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 ${
                !isProcessing 
                ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-200' 
                : 'bg-slate-100 text-slate-400 cursor-wait'
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
            <p className="mt-8 text-[8px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] italic leading-relaxed">{t.deliveryNote}</p>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;