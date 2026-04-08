import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, AlertCircle, Loader2, Ticket, MapPin } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../api/axiosConfig'; 

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- LOGIKA MULTI-BAHASA ---
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');

  const getTranslation = useCallback((field) => {
    if (!field) return '';
    if (typeof field === 'object' && field !== null) {
      return field[currentLang] || field['id'] || field['en'] || '';
    }
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed[currentLang] || parsed['id'] || parsed['en'] || field;
        }
      } catch (e) {
        return field;
      }
    }
    return field;
  }, [currentLang]);

  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(localStorage.getItem('lang') || 'id');
    };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  // --- LOGIKA PERSISTENSI DATA KERANJANG ---
  const [eventData, setEventData] = useState(() => {
    if (location.state?.event) {
      const stateCart = location.state.event;
      localStorage.setItem('cart', JSON.stringify([stateCart]));
      window.dispatchEvent(new Event('cartUpdated'));
      return stateCart;
    }
    
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

  useEffect(() => {
    localStorage.setItem('pending_qty', ticketQuantity.toString());
  }, [ticketQuantity]);

  useEffect(() => {
    if (!eventData && !isDeleted) {
      const timer = setTimeout(() => navigate('/events'), 2000);
      return () => clearTimeout(timer);
    }
  }, [eventData, navigate, isDeleted]);

  // --- FUNGSI HELPER ---
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

  // --- MAPPING DATA REAKTIF ---
  const price = Number(eventData?.starting_price || eventData?.price || 0);
  const totalPrice = ticketQuantity * price;
  
  const eventImage = useMemo(() => {
    if (eventData?.images && eventData.images.length > 0) return eventData.images[0];
    if (eventData?.image) return eventData.image;
    return "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000";
  }, [eventData]);

  const displayTitle = useMemo(() => 
    getTranslation(eventData?.title), 
    [eventData?.title, currentLang, getTranslation]
  );

  const displayTicketName = useMemo(() => 
    getTranslation(eventData?.ticket_name || eventData?.category), 
    [eventData, currentLang, getTranslation]
  );

  const displayLocation = useMemo(() => 
    getTranslation(eventData?.location), 
    [eventData?.location, currentLang, getTranslation]
  );

  // --- FIX UNTUK ERROR 422 ---
  const handleConfirmOrder = async () => {
    if (!eventData) return;
    
    setIsBooking(true);
    setErrorMessage('');

    try {
      // Pastikan ID yang diambil adalah 'ticket_type_id' jika tersedia, 
      // kalau tidak ada pakai 'id' (tergantung respons API List Event kamu)
      const targetTicketId = eventData.ticket_type_id || eventData.id;

      const payload = {
        ticket_type_id: Number(targetTicketId),
        quantity: Number(ticketQuantity)
      };

      const response = await api.post('/customer/booking', payload);
      const result = response.data;
      
      const finalOrderId = result.data?.order_id || result.order_id;

      if (finalOrderId) {
        const checkoutData = {
          order_id: finalOrderId, 
          event_name: displayTitle,
          ticket_name: displayTicketName,
          total_price: totalPrice,
          quantity: ticketQuantity,
          image: eventImage,
          location: displayLocation,
          address_details: eventData.address_details || ""
        };

        clearCartSession();
        navigate('/checkout', { state: { booking: checkoutData } });
      }
    } catch (error) {
      console.error("Booking Error Full Response:", error.response?.data);
      
      // Menangkap pesan error spesifik dari backend (biasanya error.response.data.errors)
      const serverErrors = error.response?.data?.errors;
      let detailedMsg = error.response?.data?.message;

      if (serverErrors) {
        // Gabungkan semua pesan validasi jika ada (Misal: "Stok habis, Quantity minimal 1")
        detailedMsg = Object.values(serverErrors).flat().join(', ');
      }

      const finalMsg = detailedMsg || (currentLang === 'id' ? "Gagal memproses pesanan. Periksa data kembali." : "Failed to process order. Please check your data.");
      setErrorMessage(finalMsg);
    } finally {
      setIsBooking(false);
    }
  };

  if (!eventData && !isDeleted) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#020617] text-center px-6">
          <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
          <h2 className="text-white text-xl font-black italic uppercase">
            {currentLang === 'id' ? 'Memulihkan Sesi' : 'Restoring Session'}
          </h2>
        </div>
      </MainLayout>
    );
  }

  if (isDeleted || !eventData) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#020617] text-center px-6">
            <h2 className="text-white text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
              {currentLang === 'id' ? 'Keranjang Kosong' : 'Cart is Empty'}
            </h2>
            <button 
              onClick={() => navigate('/events')} 
              className="mt-10 bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-all text-[10px]"
            >
              {currentLang === 'id' ? 'Jelajahi Event' : 'Explore Events'}
            </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex items-center gap-6 mb-12">
              <button onClick={() => navigate(-1)} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all active:scale-90">
                  <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
                   {currentLang === 'id' ? 'KERANJANG' : 'MY'} <span className="text-purple-500">{currentLang === 'id' ? 'SAYA' : 'CART'}</span>
                </h1>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/40 rounded-[40px] border border-slate-800 p-6 md:p-8 hover:border-slate-700 transition-all shadow-2xl relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="w-full md:w-56 h-56 shrink-0 overflow-hidden rounded-[30px] border border-slate-800">
                    <img src={eventImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Event" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                            <Ticket size={10} className="text-purple-400" />
                            <span className="text-purple-400 font-black text-[9px] uppercase tracking-widest">{displayTicketName}</span>
                        </div>
                        <button onClick={handleRemoveItem} className="p-3 text-slate-600 hover:text-red-500 transition-colors">
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <h3 className="text-2xl md:text-4xl font-black uppercase italic leading-none tracking-tighter mb-3">
                        {displayTitle}
                      </h3>

                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-purple-500"><MapPin size={12} /></span>
                        <p className="text-[10px] font-black uppercase italic tracking-widest opacity-80">
                          {displayLocation} — {eventData.address_details}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-end mt-10 gap-4">
                      <div>
                         <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mb-1 italic">
                           {currentLang === 'id' ? 'Harga Per Tiket' : 'Price Per Ticket'}
                         </p>
                         <p className="text-2xl font-black italic tracking-tighter">
                           Rp {price.toLocaleString('id-ID')}
                         </p>
                      </div>
                      
                      <div className="flex items-center gap-5 bg-black p-2 rounded-2xl border border-slate-800 shadow-inner">
                        <button onClick={() => ticketQuantity > 1 && setTicketQuantity(ticketQuantity - 1)} className="w-12 h-12 bg-slate-900 rounded-xl text-white flex items-center justify-center hover:bg-slate-800 border border-slate-800 active:scale-90">
                          <Minus size={16} />
                        </button>
                        <span className="font-black italic text-xl w-6 text-center">{ticketQuantity}</span>
                        <button onClick={() => setTicketQuantity(ticketQuantity + 1)} className="w-12 h-12 bg-purple-600 rounded-xl text-white flex items-center justify-center hover:bg-purple-500 shadow-lg active:scale-90">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-[2.5rem] flex items-center gap-4 animate-bounce">
                  <AlertCircle size={24} className="shrink-0" />
                  <p className="font-black text-[10px] uppercase tracking-widest">{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-slate-900 rounded-[40px] border border-slate-800 p-8 md:p-10 sticky top-32 shadow-2xl">
                <h2 className="text-xl font-black uppercase italic mb-8 border-b border-slate-800 pb-4 tracking-tighter">
                    {currentLang === 'id' ? 'Ringkasan' : 'Payment'} <span className="text-purple-500">{currentLang === 'id' ? 'Pembayaran' : 'Summary'}</span>
                </h2>
                
                <div className="space-y-6 mb-10">
                    <div className="flex justify-between uppercase text-[10px] font-black text-slate-500 tracking-widest">
                        <span>{currentLang === 'id' ? 'Jumlah' : 'Quantity'}</span>
                        <span className="text-white">{ticketQuantity} {currentLang === 'id' ? 'Tiket' : 'Tickets'}</span>
                    </div>
                    <div className="pt-6 border-t border-slate-800">
                        <span className="uppercase text-[9px] font-black text-slate-500 tracking-[0.2em] block mb-2">
                          {currentLang === 'id' ? 'Total Bayar' : 'Total Payable'}
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl md:text-4xl font-black text-white italic tracking-tighter">
                              Rp {totalPrice.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>

                <button 
                  onClick={handleConfirmOrder}
                  disabled={isBooking}
                  className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] flex justify-center items-center gap-3 transition-all active:scale-95 ${
                    isBooking ? 'bg-slate-800 text-slate-600' : 'bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/20'
                  }`}
                >
                  {isBooking ? <Loader2 className="animate-spin" size={16} /> : (currentLang === 'id' ? "Konfirmasi Pesanan" : "Confirm Order")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;