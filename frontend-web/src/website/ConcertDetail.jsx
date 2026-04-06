import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Share2, ChevronLeft, Star, 
  ShieldCheck, ChevronRight, Ticket, Info, 
  Clock, ArrowRight, Users, Loader2, AlertCircle 
} from 'lucide-react';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';

const ConcertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const fetchConcertDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/customer/events/${id}`);
        const data = response.data?.data;
        setConcert(data);
        
        if (data?.ticket_types?.length > 0) {
          const available = data.ticket_types.find(t => t.remaining_quota > 0);
          setSelectedTicket(available || data.ticket_types[0]);
        }
      } catch (err) {
        console.error("Gagal mengambil detail konser:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchConcertDetail();
  }, [id]);

  const nextImage = () => {
    if (concert?.images && concert.images.length > 0) {
      setCurrentImgIndex((prev) => (prev === concert.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (concert?.images && concert.images.length > 0) {
      setCurrentImgIndex((prev) => (prev === 0 ? concert.images.length - 1 : prev - 1));
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: concert?.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link disalin ke clipboard!');
      }
    } catch (err) { console.error(err); }
  };

  const handleBooking = () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedTicket || selectedTicket.remaining_quota <= 0) {
      alert("Silakan pilih kategori tiket yang tersedia.");
      return;
    }

    const eventData = {
      event_id: id,
      ticket_type_id: selectedTicket.id,
      ticket_name: selectedTicket.name,
      title: concert.title,
      price: selectedTicket.price,
      image: concert.images?.[0] || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000",
      location: concert.location,
      date: concert.event_date
    };

    localStorage.setItem('cart', JSON.stringify([eventData]));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  if (loading) return (
    <MainLayout>
      <div className="min-h-screen bg-[#fcfcfd] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <p className="mt-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Synchronizing Venue...</p>
      </div>
    </MainLayout>
  );

  if (!concert) return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <h2 className="text-3xl font-black text-slate-900 uppercase italic">Event Not Found</h2>
      </div>
    </MainLayout>
  );

  const tabs = ['Overview', 'Lineup Artis', 'Deskripsi', 'Syarat & Ketentuan'];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-4 uppercase italic flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span> Quick Info
            </h4>
           <p className="text-slate-500 leading-relaxed text-base mb-8 font-medium">
            Bersiaplah menjadi saksi dari kemegahan luar biasa dalam pertunjukan 
            <span className="text-slate-900 font-bold"> "{concert.title}"</span>. 
            Malam penuh euforia dan melodi yang tak terlupakan ini akan segera mengguncang panggung 
            <span className="text-slate-900 font-bold"> {concert.location}</span>. 
            Jangan biarkan diri Anda hanya menjadi penonton di layar gadget—rasakan energinya secara langsung! 
            Segera amankan slot Anda sekarang juga, karena ribuan pasang mata sudah mengincar posisi yang sama dan kuota sangat terbatas.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg shadow-green-100"><ShieldCheck size={20} /></div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Total Availability</p>
                  <p className="text-green-600 font-bold uppercase text-xs italic">
                    {concert.remaining_quota > 0 ? `${concert.remaining_quota} Slots Left` : 'Sold Out'}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="bg-purple-500 text-white p-3 rounded-xl shadow-lg shadow-purple-100"><Star size={20} /></div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Category</p>
                  <p className="text-slate-800 font-bold uppercase text-xs italic">{concert.category || "General Event"}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Lineup Artis':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-6 uppercase italic border-b-2 border-purple-600 w-fit pb-1">GUEST STARS</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {concert.casts && concert.casts.length > 0 ? (
                concert.casts.map((artist, index) => (
                  <div key={index} className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase text-base italic">{artist}</p>
                      <p className="text-purple-600 text-[9px] font-black uppercase tracking-widest">Featured Performer</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <div className="w-12 h-12 bg-slate-300 rounded-xl flex items-center justify-center text-white font-black">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-black text-slate-900 uppercase text-base italic">TBA</p>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">To Be Announced</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'Deskripsi':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left w-full">
            <h4 className="text-lg font-black text-slate-900 mb-6 uppercase italic flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span> Event Narratives
            </h4>
            
            <div className="w-full">
              {Array.isArray(concert.description) ? (
                <div className="grid gap-6">
                  {concert.description.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 quill-content text-slate-600 leading-relaxed font-medium text-base transition-all hover:shadow-md"
                    >
                      <div dangerouslySetInnerHTML={{ __html: item }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-600 quill-content">
                  <div dangerouslySetInnerHTML={{ __html: concert.description || "Tidak ada deskripsi tambahan." }} />
                </div>
              )}
            </div>
            
            <style>{`
                .quill-content {
                  word-wrap: break-word;
                  overflow-wrap: break-word;
                  word-break: normal;
                  max-width: 100%;
                }
                .quill-content h1, .quill-content h2, .quill-content h3 { 
                  font-weight: 900; 
                  color: #0f172a; 
                  margin-top: 1.5rem;
                  margin-bottom: 1rem; 
                  text-transform: uppercase; 
                  font-style: italic; 
                  line-height: 1.2;
                }
                .quill-content ul { 
                  list-style-type: disc !important;
                  padding-left: 1.5rem; 
                  margin-bottom: 1.5rem; 
                }
                .quill-content li { 
                  display: list-item !important;
                  margin-bottom: 0.8rem; 
                }
                .quill-content p { 
                  margin-bottom: 1.2rem; 
                  line-height: 1.8; 
                  white-space: normal; 
                }
                .quill-content table { 
                  width: 100% !important; 
                  border-collapse: collapse; 
                  margin: 1.5rem 0;
                  display: block;
                  overflow-x: auto;
                }
                .quill-content th, .quill-content td { 
                  border: 1px solid #e2e8f0;
                  padding: 12px;
                  min-width: 100px;
                }
            `}</style>
          </div>
        );

      case 'Syarat & Ketentuan':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-6 uppercase italic">House Rules & Terms</h4>
            <div className="grid gap-3">
              {(concert.terms_conditions || "Dilarang membawa senjata tajam.\nDilarang membawa obat-obatan terlarang.\nTiket tidak dapat di-refund.").split('\n').map((rule, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all group">
                  <div className="bg-slate-100 text-slate-400 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <ShieldCheck size={16} />
                  </div>
                  <p className="font-bold text-slate-600 text-xs italic">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <MainLayout>
      <div className="bg-[#fcfcfd] min-h-screen font-sans pb-20 text-left">
        
        {/* HERO SECTION */}
        <div className="relative w-full h-[400px] md:h-[550px] bg-slate-900 overflow-hidden text-left">
            {concert.images && concert.images.length > 0 ? concert.images.map((img, idx) => (
                <img 
                    key={idx} src={img} 
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${idx === currentImgIndex ? 'opacity-70' : 'opacity-0'}`} 
                    alt="Concert" 
                />
            )) : (
              <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000" className="absolute inset-0 w-full h-full object-cover opacity-70" alt="Placeholder" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#fcfcfd] via-transparent to-black/20 flex flex-col justify-between p-6 md:p-10">
                <div className="flex justify-between items-start">
                    <button onClick={() => navigate(-1)} className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl text-white border border-white/20 hover:bg-white hover:text-black transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    
                    {concert.images?.length > 1 && (
                      <div className="bg-black/20 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/10 text-white font-black text-[9px] uppercase tracking-widest">
                          {currentImgIndex + 1} / {concert.images?.length}
                      </div>
                    )}
                </div>

                <div className="flex justify-between items-end mb-6">
                    <div className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl border border-white/10 hidden md:block italic">
                        Experience The Music 2026
                    </div>
                    
                    {concert.images?.length > 1 && (
                      <div className="flex gap-3">
                          <button onClick={prevImage} className="bg-purple-600 text-white p-4 rounded-2xl shadow-xl hover:bg-purple-700 transition-all border border-white/20 active:scale-90">
                            <ChevronLeft size={20}/>
                          </button>
                          <button onClick={nextImage} className="bg-purple-600 text-white p-4 rounded-2xl shadow-xl hover:bg-purple-700 transition-all border border-white/20 active:scale-90">
                            <ChevronRight size={20}/>
                          </button>
                      </div>
                    )}
                </div>
            </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 md:px-6 mt-[-60px] relative z-20">
          
          {/* TAB MENU */}
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 bg-white/80 backdrop-blur-2xl p-2 rounded-[2rem] border border-white shadow-2xl mb-10 sticky top-24 z-30">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap flex-1 py-3.5 px-6 text-[10px] font-black transition-all uppercase tracking-widest rounded-full ${
                  activeTab === tab 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
            
            {/* LEFT CONTENT */}
            <div className="lg:col-span-8">
              <div className="bg-white p-8 md:p-14 rounded-[3.5rem] border border-slate-50 shadow-xl relative mb-8 text-left overflow-hidden">
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-10 bg-purple-600"></div>
                    <p className="text-purple-600 font-black text-[9px] uppercase tracking-widest">Public Event</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-tight">
                        {concert.title}
                    </h2>
                    <button onClick={handleShare} className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2">
                        <Share2 size={14}/> Share
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
                  <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                      <div className="bg-white p-3 rounded-xl shadow-md text-purple-600"><MapPin size={24}/></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Venue</p>
                        <p className="text-sm font-black text-slate-800 uppercase italic line-clamp-1">{concert.location}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                      <div className="bg-white p-3 rounded-xl shadow-md text-purple-600"><Calendar size={24}/></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Date</p>
                        <p className="text-sm font-black text-slate-800 uppercase italic">
                            {concert.event_date ? new Date(concert.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : "TBA"}
                        </p>
                      </div>
                  </div>
                </div>

                <hr className="border-slate-100 mb-10" />
                
                <div className="min-h-[250px] w-full">
                  {renderContent()}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR (BOOKING CARD) */}
            <div className="lg:col-span-4 lg:sticky lg:top-32">
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white border-4 border-white overflow-hidden relative text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 blur-[60px]"></div>
                  
                  <div className="relative">
                    <div className="bg-white/10 w-fit px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-6 border border-white/10 italic">
                        Select Category
                    </div>
                    
                    {/* TICKET TYPE SELECTOR */}
                    <div className="space-y-3 mb-8">
                      {concert.ticket_types?.map((type) => (
                        <div 
                          key={type.id}
                          onClick={() => type.remaining_quota > 0 && setSelectedTicket(type)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            selectedTicket?.id === type.id 
                            ? 'border-purple-500 bg-purple-500/10' 
                            : 'border-white/5 bg-white/5 hover:border-white/20'
                          } ${type.remaining_quota <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-black uppercase italic text-xs tracking-widest">{type.name}</span>
                            <span className="text-purple-400 font-black text-sm">
                              IDR {Number(type.price).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] uppercase font-bold text-slate-500 tracking-widest">
                              {type.remaining_quota > 0 ? `${type.remaining_quota} Seats Available` : 'Sold Out'}
                            </span>
                            {selectedTicket?.id === type.id && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 mb-8 border-t border-white/10 pt-6">
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-300">
                          <Clock size={14} className="text-purple-400"/> {concert.start_time?.slice(0,5) || "19:00"} WIB
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-300">
                          <ShieldCheck size={14} className="text-green-400"/> Secure Booking
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={handleBooking} 
                      disabled={!selectedTicket || selectedTicket.remaining_quota <= 0}
                      className={`w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 group ${
                        selectedTicket?.remaining_quota > 0 
                        ? 'bg-white text-slate-900 hover:bg-purple-600 hover:text-white' 
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {selectedTicket?.remaining_quota > 0 ? (
                        <>PROCEED TO CART <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                      ) : 'SEAT UNAVAILABLE'}
                    </button>
                    
                    <p className="mt-5 text-[8px] font-bold uppercase tracking-widest text-slate-500 text-center italic">
                        Price includes service fee & tax
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default ConcertDetail;