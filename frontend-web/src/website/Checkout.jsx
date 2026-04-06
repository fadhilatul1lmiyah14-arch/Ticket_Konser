import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, AlertCircle, Loader2, ArrowLeft, CreditCard, Smartphone, CheckCircle2 
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../api/axiosConfig'; 

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // LOGIKA ANTI-REFRESH: Ambil dari state router atau fallback ke localStorage
  const [bookingData, setBookingData] = useState(() => {
    const stateData = location.state?.booking;
    if (stateData) {
      localStorage.setItem('active_checkout', JSON.stringify(stateData));
      return stateData;
    }
    const savedData = localStorage.getItem('active_checkout');
    return savedData ? JSON.parse(savedData) : null;
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

    // Proteksi: Jika data tidak ada sama sekali, tendang ke home
    if (!bookingData || !bookingData.order_id) {
      const timer = setTimeout(() => navigate('/'), 1500);
      return () => clearTimeout(timer);
    }
    
    // Ambil data user terbaru
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
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      // Panggil API Create Invoice (Xendit/Midtrans)
      const response = await api.post('/payments/create-invoice', 
        { order_id: String(bookingData.order_id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = response.data;

      // Cek response sesuai struktur backend (biasanya: result.data.payment_url)
      const paymentUrl = result.data?.payment_url || result.payment_url;

      if (paymentUrl) {
        // Bersihkan data checkout sementara sebelum redirect
        localStorage.removeItem('active_checkout');
        
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 500);
      } else {
        throw new Error("Gagal mendapatkan link pembayaran dari server.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Koneksi gagal. Silakan coba lagi.";
      setErrorMessage(errorMsg);
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
          <p className="text-slate-500 font-black uppercase text-[10px] italic tracking-widest text-center">
            Validating Session...
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f8fafc] pb-20 pt-6 md:pt-10 font-sans text-slate-900 text-left">
        
        {/* --- Header Section --- */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-10 flex flex-row items-center gap-4 md:gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 md:p-4 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-90 group"
          >
             <ArrowLeft size={20} className="md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic text-indigo-700 leading-none">
              Final <span className="text-slate-900">Checkout</span>
            </h1>
            <p className="text-slate-400 font-bold text-[8px] md:text-[10px] mt-1 md:mt-2 italic tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              ID ORDER: {bookingData.order_id}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* --- COLUMN 1: EVENT INFO --- */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 overflow-hidden relative">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-slate-400 border-b border-slate-50 pb-4 italic">Event Summary</h2>
              
              <div className="space-y-6">
                <div className="relative rounded-2xl md:rounded-3xl overflow-hidden h-40 md:h-52 bg-slate-100 shadow-inner group">
                  <img 
                    src={bookingData.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt="Banner"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                <div>
                  <p className="text-indigo-600 font-black text-[9px] uppercase tracking-widest mb-1 italic">
                    {bookingData.ticket_name || 'Standard Entry'}
                  </p>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">
                    {bookingData.event_name}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4 pt-2 md:pt-4">
                  <div className="p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Quantity</p>
                    <p className="font-black text-lg md:text-xl text-indigo-600">{bookingData.quantity}x</p>
                  </div>
                  <div className="p-3 md:p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                    <p className="text-[8px] font-black text-indigo-400 uppercase mb-1">Secure</p>
                    <p className="font-black text-[10px] md:text-xs text-indigo-700 uppercase italic">Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-5 md:p-6 rounded-3xl md:rounded-[2rem] flex items-start gap-4">
                <AlertCircle size={24} className="shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Payment Failed</p>
                  <p className="text-sm font-bold leading-tight">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* --- COLUMN 2: SECURITY & PRICING --- */}
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 flex flex-col justify-between space-y-8 md:space-y-10">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-slate-400 border-b border-slate-50 pb-4 italic">Payment Gateway</h2>
              
              <div className="space-y-6 md:space-y-8 text-center py-4 md:py-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-400 blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-indigo-50 p-6 md:p-10 rounded-full text-indigo-600 shadow-inner border border-indigo-100">
                      <ShieldCheck size={50} md:size={80} className="w-12 h-12 md:w-20 md:h-20" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <div className="px-2">
                  <p className="text-slate-900 font-black text-lg md:text-xl uppercase italic mb-2 md:mb-3 tracking-tighter">Encrypted Payment</p>
                  <div className="flex flex-wrap justify-center gap-3 mt-4 opacity-50 grayscale">
                     <CreditCard size={18} />
                     <Smartphone size={18} />
                     <CheckCircle2 size={18} />
                  </div>
                  <p className="text-slate-400 font-bold leading-relaxed text-[9px] md:text-[10px] italic uppercase tracking-tighter mt-4">
                    Automatic verification via Xendit Secure Gateway. 
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mb-3 md:mb-4">Amount to Pay</p>
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-[10px] md:text-xs font-bold opacity-40 italic">IDR</span>
                <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-300 truncate">
                  {new Intl.NumberFormat('id-ID').format(bookingData.total_price)}
                </span>
              </div>
            </div>
          </div>

          {/* --- COLUMN 3: BUYER INFO & ACTION --- */}
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 md:mb-10 text-slate-400 border-b border-slate-50 pb-4 italic">Customer Details</h2>
            
            <div className="space-y-4 md:space-y-6 flex-grow">
              <div className="group">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</p>
                <div className="p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 group-hover:border-indigo-600 transition-all">
                  <p className="font-black text-slate-800 text-base md:text-lg italic uppercase tracking-tight truncate">{buyerInfo.fullName}</p>
                </div>
              </div>
              
              <div className="group">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</p>
                <div className="p-4 md:p-5 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 text-slate-600 font-bold text-sm md:text-base truncate">
                  {buyerInfo.email}
                </div>
              </div>
            </div>

            <button 
              disabled={isProcessing}
              onClick={handlePayNow}
              className={`mt-10 md:mt-12 w-full py-5 md:py-7 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl transition-all relative overflow-hidden active:scale-95 ${
                !isProcessing 
                ? 'bg-indigo-600 text-white hover:bg-[#0f172a] hover:-translate-y-1 shadow-indigo-200' 
                : 'bg-slate-100 text-slate-400 cursor-wait'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3 text-xs md:text-sm">
                  <Loader2 className="animate-spin" size={18} md:size={22} />
                  <span className="italic">REDIRECTING...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3 text-xs md:text-sm">
                  PAY NOW <ShieldCheck size={18} md:size={20} />
                </span>
              )}
            </button>
            
            <p className="mt-6 md:mt-8 text-[7px] md:text-[8px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] italic leading-relaxed">
              Ticket will be issued instantly to your "My Tickets" section after successful payment.
            </p>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;