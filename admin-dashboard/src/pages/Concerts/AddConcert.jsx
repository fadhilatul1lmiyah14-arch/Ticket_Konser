import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; 

// GANTI KE react-quill-new agar support React 19
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

// --- LEAFLET SETUP FOR MAP ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
  X, MapPin, Calendar, 
  DollarSign, Clock, FileText, Loader2, 
  Music, Plus, Trash2, Tag, Info, Image as ImageIcon,
  ShieldCheck, LayoutGrid, Layers, Ticket, AlignLeft, Map as MapIcon, Search, ChevronRight, Languages,
  Sparkles, Crown, Star, ArrowRight
} from 'lucide-react';

// Fix Leaflet Icon Issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Components
const LocationPicker = ({ setAddressDetails, setSelectedLocation }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation([lat, lng]);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data && data.display_name) {
          setAddressDetails(data.display_name);
        }
      } catch (err) {
        console.error("Gagal reverse geocoding");
      }
    },
  });
  return null;
};

const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => { 
    if (position) {
      map.flyTo(position, 15, { animate: true, duration: 1.5 });
    } 
  }, [position, map]);
  return null;
};

const AddConcert = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeLang, setActiveLang] = useState('id');
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [imageUrls, setImageUrls] = useState([]);
  const [inputUrl, setInputUrl] = useState("");
  const [casts, setCasts] = useState([]);
  const [inputCast, setInputCast] = useState("");
  
  // PERBAIKAN: State untuk Terms - ARRAY of objects { id: '', en: '' }
  const [termsList, setTermsList] = useState([]); // <-- DIUBAH JADI ARRAY KOSONG, BUKAN { id: [], en: [] }
  const [inputTerm, setInputTerm] = useState({ id: '', en: '' });

  const [ticketTiers, setTicketTiers] = useState([
    { name: 'REGULAR', price: '', quota: '' }
  ]);

  // PERBAIKAN: State untuk Descriptions - ARRAY of objects { id: '', en: '' }
  const [descriptions, setDescriptions] = useState([{ id: '', en: '' }]);

  // Map & Search States
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    title: { id: '', en: '' },
    event_date: '',
    start_time: '',
    category_id: '',
    location_id: '',
    address_details: '', 
    status: 'DRAFT'
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean'],
      ['link']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'link'
  ];

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/admin/locations')
        ]);
        setCategories(catRes.data?.data || []);
        setLocations(locRes.data?.data || []);
      } catch (error) {
        console.error("Gagal Load Master Data:", error);
        if (error.response?.status === 401) navigate('/login');
      }
    };
    fetchMasterData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        title: { ...prev.title, [activeLang]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'address_details') {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        handleSearchLocation(value);
      }, 1200);
    }
  };

  const handleSearchLocation = async (query) => {
    if (!query || query.length < 5) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const results = await response.json();
      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        setSelectedLocation([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsSearching(false);
    }
  };

const handleAutoTranslate = async () => {
  const currentTitleId = formData.title.id;
  const currentDescsId = descriptions.map(d => d.id).filter(d => d && d !== "<p><br></p>");
  const currentTermsId = termsList.map(t => t.id).filter(t => t);

  const hasContent = currentTitleId.trim() !== "" || currentDescsId.length > 0;

  if (!hasContent) {
    alert("Isi konten Bahasa Indonesia terlebih dahulu!");
    return;
  }

  setIsTranslating(true);

  try {
    const translateRawText = async (text) => {
      if (!text || text.trim() === "") return "";
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodedText}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      return data[0].map(item => item[0]).join("");
    };

    const processQuillContent = async (html) => {
      if (!html || html === "<p><br></p>") return "<p><br></p>";
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const plainText = doc.body.innerText || doc.body.textContent;
      if (!plainText.trim()) return html;
      const translatedText = await translateRawText(plainText);
      return `<p>${translatedText.replace(/\n/g, "</p><p>")}</p>`;
    };

    // Translate Title
    const titleIdClean = currentTitleId.replace(/<\/?[^>]+(>|$)/g, "");
    const transTitle = await translateRawText(titleIdClean);

    // Translate Descriptions
    const transDescs = await Promise.all(
      descriptions.map(async (desc) => ({
        id: desc.id,
        en: desc.id ? await processQuillContent(desc.id) : ""
      }))
    );

    // Translate Terms
    const transTerms = await Promise.all(
      termsList.map(async (term) => ({
        id: term.id,
        en: term.id ? await translateRawText(term.id) : ""
      }))
    );

    setFormData(prev => ({
      ...prev,
      title: { id: currentTitleId, en: transTitle }
    }));

    setDescriptions(transDescs);
    setTermsList(transTerms);

    setTimeout(() => {
      setActiveLang('en');
      alert("✅ Berhasil menerjemahkan ke Bahasa Inggris!");
    }, 150);

  } catch (error) {
    console.error("Translation Error:", error);
    alert("Gagal translasi otomatis.");
  } finally {
    setIsTranslating(false);
  }
};

  const addDescriptionBlock = () => {
    setDescriptions([...descriptions, { id: '', en: '' }]);
  };

  const removeDescriptionBlock = (index) => {
    if (descriptions.length > 1) {
      setDescriptions(descriptions.filter((_, i) => i !== index));
    }
  };

  const handleDescriptionChange = (index, content) => {
    setDescriptions(prev => {
      const newArray = [...prev];
      newArray[index] = { ...newArray[index], [activeLang]: content };
      return newArray;
    });
  };

  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, { name: '', price: '', quota: '' }]);
  };

  const removeTicketTier = (index) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(ticketTiers.filter((_, i) => i !== index));
    }
  };

  const handleTierChange = (index, field, value) => {
    const newTiers = [...ticketTiers];
    newTiers[index][field] = value;
    setTicketTiers(newTiers);
  };

  const addImageUrl = () => {
    if (inputUrl.trim() !== "" && !imageUrls.includes(inputUrl)) {
      setImageUrls(prev => [...prev, inputUrl]);
      setInputUrl("");
    }
  };

  const addCast = () => {
    if (inputCast.trim() !== "" && !casts.includes(inputCast)) {
      setCasts(prev => [...prev, inputCast]);
      setInputCast("");
    }
  };

  const addTerm = () => {
    if (inputTerm[activeLang].trim() !== "") {
      setTermsList(prev => [...prev, { ...inputTerm }]);
      setInputTerm({ id: '', en: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageUrls.length === 0) {
      alert("Harap masukkan minimal satu URL gambar!");
      return;
    }

    if (!formData.category_id || !formData.location_id) {
      alert("Kategori dan Lokasi harus dipilih!");
      return;
    }

    setLoading(true);
    try {
      // Filter description yang kosong
      const validDescriptions = descriptions.filter(d => d.id?.trim() !== "" || d.en?.trim() !== "");
      
      // Filter terms yang kosong
      const validTerms = termsList.filter(t => t.id?.trim() !== "" || t.en?.trim() !== "");

      const payload = {
        title: JSON.stringify(formData.title), 
        category_id: Number(formData.category_id),
        location_id: Number(formData.location_id),
        address_details: formData.address_details || "",
        description: {
          id: validDescriptions.map(d => d.id).filter(d => d && d !== "<p><br></p>"),
          en: validDescriptions.map(d => d.en).filter(d => d && d !== "<p><br></p>")
        },
        event_date: formData.event_date,
        start_time: formData.start_time,
        status: formData.status,
        images: imageUrls,
        casts: casts,
        ticket_types: ticketTiers.map(t => ({
          name: t.name,
          price: Number(t.price),
          quota: Number(t.quota),
          description: ""
        }))
      };

      // PERBAIKAN: Hanya kirim terms_conditions jika ada isinya
      if (validTerms.length > 0) {
        payload.terms_conditions = JSON.stringify(validTerms);
      }

      console.log("Sending Payload:", payload);

      await api.post('/admin/events', payload);
      alert("✅ Event & Tiket Berhasil Disimpan!");
      navigate('/admin/manage-concert'); 

    } catch (error) {
      console.error("Submit Error:", error.response?.data);
      if (error.response && error.response.status === 422) {
        const errorDetail = error.response.data;
        alert(`Gagal Validasi: ${JSON.stringify(errorDetail)}`);
      } else {
        alert("Gagal: " + (error.response?.data?.message || "Terjadi kesalahan koneksi/server"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8 bg-white text-left animate-fade-in-up">
      
      {/* Premium Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-100/15 via-pink-100/10 to-transparent rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-indigo-100/15 via-purple-100/10 to-transparent rounded-full blur-[100px] animate-pulse-slow-delay"></div>
        <div className="absolute top-[15%] left-[5%] animate-float-slow">
          <Star size={16} className="text-purple-200/30" fill="currentColor" />
        </div>
        <div className="absolute bottom-[20%] right-[8%] animate-float-delay">
          <Star size={12} className="text-pink-200/30" fill="currentColor" />
        </div>
      </div>

      {/* HEADER SECTION */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-purple-100 pb-8 md:pb-10 gap-6 md:gap-8">
        <div className="space-y-1 w-full md:w-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-100 mb-3">
            <Sparkles size={12} className="text-purple-500 animate-pulse" />
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
            <h2 className="text-[8px] md:text-[9px] font-black text-purple-600 uppercase tracking-[0.3em]">Creative Studio</h2>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
            New <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient-x">Concert</span>
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-3 rounded-full animate-slide-in"></div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="flex bg-purple-50/50 p-1 rounded-2xl border border-purple-100 shadow-inner">
                <button type="button" onClick={() => setActiveLang('id')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeLang === 'id' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : 'text-slate-500 hover:text-purple-600'}`}>ID</button>
                <button type="button" onClick={() => setActiveLang('en')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeLang === 'en' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : 'text-slate-500 hover:text-purple-600'}`}>EN</button>
                <div className="w-[1px] bg-purple-200 mx-1 my-1"></div>
                <button 
                    type="button" 
                    onClick={handleAutoTranslate} 
                    disabled={isTranslating}
                    className="px-4 py-2 text-[10px] font-black text-emerald-600 flex items-center gap-1 hover:bg-emerald-50 rounded-xl transition-all disabled:opacity-50"
                >
                    {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />} 
                    AUTO-EN
                </button>
            </div>

            <div className="flex flex-1 md:flex-none bg-purple-50/50 p-1.5 md:p-2 rounded-[20px] md:rounded-[24px] border border-purple-100 shadow-inner">
              {['DRAFT', 'PUBLISH'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData(p => ({...p, status: s}))}
                  className={`flex-1 md:flex-none px-4 md:px-10 py-3 md:py-4 rounded-[14px] md:rounded-[18px] text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                    formData.status === s 
                      ? (s === 'PUBLISH' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-200/50 scale-105' : 'bg-slate-800 text-white shadow-xl shadow-slate-300 scale-105')
                      : 'text-slate-400 hover:text-purple-600'
                  }`}
                >
                  {s === 'PUBLISH' ? 'PUBLISH' : s}
                </button>
              ))}
            </div>
            <button 
               type="button" 
               onClick={() => navigate(-1)} 
               className="p-3 md:p-5 bg-white border border-purple-100 text-slate-400 rounded-[18px] md:rounded-[24px] hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm group hover:rotate-90"
            >
             <X size={24} className="md:w-7 md:h-7" />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-2xl shadow-purple-100/40 border border-purple-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
              <FileText size={120} className="text-purple-400 rotate-12" />
            </div>

            <h3 className="font-black text-slate-800 uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4 text-lg md:text-xl">
              <LayoutGrid size={22} className="text-purple-500" /> Core Configuration ({activeLang.toUpperCase()})
            </h3>
            
            <div className="space-y-6 md:space-y-8 relative z-10">
              <div className="group">
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 mb-2 md:mb-3 block ml-4 group-focus-within:text-purple-500 transition-colors">Concert Master Title</label>
                <input 
                  type="text" name="title" required value={formData.title[activeLang]} onChange={handleChange} 
                  placeholder={activeLang === 'id' ? "Judul Konser..." : "Concert Title..."} 
                  className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[20px] md:rounded-[24px] py-4 md:py-6 px-6 md:px-10 outline-none font-bold text-slate-800 transition-all shadow-inner text-base md:text-lg placeholder:text-slate-300" 
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full"></div>
              </div>

              {/* EDITOR DESKRIPSI */}
              <div className="group">
                <div className="flex justify-between items-center mb-2 md:mb-3 ml-4">
                    <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 group-focus-within:text-purple-500">Event Narratives ({activeLang.toUpperCase()})</label>
                    <button 
                        type="button" 
                        onClick={addDescriptionBlock}
                        className="text-[9px] font-black bg-purple-100 text-purple-600 px-3 py-1 rounded-full hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all flex items-center gap-1"
                    >
                        <Plus size={12}/> Add Section
                    </button>
                </div>
                
                <div className="space-y-4">
                    {descriptions.map((desc, idx) => (
                        <div key={idx} className="relative group/editor animate-in slide-in-from-top-2">
                             <div className="rounded-[24px] md:rounded-[32px] overflow-hidden border-2 border-purple-100 bg-gradient-to-r from-slate-50 to-white focus-within:border-purple-400 transition-all shadow-inner">
                                <ReactQuill 
                                key={`quill-${activeLang}-${idx}`}
                                    theme="snow"
                                    value={desc[activeLang]}
                                    onChange={(content) => handleDescriptionChange(idx, content)}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder={activeLang === 'id' ? `Bagian ${idx + 1}: Ceritakan keseruannya...` : `Section ${idx + 1}: Tell the story...`}
                                    className="bg-transparent"
                                />
                            </div>
                            {descriptions.length > 1 && (
                                <button 
                                    type="button"
                                    onClick={() => removeDescriptionBlock(idx)}
                                    className="absolute -right-2 -top-2 p-2 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover/editor:opacity-100 transition-opacity z-20 hover:scale-110"
                                >
                                    <X size={14}/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <style>{`
                    .ql-container.ql-snow { border: none !important; font-family: inherit; font-size: 1rem; }
                    .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f0f0f0 !important; background: #fff; }
                    .ql-editor { min-height: 120px; padding: 1.5rem 2.5rem; font-weight: 500; color: #334155; line-height: 1.6; }
                    .ql-editor.ql-blank::before { color: #cbd5e1 !important; font-style: normal; left: 2.5rem; }
                    .ql-editor strong { font-weight: 800; }
                `}</style>
              </div>

              {/* Ticket Tiers */}
              <div className="pt-4 md:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 block ml-4 italic">Ticket Inventory & Categories</label>
                  <button 
                    type="button" 
                    onClick={addTicketTier}
                    className="flex items-center gap-2 text-[9px] md:text-[10px] font-black bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all shadow-md"
                  >
                    <Plus size={14}/> Add Tier
                  </button>
                </div>
                
                <div className="space-y-4">
                  {ticketTiers.map((tier, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 bg-gradient-to-r from-purple-50/30 to-pink-50/30 p-4 md:p-6 rounded-[24px] md:rounded-[28px] border border-purple-100 group hover:bg-white hover:shadow-xl transition-all animate-in slide-in-from-left-2">
                      <div className="flex-1">
                        <label className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase mb-1 block ml-2">Tier Name</label>
                        <input 
                          type="text" placeholder="e.g. VIP" required
                          value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value.toUpperCase())}
                          className="w-full bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 py-2 md:py-3 font-bold text-slate-700 outline-none focus:border-purple-400 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="md:w-40">
                          <label className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase mb-1 block ml-2">Price (IDR)</label>
                          <input 
                            type="number" placeholder="0" required
                            value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                            className="w-full bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 py-2 md:py-3 font-bold text-slate-700 outline-none focus:border-purple-400 text-sm"
                          />
                        </div>
                        <div className="md:w-28">
                          <label className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase mb-1 block ml-2">Seats</label>
                          <input 
                            type="number" placeholder="0" required
                            value={tier.quota} onChange={(e) => handleTierChange(index, 'quota', e.target.value)}
                            className="w-full bg-white border border-purple-200 rounded-xl md:rounded-2xl px-4 py-2 md:py-3 font-bold text-slate-700 outline-none focus:border-purple-400 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex items-end justify-end md:justify-start pb-1">
                        <button 
                          type="button" onClick={() => removeTicketTier(index)}
                          className={`p-3 rounded-xl transition-all ${ticketTiers.length > 1 ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600' : 'text-slate-200 cursor-not-allowed'}`}
                        >
                          <Trash2 size={20}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-4 md:pt-6">
                <div className="space-y-3">
                  <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 block ml-4 tracking-widest">Show Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
                    <input 
                      type="date" name="event_date" required value={formData.event_date} onChange={handleChange} 
                      className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[20px] md:rounded-[24px] py-4 md:py-6 pl-14 md:pl-16 pr-6 md:pr-8 font-black outline-none text-slate-700 shadow-inner transition-all uppercase text-xs md:text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 block ml-4 tracking-widest">Gate Opens</label>
                  <div className="relative group">
                    <Clock className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-purple-500" size={20} />
                    <input 
                      type="time" name="start_time" required value={formData.start_time} onChange={handleChange} 
                      className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[20px] md:rounded-[24px] py-4 md:py-6 pl-14 md:pl-16 pr-6 md:pr-8 font-black outline-none text-slate-700 shadow-inner transition-all text-xs md:text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

         {/* Section: Terms Protocol */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 sm:p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-2xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h3 className="font-black text-white uppercase italic flex items-center gap-3 md:gap-4 text-lg md:text-xl">
                  <ShieldCheck size={22} className="text-purple-400" /> Security Protocols ({activeLang.toUpperCase()})
                </h3>
                
                <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full">
                  <Info size={14} className="text-purple-400" />
                  <span className="text-[10px] font-bold text-purple-200 uppercase tracking-tight">
                    Khusus S&K Tambahan Event Ini
                  </span>
                </div>
              </div>

              {/* Input Group */}
              <div className="flex gap-2 md:gap-3 mb-8">
                <div className="relative flex-1 group">
                  <input 
                    type="text" 
                    value={inputTerm[activeLang]} 
                    onChange={(e) => setInputTerm(prev => ({...prev, [activeLang]: e.target.value}))} 
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm())}
                    placeholder={activeLang === 'id' ? "Contoh: Dilarang membawa kamera profesional..." : "Add specific rule..."} 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[18px] md:rounded-[22px] px-6 md:px-8 py-3 md:py-5 text-xs md:text-sm font-bold outline-none focus:border-purple-400 focus:bg-white/10 text-white transition-all placeholder:text-white/20" 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={addTerm} 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 rounded-[18px] md:rounded-[22px] hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Terms List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {termsList.length > 0 ? (
                  termsList.map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-4 rounded-xl md:rounded-2xl border border-white/5 transition-colors group animate-in zoom-in duration-300">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                        <p className="text-[10px] md:text-[11px] font-medium text-white/80 leading-relaxed">
                          {t[activeLang] || t.id}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTermsList(termsList.filter((_, idx) => idx !== i))}
                        className="p-1 hover:bg-rose-500/20 rounded-md transition-colors text-white/20 hover:text-rose-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-10 border-2 border-dashed border-white/5 rounded-[24px] flex flex-col items-center justify-center opacity-40">
                    <ShieldCheck size={32} className="mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada S&K tambahan</p>
                    <p className="text-[8px] text-white/30 mt-1">(Tidak akan ditampilkan di frontend)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute -bottom-12 -right-12 opacity-[0.03] text-white rotate-12 pointer-events-none">
              <ShieldCheck size={280} />
            </div>
          </div>
          </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8 md:space-y-10">
          
          <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-purple-100/40 border border-purple-100">
            <h3 className="font-black text-slate-800 uppercase italic mb-6 md:mb-8 flex items-center gap-3 text-base md:text-lg"><Layers size={22} className="text-purple-500"/> Ecosystem</h3>
            <div className="space-y-5 md:space-y-6">
              <div>
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 mb-2 md:mb-3 block ml-4">Genre / Category</label>
                <select 
                  name="category_id" required value={formData.category_id} onChange={handleChange} 
                  className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[18px] md:rounded-[22px] py-4 md:py-5 px-6 md:px-8 font-black uppercase text-[11px] md:text-[12px] outline-none text-slate-700 transition-all appearance-none"
                >
                  <option value="">Choose Genre</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 mb-2 md:mb-3 block ml-4">Venue Assignment (City)</label>
                <select 
                  name="location_id" required value={formData.location_id} onChange={handleChange} 
                  className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[18px] md:rounded-[22px] py-4 md:py-5 px-6 md:px-8 font-black uppercase text-[11px] md:text-[12px] outline-none text-slate-700 transition-all appearance-none mb-4"
                >
                  <option value="">Choose City/Venue</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                </select>

                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 mb-2 md:mb-3 block ml-4 italic">Specific Venue Address Details</label>
                <div className="relative group mb-4">
                  <div className="absolute left-5 top-5 z-10">
                    {isSearching ? <Loader2 size={18} className="animate-spin text-purple-500" /> : <Search size={18} className="text-purple-500" />}
                  </div>
                  <textarea 
                    name="address_details" 
                    value={formData.address_details} 
                    onChange={handleChange} 
                    required
                    placeholder="Search or type specific address..."
                    className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[18px] md:rounded-[22px] py-4 pl-12 pr-6 font-bold text-slate-700 outline-none transition-all text-xs min-h-[100px] shadow-inner"
                  ></textarea>
                </div>

                {/* --- ADDRESS MAP PICKER --- */}
                <div className="space-y-3 animate-in zoom-in duration-500 mt-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                      <MapIcon size={12}/> Map Geolocation
                    </label>
                    {selectedLocation && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md">Marker Set</span>}
                  </div>
                  <div className="w-full rounded-[20px] md:rounded-[24px] overflow-hidden border-2 border-purple-100 h-[200px] shadow-sm relative z-0">
                    <MapContainer center={[-6.2088, 106.8456]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker 
                        setAddressDetails={(val) => setFormData(p => ({...p, address_details: val}))} 
                        setSelectedLocation={setSelectedLocation} 
                      />
                      {selectedLocation && <Marker position={selectedLocation} />}
                      <RecenterMap position={selectedLocation} />
                    </MapContainer>
                  </div>
                  <p className="text-[8px] text-slate-400 italic px-2">*Click map to pinpoint exact location</p>
                </div>
              </div>

              <div className="pt-6 md:pt-8 border-t border-purple-100">
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-500 mb-3 md:mb-4 block ml-4 italic">Lineup</label>
                <div className="flex gap-2 mb-4 md:mb-6">
                  <input 
                    type="text" value={inputCast} onChange={(e) => setInputCast(e.target.value)} 
                    placeholder="Artist Name" 
                    className="flex-1 bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[14px] md:rounded-[18px] px-4 md:px-6 py-3 md:py-4 text-xs font-bold outline-none text-slate-700" 
                  />
                  <button type="button" onClick={addCast} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 md:px-6 rounded-[14px] md:rounded-[18px] hover:shadow-lg transition-all"><Plus size={18}/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {casts.map((c, i) => (
                    <span key={i} className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 md:px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase flex items-center gap-2 md:gap-3 shadow-md">
                      <Crown size={12} className="text-amber-400" />
                      {c} <X size={14} className="cursor-pointer text-rose-400 hover:text-rose-300" onClick={() => setCasts(casts.filter((_, idx) => idx !== i))}/>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-purple-100/40 border border-purple-100 relative">
            <h3 className="font-black text-slate-800 uppercase italic mb-6 md:mb-8 flex items-center gap-3 text-base md:text-lg"><ImageIcon size={22} className="text-purple-500"/> Visual Assets</h3>
            <div className="space-y-5 md:space-y-6">
                <div className="flex gap-2">
                  <input 
                    type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} 
                    placeholder="URL Image" 
                    className="flex-1 bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[14px] md:rounded-[18px] px-4 md:px-6 py-3 md:py-4 text-xs font-bold outline-none text-slate-700" 
                  />
                  <button type="button" onClick={addImageUrl} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 md:px-6 rounded-[14px] md:rounded-[18px] transition-all hover:shadow-lg"><Plus size={18}/></button>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 max-h-[300px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-[18px] md:rounded-[24px] overflow-hidden group shadow-md">
                      <img src={url} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125" alt="preview" />
                      <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"><Trash2 className="text-white" size={20}/></button>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <button 
            type="submit" disabled={loading} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 md:py-8 rounded-[28px] md:rounded-[36px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-sm hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-500 flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50 active:scale-[0.98] group relative overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            {loading ? <Loader2 className="animate-spin relative z-10" size={24} /> : <><ShieldCheck size={20} className="relative z-10 group-hover:rotate-12 transition-transform"/> <span className="relative z-10">Deploy Event</span> <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform"/></>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { width: 0; opacity: 0; }
          to { width: 4rem; opacity: 1; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes pulse-slow-delay {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }
        .animate-slide-in {
          animation: slide-in 0.8s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slow-delay {
          animation: pulse-slow-delay 5s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 5s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899);
          border-radius: 10px;
        }
      `}</style>
    </form>
  );
};

export default AddConcert;