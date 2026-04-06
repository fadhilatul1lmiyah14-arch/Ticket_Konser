import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig'; 

// GANTI KE react-quill-new agar support React 19
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 

import { 
  X, Calendar, Clock, Loader2, 
  Plus, Trash2, Image as ImageIcon,
  ShieldCheck, LayoutGrid, Layers, RefreshCcw
} from 'lucide-react';

const EditConcert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [imageUrls, setImageUrls] = useState([]);
  const [inputUrl, setInputUrl] = useState("");
  const [casts, setCasts] = useState([]);
  const [inputCast, setInputCast] = useState("");
  
  const [termsList, setTermsList] = useState([]);
  const [inputTerm, setInputTerm] = useState("");

  const [ticketTiers, setTicketTiers] = useState([]);

  // Menggunakan Array untuk blok deskripsi
  const [descriptions, setDescriptions] = useState(['']);

  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    start_time: '',
    category_id: '',
    location_id: '',
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
        
        setFormData({
          title: event.title || '',
          event_date: event.event_date || '',
          start_time: event.start_time?.substring(0, 5) || '',
          category_id: event.category_id || '',
          location_id: event.location_id || '',
          status: event.status === 'PUBLISH' ? 'PUBLISHED' : (event.status || 'DRAFT')
        });

        // FIX: PENANGANAN DESKRIPSI (Disesuaikan dengan format Array dari Swagger)
        if (event.description) {
          if (Array.isArray(event.description)) {
            // Jika sudah array (seperti di Swagger kamu), langsung pakai
            setDescriptions(event.description.length > 0 ? event.description : ['']);
          } else {
            // Fallback jika API tiba-tiba kirim string JSON atau string biasa
            try {
              const parsed = JSON.parse(event.description);
              setDescriptions(Array.isArray(parsed) ? parsed : [event.description]);
            } catch (e) {
              setDescriptions([event.description]);
            }
          }
        }

        setImageUrls(Array.isArray(event.images) ? event.images : []);
        setCasts(Array.isArray(event.casts) ? event.casts : []);
        
        if (event.ticket_types && event.ticket_types.length > 0) {
          setTicketTiers(event.ticket_types.map(t => ({
            name: t.name,
            price: t.price.toString(),
            quota: t.quota.toString()
          })));
        } else {
          setTicketTiers([{ name: 'REGULAR', price: '', quota: '' }]);
        }
        
        if (event.terms_conditions) {
          setTermsList(event.terms_conditions.split('\n').filter(t => t.trim() !== ""));
        }

      } catch (error) {
        console.error("Error loading data:", error);
        alert("Gagal memuat data konser.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addDescriptionBlock = () => setDescriptions([...descriptions, '']);
  
  const removeDescriptionBlock = (index) => {
    if (descriptions.length > 1) {
      setDescriptions(descriptions.filter((_, i) => i !== index));
    }
  };

  const handleDescriptionChange = (index, content) => {
    const newDescs = [...descriptions];
    newDescs[index] = content;
    setDescriptions(newDescs);
  };

  const addTicketTier = () => setTicketTiers([...ticketTiers, { name: '', price: '', quota: '' }]);
  
  const removeTicketTier = (index) => {
    if (ticketTiers.length > 1) setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

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
    if (inputTerm.trim() !== "" && !termsList.includes(inputTerm)) {
      setTermsList(prev => [...prev, inputTerm]);
      setInputTerm("");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (imageUrls.length === 0) {
      alert("Harap masukkan minimal satu URL gambar!");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        title: formData.title,
        category_id: Number(formData.category_id),
        location_id: Number(formData.location_id),
        // Kirim kembali sebagai array (Sync dengan GET)
        description: descriptions.filter(d => d.trim() !== ""),
        terms_conditions: termsList.join('\n'), 
        event_date: formData.event_date,
        start_time: formData.start_time,
        status: formData.status === 'PUBLISHED' ? 'PUBLISH' : formData.status, 
        images: imageUrls,
        casts: casts,
        ticket_types: ticketTiers.map(t => ({
          name: t.name,
          price: Number(t.price),
          quota: Number(t.quota)
        }))
      };

      await api.put(`/admin/events/${id}`, payload);
      alert("✅ Konser Berhasil Diperbarui!");
      navigate('/admin/manage-concert'); 
    } catch (error) {
      console.error("ERROR UPDATE EVENT:", error.response?.data);
      alert("Gagal memperbarui data.");
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
    <form onSubmit={handleUpdate} className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8 bg-white text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-8 md:pb-10 gap-6 md:gap-8">
        <div className="space-y-1 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-slate-900 rounded-xl text-white shadow-xl shadow-slate-200">
              <RefreshCcw size={18}/>
            </span>
            <h2 className="text-[9px] md:text-[11px] font-black text-[#E297C1] uppercase tracking-[0.3em] md:tracking-[0.5em]">Update Mode</h2>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Edit <span className="text-slate-200">Concert</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
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
             <X size={24} />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* LEFT COLUMN: CORE INFO */}
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-2xl shadow-slate-200/40 border border-slate-50 relative overflow-hidden group">
            <h3 className="font-black text-slate-900 uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4 text-lg md:text-xl">
              <LayoutGrid size={22} className="text-[#E297C1]" /> Core Configuration
            </h3>
            
            <div className="space-y-6 md:space-y-8 relative z-10">
              <div className="group">
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-2 md:mb-3 block ml-4 group-focus-within:text-[#E297C1]">Concert Master Title</label>
                <input 
                  type="text" name="title" required value={formData.title} onChange={handleChange} 
                  placeholder="World Tour: Echoes of Sound" 
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] md:rounded-[24px] py-4 md:py-6 px-6 md:px-10 outline-none focus:border-[#E297C1] focus:bg-white font-bold text-slate-800 transition-all shadow-inner text-base md:text-lg" 
                />
              </div>

              {/* BAGIAN DESKRIPSI (FIXED SINKRONISASI) */}
              <div className="group">
                <div className="flex justify-between items-center mb-2 md:mb-3 ml-4">
                    <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 group-focus-within:text-[#E297C1]">Event Narratives (Compound)</label>
                    <button 
                        type="button" 
                        onClick={addDescriptionBlock}
                        className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full hover:bg-[#E297C1] hover:text-white transition-all flex items-center gap-1"
                    >
                        <Plus size={12}/> Add Section
                    </button>
                </div>
                
                <div className="space-y-4">
                    {descriptions.map((desc, idx) => (
                        <div key={idx} className="relative group/editor animate-in slide-in-from-top-2">
                             <div className="rounded-[24px] md:rounded-[32px] overflow-hidden border-2 border-slate-50 bg-slate-50 focus-within:border-[#E297C1] focus-within:bg-white transition-all shadow-inner">
                                <ReactQuill 
                                    theme="snow"
                                    value={desc}
                                    onChange={(content) => handleDescriptionChange(idx, content)}
                                    modules={quillModules}
                                    formats={quillFormats}
                                    placeholder={`Section ${idx + 1}: Tell the story...`}
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
                    .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f1f5f9 !important; background: #fff; }
                    .ql-editor { min-height: 120px; padding: 1.5rem 2.5rem; font-weight: 500; color: #334155; line-height: 1.6; }
                    .ql-editor.ql-blank::before { color: #cbd5e1 !important; font-style: normal; left: 2.5rem; }
                    .ql-editor strong { font-weight: 800; }
                `}</style>
              </div>

              {/* Ticket Tiers Section */}
              <div className="pt-4 md:pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 block ml-4 italic">Ticket Inventory & Categories</label>
                  <button type="button" onClick={addTicketTier} className="flex items-center gap-2 text-[9px] md:text-[10px] font-black bg-[#E297C1] text-white px-4 py-2 rounded-full hover:bg-slate-900 transition-all shadow-lg">
                    <Plus size={14}/> Add Tier
                  </button>
                </div>
                
                <div className="space-y-4">
                  {ticketTiers.map((tier, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 md:p-6 rounded-[24px] md:rounded-[28px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex-1">
                        <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Tier Name</label>
                        <input type="text" placeholder="e.g. VIP" required value={tier.name} onChange={(e) => handleTierChange(index, 'name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="md:w-40">
                          <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Price (IDR)</label>
                          <input type="number" placeholder="0" required value={tier.price} onChange={(e) => handleTierChange(index, 'price', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"/>
                        </div>
                        <div className="md:w-28">
                          <label className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase mb-1 block ml-2">Seats</label>
                          <input type="number" placeholder="0" required value={tier.quota} onChange={(e) => handleTierChange(index, 'quota', e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 outline-none focus:border-[#E297C1] text-sm"/>
                        </div>
                      </div>
                      <div className="flex items-end justify-end md:justify-start pb-1">
                        <button type="button" onClick={() => removeTicketTier(index)} className={`p-3 rounded-xl transition-all ${ticketTiers.length > 1 ? 'text-rose-400 hover:bg-rose-50' : 'text-slate-200 cursor-not-allowed'}`}>
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
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E297C1]" size={20} />
                    <input type="date" name="event_date" required value={formData.event_date} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] md:rounded-[24px] py-4 pl-14 pr-6 font-black outline-none focus:border-[#E297C1] text-slate-700 transition-all uppercase text-xs md:text-sm" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 block ml-4 tracking-widest">Gate Opens</label>
                  <div className="relative">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E297C1]" size={20} />
                    <input type="time" name="start_time" required value={formData.start_time} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[20px] md:rounded-[24px] py-4 pl-14 pr-6 font-black outline-none focus:border-[#E297C1] text-slate-700 transition-all text-xs md:text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Security Protocols */}
          <div className="bg-slate-900 p-6 sm:p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-2xl text-white">
            <h3 className="font-black text-white uppercase italic mb-6 md:mb-10 flex items-center gap-3 md:gap-4 text-lg md:text-xl">
              <ShieldCheck size={22} className="text-[#E297C1]" /> Security Protocols
            </h3>
            <div>
              <div className="flex gap-2 md:gap-3 mb-6">
                <input type="text" value={inputTerm} onChange={(e) => setInputTerm(e.target.value)} placeholder="Add rule..." className="flex-1 bg-white/5 border-2 border-white/5 rounded-[18px] px-6 py-3 text-xs font-bold outline-none focus:border-[#E297C1] text-white" />
                <button type="button" onClick={addTerm} className="bg-[#E297C1] text-white px-6 rounded-[18px] hover:scale-105 transition-all"><Plus size={24}/></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {termsList.map((t, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 group">
                    <p className="text-[9px] md:text-[10px] font-bold text-white/70 uppercase truncate mr-2">{t}</p>
                    <X size={16} className="shrink-0 cursor-pointer text-white/30 hover:text-rose-500" onClick={() => setTermsList(termsList.filter((_, idx) => idx !== i))}/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDE INFO */}
        <div className="lg:col-span-4 space-y-8 md:space-y-10">
          <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/40 border border-slate-50">
            <h3 className="font-black text-slate-900 uppercase italic mb-6 flex items-center gap-3 text-base md:text-lg"><Layers size={22} className="text-[#E297C1]"/> Ecosystem</h3>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Genre / Category</label>
                <select name="category_id" required value={formData.category_id} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] py-4 px-6 font-black uppercase text-[11px] outline-none focus:border-[#E297C1] text-slate-700 transition-all">
                  <option value="">Choose Genre</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-2 block ml-4">Venue Assignment</label>
                <select name="location_id" required value={formData.location_id} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] py-4 px-6 font-black uppercase text-[11px] outline-none focus:border-[#E297C1] text-slate-700 transition-all">
                  <option value="">Choose Venue</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                </select>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <label className="text-[10px] md:text-[11px] font-black uppercase text-slate-400 mb-3 block ml-4 italic">Lineup</label>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={inputCast} onChange={(e) => setInputCast(e.target.value)} placeholder="Artist Name" className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-[14px] px-4 py-3 text-xs font-bold outline-none focus:border-[#E297C1] text-slate-800" />
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

          <div className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/40 border border-slate-50">
            <h3 className="font-black text-slate-900 uppercase italic mb-6 flex items-center gap-3 text-base md:text-lg"><ImageIcon size={22} className="text-[#E297C1]"/> Visual Assets</h3>
            <div className="space-y-5">
                <div className="flex gap-2">
                  <input type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="URL Image" className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-[14px] px-4 py-3 text-xs font-bold outline-none focus:border-[#E297C1]" />
                  <button type="button" onClick={addImageUrl} className="bg-[#E297C1] text-white px-5 rounded-[14px] transition-all"><Plus size={18}/></button>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
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
            className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-xs hover:bg-[#E297C1] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={20}/> Save Changes</>}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditConcert;