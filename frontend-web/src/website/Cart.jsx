import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, AlertCircle, Loader2, Ticket, MapPin } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import api from '../api/axiosConfig'; 
import PremiumBackground from '../components/PremiumBackground';

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- DARK MODE LOGIC ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

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

  // Ambil quota maksimum dari eventData (harusnya sudah ada dari concert detail)
  const maxQuota = eventData?.remaining_quota || 0;
  
  const [ticketQuantity, setTicketQuantity] = useState(() => {
    const savedQty = localStorage.getItem('pending_qty');
    const initialQty = savedQty ? parseInt(savedQty) : 1;
    // Batasi quantity awal tidak melebihi maxQuota
    if (maxQuota > 0 && initialQty > maxQuota) {
      return maxQuota;
    }
    return initialQty;
  });

  const [isDeleted, setIsDeleted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [quantityError, setQuantityError] = useState('');

  // Validasi quantity tidak melebihi quota
  const validateQuantity = (newQuantity) => {
    if (maxQuota > 0 && newQuantity > maxQuota) {
      setQuantityError(`${currentLang === 'id' ? 'Maksimal' : 'Maximum'} ${maxQuota} ${currentLang === 'id' ? 'tiket' : 'tickets'} ${currentLang === 'id' ? 'tersedia' : 'available'}`);
      return false;
    }
    setQuantityError('');
    return true;
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (validateQuantity(newQuantity)) {
      setTicketQuantity(newQuantity);
    }
  };

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
    
    // Validasi terakhir sebelum submit
    if (maxQuota > 0 && ticketQuantity > maxQuota) {
      setQuantityError(`${currentLang === 'id' ? 'Maksimal' : 'Maximum'} ${maxQuota} ${currentLang === 'id' ? 'tiket' : 'tickets'} ${currentLang === 'id' ? 'tersedia' : 'available'}`);
      return;
    }
    
    setIsBooking(true);
    setErrorMessage('');

    try {
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
      const serverErrors = error.response?.data?.errors;
      let detailedMsg = error.response?.data?.message;

      if (serverErrors) {
        detailedMsg = Object.values(serverErrors).flat().join(', ');
      }

      const finalMsg = detailedMsg || (currentLang === 'id' ? "Gagal memproses pesanan. Periksa data kembali." : "Failed to process order. Please check your data.");
      setErrorMessage(finalMsg);
    } finally {
      setIsBooking(false);
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
    ? "bg-white/80 backdrop-blur-2xl border-slate-200 shadow-xl hover:border-slate-300" 
    : "bg-slate-900/40 backdrop-blur-2xl border-slate-800 hover:border-slate-700";
  
  const ticketBadgeClass = !isDarkMode 
    ? "bg-purple-100 border-purple-300 text-purple-600" 
    : "bg-purple-500/10 border-purple-500/20 text-purple-400";
  
  const removeButtonClass = !isDarkMode 
    ? "text-slate-400 hover:text-red-500" 
    : "text-slate-600 hover:text-red-500";
  
  const locationTextClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const priceLabelClass = !isDarkMode ? "text-slate-500" : "text-slate-600";
  const priceValueClass = !isDarkMode ? "text-slate-800" : "text-white";
  
  const quantityControlClass = !isDarkMode 
    ? "bg-white/60 backdrop-blur-md border-slate-200" 
    : "bg-black/40 backdrop-blur-md border-slate-800";
  
  const quantityButtonClass = !isDarkMode 
    ? "bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-100" 
    : "bg-slate-900 rounded-xl text-white hover:bg-slate-800 border-slate-800";
  
  const quantityAddClass = !isDarkMode 
    ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-200/50" 
    : "bg-purple-600 rounded-xl text-white hover:bg-purple-500 shadow-lg";
  
  const errorClass = !isDarkMode 
    ? "bg-red-100/80 backdrop-blur-xl border-red-300 text-red-600" 
    : "bg-red-500/10 backdrop-blur-xl border-red-500/30 text-red-500";
  
  const sidebarClass = !isDarkMode 
    ? "bg-white/80 backdrop-blur-2xl border-slate-200 shadow-2xl" 
    : "bg-slate-900/60 backdrop-blur-2xl border-slate-800";
  
  const summaryBorderClass = !isDarkMode ? "border-slate-200" : "border-slate-800";
  const summaryLabelClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const summaryValueClass = !isDarkMode ? "text-slate-800" : "text-white";
  const buttonConfirmClass = !isDarkMode 
    ? "bg-purple-500 hover:bg-purple-600 text-white shadow-xl shadow-purple-200/50" 
    : "bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/20";
  const buttonDisabledClass = !isDarkMode 
    ? "bg-slate-200 text-slate-400" 
    : "bg-slate-800 text-slate-600";

  if (!eventData && !isDeleted) {
    return (
      <MainLayout>
        <PremiumBackground isLightMode={!isDarkMode}>
          <div className="min-h-[80vh] flex flex-col items-center justify-center bg-transparent text-center px-6">
            <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
            <h2 className={`text-xl font-black italic uppercase ${textMainClass}`}>
              {currentLang === 'id' ? 'Memulihkan Sesi' : 'Restoring Session'}
            </h2>
          </div>
        </PremiumBackground>
      </MainLayout>
    );
  }

  if (isDeleted || !eventData) {
    return (
      <MainLayout>
        <PremiumBackground isLightMode={!isDarkMode}>
          <div className="min-h-[80vh] flex flex-col items-center justify-center bg-transparent text-center px-6">
              <h2 className={`text-3xl md:text-5xl font-black italic uppercase tracking-tighter ${textMainClass}`}>
                {currentLang === 'id' ? 'Keranjang Kosong' : 'Cart is Empty'}
              </h2>
              <button 
                onClick={() => navigate('/events')} 
                className={`mt-10 px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-[10px] ${!isDarkMode ? 'bg-slate-800 text-white hover:bg-purple-500' : 'bg-white text-black hover:bg-purple-500 hover:text-white'}`}
              >
                {currentLang === 'id' ? 'Jelajahi Event' : 'Explore Events'}
              </button>
          </div>
        </PremiumBackground>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PremiumBackground isLightMode={!isDarkMode}>
        <div className="min-h-screen bg-transparent p-6 md:p-12">
          <div className="max-w-6xl mx-auto">
            
            <div className="flex items-center gap-6 mb-12">
                <button onClick={() => navigate(-1)} className={`p-4 backdrop-blur-xl border rounded-2xl transition-all active:scale-90 ${buttonBackClass}`}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className={`text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none ${textMainClass}`}>
                     {currentLang === 'id' ? 'KERANJANG' : 'MY'} <span className="text-purple-500">{currentLang === 'id' ? 'SAYA' : 'CART'}</span>
                  </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <div className={`rounded-[40px] border p-6 md:p-8 transition-all shadow-2xl relative overflow-hidden group ${cardClass}`}>
                  <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    <div className={`w-full md:w-56 h-56 shrink-0 overflow-hidden rounded-[30px] border ${borderClass}`}>
                      <img src={eventImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Event" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${ticketBadgeClass}`}>
                              <Ticket size={10} />
                              <span className="font-black text-[9px] uppercase tracking-widest">{displayTicketName}</span>
                          </div>
                          <button onClick={handleRemoveItem} className={`p-3 transition-colors ${removeButtonClass}`}>
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <h3 className={`text-2xl md:text-4xl font-black uppercase italic leading-none tracking-tighter mb-3 ${textMainClass}`}>
                          {displayTitle}
                        </h3>

                        <div className={`flex items-center gap-2 ${locationTextClass}`}>
                          <span className="text-purple-500"><MapPin size={12} /></span>
                          <p className="text-[10px] font-black uppercase italic tracking-widest opacity-80">
                            {displayLocation} — {eventData.address_details}
                          </p>
                        </div>
                        
                        {/* Informasi Sisa Tiket - TAMPILKAN HANYA JIKA ADA QUOTA */}
                        {maxQuota > 0 && (
                          <div className="mt-2 text-[9px] font-black text-purple-500 uppercase tracking-wider">
                            {currentLang === 'id' ? 'Sisa tiket' : 'Remaining tickets'}: {maxQuota}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap justify-between items-end mt-10 gap-4">
                        <div>
                           <p className={`text-[9px] font-black uppercase tracking-widest mb-1 italic ${priceLabelClass}`}>
                             {currentLang === 'id' ? 'Harga Per Tiket' : 'Price Per Ticket'}
                           </p>
                           <p className={`text-2xl font-black italic tracking-tighter ${priceValueClass}`}>
                             Rp {price.toLocaleString('id-ID')}
                           </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <div className={`flex items-center gap-5 backdrop-blur-md p-2 rounded-2xl border shadow-inner ${quantityControlClass}`}>
                            <button 
                              onClick={() => handleQuantityChange(ticketQuantity - 1)} 
                              disabled={ticketQuantity <= 1}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center border active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed ${quantityButtonClass}`}
                            >
                              <Minus size={16} />
                            </button>
                            <span className={`font-black italic text-xl w-6 text-center ${textMainClass}`}>{ticketQuantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(ticketQuantity + 1)} 
                              disabled={ticketQuantity >= maxQuota}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed ${quantityAddClass}`}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          {/* Pesan error jika quantity melebihi batas */}
                          {quantityError && (
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-wider animate-pulse">
                              {quantityError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {errorMessage && (
                  <div className={`backdrop-blur-xl border p-6 rounded-[2.5rem] flex items-center gap-4 animate-bounce ${errorClass}`}>
                    <AlertCircle size={24} className="shrink-0" />
                    <p className="font-black text-[10px] uppercase tracking-widest">{errorMessage}</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className={`rounded-[40px] border p-8 md:p-10 sticky top-32 shadow-2xl ${sidebarClass}`}>
                  <h2 className={`text-xl font-black uppercase italic mb-8 pb-4 tracking-tighter border-b ${summaryBorderClass} ${textMainClass}`}>
                      {currentLang === 'id' ? 'Ringkasan' : 'Payment'} <span className="text-purple-500">{currentLang === 'id' ? 'Pembayaran' : 'Summary'}</span>
                  </h2>
                  
                  <div className="space-y-6 mb-10">
                      <div className={`flex justify-between uppercase text-[10px] font-black tracking-widest ${summaryLabelClass}`}>
                          <span>{currentLang === 'id' ? 'Jumlah' : 'Quantity'}</span>
                          <span className={`${textMainClass}`}>{ticketQuantity} {currentLang === 'id' ? 'Tiket' : 'Tickets'}</span>
                      </div>
                      <div className={`pt-6 border-t ${summaryBorderClass}`}>
                          <span className={`uppercase text-[9px] font-black tracking-[0.2em] block mb-2 ${summaryLabelClass}`}>
                            {currentLang === 'id' ? 'Total Bayar' : 'Total Payable'}
                          </span>
                          <div className="flex items-baseline gap-2">
                              <span className={`text-3xl md:text-4xl font-black italic tracking-tighter ${summaryValueClass}`}>
                                Rp {totalPrice.toLocaleString('id-ID')}
                              </span>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleConfirmOrder}
                    disabled={isBooking}
                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[10px] flex justify-center items-center gap-3 transition-all active:scale-95 ${
                      isBooking ? buttonDisabledClass : buttonConfirmClass
                    }`}
                  >
                    {isBooking ? <Loader2 className="animate-spin" size={16} /> : (currentLang === 'id' ? "Konfirmasi Pesanan" : "Confirm Order")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PremiumBackground>
    </MainLayout>
  );
};

export default Cart;