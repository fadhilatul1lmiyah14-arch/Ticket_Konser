import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowLeft 
} from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Menangkap data booking dari Cart.jsx
  const bookingData = location.state?.booking;

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    // 1. Proteksi: Jika order_id tidak ada (akses direct), balik ke home
    if (!bookingData || !bookingData.order_id) {
      navigate('/');
      return;
    }
    
    // 2. Ambil data user dari localStorage yang disimpan saat Login
    // Kita sesuaikan dengan struktur tabel 'users' di schema.db
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setBuyerInfo({
      fullName: savedUser.name || 'Customer',
      email: savedUser.email || '-',
      phone: savedUser.phone || 'Belum diatur'
    });
  }, [bookingData, navigate]);

  const handlePayNow = async () => {
    setErrorMessage('');
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      /**
       * ALUR BACKEND:
       * 1. Mengirim order_id ke endpoint payment.
       * 2. Backend akan mengecek tabel 'orders' berdasarkan ID tersebut.
       * 3. Backend membuat invoice ke Xendit.
       * 4. Backend mencatat xendit_external_id ke tabel 'payments'.
       */
      const response = await fetch('http://192.168.0.242:3000/payments/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          order_id: String(bookingData.order_id) // Sesuai schema: text id
        }),
      });

      const result = await response.json();

      if (response.ok && (result.payment_url || result.data?.invoice_url)) {
        // Redirect ke Portal Pembayaran Xendit
        const redirectUrl = result.payment_url || result.data?.invoice_url;
        window.location.href = redirectUrl;
      } else {
        // Tangani error jika stok habis di detik terakhir atau gagal hit Xendit
        setErrorMessage(result.message || "Gagal membuat invoice. Silakan coba lagi.");
      }
    } catch (error) {
      setErrorMessage("Koneksi gagal. Pastikan server backend Anda aktif.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) return null;

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f1f5f9] pb-20 pt-10 font-sans text-slate-900 text-left">
        
        {/* Header Section */}
        <div className="max-w-7xl mx-auto px-6 mb-10 flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-90"
          >
             <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-purple-700 leading-none">
              Final <span className="text-slate-900">Checkout</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs mt-2 italic tracking-widest uppercase opacity-70">
              Order Ref: {bookingData.order_id}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUMN 1: EVENT INFO */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 overflow-hidden relative">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-slate-400 border-b pb-4">Event Detail</h2>
              
              <div className="space-y-6">
                <div className="relative rounded-3xl overflow-hidden h-48 bg-slate-100 shadow-inner">
                  <img 
                    src={bookingData.image} 
                    className="w-full h-full object-cover" 
                    alt="Event"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur text-purple-700 text-[10px] font-black px-4 py-2 rounded-full uppercase shadow-sm">
                      Official Ticket
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">
                  {bookingData.event_name}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Quantity</p>
                    <p className="font-black text-lg text-purple-600">{bookingData.quantity} Tiket</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Status</p>
                    <p className="font-black text-sm text-orange-500 uppercase italic">Waiting Payment</p>
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-6 rounded-[2rem] flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={24} className="shrink-0" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">Payment Error</p>
                  <p className="text-sm font-bold leading-tight">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* COLUMN 2: PAYMENT GATEWAY INFO */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-slate-400 border-b pb-4">Gateway Secure</h2>
              
              <div className="space-y-8 text-center py-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-400 blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-purple-50 p-10 rounded-full text-purple-600 shadow-inner">
                      <ShieldCheck size={80} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
                <div className="px-4">
                  <p className="text-slate-900 font-black text-xl uppercase italic mb-3 tracking-tighter">Powered by Xendit</p>
                  <p className="text-slate-500 font-bold leading-relaxed italic text-sm">
                    Klik tombol bayar untuk membuka portal <span className="text-purple-600">Secure Checkout</span>. 
                    Mendukung QRIS, Virtual Account (BCA, Mandiri, BNI), dan E-Wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40 mb-4">Total Amount Due</p>
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold opacity-40 italic">IDR</span>
                <span className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-purple-400">
                  Rp {bookingData.total_price?.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: BUYER DETAILS & ACTION */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-slate-400 border-b pb-4">Buyer Identity</h2>
            
            <div className="space-y-6 flex-grow">
              <div className="group">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Name</p>
                <div className="p-5 bg-slate-50 rounded-2xl border-l-4 border-slate-200 group-hover:border-purple-600 transition-all">
                  <p className="font-black text-slate-800 text-lg italic uppercase tracking-tight">{buyerInfo.fullName}</p>
                </div>
              </div>
              
              <div className="group">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Verified Email</p>
                <div className="p-5 bg-slate-50 rounded-2xl border-l-4 border-slate-200 group-hover:border-purple-600 transition-all text-slate-600 font-bold">
                  {buyerInfo.email}
                </div>
              </div>

              <div className="group">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact Phone</p>
                <div className="p-5 bg-slate-50 rounded-2xl border-l-4 border-slate-200 group-hover:border-purple-600 transition-all text-slate-600 font-bold">
                  {buyerInfo.phone}
                </div>
              </div>
            </div>

            <button 
              disabled={isProcessing}
              onClick={handlePayNow}
              className={`mt-12 w-full py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all relative overflow-hidden active:scale-95 ${
                !isProcessing 
                ? 'bg-purple-600 text-white hover:bg-[#0f172a] hover:-translate-y-1 shadow-purple-200' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin" size={22} />
                  <span className="italic">Encrypting...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  SECURE PAYMENT <ShieldCheck size={20} />
                </span>
              )}
            </button>
            
            <div className="mt-8 flex flex-col items-center gap-2 opacity-50">
               <div className="flex gap-4">
                 <div className="w-8 h-5 bg-slate-200 rounded-sm"></div>
                 <div className="w-8 h-5 bg-slate-200 rounded-sm"></div>
                 <div className="w-8 h-5 bg-slate-200 rounded-sm"></div>
               </div>
               <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] italic">
                 Tiket akan dikirim via email segera setelah pembayaran sukses.
               </p>
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;