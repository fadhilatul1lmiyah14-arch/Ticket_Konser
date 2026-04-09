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
  ShieldCheck, LayoutGrid, Layers, Ticket, AlignLeft, Map as MapIcon, Search, ChevronRight, Languages
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
  const [activeLang, setActiveLang] = useState('id'); // 'id' or 'en'
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [imageUrls, setImageUrls] = useState([]);
  const [inputUrl, setInputUrl] = useState("");
  const [casts, setCasts] = useState([]);
  const [inputCast, setInputCast] = useState("");
  
  // State for Multi-language support
  const [termsList, setTermsList] = useState({ id: [], en: [] });
  const [inputTerm, setInputTerm] = useState("");

  const [ticketTiers, setTicketTiers] = useState([
    { name: 'REGULAR', price: '', quota: '' }
  ]);

  const [descriptions, setDescriptions] = useState({
    id: [''],
    en: ['']
  });

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
  // 1. Cek apakah konten ID ada
  const hasContent = formData.title.id.trim() !== "" || 
                     descriptions.id.some(d => d && d !== "<p><br></p>");

  if (!hasContent) {
    alert("Isi konten Bahasa Indonesia terlebih dahulu!");
    return;
  }

  setIsTranslating(true);

  try {
    // Fungsi pembantu untuk translate teks murni saja
    const translateRawText = async (text) => {
      if (!text || text.trim() === "") return "";
      
      // Bersihkan karakter khusus yang bisa merusak URL
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodedText}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Google API Limit/Error");
      
      const data = await res.json();
      // Gabungkan hasil (karena Google memecah per kalimat dalam array)
      return data[0].map(item => item[0]).join("");
    };

    // Fungsi untuk memproses HTML dari ReactQuill
    const processQuillContent = async (html) => {
      if (!html || html === "<p><br></p>") return "<p><br></p>";
      
      // Gunakan DOMParser untuk mengambil teks murni tanpa tag HTML
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const plainText = doc.body.innerText || doc.body.textContent;
      
      if (!plainText.trim()) return html;

      const translatedText = await translateRawText(plainText);
      
      // Bungkus kembali ke tag paragraf agar ReactQuill mengenalinya
      return `<p>${translatedText.replace(/\n/g, "</p><p>")}</p>`;
    };

    // --- EKSEKUSI TRANSLATE ---

    // 1. Translate Title (Ambil teks murni saja)
    const titleIdClean = formData.title.id.replace(/<\/?[^>]+(>|$)/g, "");
    const transTitle = await translateRawText(titleIdClean);

    // 2. Translate Descriptions (Array)
    const transDescs = await Promise.all(
      descriptions.id.map(async (content) => await processQuillContent(content))
    );

    // 3. Translate Terms (Array)
    const transTerms = await Promise.all(
      termsList.id.map(async (term) => await translateRawText(term))
    );

    // Update States
    setFormData(prev => ({
      ...prev,
      title: { ...prev.title, en: transTitle }
    }));
    setDescriptions(prev => ({ ...prev, en: transDescs }));
    setTermsList(prev => ({ ...prev, en: transTerms }));

    setActiveLang('en');
    alert("✅ Berhasil menerjemahkan ke Bahasa Inggris!");

  } catch (error) {
    console.error("Translation Error:", error);
    alert("Gagal translasi otomatis. Pastikan koneksi internet stabil atau teks tidak terlalu panjang.");
  } finally {
    setIsTranslating(false);
  }
};

  const addDescriptionBlock = () => {
    setDescriptions(prev => ({
      id: [...prev.id, ''],
      en: [...prev.en, '']
    }));
  };

  const removeDescriptionBlock = (index) => {
    if (descriptions.id.length > 1) {
      setDescriptions(prev => ({
        id: prev.id.filter((_, i) => i !== index),
        en: prev.en.filter((_, i) => i !== index)
      }));
    }
  };

  const handleDescriptionChange = (index, content) => {
    setDescriptions(prev => {
        const newArray = [...prev[activeLang]];
        newArray[index] = content;
        return { ...prev, [activeLang]: newArray };
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
    if (inputTerm.trim() !== "") {
      setTermsList(prev => ({
        ...prev,
        [activeLang]: [...prev[activeLang], inputTerm]
      }));
      setInputTerm("");
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validasi Dasar
  if (imageUrls.length === 0) {
    alert("Harap masukkan minimal satu URL gambar!");
    return;
  }

  // Validasi Input Wajib (Tambahan agar tidak kena 422 di backend)
  if (!formData.category_id || !formData.location_id) {
    alert("Kategori dan Lokasi harus dipilih!");
    return;
  }

  setLoading(true);
  try {
    const payload = {
      // 1. Title harus jadi String (JSON) agar lolos validasi t.String() di Elysia
      title: JSON.stringify(formData.title), 

      category_id: Number(formData.category_id),
      location_id: Number(formData.location_id),
      address_details: formData.address_details || "",

      // 2. Description (Sudah benar berupa object, tapi di backend kamu ada t.Any())
      // Kita kirim sebagai object, nanti di backend di-stringify otomatis oleh logic kamu
      description: {
        id: descriptions.id.filter(d => d.trim() !== "" && d !== "<p><br></p>"),
        en: descriptions.en.filter(d => d.trim() !== "" && d !== "<p><br></p>")
      },

      // 3. Terms Conditions harus jadi String (JSON) karena di Backend tipenya t.String()
      terms_conditions: JSON.stringify({
        id: termsList.id.join('\n'),
        en: termsList.en.length > 0 ? termsList.en.join('\n') : ""
      }),

      event_date: formData.event_date,
      start_time: formData.start_time,
      status: formData.status,
      images: imageUrls,
      casts: casts,
      ticket_types: ticketTiers.map(t => ({
        name: t.name,
        price: Number(t.price),
        quota: Number(t.quota),
        description: "" // Tambahkan default agar sesuai skema backend
      }))
    };

    console.log("Sending Payload:", payload); // Cek console untuk memastikan struktur

    await api.post('/admin/events', payload);
    alert("✅ Event & Tiket Berhasil Disimpan!");
    navigate('/admin/manage-concert'); 

  } catch (error) {
    console.error("Submit Error:", error.response?.data);
    if (error.response && error.response.status === 422) {
      // Menampilkan detail error validasi dari Elysia
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
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8 bg-white text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-8 md:pb-10 gap-6 md:gap-8">
        <div className="space-y-1 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-slate-900 rounded-xl text-white shadow-xl shadow-slate-200 rotate-3 transition-transform">
              <Music size={18}/>
            </span>
            <h2 className="text-[9px] md:text-[11px] font-black text-[#E297C1] uppercase tracking-[0.3em] md:tracking-[0.5em]">Creative Studio</h2>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            New <span className="text-slate-200">Concert</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
            {/* Language Switcher & Auto-Translate */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                <button type="button" onClick={() => setActiveLang('id')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeLang === 'id' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>ID</button>
                <button type="button" onClick={() => setActiveLang('en')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${activeLang === 'en' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>EN</button>
                <div className="w-[1px] bg-slate-200 mx-1 my-1"></div>
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

            <div className="flex flex-1 md:flex-none bg-slate-50 p-1.5 md:p-2 rounded-[20px] md:rounded-[24px] border border-slate-100 shadow-inner">
              {['DRAFT', 'PUBLISHED'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData(p => ({...p, status: s}))}
                  className={`flex-1 md:flex-none px-4 md:px-10 py-3 md:py-4 rounded-[14px] md:rounded-[18px] text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                    formData.status === s 
                      ? (s === 'PUBLISHED' ? 'bg-[#E297C1] text-white shadow-xl shadow-pink-100 scale-105' : 'bg-slate-900 text-white shadow-xl shadow-slate-300 scale-105')
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {s === 'PUBLISHED' ? 'PUBLISH' : s}
                </button>
              ))}
            </div>
            <button 
               type="button" 
               onClick={() => navigate(-1)} 
               className="p-3 md:p-5 bg-white border border-slate-200 text-slate-300 rounded-[18px] md:rounded-[24px] hover:text-rose-500 transition-all shadow-sm group hover:rotate-90"
            >
             <X size={24} className="md:w-7 md:h-7" />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-2xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
              <FileText size={120} className="text-[#E297C1] rotate-12" />
            </div>

            <h3 className="font-black text-slate-900 uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4 text-lg md:text-xl">
              <LayoutGrid size={22} className="text-[#E297C1]" /> Core Configuration ({activeLang.toUpperCase()})
            </h3>
            
            <div className="space-y-6 md:space-y-8 relative z-10">
              <div className="group">
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-2 md:mb-3 block ml-4 group-focus-within:text-[#E297C1] transition-colors">Concert Master Title</label>
                <input 
                  type="text" name="title" required value={formData.title[activeLang]} onChange={handleChange} 
                  placeholder={activeLang === 'id' ? "Judul Konser..." : "Concert Title..."} 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] md:rounded-[24px] py-4 md:py-6 px-6 md:px-10 outline-none focus:border-[#E297C1] focus:bg-white font-bold text-slate-800 transition-all shadow-inner text-base md:text-lg placeholder:text-slate-200" 
                />
              </div>

              {/* EDITOR DESKRIPSI */}
              <div className="group">
                <div className="flex justify-between items-center mb-2 md:mb-3 ml-4">
                    <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 group-focus-within:text-[#E297C1]">Event Narratives ({activeLang.toUpperCase()})</label>
                    <button 
                        type="button" 
                        onClick={addDescriptionBlock}
                        className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full hover:bg-[#E297C1] hover:text-white transition-all flex items-center gap-1"
                    >
                        <Plus size={12}/> Add Section
                    </button>
                </div>
                
                <div className="space-y-4">
                    {descriptions[activeLang].map((desc, idx) => (
                        <div key={idx} className="relative group/editor animate-in slide-in-from-top-2">
                             <div className="rounded-[24px] md:rounded-[32px] overflow-hidden border-2 border-slate-50 bg-slate-50 focus-within:border-[#E297C1] focus-within:bg-white transition-all shadow-inner">
                                <ReactQuill 
                                    theme="snow"
                                    value={desc}
                                    onChange={(content) => handleDescriptionChange(idx, content)}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder={activeLang === 'id' ? `Bagian ${idx + 1}: Ceritakan keseruannya...` : `Section ${idx + 1}: Tell the story...`}
                                    className="bg-transparent"
                                />
                            </div>
                            {descriptions.id.length > 1 && (
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
                    .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f1f5f9 !important; background: #fff; }
                    .ql-editor { min-height: 120px; padding: 1.5rem 2.5rem; font-weight: 500; color: #334155; line-height: 1.6; }
                    .ql-editor.ql-blank::before { color: #cbd5e1 !important; font-style: normal; left: 2.5rem; }
                    .ql-editor strong { font-weight: 800; }
                `}</style>
              </div>

              {/* Ticket Tiers */}
              <div className="pt-4 md:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 block ml-4 italic">Ticket Inventory & Categories</label>
                  <button 
                    type="button" 
                    onClick={addTicketTier}
                    className="flex items-center gap-2 text-[9px] md:text-[10px] font-black bg-[#E297C1] text-white px-4 py-2 rounded-full hover:bg-slate-900 transition-all shadow-lg"
                  >
                    <Plus size={14}/> Add Tier
                  </button>
                </div>
                
                <div className="space-y-4">
                  {ticketTiers.map((tier, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 md:p-6 rounded-[24px] md:rounded-[28px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all animate-in slide-in-from-left-2">
                      <div className="flex-1">
                        <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Tier Name</label>
                        <input 
                          type="text" placeholder="e.g. VIP" required
                          value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value.toUpperCase())}
                          className="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-4 py-2 md:py-3 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="md:w-40">
                          <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Price (IDR)</label>
                          <input 
                            type="number" placeholder="0" required
                            value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-4 py-2 md:py-3 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"
                          />
                        </div>
                        <div className="md:w-28">
                          <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Seats</label>
                          <input 
                            type="number" placeholder="0" required
                            value={tier.quota} onChange={(e) => handleTierChange(index, 'quota', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl md:rounded-2xl px-4 py-2 md:py-3 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"
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
                  <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 block ml-4 tracking-widest">Show Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-[#E297C1]" size={20} />
                    <input 
                      type="date" name="event_date" required value={formData.event_date} onChange={handleChange} 
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] md:rounded-[24px] py-4 md:py-6 pl-14 md:pl-16 pr-6 md:pr-8 font-black outline-none focus:border-[#E297C1] focus:bg-white text-slate-700 shadow-inner transition-all uppercase text-xs md:text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 block ml-4 tracking-widest">Gate Opens</label>
                  <div className="relative group">
                    <Clock className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-[#E297C1]" size={20} />
                    <input 
                      type="time" name="start_time" required value={formData.start_time} onChange={handleChange} 
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] md:rounded-[24px] py-4 md:py-6 pl-14 md:pl-16 pr-6 md:pr-8 font-black outline-none focus:border-[#E297C1] focus:bg-white text-slate-700 shadow-inner transition-all text-xs md:text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

         {/* Section: Terms Protocol */}
          <div className="bg-slate-900 p-6 sm:p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-2xl shadow-slate-300 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h3 className="font-black text-white uppercase italic flex items-center gap-3 md:gap-4 text-lg md:text-xl">
                  <ShieldCheck size={22} className="text-[#E297C1]" /> Security Protocols ({activeLang.toUpperCase()})
                </h3>
                
                {/* Info Badge untuk Admin */}
                <div className="flex items-center gap-2 bg-[#E297C1]/10 border border-[#E297C1]/20 px-4 py-2 rounded-full">
                  <Info size={14} className="text-[#E297C1]" />
                  <span className="text-[10px] font-bold text-pink-100 uppercase tracking-tight">
                    Khusus S&K Tambahan Event Ini
                  </span>
                </div>
              </div>

              {/* Input Group */}
              <div className="flex gap-2 md:gap-3 mb-8">
                <div className="relative flex-1 group">
                  <input 
                    type="text" 
                    value={inputTerm} 
                    onChange={(e) => setInputTerm(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm())}
                    placeholder={activeLang === 'id' ? "Contoh: Dilarang membawa kamera profesional..." : "Add specific rule..."} 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-[18px] md:rounded-[22px] px-6 md:px-8 py-3 md:py-5 text-xs md:text-sm font-bold outline-none focus:border-[#E297C1] focus:bg-white/10 text-white transition-all placeholder:text-white/20" 
                  />
                </div>
                <button 
                  type="button" 
                  onClick={addTerm} 
                  className="bg-[#E297C1] text-white px-6 md:px-8 rounded-[18px] md:rounded-[22px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-pink-500/20 flex items-center justify-center"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>

              {/* Terms List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {termsList[activeLang].length > 0 ? (
                  termsList[activeLang].map((t, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-4 rounded-xl md:rounded-2xl border border-white/5 transition-colors group animate-in zoom-in duration-300">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E297C1] mt-1.5 shrink-0" />
                        <p className="text-[10px] md:text-[11px] font-medium text-white/80 leading-relaxed">
                          {t}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTermsList(prev => ({...prev, [activeLang]: prev[activeLang].filter((_, idx) => idx !== i)}))}
                        className="p-1 hover:bg-rose-500/20 rounded-md transition-colors text-white/20 hover:text-rose-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 border-2 border-dashed border-white/5 rounded-[24px] flex flex-col items-center justify-center opacity-40">
                    <FileText size={24} className="mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada S&K tambahan</p>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Background Icon */}
            <div className="absolute -bottom-12 -right-12 opacity-[0.03] text-white rotate-12 pointer-events-none">
              <ShieldCheck size={280} />
            </div>
          </div>
          </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-8 md:space-y-10">
          
          <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/40 border border-slate-50">
            <h3 className="font-black text-slate-900 uppercase italic mb-6 md:mb-8 flex items-center gap-3 text-base md:text-lg"><Layers size={22} className="text-[#E297C1]"/> Ecosystem</h3>
            <div className="space-y-5 md:space-y-6">
              <div>
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-2 md:mb-3 block ml-4">Genre / Category</label>
                <select 
                  name="category_id" required value={formData.category_id} onChange={handleChange} 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] md:rounded-[22px] py-4 md:py-5 px-6 md:px-8 font-black uppercase text-[11px] md:text-[12px] outline-none focus:border-[#E297C1] focus:bg-white text-slate-700 transition-all appearance-none"
                >
                  <option value="">Choose Genre</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-2 md:mb-3 block ml-4">Venue Assignment (City)</label>
                <select 
                  name="location_id" required value={formData.location_id} onChange={handleChange} 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] md:rounded-[22px] py-4 md:py-5 px-6 md:px-8 font-black uppercase text-[11px] md:text-[12px] outline-none focus:border-[#E297C1] focus:bg-white text-slate-700 transition-all appearance-none mb-4"
                >
                  <option value="">Choose City/Venue</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                </select>

                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-2 md:mb-3 block ml-4 italic">Specific Venue Address Details</label>
                <div className="relative group mb-4">
                  <div className="absolute left-5 top-5 z-10">
                    {isSearching ? <Loader2 size={18} className="animate-spin text-[#E297C1]" /> : <Search size={18} className="text-[#E297C1]" />}
                  </div>
                  <textarea 
                    name="address_details" 
                    value={formData.address_details} 
                    onChange={handleChange} 
                    required
                    placeholder="Search or type specific address..."
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] md:rounded-[22px] py-4 pl-12 pr-6 font-bold text-slate-700 outline-none focus:border-[#E297C1] focus:bg-white transition-all text-xs min-h-[100px] shadow-inner"
                  ></textarea>
                </div>

                {/* --- ADDRESS MAP PICKER --- */}
                <div className="space-y-3 animate-in zoom-in duration-500 mt-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black text-[#E297C1] uppercase tracking-widest flex items-center gap-2">
                      <MapIcon size={12}/> Map Geolocation
                    </label>
                    {selectedLocation && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md">Marker Set</span>}
                  </div>
                  <div className="w-full rounded-[20px] md:rounded-[24px] overflow-hidden border-2 border-slate-100 h-[200px] shadow-sm relative z-0">
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

              <div className="pt-6 md:pt-8 border-t border-slate-50">
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-3 md:mb-4 block ml-4 italic">Lineup</label>
                <div className="flex gap-2 mb-4 md:mb-6">
                  <input 
                    type="text" value={inputCast} onChange={(e) => setInputCast(e.target.value)} 
                    placeholder="Artist Name" 
                    className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-[14px] md:rounded-[18px] px-4 md:px-6 py-3 md:py-4 text-xs font-bold outline-none focus:border-[#E297C1] text-slate-800" 
                  />
                  <button type="button" onClick={addCast} className="bg-slate-900 text-white px-5 md:px-6 rounded-[14px] md:rounded-[18px] hover:bg-[#E297C1] transition-all"><Plus size={18}/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {casts.map((c, i) => (
                    <span key={i} className="bg-slate-900 text-white px-4 md:px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase flex items-center gap-2 md:gap-3">
                      {c} <X size={14} className="cursor-pointer text-[#E297C1]" onClick={() => setCasts(casts.filter((_, idx) => idx !== i))}/>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/40 border border-slate-50 relative">
            <h3 className="font-black text-slate-900 uppercase italic mb-6 md:mb-8 flex items-center gap-3 text-base md:text-lg"><ImageIcon size={22} className="text-[#E297C1]"/> Visual Assets</h3>
            <div className="space-y-5 md:space-y-6">
                <div className="flex gap-2">
                  <input 
                    type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} 
                    placeholder="URL Image" 
                    className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-[14px] md:rounded-[18px] px-4 md:px-6 py-3 md:py-4 text-xs font-bold outline-none focus:border-[#E297C1]" 
                  />
                  <button type="button" onClick={addImageUrl} className="bg-[#E297C1] text-white px-5 md:px-6 rounded-[14px] md:rounded-[18px] transition-all"><Plus size={18}/></button>
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
            className="w-full bg-slate-900 text-white py-6 md:py-8 rounded-[28px] md:rounded-[36px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-xs md:text-sm hover:bg-[#E297C1] transition-all shadow-2xl flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={20}/> Deploy Event</>}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddConcert;