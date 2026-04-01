import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Share2, ChevronLeft, Star, ShieldCheck, Zap, ChevronRight, Ticket, Info, Clock, ArrowRight } from 'lucide-react';
import api from '../api/axiosConfig'; 
import MainLayout from '../layouts/MainLayout';

const ConcertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const fetchConcertDetail = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/customer/events/${id}`);
        // SINKRONISASI: Ambil dari .data.data sesuai standar response backend
        const data = response.data?.data || response.data;
        setConcert(data);
      } catch (err) {
        console.error("Gagal mengambil detail konser:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchConcertDetail();
  }, [id]);

  const nextImage = () => {
    if (concert?.images?.length) {
      setCurrentImgIndex((prev) => (prev === concert.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (concert?.images?.length) {
      setCurrentImgIndex((prev) => (prev === 0 ? concert.images.length - 1 : prev - 1));
    }
  };

  const tabs = ['Overview', 'Lineup Artis', 'Deskripsi', 'Syarat & Ketentuan'];

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

  // FUNGSI NAVIGASI KE CART DENGAN DATA LENGKAP
  const handleBooking = () => {
    navigate('/cart', { 
      state: { 
        event: {
          id: id,
          name: concert.title,
          price: concert.current_price,
          image: concert.images?.[0] || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000"
        } 
      } 
    });
  };

  if (loading) return (
    <MainLayout>
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-4 font-bold uppercase text-[10px] tracking-widest text-slate-400">Loading Experience...</p>
      </div>
    </MainLayout>
  );

  if (!concert) return <MainLayout><div className="text-center py-20 font-bold uppercase italic text-white">Event Not Found</div></MainLayout>;

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-4 uppercase italic flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span> Highlight
            </h4>
            <p className="text-slate-500 leading-relaxed text-base mb-8 font-medium">
              {concert.description || "Bersiaplah untuk pengalaman musikalitas tinggi yang akan merubah cara Anda menikmati pertunjukan live secara eksklusif."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg shadow-green-100"><ShieldCheck size={20} /></div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Status</p>
                  <p className="text-green-600 font-bold uppercase text-xs italic">
                    {concert.remaining_quota > 0 ? 'Tickets Ready' : 'Sold Out'}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center gap-4 text-left">
                <div className="bg-purple-500 text-white p-3 rounded-xl shadow-lg shadow-purple-100"><Star size={20} /></div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Category</p>
                  <p className="text-slate-800 font-bold uppercase text-xs italic">
                    {concert.category?.category_name || "Top Tier Event"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Lineup Artis':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-6 uppercase italic border-b-2 border-purple-600 w-fit pb-1">GUEST STARS</h4>
            <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {concert.title?.charAt(0)}
                </div>
                <div>
                    <p className="font-black text-slate-900 uppercase text-lg italic leading-tight">{concert.title}</p>
                    <p className="text-purple-600 text-[10px] font-black uppercase tracking-widest">Main Headliner</p>
                </div>
            </div>
          </div>
        );
      case 'Deskripsi':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-4 uppercase italic">The Concept</h4>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl">
               <p className="text-slate-300 leading-relaxed font-medium text-base italic">
                {concert.description || `"${concert.title}" adalah perjalanan audio-visual yang dirancang khusus untuk menciptakan harmoni antara musisi dan penggemar dalam suasana yang intim namun megah.`}
              </p>
            </div>
          </div>
        );
      case 'Syarat & Ketentuan':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-6 uppercase italic">House Rules</h4>
            <div className="grid gap-3">
              {(concert.terms_conditions || "E-tiket wajib ditukar sebelum acara.\nMembawa kartu identitas asli.\nDilarang membawa senjata tajam & narkoba.").split('\n').map((rule, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all group">
                  <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] group-hover:bg-purple-600 transition-colors">0{i+1}</span>
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
        
        {/* 1. HERO IMAGE SECTION */}
        <div className="relative w-full h-[400px] md:h-[550px] bg-slate-900 overflow-hidden">
            {concert.images?.length > 0 ? concert.images.map((img, idx) => (
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
                    <div className="bg-black/20 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/10 text-white font-black text-[9px] uppercase tracking-widest">
                        {currentImgIndex + 1} / {concert.images?.length || 1}
                    </div>
                </div>

                <div className="flex justify-between items-end mb-6">
                    <div className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl border border-white/10 hidden md:block italic">
                        Official Event Experience 2026
                    </div>
                    <div className="flex gap-3">
                        <button onClick={prevImage} className="bg-purple-600 text-white p-4 rounded-2xl shadow-xl hover:bg-purple-700 transition-all active:scale-90 border border-white/20">
                          <ChevronLeft size={20}/>
                        </button>
                        <button onClick={nextImage} className="bg-purple-600 text-white p-4 rounded-2xl shadow-xl hover:bg-purple-700 transition-all active:scale-90 border border-white/20">
                          <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 md:px-6 mt-[-60px] relative z-20">
          
          {/* 2. TAB MENU */}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            
            {/* LEFT CONTENT */}
            <div className="lg:col-span-8 relative z-10 text-left">
              <div className="bg-white p-8 md:p-14 rounded-[3.5rem] border border-slate-50 shadow-xl relative overflow-hidden mb-8">
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-10 bg-purple-600"></div>
                    <p className="text-purple-600 font-black text-[9px] uppercase tracking-widest">Featured Concert</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-tight">
                        {concert.title}
                    </h2>
                    <button onClick={handleShare} className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2">
                        <Share2 size={14}/> Share
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all text-left">
                      <div className="bg-white p-3 rounded-xl shadow-md text-purple-600"><MapPin size={24}/></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Venue</p>
                        <p className="text-sm font-black text-slate-800 uppercase italic">
                            {concert.location?.location_name || "TBA"}
                        </p>
                      </div>
                  </div>
                  <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all text-left">
                      <div className="bg-white p-3 rounded-xl shadow-md text-purple-600"><Calendar size={24}/></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Schedule</p>
                        <p className="text-sm font-black text-slate-800 uppercase italic">
                            {concert.event_date ? new Date(concert.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "TBA"}
                        </p>
                      </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-10">
                   <div className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Ticket size={14}/> {concert.remaining_quota} / {concert.total_quota} Slots Available
                   </div>
                   <div className="bg-purple-100 text-purple-600 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-purple-200 flex items-center gap-2">
                    <Star size={14}/> {concert.category?.category_name || "Premium"}
                   </div>
                </div>

                <hr className="border-slate-100 mb-10" />
                
                <div className="min-h-[250px] relative z-20">
                  {renderContent()}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="lg:col-span-4 sticky top-32 z-10 text-left">
                <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl text-white border-4 border-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 blur-[60px]"></div>
                  
                  <div className="relative">
                    <div className="bg-white/10 w-fit px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-8 border border-white/10 italic">
                        Admission Pass
                    </div>
                    
                    <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest mb-2">Price Starting From</p>
                    <div className="flex items-baseline gap-2 mb-10">
                      <span className="text-lg font-black text-purple-400 italic">IDR</span>
                      <h3 className="text-5xl font-black tracking-tighter italic">
                        {Number(concert.current_price || 0).toLocaleString('id-ID')}
                      </h3>
                    </div>

                    <div className="space-y-4 mb-10 border-t border-white/10 pt-6">
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-300">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Time: {concert.start_time || "TBA"}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-300">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Secure Payment
                      </div>
                    </div>

                    <button 
                      onClick={handleBooking} 
                      disabled={concert.remaining_quota <= 0}
                      className={`w-full py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 group ${
                        concert.remaining_quota > 0 
                        ? 'bg-white text-slate-900 hover:bg-purple-600 hover:text-white' 
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {concert.remaining_quota > 0 ? (
                        <>BOOK NOW <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
                      ) : 'SOLD OUT'}
                    </button>
                    
                    <p className="mt-6 text-[8px] font-bold uppercase tracking-widest text-slate-500 text-center italic">
                        Tax included • Non-refundable
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