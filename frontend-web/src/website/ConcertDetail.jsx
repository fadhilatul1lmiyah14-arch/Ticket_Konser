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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  const getLangText = (data) => {
    if (!data) return "";
    if (typeof data === 'string') return data;
    return data[currentLang] || data['id'] || "";
  };

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
        const response = await api.get(`/customer/events/${id}`);
        const data = response.data?.data;
        
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
       remaining_quota: selectedTicket.remaining_quota, 
      image: concert.images?.[0] || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000",
      location: concert.location,
      date: concert.event_date
    };

    localStorage.setItem('cart', JSON.stringify([eventData]));
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  // Light mode specific styles
  const mainCardClass = !isDarkMode 
    ? "bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl" 
    : "bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-2xl";
  
  const textMainClass = !isDarkMode ? "text-slate-800" : "text-white";
  const textSecondaryClass = !isDarkMode ? "text-slate-600" : "text-slate-300";
  const textMutedClass = !isDarkMode ? "text-slate-500" : "text-slate-400";
  
  const infoCardClass = !isDarkMode 
    ? "bg-white/60 border-slate-200" 
    : "bg-white/5 border-white/10";
  
  const infoIconClass = !isDarkMode 
    ? "bg-purple-100 text-purple-600" 
    : "bg-slate-800 text-purple-400";
  
  const badgeClass = !isDarkMode 
    ? "bg-white/60 border-slate-200 text-slate-600" 
    : "bg-white/5 border-white/10 text-purple-400";
  
  const tabButtonClass = !isDarkMode 
    ? "bg-white/80 text-slate-700 shadow-md" 
    : "bg-purple-600 text-white shadow-lg shadow-purple-600/20";
  
  const tabInactiveClass = !isDarkMode 
    ? "text-slate-500 hover:text-purple-600 hover:bg-purple-50" 
    : "text-slate-500 hover:text-white hover:bg-white/5";
  
  const sidebarClass = !isDarkMode 
    ? "bg-white/90 border-slate-200 shadow-2xl" 
    : "bg-slate-950 border-white/10 shadow-2xl";
  
  const ticketCardClass = !isDarkMode 
    ? "border-slate-200 bg-white/60" 
    : "border-white/5 bg-white/5";
  
  const ticketSelectedClass = !isDarkMode 
    ? "border-purple-500 bg-purple-50/80" 
    : "border-purple-600 bg-purple-600/10";
  
  const ticketDisabledClass = !isDarkMode ? "opacity-40" : "opacity-30";
  const buttonClass = !isDarkMode 
    ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-200/30" 
    : "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20";
  const buttonDisabledClass = !isDarkMode 
    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
    : "bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5";

  if (loading) return (
    <MainLayout>
      <div className={`min-h-screen flex flex-col items-center justify-center ${!isDarkMode ? 'bg-white' : 'bg-slate-950'}`}>
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className={`mt-4 font-black uppercase text-[10px] tracking-widest ${!isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Synchronizing Venue...</p>
      </div>
    </MainLayout>
  );

  if (!concert) return (
    <MainLayout>
      <div className={`min-h-screen flex items-center justify-center text-center px-6 ${!isDarkMode ? 'bg-white' : 'bg-slate-950'}`}>
        <h2 className={`text-3xl font-black uppercase italic ${!isDarkMode ? 'text-slate-800' : 'text-white'}`}>Event Not Found</h2>
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
            <h4 className={`text-lg font-black ${textMainClass} mb-4 uppercase italic flex items-center gap-2`}>
              <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span> {currentLang === 'id' ? 'Info Singkat' : 'Quick Info'}
            </h4>
            <div className={`${textSecondaryClass} leading-relaxed text-base mb-8 font-medium`}>
              {currentLang === 'id' ? 'Bersiaplah menjadi saksi dari kemegahan luar biasa dalam pertunjukan' : 'Prepare to witness the extraordinary grandeur in the performance of'} 
              <span className="text-purple-500 font-bold"> "{getLangText(concert.title)}"</span>. 
              {currentLang === 'id' ? ' Malam penuh euforia dan melodi yang tak terlupakan ini akan segera mengguncang panggung' : ' This unforgettable night of euphoria and melody will soon shake the stage at'} 
              <span className="text-purple-500 font-bold"> {concert.location}</span>. 
              
              <span className={`block mt-3 p-4 rounded-2xl border text-sm italic ${!isDarkMode ? 'bg-white/40 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                <span className={`font-black uppercase text-[9px] block mb-1 tracking-widest ${!isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{currentLang === 'id' ? 'Detail Lokasi' : 'Location Detail'}</span>
                {concert.address_details || (currentLang === 'id' ? "Informasi alamat lengkap akan tertera pada e-tiket Anda." : "Full address information will be listed on your e-ticket.") }
              </span>

              <p className="mt-4">
                {currentLang === 'id' 
                  ? 'Jangan biarkan diri Anda hanya menjadi penonton di layar gadget—rasakan energinya secara langsung! Segera amankan slot Anda sekarang juga.'
                  : "Don't let yourself just be a viewer on a gadget screen—feel the energy in person! Secure your slot right now."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border flex items-center gap-4 ${infoCardClass}`}>
                <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg shadow-green-500/20"><ShieldCheck size={20} /></div>
                <div>
                  <p className={`text-[9px] uppercase font-black tracking-widest ${textMutedClass}`}>Total Availability</p>
                  <p className="text-green-500 font-bold uppercase text-xs italic">
                    {concert.remaining_quota > 0 ? `${concert.remaining_quota} Slots Left` : 'Sold Out'}
                  </p>
                </div>
              </div>
              <div className={`p-5 rounded-2xl border flex items-center gap-4 ${infoCardClass}`}>
                <div className={`p-3 rounded-xl shadow-lg shadow-purple-500/20 ${!isDarkMode ? 'bg-purple-100 text-purple-600' : 'bg-purple-600 text-white'}`}><Star size={20} /></div>
                <div>
                  <p className={`text-[9px] uppercase font-black tracking-widest ${textMutedClass}`}>Category</p>
                  <p className={`font-bold uppercase text-xs italic ${textMainClass}`}>{concert.category || "General Event"}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }

    if (activeTabLower === 'lineup artis' || activeTabLower === 'artist lineup') {
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left">
            <h4 className={`text-lg font-black ${textMainClass} mb-6 uppercase italic border-b-2 border-purple-500 w-fit pb-1`}>{currentLang === 'id' ? 'BINTANG TAMU' : 'GUEST STARS'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {concert.casts && concert.casts.length > 0 ? (
                concert.casts.map((artist, index) => (
                  <div key={index} className={`flex items-center gap-4 p-5 rounded-3xl border transition-all hover:bg-opacity-20 group ${infoCardClass}`}>
                    <div className="bg-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-transform">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className={`font-black uppercase text-base italic ${textMainClass}`}>{artist}</p>
                      <p className="text-purple-400 text-[9px] font-black uppercase tracking-widest">{currentLang === 'id' ? 'Penampil Utama' : 'Featured Performer'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`flex items-center gap-4 p-5 rounded-3xl border ${infoCardClass}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${!isDarkMode ? 'bg-slate-200 text-slate-500' : 'bg-slate-800 text-slate-500'}`}>
                    <Users size={20} />
                  </div>
                  <div>
                    <p className={`font-black uppercase text-base italic ${textMutedClass}`}>TBA</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${textMutedClass}`}>To Be Announced</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }

    if (activeTabLower === 'deskripsi' || activeTabLower === 'description') {
        let rawDescription = concert.description;
        if (typeof rawDescription === 'string') {
            try { rawDescription = JSON.parse(rawDescription); } catch (e) { rawDescription = null; }
        }
        const contentArray = rawDescription ? (rawDescription[currentLang] || rawDescription['id']) : null;

        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left w-full">
            <h4 className={`text-lg font-black ${textMainClass} mb-6 uppercase italic flex items-center gap-2`}>
              <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span> 
              {currentLang === 'id' ? 'Narasi Event' : 'Event Narratives'}
            </h4>
            
            <div className="w-full space-y-6">
              {Array.isArray(contentArray) && contentArray.length > 0 ? (
                contentArray.map((htmlString, idx) => {
                  const cleanedContent = htmlString
                    .replace(/&nbsp;/g, ' ') 
                    .replace(/background-color:[^;]+;/g, '') 
                    .replace(/color:[^;]+;/g, 'color: inherit;'); 

                  return (
                    <div key={idx} className={`p-6 md:p-8 rounded-[2rem] border backdrop-blur-sm ${!isDarkMode ? 'bg-white/40 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                      <div 
                        /* Tambahkan break-words untuk keamanan extra di Tailwind */
                        className={`quill-content break-words font-medium text-base leading-relaxed ${!isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} 
                        dangerouslySetInnerHTML={{ __html: cleanedContent }} 
                      />
                    </div>
                  );
                })
              ) : (
                <div className={`p-6 md:p-8 rounded-[2rem] border italic ${!isDarkMode ? 'bg-white/40 border-slate-200 text-slate-500' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                   {currentLang === 'id' ? 'Tidak ada deskripsi.' : 'No description available.'}
                </div>
              )}
            </div>

            <style>{`
                .quill-content { 
                    /* SOLUSI UTAMA: Gunakan normal agar kata tidak terpotong di tengah */
                    word-break: normal; 
                    overflow-wrap: break-word; 
                    word-wrap: break-word;
                    text-align: justify; /* Opsional: agar lebih rapi seperti di koran */
                    hyphens: none; /* Mencegah pemotongan kata otomatis dengan tanda hubung */
                }
                .quill-content span { background-color: transparent !important; color: inherit !important; }
                .quill-content p { margin-bottom: 1.25rem; line-height: 1.8; }
                .quill-content strong { font-weight: 800; color: ${!isDarkMode ? '#1e293b' : '#f8fafc'}; }
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
            try { allTerms = JSON.parse(concert.terms); } catch (e) { allTerms = [concert.terms]; }
        }
        const specificRules = concert.rules || concert.event_terms || [];
        if (Array.isArray(specificRules)) { allTerms = [...allTerms, ...specificRules]; }

        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-left space-y-8">
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[2px] w-8 bg-purple-500"></div>
                <h4 className={`text-sm font-black uppercase tracking-[0.15em] italic ${textMutedClass}`}>
                  {currentLang === 'id' ? 'Protokol & Ketentuan Event' : 'Event Protocols & Terms'}
                </h4>
                <div className={`h-[2px] flex-1 ${!isDarkMode ? 'bg-slate-200' : 'bg-white/10'}`}></div>
              </div>
              <div className="grid gap-3">
                {allTerms.length > 0 ? (
                  allTerms.map((rule, i) => (
                    <div key={i} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all group ${infoCardClass}`}>
                      <div className={`p-2.5 rounded-xl transition-colors mt-0.5 ${!isDarkMode ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white' : 'bg-slate-800 text-purple-400 group-hover:bg-purple-600 group-hover:text-white'}`}>
                        <ShieldCheck size={18} />
                      </div>
                      <p className={`font-bold text-xs md:text-sm italic leading-relaxed ${textSecondaryClass}`}>
                        {getLangText(rule).replace(/<[^>]*>?/gm, '')}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className={`p-6 rounded-2xl border border-dashed text-center ${infoCardClass}`}>
                    <p className={`italic text-sm ${textMutedClass}`}>{currentLang === 'id' ? 'Tidak ada ketentuan khusus.' : 'No specific terms available.'}</p>
                  </div>
                )}
              </div>
            </section>
            <div className={`p-6 rounded-[2rem] border ${!isDarkMode ? 'bg-purple-50/60 border-purple-300/50' : 'bg-purple-900/20 border-purple-500/20'}`}>
                <div className="flex gap-3 items-center text-purple-500 mb-2">
                   <Info size={18} />
                   <p className="text-[10px] font-black uppercase tracking-widest">{currentLang === 'id' ? 'Informasi Penting' : 'Important Notice'}</p>
                </div>
                <p className={`text-xs font-medium leading-relaxed ${!isDarkMode ? 'text-purple-700/80' : 'text-purple-200/60'}`}>
                  {currentLang === 'id' 
                    ? 'Dengan membeli tiket ini, Anda dianggap telah menyetujui seluruh syarat dan ketentuan yang berlaku. E-tiket resmi hanya dikirimkan melalui sistem RalyTicket.' 
                    : 'By purchasing this ticket, you are deemed to have agreed to all terms. Official e-tickets are only sent through the RalyTicket system.'}
                </p>
            </div>
          </div>
        );
    }
    return null;
  };

  return (
    <MainLayout>
      {/* Background transparan agar PremiumBackground terlihat */}
      <div className={`bg-transparent min-h-screen font-sans pb-20 text-left overflow-visible`}>
        <div className={`relative w-full h-[400px] md:h-[550px] overflow-hidden text-left ${!isDarkMode ? 'bg-slate-100' : 'bg-slate-950'}`}>
            {concert.images && concert.images.length > 0 ? concert.images.map((img, idx) => (
                <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${idx === currentImgIndex ? 'opacity-100' : 'opacity-0'}`} alt="Concert" />
            )) : (
              <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000" className="absolute inset-0 w-full h-full object-cover" alt="Placeholder" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 flex flex-col justify-between p-6 md:p-10">
                <div className="flex justify-between items-start">
                    <button onClick={() => navigate(-1)} className="bg-black/30 backdrop-blur-xl p-3 rounded-2xl text-white border border-white/20 hover:bg-purple-600 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    {concert.images?.length > 1 && (
                      <div className="bg-black/40 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/20 text-white font-black text-[9px] uppercase tracking-widest">
                          {currentImgIndex + 1} / {concert.images?.length}
                      </div>
                    )}
                </div>
                <div className="flex justify-between items-end mb-6">
                    <div className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl border border-white/20 hidden md:block italic">
                        Experience The Music 2026
                    </div>
                    {concert.images?.length > 1 && (
                      <div className="flex gap-3">
                          <button onClick={prevImage} className="bg-black/50 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl hover:bg-purple-600 transition-all border border-white/20 active:scale-90">
                            <ChevronLeft size={20}/>
                          </button>
                          <button onClick={nextImage} className="bg-black/50 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl hover:bg-purple-600 transition-all border border-white/20 active:scale-90">
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
              {/* Card Konten Utama - Light Mode Support */}
              <div className={`p-8 md:p-14 rounded-[3.5rem] border shadow-2xl relative text-left overflow-hidden ${mainCardClass}`}>
                <div className="space-y-4 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-[2px] w-10 bg-purple-500"></div>
                    <p className={`font-black text-[9px] uppercase tracking-widest ${!isDarkMode ? 'text-purple-600' : 'text-purple-400'}`}>Public Event</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
  <div className="flex flex-col gap-2"> {/* Wrapper baru untuk Judul + Badge agar tetap rapi */}
    {/* BADGE BERAKHIR: Muncul hanya jika is_expired true */}
    {concert.is_expired && (
      <div className="w-fit bg-red-600 text-white px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-red-500/20 italic animate-pulse">
        {currentLang === 'id' ? '• Event Berakhir' : '• Event Ended'}
      </div>
    )}
    
    <h1 className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-tight ${textMainClass}`}>
      {getLangText(concert.title)}
    </h1>
  </div>

  <button 
    onClick={handleShare} 
    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 shrink-0 ${!isDarkMode ? 'bg-white/60 text-slate-700 border-slate-200 hover:bg-purple-500 hover:text-white' : 'bg-white/5 text-white border-white/10 hover:bg-purple-600'}`}
  >
    <Share2 size={14}/> {currentLang === 'id' ? 'Bagikan' : 'Share'}
  </button>
</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
                  <div onClick={handleOpenMap} className={`flex items-center gap-5 p-6 rounded-[2rem] border transition-all cursor-pointer group ${infoCardClass}`}>
                      <div className={`p-3 rounded-xl transition-all ${!isDarkMode ? 'bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white' : 'bg-slate-800 text-purple-400 group-hover:bg-purple-600 group-hover:text-white'}`}><MapPin size={24}/></div>
                      <div className="flex-1">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${textMutedClass}`}>{currentLang === 'id' ? 'Informasi Venue' : 'Venue Information'}</p>
                        <p className={`text-sm font-black uppercase italic leading-tight mb-1 ${textMainClass}`}>{concert.location}</p>
                        <p className={`text-[10px] font-medium italic line-clamp-2 pr-4 ${textMutedClass}`}>{concert.address_details || "No detail address available"}</p>
                      </div>
                      <div className={textMutedClass}><ExternalLink size={14} /></div>
                  </div>

                  <div className={`flex items-center gap-5 p-6 rounded-[2rem] border ${infoCardClass}`}>
                      <div className={`p-3 rounded-xl ${!isDarkMode ? 'bg-purple-100 text-purple-600' : 'bg-slate-800 text-purple-400'}`}><Calendar size={24}/></div>
                      <div>
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${textMutedClass}`}>{currentLang === 'id' ? 'Tanggal' : 'Date'}</p>
                        <p className={`text-sm font-black uppercase italic ${textMainClass}`}>
                            {concert.event_date ? new Date(concert.event_date).toLocaleDateString(currentLang === 'id' ? 'id-ID' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : "TBA"}
                        </p>
                      </div>
                  </div>
                </div>

                <hr className={`mb-8 ${!isDarkMode ? 'border-slate-200' : 'border-white/5'}`} />

                <div className={`flex overflow-x-auto no-scrollbar gap-1.5 p-1.5 rounded-full border mb-10 ${!isDarkMode ? 'bg-white/40 border-slate-200' : 'bg-black/20 border-white/5'}`}>
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap flex-1 py-3 px-4 text-[9px] font-black transition-all uppercase tracking-widest rounded-full ${
                          activeTab === tab 
                            ? tabButtonClass 
                            : tabInactiveClass
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
                {/* Sidebar Card - Sticky & Light Mode Support */}
                <div className={`p-8 rounded-[3rem] shadow-2xl border overflow-hidden relative text-left ${sidebarClass}`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] ${!isDarkMode ? 'bg-purple-200/40' : 'bg-purple-600/10'}`}></div>
                  
                  <div className="relative">
                    <div className={`w-fit px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest mb-6 border italic ${badgeClass}`}>
                        {currentLang === 'id' ? 'Pilih Kategori' : 'Select Category'}
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {concert.ticket_types?.map((type) => (
                        <div 
                          key={type.id}
                          onClick={() => type.remaining_quota > 0 && setSelectedTicket(type)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                            selectedTicket?.id === type.id 
                            ? ticketSelectedClass 
                            : ticketCardClass
                          } ${type.remaining_quota <= 0 ? ticketDisabledClass : ''}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-black uppercase italic text-xs tracking-widest ${textMainClass}`}>{type.name}</span>
                            <span className="text-purple-500 font-black text-sm">
                              IDR {Number(type.price).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-[8px] uppercase font-bold tracking-widest ${textMutedClass}`}>
                              {type.remaining_quota > 0 ? `${type.remaining_quota} Seats Left` : 'Sold Out'}
                            </span>
                            {selectedTicket?.id === type.id && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`space-y-4 mb-8 border-t pt-6 ${!isDarkMode ? 'border-slate-200' : 'border-white/10'}`}>
                      <div className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest ${textMutedClass}`}>
                          <Clock size={14} className="text-purple-500"/> {concert.start_time?.slice(0,5) || "19:00"} WIB
                      </div>
                      <div className={`flex items-center gap-3 text-[9px] font-black uppercase tracking-widest ${textMutedClass}`}>
                          <ShieldCheck size={14} className="text-green-500"/> {currentLang === 'id' ? 'Pemesanan Aman' : 'Secure Booking'}
                      </div>
                    </div>

                    <button 
  type="button"
  onClick={handleBooking} 
  // Tombol mati jika: tiket belum dipilih, kuota habis, ATAU event sudah berakhir
  disabled={!selectedTicket || selectedTicket.remaining_quota <= 0 || concert.is_expired}
  className={`w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 group ${
    (selectedTicket?.remaining_quota > 0 && !concert.is_expired) ? buttonClass : buttonDisabledClass
  }`}
>
  {concert.is_expired ? (
    // Kondisi 1: Jika Event Berakhir
    currentLang === 'id' ? 'PENJUALAN DITUTUP' : 'SALES CLOSED'
  ) : selectedTicket?.remaining_quota > 0 ? (
    // Kondisi 2: Jika Masih Tersedia
    <>
      {currentLang === 'id' ? 'LANJUT KE KERANJANG' : 'PROCEED TO CART'} 
      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
    </>
  ) : (
    // Kondisi 3: Jika Habis (Sold Out)
    currentLang === 'id' ? 'TIKET HABIS' : 'SOLD OUT'
  )}
</button>
                    
                    <p className={`mt-5 text-[8px] font-bold uppercase tracking-widest text-center italic ${textMutedClass}`}>
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