import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig'; 

// GANTI KE react-quill-new agar support React 19
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

// Leaflet Imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { 
  X, Calendar, Clock, Loader2, 
  Plus, Trash2, Image as ImageIcon,
  ShieldCheck, LayoutGrid, Layers, RefreshCcw, MapPin, Navigation, Languages, Sparkles, Info
} from 'lucide-react';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, map]);
  return null;
};

const EditConcert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeLang, setActiveLang] = useState('id'); // 'id' or 'en'
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [imageUrls, setImageUrls] = useState([]);
  const [inputUrl, setInputUrl] = useState("");
  const [casts, setCasts] = useState([]);
  const [inputCast, setInputCast] = useState("");
  
  // Adjusted State Structures
  const [termsList, setTermsList] = useState([]); // Array of { id: string, en: string }
  const [inputTerm, setInputTerm] = useState({ id: '', en: '' });

  const [ticketTiers, setTicketTiers] = useState([]);
  const [descriptions, setDescriptions] = useState([{ id: '', en: '' }]);

  const [formData, setFormData] = useState({
    title: { id: '', en: '' },
    event_date: '',
    start_time: '',
    category_id: '',
    location_id: '',
    address_details: '',
    latitude: -6.200000, 
    longitude: 106.816666,
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

  // Helper function for Google Translate API
  const translateText = async (htmlOrText, from = 'id', to = 'en') => {
  if (!htmlOrText || htmlOrText === '<p><br></p>') return htmlOrText;
  
  try {
    // 1. Ekstrak teks murni (buang tag HTML agar tidak mengacaukan API Google)
    const doc = new DOMParser().parseFromString(htmlOrText, 'text/html');
    const plainText = doc.body.innerText || doc.body.textContent;

    if (!plainText.trim()) return htmlOrText;

    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(plainText)}`
    );
    const data = await res.json();
    const translatedText = data[0].map(item => item[0]).join('');

    // 2. Jika input aslinya mengandung HTML, bungkus kembali ke tag <p>
    return htmlOrText.includes('<') ? `<p>${translatedText}</p>` : translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return htmlOrText;
  }
};

  const handleAutoTranslateAll = async () => {
    setIsTranslating(true);
    try {
      // 1. Translate Title
      const translatedTitle = await translateText(formData.title.id);
      setFormData(prev => ({ ...prev, title: { ...prev.title, en: translatedTitle } }));

      // 2. Translate Descriptions
      const translatedDescs = await Promise.all(
        descriptions.map(async (desc) => ({
          id: desc.id,
          en: await translateText(desc.id)
        }))
      );
      setDescriptions(translatedDescs);

      // 3. Translate Terms
      const translatedTerms = await Promise.all(
        termsList.map(async (term) => ({
          id: term.id,
          en: await translateText(term.id)
        }))
      );
      setTermsList(translatedTerms);

      alert("✨ Auto-translation complete!");
    } catch (err) {
      alert("Failed to translate some parts.");
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [catRes, locRes, eventRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/locations'),
        api.get(`/admin/events/${id}`)
      ]);

      setCategories(catRes.data?.data || []);
      setLocations(locRes.data?.data || []);
      
      const event = eventRes.data?.data || eventRes.data;
      
      // Helper untuk parsing JSON yang aman
      const safeParse = (val, fallback) => {
        try {
          if (!val) return fallback;
          return typeof val === 'string' ? JSON.parse(val) : val;
        } catch (e) { return fallback; }
      };

      // 1. Sync Title
      const titleObj = safeParse(event.title, { id: event.title || '', en: event.title || '' });
      
      setFormData({
        title: titleObj,
        event_date: event.event_date || '',
        start_time: event.start_time?.substring(0, 5) || '',
        category_id: event.category_id || '',
        location_id: event.location_id || '',
        address_details: event.address_details || '',
        latitude: event.latitude ? parseFloat(event.latitude) : -6.200000,
        longitude: event.longitude ? parseFloat(event.longitude) : 106.816666,
        status: event.status === 'PUBLISH' ? 'PUBLISHED' : (event.status || 'DRAFT')
      });

      // 2. Sync Descriptions (Harus Array of Objects)
      const descData = safeParse(event.description, []);
      if (Array.isArray(descData)) {
        setDescriptions(descData.length > 0 ? descData : [{ id: '', en: '' }]);
      } else {
        setDescriptions([{ id: event.description, en: event.description }]);
      }

      // 3. Sync Terms (Harus Array of Objects)
      const termsData = safeParse(event.terms_conditions, []);
      setTermsList(Array.isArray(termsData) ? termsData : []);

      // 4. Sync Other fields
      setImageUrls(Array.isArray(event.images) ? event.images : []);
      setCasts(Array.isArray(event.casts) ? event.casts : []);
      
      if (event.ticket_types?.length > 0) {
        setTicketTiers(event.ticket_types.map(t => ({
          name: t.name,
          price: (t.price || 0).toString(),
          quota: (t.quota || 0).toString() 
        })));
      }

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "title") {
      setFormData(prev => ({ ...prev, title: { ...prev.title, [activeLang]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddressSearch = async () => {
    if (!formData.address_details || formData.address_details.length < 3) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address_details)}&limit=1`);
      const data = await response.json();
      if (data?.length > 0) {
        setFormData(prev => ({ ...prev, latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) }));
      }
    } catch (error) { console.error(error); }
  };

  const handleLocationSelect = async (lat, lng) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data?.display_name) {
        setFormData(prev => ({ ...prev, address_details: data.display_name }));
      }
    } catch (error) { console.error(error); }
  };

  const addDescriptionBlock = () => setDescriptions([...descriptions, { id: '', en: '' }]);
  const removeDescriptionBlock = (index) => descriptions.length > 1 && setDescriptions(descriptions.filter((_, i) => i !== index));
  const handleDescriptionChange = (index, content) => {
    const newDescs = [...descriptions];
    newDescs[index][activeLang] = content;
    setDescriptions(newDescs);
  };

  const addTicketTier = () => setTicketTiers([...ticketTiers, { name: '', price: '', quota: '' }]);
  const removeTicketTier = (index) => ticketTiers.length > 1 && setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  const handleTierChange = (index, field, value) => {
    const newTiers = [...ticketTiers];
    newTiers[index][field] = field === 'name' ? value.toUpperCase() : value;
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

  const handleUpdate = async (e) => {
  e.preventDefault();
  if (imageUrls.length === 0) return alert("Harap masukkan minimal satu URL gambar!");

  setIsUpdating(true);
  try {
    const payload = {
      // Dibungkus JSON.stringify agar di DB tersimpan sebagai string JSON
      title: JSON.stringify(formData.title),
      category_id: Number(formData.category_id),
      location_id: Number(formData.location_id),
      address_details: formData.address_details,
      latitude: formData.latitude,
      longitude: formData.longitude,
      
      // Kirim array object langsung, backend kamu sudah ada logic JSON.stringify untuk ini
      description: descriptions.filter(d => d.id.trim() !== ""), 
      terms_conditions: JSON.stringify(termsList), 
      
      event_date: formData.event_date,
      start_time: formData.start_time,
      status: formData.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT', 
      images: imageUrls,
      casts: casts,
      ticket_types: ticketTiers.map(t => ({
        name: t.name,
        price: Number(t.price),
        quota: Number(t.quota),
        description: "" // Tambahkan default agar skema backend terpenuhi
      }))
    };

    await api.put(`/admin/events/${id}`, payload);
    alert("✅ Konser Berhasil Diperbarui!");
    navigate('/admin/manage-concert'); 
  } catch (error) {
    alert(error.response?.data?.message || "Gagal memperbarui data.");
  } finally {
    setIsUpdating(false);
  }
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-[#E297C1]" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Synchronizing Data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpdate} className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8 bg-white text-left">
      
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-8 md:pb-10 gap-6 md:gap-8">
        <div className="space-y-1 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-slate-900 rounded-xl text-white">
              <RefreshCcw size={18}/>
            </span>
            <h2 className="text-[11px] font-black text-[#E297C1] uppercase tracking-[0.5em]">Update Mode</h2>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter">
            Edit <span className="text-slate-200">Concert</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
            {/* Language Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button 
                type="button" 
                onClick={() => setActiveLang('id')}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${activeLang === 'id' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
              >
                ID
              </button>
              <button 
                type="button" 
                onClick={() => setActiveLang('en')}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${activeLang === 'en' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
              >
                EN
              </button>
            </div>

            <button 
              type="button"
              onClick={handleAutoTranslateAll}
              disabled={isTranslating}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-100 disabled:opacity-50"
            >
              {isTranslating ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
              {isTranslating ? 'Translating...' : 'Auto Translate'}
            </button>

            {/* Container for Status and Close Button */}
            <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-[24px] border border-slate-100">
              <div className="flex">
                {['DRAFT', 'PUBLISHED'].map((s) => (
                  <button
                    key={s} type="button" onClick={() => setFormData(p => ({...p, status: s}))}
                    className={`px-6 md:px-10 py-3 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all ${
                      formData.status === s ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'
                    }`}
                  >
                    {s === 'PUBLISHED' ? 'PUBLISH' : s}
                  </button>
                ))}
              </div>
              
              {/* Tombol X sekarang berada di dalam kontainer yang sama, di samping tombol status */}
              <button type="button" onClick={() => navigate(-1)} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-full hover:text-rose-500 group transition-all shadow-sm">
                <X size={20} className="group-hover:rotate-90 transition-transform"/>
              </button>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-6 md:p-12 rounded-[48px] shadow-2xl shadow-slate-200/40 border border-slate-50 relative">
            <div className="absolute top-8 right-8 flex items-center gap-2 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              <Languages size={12}/> Editing: {activeLang.toUpperCase()}
            </div>

            <h3 className="font-black text-slate-900 uppercase italic mb-10 flex items-center gap-4 text-xl">
              <LayoutGrid size={22} className="text-[#E297C1]" /> Core Configuration
            </h3>
            
            <div className="space-y-8">
              <div className="group">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-3 block ml-4">Concert Title ({activeLang.toUpperCase()})</label>
                <input 
                  type="text" name="title" required value={formData.title[activeLang]} 
                  onChange={handleChange} 
                  placeholder={`Concert Title in ${activeLang === 'id' ? 'Indonesian' : 'English'}`}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[24px] py-6 px-10 outline-none focus:border-[#E297C1] focus:bg-white font-bold text-slate-800 transition-all text-lg" 
                />
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-3 ml-4">
                    <label className="text-[11px] font-black uppercase text-slate-400 italic">Event Narratives ({activeLang.toUpperCase()})</label>
                    <button type="button" onClick={addDescriptionBlock} className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full hover:bg-[#E297C1] hover:text-white transition-all flex items-center gap-1">
                        <Plus size={12}/> Add Section
                    </button>
                </div>
                
                <div className="space-y-4">
                    {descriptions.map((desc, idx) => (
                        <div key={idx} className="relative group/editor">
                             <div className="rounded-[32px] overflow-hidden border-2 border-slate-50 bg-slate-50 focus-within:border-[#E297C1] focus-within:bg-white transition-all shadow-inner">
                                <ReactQuill 
                                    theme="snow"
                                    value={desc[activeLang]}
                                    onChange={(content) => handleDescriptionChange(idx, content)}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder={`Section ${idx + 1}: ${activeLang === 'id' ? 'Ceritakan sesuatu...' : 'Tell the story...'}`}
                                    className="bg-transparent"
                                />
                            </div>
                            {descriptions.length > 1 && (
                                <button type="button" onClick={() => removeDescriptionBlock(idx)} className="absolute -right-2 -top-2 p-2 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover/editor:opacity-100 transition-opacity z-20">
                                    <X size={14}/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
              </div>

              <div className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-[11px] font-black uppercase text-slate-400 block ml-4 italic">Ticket Inventory</label>
                  <button type="button" onClick={addTicketTier} className="flex items-center gap-2 text-[10px] font-black bg-[#E297C1] text-white px-4 py-2 rounded-full hover:bg-slate-900 transition-all shadow-lg">
                    <Plus size={14}/> Add Tier
                  </button>
                </div>
                <div className="space-y-4">
                  {ticketTiers.map((tier, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 bg-slate-50 p-6 rounded-[28px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Tier Name</label>
                        <input type="text" placeholder="VIP" required value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="md:w-40">
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Price (IDR)</label>
                          <input type="number" required value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"/>
                        </div>
                        <div className="md:w-28">
                          <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Seats</label>
                          <input type="number" required value={tier.quota} onChange={(e) => handleTierChange(index, 'quota', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"/>
                        </div>
                      </div>
                      <div className="flex items-end pb-1">
                        <button type="button" onClick={() => removeTicketTier(index)} className={`p-3 rounded-xl transition-all ${ticketTiers.length > 1 ? 'text-rose-400 hover:bg-rose-50' : 'text-slate-200'}`}>
                          <Trash2 size={20}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-slate-400 block ml-4 tracking-widest">Show Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E297C1]" size={20} />
                    <input type="date" name="event_date" required value={formData.event_date} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[24px] py-4 pl-14 pr-6 font-black outline-none focus:border-[#E297C1] text-slate-700 transition-all uppercase text-sm" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-slate-400 block ml-4 tracking-widest">Gate Opens</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E297C1]" size={20} />
                    <input type="time" name="start_time" required value={formData.start_time} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[24px] py-4 pl-14 pr-6 font-black outline-none focus:border-[#E297C1] text-slate-700 transition-all text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Terms Protocol (EDIT MODE) */}
<div className="bg-slate-900 p-6 md:p-12 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
  <div className="relative z-10">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
      <h3 className="font-black text-white uppercase italic flex items-center gap-4 text-xl">
        <ShieldCheck size={22} className="text-[#E297C1]" /> Security Protocols ({activeLang.toUpperCase()})
      </h3>

      {/* Info Badge khusus untuk Admin agar tidak bingung saat edit */}
      <div className="flex items-center gap-2 bg-[#E297C1]/10 border border-[#E297C1]/20 px-4 py-2 rounded-full">
        <Info size={14} className="text-[#E297C1]" />
        <span className="text-[10px] font-bold text-pink-100 uppercase tracking-tight">
          S&K Tambahan Khusus Event Ini
        </span>
      </div>
    </div>

    <div>
      <div className="flex gap-3 mb-8">
        <input 
          type="text" 
          value={inputTerm[activeLang]} 
          onChange={(e) => setInputTerm(prev => ({...prev, [activeLang]: e.target.value}))} 
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTerm())}
          placeholder={activeLang === 'id' ? "Aturan tambahan (ID)..." : "Additional rule (EN)..."} 
          className="flex-1 bg-white/5 border-2 border-white/5 rounded-[18px] px-6 py-4 text-sm font-bold outline-none focus:border-[#E297C1] focus:bg-white/10 text-white transition-all placeholder:text-white/20" 
        />
        <button 
          type="button" 
          onClick={addTerm} 
          className="bg-[#E297C1] text-white px-8 rounded-[18px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-pink-500/20 flex items-center justify-center"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {termsList.length > 0 ? (
          termsList.map((t, i) => (
            <div key={i} className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 transition-colors group animate-in zoom-in duration-300">
              <div className="flex items-start gap-3 overflow-hidden">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E297C1] mt-1.5 shrink-0" />
                <p className="text-[10px] md:text-[11px] font-medium text-white/80 leading-relaxed italic">
                  {t[activeLang] || t.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTermsList(termsList.filter((_, idx) => idx !== i))}
                className="p-1 hover:bg-rose-500/20 rounded-md transition-colors text-white/20 hover:text-rose-500"
              >
                <X size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 border-2 border-dashed border-white/5 rounded-[32px] flex flex-col items-center justify-center opacity-30">
            <ShieldCheck size={32} className="mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Tidak ada S&K khusus</p>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Watermark Background agar visual tidak flat */}
  <div className="absolute -bottom-12 -right-12 opacity-[0.03] text-white rotate-12 pointer-events-none">
    <ShieldCheck size={280} />
  </div>
</div>
</div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/40 border border-slate-50">
            <h3 className="font-black text-slate-900 uppercase italic mb-6 flex items-center gap-3 text-lg"><Layers size={22} className="text-[#E297C1]"/> Ecosystem</h3>
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Genre</label>
                <select name="category_id" required value={formData.category_id} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] py-4 px-6 font-black uppercase text-[11px] outline-none focus:border-[#E297C1] text-slate-700">
                  <option value="">Choose Genre</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Venue Assignment</label>
                  <select name="location_id" required value={formData.location_id} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] py-4 px-6 font-black uppercase text-[11px] outline-none focus:border-[#E297C1] text-slate-700">
                    <option value="">Choose Venue</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                  </select>
                </div>
                
                <div className="group">
                  <label className="text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4 group-focus-within:text-[#E297C1]">Address Details</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-300" size={16} />
                    <textarea 
                      name="address_details" value={formData.address_details} onChange={handleChange}
                      onBlur={handleAddressSearch}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())}
                      placeholder="e.g. Building A, 3rd Floor..." rows="3"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] py-4 pl-12 pr-6 font-bold text-[11px] outline-none focus:border-[#E297C1] focus:bg-white text-slate-700 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center ml-4">
                    <label className="text-[11px] font-black uppercase text-slate-400 italic">Geospatial Tagging</label>
                    <div className="flex gap-2 text-[9px] font-black text-[#E297C1]">
                      <span>LAT: {formData.latitude.toFixed(4)}</span>
                      <span>LNG: {formData.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                  <div className="h-[250px] w-full rounded-[24px] overflow-hidden border-2 border-slate-100 z-0">
                    <MapContainer center={[formData.latitude, formData.longitude]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[formData.latitude, formData.longitude]} />
                      <LocationPicker onLocationSelect={handleLocationSelect} />
                      <RecenterMap lat={formData.latitude} lng={formData.longitude} />
                    </MapContainer>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <label className="text-[11px] font-black uppercase text-slate-400 mb-3 block ml-4 italic">Lineup</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={inputCast} onChange={(e) => setInputCast(e.target.value)} placeholder="Artist Name" className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-[14px] px-4 py-3 text-xs font-bold outline-none focus:border-[#E297C1]" />
                  <button type="button" onClick={addCast} className="bg-slate-900 text-white px-5 rounded-[14px] hover:bg-[#E297C1] transition-all"><Plus size={18}/></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {casts.map((c, i) => (
                    <span key={i} className="bg-slate-900 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase flex items-center gap-2">
                      {c} <X size={14} className="cursor-pointer text-[#E297C1]" onClick={() => setCasts(casts.filter((_, idx) => idx !== i))}/>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-2xl shadow-slate-200/40 border border-slate-50">
            <h3 className="font-black text-slate-900 uppercase italic mb-6 flex items-center gap-3 text-lg"><ImageIcon size={22} className="text-[#E297C1]"/> Visual Assets</h3>
            <div className="space-y-5">
                <div className="flex gap-2">
                  <input type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="URL Image" className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-[14px] px-4 py-3 text-xs font-bold outline-none focus:border-[#E297C1]" />
                  <button type="button" onClick={addImageUrl} className="bg-[#E297C1] text-white px-5 rounded-[14px] transition-all"><Plus size={18}/></button>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-[18px] overflow-hidden group shadow-md">
                      <img src={url} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125" alt="preview" />
                      <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"><Trash2 className="text-white" size={20}/></button>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <button 
            type="submit" disabled={isUpdating} 
            className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs hover:bg-[#E297C1] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={20}/> : <ShieldCheck size={20}/>}
            {isUpdating ? 'Updating...' : 'Submit Record'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditConcert;