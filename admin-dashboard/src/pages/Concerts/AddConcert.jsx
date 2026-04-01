import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; 
import { 
  X, Image as ImageIcon, MapPin, Tag, Calendar, 
  DollarSign, Clock, FileText, Loader2, CheckCircle, 
  Music, Plus, Trash2 
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const AddConcert = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // State untuk menyimpan URL gambar (Array of Strings sesuai backend)
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
    publish: true // Default PUBLISH
  });

  // 1. Load Master Data (Category & Location)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const headers = { Authorization: `Bearer ${token}` };

        const [catRes, locRes] = await Promise.all([
          api.get('/admin/categories', { headers }),
          api.get('/admin/locations', { headers })
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // 2. Gallery Logic (URL Based)
  const addImageUrl = () => {
    if (inputUrl.trim() !== "" && !imageUrls.includes(inputUrl)) {
      setImageUrls(prev => [...prev, inputUrl]);
      setInputUrl("");
    }
  };

  const removeImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  // 3. Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imageUrls.length === 0) {
      alert("Harap masukkan minimal satu URL gambar untuk konser!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');

      // PAKSA KONVERSI TIPE DATA AGAR VALID DI BACKEND (Elysia t.Numeric)
      const payload = {
        title: formData.title,
        category_id: Number(formData.category_id), // Harus Number
        location_id: Number(formData.location_id), // Harus Number
        description: formData.description,
        event_date: formData.event_date,
        start_time: formData.start_time,
        price: Number(formData.price),             // Harus Number
        quota: Number(formData.quota),             // Harus Number
        publish: formData.publish,                 // t.Any() di backend, kirim boolean OK
        images: imageUrls                          // t.Array(t.String())
      };

      const response = await api.post('/admin/events', payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });

      alert(response.data.message || "✅ Event Berhasil Disimpan!");
      navigate('/concerts'); // Kembali ke halaman Manage Concerts

    } catch (error) {
      console.error("ERROR POST EVENT:", error.response?.data);
      const errorDetail = error.response?.data;
      alert("Gagal: " + (errorDetail?.detail || errorDetail?.error || "Terjadi kesalahan server"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-left">
      <Sidebar />
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          {/* HEADER */}
          <header className="mb-10 flex justify-between items-end border-b border-slate-100 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 bg-slate-900 rounded-lg text-white"><Music size={14}/></span>
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Internal Studio</h2>
              </div>
              <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter">
                Create <span className="text-[#E297C1]">New Event</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
               {/* Status Toggle */}
               <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400">Direct Publish</span>
                  <input 
                    type="checkbox" 
                    name="publish"
                    checked={formData.publish}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#E297C1]"
                  />
               </label>
               <button type="button" onClick={() => navigate('/concerts')} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-rose-500 transition-all shadow-sm">
                <X size={24} />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* LEFT COLUMN: PRIMARY INFO */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 uppercase italic mb-8 flex items-center gap-3 text-lg">
                  <FileText size={22} className="text-[#E297C1]" /> Core Information
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Concert Title</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Bruno Mars: Live in Jakarta" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 outline-none focus:border-[#E297C1] font-bold text-slate-700 transition-all" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Description</label>
                    <textarea name="description" required rows="5" value={formData.description} onChange={handleChange} placeholder="Write event details, line-up, and terms..." className="w-full bg-slate-50 border-2 border-slate-50 rounded-[32px] py-5 px-8 outline-none focus:border-[#E297C1] font-bold text-slate-700 transition-all resize-none"></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Event Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E297C1]" size={18} />
                        <input type="date" name="event_date" required value={formData.event_date} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 pl-16 pr-8 font-bold outline-none focus:border-[#E297C1]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Start Time</label>
                      <div className="relative">
                        <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#E297C1]" size={18} />
                        <input type="time" name="start_time" required value={formData.start_time} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 pl-16 pr-8 font-bold outline-none focus:border-[#E297C1]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Quota */}
              <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 uppercase italic mb-8 flex items-center gap-3 text-lg">
                  <DollarSign size={22} className="text-[#E297C1]" /> Pricing & Quota
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Ticket Price (IDR)</label>
                    <input type="number" name="price" required value={formData.price} onChange={handleChange} placeholder="500000" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 font-bold outline-none focus:border-[#E297C1]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Initial Quota</label>
                    <input type="number" name="quota" required value={formData.quota} onChange={handleChange} placeholder="1000" className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-5 px-8 font-bold outline-none focus:border-[#E297C1]" />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ASSETS */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 uppercase italic mb-8 flex items-center gap-3"><MapPin size={20} className="text-[#E297C1]"/> Assets & Mapping</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Category</label>
                    <select name="category_id" required value={formData.category_id} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 font-bold uppercase text-[11px] tracking-widest outline-none focus:border-[#E297C1]">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-2">Venue Location</label>
                    <select name="location_id" required value={formData.location_id} onChange={handleChange} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-6 font-bold uppercase text-[11px] tracking-widest outline-none focus:border-[#E297C1]">
                      <option value="">Select Venue</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                    </select>
                  </div>
                  
                  {/* Gallery Section */}
                  <div className="pt-4 border-t border-slate-50">
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block ml-2">Gallery Images (URLs)</label>
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="url" 
                        value={inputUrl} 
                        onChange={(e) => setInputUrl(e.target.value)} 
                        placeholder="https://image-url.com/poster.jpg" 
                        className="flex-1 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#E297C1]" 
                      />
                      <button type="button" onClick={addImageUrl} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-[#E297C1] transition-all">
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-100 group">
                          <img src={url} className="w-full h-full object-cover" alt="preview" onError={(e) => e.target.src='https://via.placeholder.com/150?text=Invalid+URL'} />
                          <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <Trash2 className="text-white" size={16}/>
                          </button>
                        </div>
                      ))}
                      {imageUrls.length === 0 && (
                        <div className="col-span-2 py-10 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-300">
                          <ImageIcon size={24} className="mb-2"/>
                          <p className="text-[9px] font-black uppercase">No Images Added</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-slate-900 text-white py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-xs hover:bg-[#E297C1] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Save & Publish Event"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddConcert;