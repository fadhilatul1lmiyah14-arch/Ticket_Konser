import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const eventFromState = location.state?.event;

  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!eventFromState) {
      navigate('/');
    }
  }, [eventFromState, navigate]);

  if (!eventFromState) return null;

  const totalPrice = ticketQuantity * (eventFromState.price || 0);

  const handleConfirmOrder = async () => {
    setIsBooking(true);
    setErrorMessage('');

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      setErrorMessage("Sesi berakhir. Silakan login kembali.");
      setIsBooking(false);
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      const payload = {
        user_id: String(userId),
        event_id: Number(eventFromState.id),
        quantity: Number(ticketQuantity)
      };

      console.log("1. Mengirim Payload:", payload);

      const response = await fetch('http://192.168.0.242:3000/customer/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("2. Response Backend Lengkap:", result);

      if (response.ok) {
        /**
         * PERBAIKAN KRUSIAL: 
         * Mengambil ID dari berbagai kemungkinan struktur response backend (Elysia/Prisma)
         */
        const orderId = result.id || result.data?.id || result.booking?.id || result.order_id;

        console.log("3. Order ID yang didapat:", orderId);

        if (orderId) {
          console.log("4. Melakukan Navigasi ke Checkout...");
          navigate('/checkout', { 
            state: { 
              booking: {
                order_id: orderId, 
                event_name: eventFromState.name,
                total_price: totalPrice,
                quantity: ticketQuantity,
                image: eventFromState.image
              } 
            } 
          });
        } else {
          console.error("Gagal Navigasi: ID tidak ditemukan dalam response.");
          setErrorMessage("Pesanan berhasil, namun data ID tidak diterima dari server.");
        }
      } else {
        console.error("Backend Error:", result);
        setErrorMessage(result.message || "Gagal membuat pesanan (Server Error).");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setErrorMessage("Gagal terhubung ke server. Pastikan koneksi backend aktif.");
    } finally {
      setIsBooking(false);
    }
  };

  if (isDeleted) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#0f172a] text-center">
            <h2 className="text-white text-3xl font-black italic uppercase">Keranjang Kosong</h2>
            <button 
              onClick={() => navigate('/')} 
              className="mt-6 bg-purple-600 px-8 py-3 rounded-xl text-white font-black uppercase tracking-widest hover:bg-purple-700 transition-all"
            >
              Cari Konser
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
               className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors shadow-lg"
             >
                <ArrowLeft size={24} />
             </button>
             <h1 className="text-4xl font-black uppercase italic tracking-tighter">
               My <span className="text-purple-500">Cart</span>
             </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900/50 rounded-[40px] border border-slate-800 p-8 hover:border-purple-500/50 transition-all">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-44 h-44 shrink-0 overflow-hidden rounded-[30px]">
                    <img 
                      src={eventFromState.image} 
                      className="w-full h-full object-cover" 
                      alt={eventFromState.name} 
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-purple-400 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Selected Event</p>
                        <h3 className="text-2xl font-black uppercase italic leading-none">{eventFromState.name}</h3>
                      </div>
                      <button 
                        onClick={() => setIsDeleted(true)} 
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>

                    <div className="flex justify-between items-end mt-6">
                      <div className="space-y-1">
                         <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Price per ticket</p>
                         <p className="text-2xl font-black italic tracking-tight">
                           Rp {Number(eventFromState.price).toLocaleString('id-ID')}
                         </p>
                      </div>
                      
                      <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-2xl border border-slate-700">
                        <button 
                          onClick={() => ticketQuantity > 1 && setTicketQuantity(ticketQuantity - 1)} 
                          className="w-10 h-10 bg-slate-700 rounded-lg text-white flex items-center justify-center hover:bg-slate-600 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-black italic text-lg w-8 text-center">{ticketQuantity}</span>
                        <button 
                          onClick={() => setTicketQuantity(ticketQuantity + 1)} 
                          className="w-10 h-10 bg-purple-600 rounded-lg text-white flex items-center justify-center hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-5 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
                  <AlertCircle size={24} />
                  <p className="font-black text-[10px] uppercase tracking-[0.15em]">{errorMessage}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900/50 rounded-[40px] border border-slate-800 p-10 h-fit sticky top-10">
                <h2 className="text-xl font-black uppercase italic mb-8 border-b border-slate-800 pb-4 tracking-tighter">Payment Summary</h2>
                
                <div className="space-y-4 mb-10">
                    <div className="flex justify-between uppercase text-[10px] font-black text-slate-400 tracking-widest">
                        <span>Quantity</span>
                        <span className="text-white">{ticketQuantity} Tickets</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Total Price</span>
                        <span className="text-3xl font-black text-purple-400 italic tracking-tighter">
                          Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>

                <button 
                  onClick={handleConfirmOrder}
                  disabled={isBooking}
                  className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all active:scale-95 shadow-2xl ${
                    isBooking 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
                  }`}
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </button>
                <p className="text-[9px] text-slate-500 font-bold uppercase text-center mt-6 tracking-[0.2em] leading-relaxed italic">
                  Link pembayaran akan otomatis dibuat melalui gerbang aman Xendit.
                </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;