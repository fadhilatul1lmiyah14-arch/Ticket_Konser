import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, AlertCircle, Loader2, Ticket } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../api/axiosConfig'; 

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- LOGIKA PERSISTENSI DATA (ANTI-REFRESH) ---
  const [eventData, setEventData] = useState(() => {
    // 1. Prioritas 1: Cek state navigasi (dari halaman Detail)
    if (location.state?.event) {
      const stateCart = location.state.event;
      localStorage.setItem('cart', JSON.stringify([stateCart]));
      window.dispatchEvent(new Event('cartUpdated'));
      return stateCart;
    }
    
    // 2. Prioritas 2: Ambil dari localStorage jika state hilang (setelah refresh)
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        return parsed[0] || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [ticketQuantity, setTicketQuantity] = useState(() => {
    const savedQty = localStorage.getItem('pending_qty');
    return savedQty ? parseInt(savedQty) : 1;
  });

  const [isDeleted, setIsDeleted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Simpan quantity ke localstorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('pending_qty', ticketQuantity.toString());
  }, [ticketQuantity]);

  // Jika tidak ada data dan tidak dalam proses hapus, balik ke home
  useEffect(() => {
    if (!eventData && !isDeleted) {
      const timer = setTimeout(() => navigate('/'), 2000);
      return () => clearTimeout(timer);
    }
  }, [eventData, navigate, isDeleted]);

  // --- FUNGSI MENGHAPUS ITEM ---
  const clearCartSession = () => {
    localStorage.removeItem('cart');
    localStorage.removeItem('pending_qty');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemoveItem = () => {
    clearCartSession();
    setIsDeleted(true);
    setEventData(null);
  };

  // --- FUNGSI PROSES KE CHECKOUT (HIT API) ---
  const handleConfirmOrder = async () => {
    if (!eventData) return;
    
    setIsBooking(true);
    setErrorMessage('');

    try {
      const payload = {
        event_id: Number(eventData.event_id || eventData.id),
        ticket_type_id: Number(eventData.ticket_type_id),
        quantity: Number(ticketQuantity)
      };

      const response = await api.post('/customer/booking', payload);
      const result = response.data;
      
      const finalOrderId = result.data?.order_id || result.order_id;

      if (finalOrderId) {
        // Simpan data untuk checkout sebelum menghapus session
        const checkoutData = {
          order_id: finalOrderId, 
          event_name: eventTitle,
          ticket_name: eventData.ticket_name,
          total_price: totalPrice,
          quantity: ticketQuantity,
          image: eventImage
        };

        clearCartSession();
        
        navigate('/checkout', { 
          state: { booking: checkoutData } 
        });
      }
    } catch (error) {
      console.error("Booking Error:", error);
      const msg = error.response?.data?.message || "Gagal membuat pesanan. Pastikan stok tersedia.";
      setErrorMessage(msg);
    } finally {
      setIsBooking(false);
    }
  };

  // --- DATA MAPPING ---
  const price = eventData?.price || 0;
  const totalPrice = ticketQuantity * price;
  const eventTitle = eventData?.title || "Exclusive Event";
  const eventImage = eventData?.image || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000";

  // --- HANDLING LOADING & EMPTY STATE ---
  if (!eventData && !isDeleted) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f172a] text-center px-6">
          <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
          <h2 className="text-white text-xl font-black italic uppercase">Restoring Session</h2>
          <p className="text-slate-400 mt-2 uppercase text-[10px] font-black tracking-widest italic">Please wait...</p>
        </div>
      </MainLayout>
    );
  }

  if (isDeleted || !eventData) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f172a] text-center px-6">
            <h2 className="text-white text-3xl font-black italic uppercase">Cart is Empty</h2>
            <p className="text-slate-400 mt-2 uppercase text-[10px] font-black tracking-widest italic opacity-60">Your journey starts with a single ticket.</p>
            <button 
              onClick={() => navigate('/events')} 
              className="mt-8 bg-purple-600 px-10 py-4 rounded-2xl text-white font-black uppercase tracking-[0.2em] hover:bg-purple-700 transition-all shadow-xl shadow-purple-500/20 active:scale-95 text-xs"
            >
              Explore Events
            </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 text-left">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex items-center gap-6 mb-12">
              <button 
                onClick={() => navigate(-1)} 
                className="p-4 bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-2xl hover:bg-slate-700 transition-all shadow-lg active:scale-90"
              >
                  <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                  My <span className="text-purple-500">Cart</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-black uppercase mt-2 tracking-widest italic">Review your selection before checkout</p>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT: ITEM LIST */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/40 backdrop-blur-sm rounded-[40px] border border-slate-800/50 p-8 hover:border-purple-500/30 transition-all shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[80px]"></div>

                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="w-full md:w-48 h-48 shrink-0 overflow-hidden rounded-[30px] border border-slate-800 shadow-2xl">
                    <img 
                      src={eventImage} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      alt="Banner" 
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Ticket size={12} className="text-purple-400" />
                            <p className="text-purple-400 font-black text-[9px] uppercase tracking-[0.3em]">{eventData.ticket_name || 'Admission'}</p>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black uppercase italic leading-tight tracking-tighter">
                          {eventTitle}
                        </h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase mt-1 italic tracking-[0.15em] opacity-80">
                          {eventData.location || "Online Experience"}
                        </p>
                      </div>
                      <button 
                        onClick={handleRemoveItem} 
                        className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>

                    <div className="flex flex-wrap justify-between items-end mt-8 gap-4">
                      <div>
                         <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1 italic opacity-60">Price</p>
                         <p className="text-2xl font-black italic tracking-tighter text-white">
                           Rp {Number(price).toLocaleString('id-ID')}
                         </p>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shadow-inner">
                        <button 
                          onClick={() => ticketQuantity > 1 && setTicketQuantity(ticketQuantity - 1)} 
                          className="w-12 h-12 bg-slate-800 rounded-xl text-white flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700 active:scale-90"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-black italic text-xl w-8 text-center">{ticketQuantity}</span>
                        <button 
                          onClick={() => setTicketQuantity(ticketQuantity + 1)} 
                          className="w-12 h-12 bg-purple-600 rounded-xl text-white flex items-center justify-center hover:bg-purple-500 transition-colors shadow-lg active:scale-90"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-500 p-6 rounded-[2.5rem] flex items-center gap-4">
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="font-black text-[10px] uppercase tracking-widest leading-relaxed">{errorMessage}</p>
                </div>
              )}
            </div>

            {/* RIGHT: SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900/60 backdrop-blur-md rounded-[40px] border border-slate-800 p-10 sticky top-32 shadow-2xl overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/5 rounded-full blur-3xl"></div>
                <h2 className="text-xl font-black uppercase italic mb-8 border-b border-slate-800 pb-4 tracking-tighter">
                    Payment <span className="text-purple-500">Summary</span>
                </h2>
                <div className="space-y-6 mb-10">
                    <div className="flex justify-between uppercase text-[10px] font-black text-slate-500 tracking-[0.2em]">
                        <span>Item Quantity</span>
                        <span className="text-white">{ticketQuantity} Tickets</span>
                    </div>
                    <div className="pt-4 border-t border-slate-800/50">
                        <span className="uppercase text-[10px] font-black text-slate-500 tracking-[0.2em] block mb-2">Total Amount</span>
                        <div className="flex items-baseline gap-2">
                           <span className="text-sm font-bold text-slate-500 italic uppercase">IDR</span>
                           <span className="text-4xl font-black text-purple-400 italic tracking-tighter">
                             {totalPrice.toLocaleString('id-ID')}
                           </span>
                        </div>
                    </div>
                </div>

                <button 
                  onClick={handleConfirmOrder}
                  disabled={isBooking}
                  className={`w-full py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] flex justify-center items-center gap-3 transition-all shadow-2xl relative z-10 active:scale-95 ${
                    isBooking 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20 hover:-translate-y-1'
                  }`}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span className="italic">Processing...</span>
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
                <p className="text-[8px] text-slate-600 font-bold uppercase text-center mt-8 tracking-[0.15em] italic">
                    *Prices include 11% PPN and admin fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;