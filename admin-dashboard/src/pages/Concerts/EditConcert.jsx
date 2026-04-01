import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosConfig'; 
import { 
  Save, 
  X, 
  Calendar, 
  DollarSign, 
  Clock, 
  FileText,
  Loader2,
  RefreshCcw,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Music,
  MapPin,
  Tag
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const EditConcert = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // State Gambar (Array of strings sesuai backend)
  const [imageUrls, setImageUrls] = useState([]);
  const [inputUrl, setInputUrl] = useState("");

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '',
    price: '',
    quota: '',
    category_id: '',
    location_id: '',
    publish: true 
  });

  // 1. Fetch Initial Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [catRes, locRes, eventRes] = await Promise.all([
          api.get('/admin/categories', { headers }),
          api.get('/admin/locations', { headers }),
          api.get(`/admin/events/${id}`, { headers })
        ]);

        setCategories(catRes.data?.data || []);
        setLocations(locRes.data?.data || []);
        
        const event = eventRes.data?.data || eventRes.data;
        
        // Mapping data dari backend ke state form
        // Catatan: backend mengembalikan event_date dalam format ISO, kita ambil YYYY-MM-DD
        setFormData({
          title: event.title || '',
          description: event.description || '',
          event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
          start_time: event.start_time || '',
          price: event.price || event.current_price || '',
          quota: event.total_quota || event.quota || '',
          category_id: event.category_id || '',
          location_id: event.location_id || '',
          publish: event.status === 'PUBLISH'
        });

        // Backend mengirim images sebagai array of strings (URL)
        setImageUrls(event.images || []);

      } catch (error) {
        console.error("Error loading data:", error);
        alert("Gagal memuat data konser.");
        if (error.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addImageUrl = () => {
    if (inputUrl.trim() !== "" && !imageUrls.includes(inputUrl)) {
      setImageUrls(prev => [...prev, inputUrl]);
      setInputUrl("");
    }
  };

  const removeImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // 2. Handle Update (PUT)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (imageUrls.length === 0) return alert("Minimal harus ada 1 gambar!");

    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // Payload harus sinkron dengan t.Object backend
      const payload = {
        title: formData.title,
        description: formData.description,
        event_date: formData.event_date,
        start_time: formData.start_time,
        price: Number(formData.price),         // Konversi ke Numeric
        quota: Number(formData.quota),         // Konversi ke Numeric
        category_id: Number(formData.category_id), // Konversi ke Numeric
        location_id: Number(formData.location_id), // Konversi ke Numeric
        publish: formData.publish,             // Boolean
        images: imageUrls                      // Array of Strings
      };

      await api.put(`/admin/events/${id}`, payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      alert("✅ Konser berhasil diperbarui!");
      navigate('/concerts');
    } catch (error) {
      console.error("Update Error:", error.response?.data);
      const errorMsg = error.response?.data?.error || "Gagal memperbarui data";
      alert("Gagal: " + errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#E297C1] mx-auto mb-4" size={48} />
        <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 italic">Accessing Database...</p>
      </div>
    </div>
  );

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-left">
      <Sidebar />
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <form onSubmit={handleUpdate} className="max-w-6xl mx-auto">
          {/* HEADER */}
          <header className="mb-12 flex justify-between items-end border-b border-slate-100 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCcw size={16} className="text-[#E297C1] animate-reverse-spin" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Modification Mode</h2>
              </div>
              <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter">
                Edit <span className="text-[#E297C1]">Concert</span>
              </h1>
            </div>
            <button type="button" onClick={() => navigate('/concerts')} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-rose-500 transition-all shadow-sm">
              <X size={24} />
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT: MAIN FORM */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 uppercase italic mb-8 flex items-center gap-3 text-lg">
                  <FileText size={22} className="text-[#E297C1]" /> Core Details
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Event Title</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 outline-none focus:border-[#E297C1] font-bold text-slate-700 transition-all" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Event Description</label>
                    <textarea name="description" required rows="6" value={formData.description} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-[32px] py-5 px-8 outline-none focus:border-[#E297C1] font-bold text-slate-700 transition-all resize-none"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Date</label>
                      <input type="date" name="event_date" required value={formData.event_date} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 font-bold outline-none focus:border-[#E297C1]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Time</label>
                      <input type="time" name="start_time" required value={formData.start_time} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 font-bold outline-none focus:border-[#E297C1]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* PRICING */}
              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 uppercase italic mb-8 flex items-center gap-3 text-lg">
                  <DollarSign size={22} className="text-[#E297C1]" /> Financials & Quota
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input type="number" name="price" required value={formData.price} onChange={handleChange} placeholder="Price (IDR)" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 font-bold outline-none focus:border-[#E297C1]" />
                  <input type="number" name="quota" required value={formData.quota} onChange={handleChange} placeholder="Quota" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 font-bold outline-none focus:border-[#E297C1]" />
                </div>
              </div>
            </div>

            {/* RIGHT: ASSETS & STATUS */}
            <div className="space-y-8">
              {/* ASSETS */}
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 uppercase italic mb-8 flex items-center gap-3"><Tag size={20} className="text-[#E297C1]"/> Taxonomy</h3>
                <div className="space-y-6">
                  <select name="category_id" required value={formData.category_id} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 font-bold uppercase text-[11px] tracking-widest outline-none focus:border-[#E297C1]">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                  </select>
                  <select name="location_id" required value={formData.location_id} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 font-bold uppercase text-[11px] tracking-widest outline-none focus:border-[#E297C1]">
                    {locations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                  </select>

                  <div className="pt-6 border-t border-slate-50">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block ml-2">Gallery Assets</label>
                    <div className="flex gap-2 mb-4">
                      <input type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="Image URL..." className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                      <button type="button" onClick={addImageUrl} className="bg-slate-900 text-white p-2 rounded-xl hover:bg-[#E297C1] transition-all"><Plus size={20} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative aspect-video rounded-xl overflow-hidden border-2 border-white shadow-sm group">
                          <img src={url} className="w-full h-full object-cover" alt="preview" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* VISIBILITY */}
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 uppercase italic mb-6">Visibility Status</h3>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setFormData(p => ({...p, publish: false}))} className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${!formData.publish ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-50 text-slate-300'}`}>
                    {!formData.publish ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                    <span className="text-[9px] font-black uppercase tracking-widest">Draft</span>
                  </button>
                  <button type="button" onClick={() => setFormData(p => ({...p, publish: true}))} className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.publish ? 'border-[#E297C1] bg-[#E297C1] text-white shadow-lg' : 'border-slate-50 text-slate-300'}`}>
                    {formData.publish ? <CheckCircle2 size={18}/> : <Circle size={18}/>}
                    <span className="text-[9px] font-black uppercase tracking-widest">Publish</span>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isUpdating} className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-xs hover:bg-[#E297C1] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Update Event</>}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditConcert;