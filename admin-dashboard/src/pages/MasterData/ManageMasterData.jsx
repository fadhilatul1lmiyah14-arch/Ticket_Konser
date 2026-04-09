import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; 
import { Tag, MapPin, Database, Loader2, Trash2, ChevronRight, Info, FileText, Save, Languages, Sparkles } from 'lucide-react';

const ManageMasterData = () => {
  const [activeTab, setActiveTab] = useState('categories'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [globalTerms, setGlobalTerms] = useState('');

  // --- HELPER: GOOGLE TRANSLATE (Sama seperti di Edit Concert) ---
  const translateText = async (text, from = 'id', to = 'en') => {
    if (!text || text.trim() === "") return text;
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0].map(item => item[0]).join('');
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      let endpoint = '';
      
      if (activeTab === 'categories') endpoint = '/admin/categories';
      else if (activeTab === 'locations') endpoint = '/admin/locations';
      else if (activeTab === 'terms') endpoint = '/admin/global-terms';

      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const result = response.data?.data || response.data || [];
      
      if (activeTab === 'terms') {
        const rawContent = result?.content || "";
        // Parsing data terms agar tampil user-friendly "Indo | English"
        const displayLines = rawContent.split('\n').map(line => {
          if (!line.trim()) return "";
          try {
            if (line.trim().startsWith('{')) {
              const parsed = JSON.parse(line);
              return `${parsed.id} | ${parsed.en}`; 
            }
          } catch (e) {}
          return line;
        });
        setGlobalTerms(displayLines.filter(l => l !== "").join('\n'));
      } else {
        setData(Array.isArray(result) ? result : []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]);
      if (activeTab === 'terms') setGlobalTerms('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, [activeTab]);

  // --- FEATURE: AUTO TRANSLATE (UPDATED TO GOOGLE TRANSLATE) ---
  const handleAutoTranslate = async () => {
    if (!globalTerms.trim()) return;
    setIsTranslating(true);
    
    try {
      const lines = globalTerms.split('\n').filter(l => l.trim() !== "");
      
      const translatedLines = await Promise.all(lines.map(async (line) => {
        // Jika baris sudah punya format "Indo | English", ambil Indo-nya saja untuk ditranslate ulang
        const sourceText = line.includes('|') ? line.split('|')[0].trim() : line.trim();
        
        const translatedText = await translateText(sourceText, 'id', 'en');
        
        return `${sourceText} | ${translatedText}`;
      }));

      setGlobalTerms(translatedLines.join('\n'));
      alert("✨ Auto-translation complete!");
    } catch (error) {
      console.error("Translation error:", error);
      alert("Gagal menerjemahkan.");
    } finally {
      setIsTranslating(false);
    }
  };

  // --- ADD DATA (Categories) ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const rawValue = inputValue.trim();
    if (!rawValue) return;

    const formattedValue = rawValue.toUpperCase();
    const isDuplicate = data.some(item => item.category_name?.toUpperCase() === formattedValue);

    if (isDuplicate) {
      alert(`⚠️ Kategori "${formattedValue}" sudah ada!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/admin/categories', { name: formattedValue }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInputValue('');
      await fetchData(); 
      alert(`✅ Kategori berhasil ditambahkan!`);
    } catch (error) {
      alert("Gagal menyimpan kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UPDATE GLOBAL TERMS ---
  const handleUpdateTerms = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
      await api.post('/admin/global-terms', { content: globalTerms }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`✅ Syarat & Ketentuan berhasil diperbarui!`);
      await fetchData(); 
    } catch (error) {
      alert("Gagal memperbarui Syarat & Ketentuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DELETE DATA ---
  const handleDelete = async (id) => {
    const type = activeTab === 'categories' ? 'Kategori' : 'Lokasi';
    if (!window.confirm(`Hapus ${type} ini secara permanen?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = activeTab === 'categories' ? '/admin/categories' : '/admin/locations';
      await api.delete(`${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData();
      alert(`✅ ${type} berhasil dihapus.`);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert(`❌ Gagal! ${type} ini masih digunakan oleh data Event.`);
      } else {
        alert("Terjadi kesalahan saat menghapus data.");
      }
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans p-4 sm:p-8 md:p-12 relative overflow-x-hidden text-left">
      <div className="absolute top-0 right-0 w-64 h-64 md:w-[500px] md:h-[500px] bg-[#E297C1]/5 blur-[80px] md:blur-[120px] rounded-full -z-10"></div>

      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
            <Database size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-[10px] font-black text-[#E297C1] uppercase tracking-[0.3em] md:tracking-[0.5em]">System Core</h2>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase italic leading-none tracking-tighter text-left">
          Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-400 font-light">Data</span>
        </h1>
      </header>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-8 md:mb-10 bg-white/50 backdrop-blur-md p-1.5 rounded-[20px] sm:rounded-[24px] border border-white shadow-xl shadow-slate-200/50 w-full sm:w-fit">
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-6 sm:px-10 py-3.5 rounded-[16px] sm:rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${activeTab === 'categories' ? 'bg-[#E297C1] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Tag size={16} /> Categories
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`px-6 sm:px-10 py-3.5 rounded-[16px] sm:rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${activeTab === 'locations' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MapPin size={16} /> Locations
        </button>
        <button 
          onClick={() => setActiveTab('terms')}
          className={`px-6 sm:px-10 py-3.5 rounded-[16px] sm:rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${activeTab === 'terms' ? 'bg-[#E297C1] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FileText size={16} /> Global Terms
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 text-left">
        {/* LEFT SIDE: FORM */}
        <div className="lg:col-span-5 xl:col-span-4">
          {activeTab === 'categories' ? (
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-[#E297C1] rounded-full"></div>
                <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-lg md:text-xl">Add Category</h3>
              </div>
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                  <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. MUSIC FESTIVAL"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] py-4 px-6 outline-none focus:border-[#E297C1] focus:bg-white font-bold text-slate-700 transition-all uppercase text-sm"
                    required
                  />
                </div>
                <button 
                  disabled={isSubmitting} 
                  className="w-full bg-slate-900 text-white py-4 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#E297C1] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                    <>Submit Category <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/></>
                  )}
                </button>
              </form>
            </div>
          ) : activeTab === 'locations' ? (
            <div className="bg-slate-900 p-8 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <Info className="text-[#E297C1] mb-4" size={32} />
                <h3 className="font-black text-xl uppercase italic tracking-tight mb-4">Location Management</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                  Data lokasi di bawah adalah referensi yang tersimpan di sistem.
                </p>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="p-2 bg-[#E297C1] rounded-lg">
                    <MapPin size={14} className="text-white"/>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Add/Edit Concert Detail</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#E297C1] p-8 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <FileText className="text-slate-900 mb-4" size={32} />
                  <h3 className="font-black text-xl uppercase italic tracking-tight mb-4 text-white">Terms Setup</h3>
                  <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">
                    Tulis syarat & ketentuan dalam Bahasa Indonesia. Gunakan fitur Auto Translate untuk mengisi versi Inggris secara otomatis.
                  </p>
                  <button 
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating || !globalTerms}
                    className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
                  >
                    {isTranslating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isTranslating ? 'Translating...' : 'Auto Translate to English'}
                  </button>
                </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: TABLE / EDITOR */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#E297C1] mb-6" size={48} strokeWidth={3} />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Accessing Database...</p>
              </div>
            ) : activeTab === 'terms' ? (
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-xl">Global Terms Editor</h3>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <Languages size={12} className="text-[#E297C1]"/>
                        Format: Teks Indo | Teks Inggris
                    </div>
                </div>
                <form onSubmit={handleUpdateTerms} className="space-y-6">
                    <textarea 
                        value={globalTerms}
                        onChange={(e) => setGlobalTerms(e.target.value)}
                        placeholder="Tuliskan tiap poin di baris baru...&#10;Contoh: Dilarang membawa makanan | No food allowed"
                        className="w-full min-h-[400px] bg-slate-50 border-2 border-slate-50 rounded-[24px] p-8 outline-none focus:border-[#E297C1] focus:bg-white font-medium text-slate-600 text-sm leading-relaxed transition-all"
                    />
                    <button 
                        disabled={isSubmitting}
                        type="submit"
                        className="bg-slate-900 text-white px-10 py-4 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#E297C1] transition-all shadow-xl flex items-center gap-3"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16}/> Sync Multilanguage Policy</>}
                    </button>
                </form>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="px-10 py-7 text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">Entry ID</th>
                      <th className="px-8 py-7 text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">Identified Label</th>
                      <th className="px-10 py-7 text-[9px] font-black text-white/50 uppercase tracking-[0.3em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-left">
                    {data.length > 0 ? data.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                        <td className="px-10 py-6 font-black text-[#E297C1] italic tracking-tighter text-lg">#{item.id}</td>
                        <td className="px-8 py-6">
                          <span className="font-black text-slate-800 uppercase italic tracking-tight text-sm md:text-base">
                            {activeTab === 'locations' ? item.location_name : item.category_name}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-24 text-center text-slate-300 font-black uppercase italic tracking-widest">Archives Empty</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMasterData;