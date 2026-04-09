import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Share2, ChevronLeft, Star, 
  ShieldCheck, ChevronRight, Ticket, Info, 
  Clock, ArrowRight, Users, Loader2, AlertCircle,
  ExternalLink, FileText
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
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'id');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Helper untuk mendapatkan teks berdasarkan bahasa aktif
  const getLangText = (data) => {
    if (!data) return "";
    if (typeof data === 'string') return data;
    return data[currentLang] || data['id'] || "";
  };

  useEffect(() => {
    const handleLangChange = () => {
      const newLang = localStorage.getItem('lang') || 'id';
      setCurrentLang(newLang);
    };
    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

  useEffect(() => {
    const fetchConcertDetail = async () => {
      try {
        setLoading(true);
        // Memanggil detail event
        const response = await api.get(`/customer/events/${id}`);
        const data = response.data?.data;
        
        // PERBAIKAN: Bungkus Global Terms ke dalam objek { id, en } agar seragam
        if (data && Array.isArray(data.terms)) {
          data.terms = data.terms.map(term => {
            if (typeof term === 'string') {
              return { id: term, en: term };
            }
            return term;
          });
        }
        
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

  const handleOpenMap = () => {
    if (!concert) return;
    const query = encodeURIComponent(`${concert.location} ${concert.address_details || ''}`);
    // PERBAIKAN: Menggunakan URL Google Maps yang benar
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

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
    const displayTitle = getLangText(concert?.title);
    try {
      if (navigator.share) {
        await navigator.share({ title: displayTitle, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(currentLang === 'id' ? 'Link disalin ke clipboard!' : 'Link copied to clipboard!');
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
      title: getLangText(concert.title),
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

  const tabs = currentLang === 'id' 
    ? ['Overview', 'Lineup Artis', 'Deskripsi', 'Syarat & Ketentuan']
    : ['Overview', 'Artist Lineup', 'Description', 'Terms & Conditions'];

  const renderContent = () => {
    const activeTabLower = activeTab.toLowerCase();

    if (activeTabLower === 'overview' || activeTab === 'Overview') {
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-4 uppercase italic flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span> {currentLang === 'id' ? 'Info Singkat' : 'Quick Info'}
            </h4>
            <div className="text-slate-500 leading-relaxed text-base mb-8 font-medium">
              {currentLang === 'id' ? 'Bersiaplah menjadi saksi dari kemegahan luar biasa dalam pertunjukan' : 'Prepare to witness the extraordinary grandeur in the performance of'} 
              <span className="text-slate-900 font-bold"> "{getLangText(concert.title)}"</span>. 
              {currentLang === 'id' ? 'Malam penuh euforia dan melodi yang tak terlupakan ini akan segera mengguncang panggung' : 'This unforgettable night of euphoria and melody will soon shake the stage at'} 
              <span className="text-slate-900 font-bold"> {concert.location}</span>. 
              
              <span className="block mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 italic">
                <span className="font-black text-slate-400 uppercase text-[9px] block mb-1 tracking-widest">{currentLang === 'id' ? 'Detail Lokasi' : 'Location Detail'}</span>
                {concert.address_details || (currentLang === 'id' ? "Informasi alamat lengkap akan tertera pada e-tiket Anda." : "Full address information will be listed on your e-ticket.") }
              </span>

              <p className="mt-4">
                {currentLang === 'id' 
                  ? 'Jangan biarkan diri Anda hanya menjadi penonton di layar gadget—rasakan energinya secara langsung! Segera amankan slot Anda sekarang juga, karena ribuan pasang mata sudah mengincar posisi yang sama dan kuota sangat terbatas.'
                  : "Don't let yourself just be a viewer on a gadget screen—feel the energy in person! Secure your slot right now, because thousands of pairs of eyes are already eyeing the same position and quota is very limited."}
              </p>
            </div>
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
    }

    if (activeTabLower === 'lineup artis' || activeTabLower === 'artist lineup') {
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
            <h4 className="text-lg font-black text-slate-900 mb-6 uppercase italic border-b-2 border-purple-600 w-fit pb-1">{currentLang === 'id' ? 'BINTANG TAMU' : 'GUEST STARS'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {concert.casts && concert.casts.length > 0 ? (
                concert.casts.map((artist, index) => (
                  <div key={index} className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-lg group">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 uppercase text-base italic">{artist}</p>
                      <p className="text-purple-600 text-[9px] font-black uppercase tracking-widest">{currentLang === 'id' ? 'Penampil Utama' : 'Featured Performer'}</p>
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
    }

    if (activeTabLower === 'deskripsi' || activeTabLower === 'description') {
        let descriptionArray = [];
        try {
            descriptionArray = typeof concert.description === 'string' 
                ? JSON.parse(concert.description) 
                : concert.description;
        } catch (e) {
            descriptionArray = [];
        }

        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left w-full">
            <h4 className="text-lg font-black text-slate-900 mb-6 uppercase italic flex items-center gap-2">
              <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span> {currentLang === 'id' ? 'Narasi Event' : 'Event Narratives'}
            </h4>
            <div className="w-full space-y-6">
              {Array.isArray(descriptionArray) && descriptionArray.length > 0 ? (
                descriptionArray.map((item, idx) => {
                  const rawHtml = getLangText(item);
                  const cleanedContent = rawHtml
                    .replace(/&nbsp;/g, ' ') 
                    .replace(/background-color:[^;]+;/g, '') 
                    .replace(/color:[^;]+;/g, 'color: inherit;'); 

                  return (
                    <div key={idx} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                      <div className="quill-content text-slate-600 font-medium text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanedContent }} />
                    </div>
                  );
                })
              ) : (
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm text-slate-400 italic">
                   {currentLang === 'id' ? 'Tidak ada deskripsi.' : 'No description available.'}
                </div>
              )}
            </div>
            <style>{`
                .quill-content { word-wrap: break-word; overflow-wrap: break-word; word-break: normal; white-space: normal; max-width: 100%; }
                .quill-content span { background-color: transparent !important; color: inherit !important; }
                .quill-content p { margin-bottom: 1.25rem; line-height: 1.8; }
                .quill-content img { max-width: 100%; height: auto; border-radius: 1.5rem; margin: 1.5rem 0; }
                .quill-content ul, .quill-content ol { padding-left: 1.5rem; margin-bottom: 1rem; }
                .quill-content li { list-style: inherit; margin-bottom: 0.5rem; }
            `}</style>
          </div>
        );
    }

    if (activeTabLower === 'syarat & ketentuan' || activeTabLower === 'terms & conditions') {
        let allTerms = [];
        
        if (Array.isArray(concert.terms)) {
            allTerms = [...concert.terms];
        } else if (typeof concert.terms === 'string') {
            try {
                allTerms = JSON.parse(concert.terms);
            } catch (e) {
                allTerms = [concert.terms];
            }
        }

        const specificRules = concert.rules || concert.event_terms || [];
        if (Array.isArray(specificRules)) {
            allTerms = [...allTerms, ...specificRules];
        }

        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left space-y-8">
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[2px] w-8 bg-purple-600"></div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em] italic">
                  {currentLang === 'id' ? 'Protokol & Ketentuan Event' : 'Event Protocols & Terms'}
                </h4>
                <div className="h-[2px] flex-1 bg-slate-100"></div>
              </div>
              
              <div className="grid gap-3">
                {allTerms.length > 0 ? (
                  allTerms.map((rule, i) => (
                    <div key={i} className="flex items-start gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-white transition-all group shadow-sm">
                      <div className="bg-white text-purple-600 p-2.5 rounded-xl shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors mt-0.5">
                        <ShieldCheck size={18} />
                      </div>
                      <p className="font-bold text-slate-700 text-xs md:text-sm italic leading-relaxed">
                        {getLangText(rule).replace(/<[^>]*>?/gm, '')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 italic text-sm">{currentLang === 'id' ? 'Tidak ada ketentuan khusus.' : 'No specific terms available.'}</p>
                  </div>
                )}
              </div>
            </section>
            
            <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100">
               <div className="flex gap-3 items-center text-purple-600 mb-2">
                  <Info size={18} />
                  <p className="text-[10px] font-black uppercase tracking-widest">{currentLang === 'id' ? 'Informasi Penting' : 'Important Notice'}</p>
               </div>
               <p className="text-xs text-purple-800/70 font-medium leading-relaxed">
                 {currentLang === 'id' 
                   ? 'Dengan membeli tiket ini, Anda dianggap telah menyetujui seluruh syarat dan ketentuan yang berlaku di atas. E-tiket resmi hanya dikirimkan melalui sistem RalyTicket.' 
                   : 'By purchasing this ticket, you are deemed to have agreed to all the terms and conditions mentioned above. Official e-tickets are only sent through the RalyTicket system.'}
               </p>
            </div>
          </div>
        );
    }
    return null;
  };

  return (
    <MainLayout>
      <div className="bg-[#fcfcfd] min-h-screen font-sans pb-20 text-left overflow-visible">
        <div className="relative w-full h-[400px] md:h-[550px] bg-slate-900 overflow-hidden text-left">
            {concert.images && concert.images.length > 0 ? concert.images.map((img, idx) => (
                <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${idx === currentImgIndex ? 'opacity-70' : 'opacity-0'}`} alt="Concert" />
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

        <main className="max-w-6xl mx-auto px-4 md:px-6 mt-[-60px] relative z-20 overflow-visible">
          <div className="flex flex-col lg:flex-row gap-8 items-start text-left overflow-visible">
            <div className="w-full lg:w-2/3">
              <div className="bg-white p-8 md:p-14 rounded-[3.5rem] border border-slate-50 shadow-xl relative text-left overflow-hidden">
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-10 bg-purple-600"></div>
                    <p className="text-purple-600 font-black text-[9px] uppercase tracking-widest">Public Event</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-tight">
                        {getLangText(concert.title)}
                    </h1>
                    <button onClick={handleShare} className="bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2">
                        <Share2 size={14}/> {currentLang === 'id' ? 'Bagikan' : 'Share'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
                  <div onClick={handleOpenMap} className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer group shadow-sm">
                      <div className="bg-white p-3 rounded-xl shadow-md text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all"><MapPin size={24}/></div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-purple-400">{currentLang === 'id' ? 'Informasi Venue' : 'Venue Information'}</p>
                        <p className="text-sm font-black text-slate-800 uppercase italic leading-tight mb-1">{concert.location}</p>
                        <p className="text-[10px] font-medium text-slate-500 italic line-clamp-2 pr-4">{concert.address_details || "No detail address available"}</p>
                      </div>
                      <div className="text-slate-300 group-hover:text-purple-500 transform translate-x-2"><ExternalLink size={14} /></div>
                  </div>

                  <div className="flex items-center gap-5 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-sm">
                      <div className="bg-white p-3 rounded-xl shadow-md text-purple-600"><Calendar size={24}/></div>
                      <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{currentLang === 'id' ? 'Tanggal' : 'Date'}</p>
                        <p className="text-sm font-black text-slate-800 uppercase italic">
                            {concert.event_date ? new Date(concert.event_date).toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : "TBA"}
                        </p>
                      </div>
                  </div>
                </div>

                <hr className="border-slate-100 mb-8" />

                <div className="flex overflow-x-auto no-scrollbar gap-1.5 bg-slate-50/50 p-1.5 rounded-full border border-slate-100 mb-10">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap flex-1 py-3 px-4 text-[9px] font-black transition-all uppercase tracking-widest rounded-full ${
                          activeTab === tab 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                </div>
                
                <div className="min-h-[250px] w-full">
                  {renderContent()}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/3 lg:sticky lg:top-24 z-30">
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white border-4 border-white overflow-hidden relative text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 blur-[60px]"></div>
                  
                  <div className="relative">
                    <div className="bg-white/10 w-fit px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-6 border border-white/10 italic">
                        {currentLang === 'id' ? 'Pilih Kategori' : 'Select Category'}
                    </div>
                    
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
                              {type.remaining_quota > 0 ? `${type.remaining_quota} ${currentLang === 'id' ? 'Kursi Tersedia' : 'Seats Available'}` : 'Sold Out'}
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
                          <ShieldCheck size={14} className="text-green-400"/> {currentLang === 'id' ? 'Pemesanan Aman' : 'Secure Booking'}
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
                        <> {currentLang === 'id' ? 'LANJUT KE KERANJANG' : 'PROCEED TO CART'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                      ) : (currentLang === 'id' ? 'TIKET TIDAK TERSEDIA' : 'SEAT UNAVAILABLE')}
                    </button>
                    
                    <p className="mt-5 text-[8px] font-bold uppercase tracking-widest text-slate-500 text-center italic">
                        {currentLang === 'id' ? 'Harga sudah termasuk pajak & biaya layanan' : 'Price includes service fee & tax'}
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