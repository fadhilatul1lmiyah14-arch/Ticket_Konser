import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; 
import { 
  Tag, MapPin, Database, Loader2, Trash2, ChevronRight, Info, FileText, Save, Languages, Sparkles,
  ChevronLeft, ChevronRight as ChevronRightIcon, Crown, Star, ArrowRight
} from 'lucide-react';

const ManageMasterData = () => {
  const [activeTab, setActiveTab] = useState('categories'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [globalTerms, setGlobalTerms] = useState('');

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // Reset page when tab changes or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, data.length]);

  // Auto scroll to top when page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAutoTranslate = async () => {
    if (!globalTerms.trim()) return;
    setIsTranslating(true);
    
    try {
      const lines = globalTerms.split('\n').filter(l => l.trim() !== "");
      
      const translatedLines = await Promise.all(lines.map(async (line) => {
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

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white min-h-screen font-sans p-4 sm:p-8 md:p-12 relative overflow-x-hidden text-left animate-fade-in-up">
      
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

      <header className="mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-100 mb-3">
          <Database size={14} className="text-purple-500" />
          <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span>
          <h2 className="text-[8px] md:text-[9px] font-black text-purple-600 uppercase tracking-[0.3em]">System Core</h2>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase italic leading-none tracking-tighter text-left">
          Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 bg-[length:200%_auto] animate-gradient-x">Data</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-4 rounded-full animate-slide-in"></div>
      </header>

      {/* TABS - Premium */}
      <div className="flex flex-wrap gap-2 mb-8 md:mb-10 bg-white/50 backdrop-blur-md p-1.5 rounded-[20px] sm:rounded-[24px] border border-purple-100 shadow-xl shadow-purple-50/50 w-full sm:w-fit">
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-6 sm:px-10 py-3.5 rounded-[16px] sm:rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${
            activeTab === 'categories' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
              : 'text-slate-500 hover:text-purple-600'
          }`}
        >
          <Tag size={16} /> Categories
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`px-6 sm:px-10 py-3.5 rounded-[16px] sm:rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${
            activeTab === 'locations' 
              ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg' 
              : 'text-slate-500 hover:text-purple-600'
          }`}
        >
          <MapPin size={16} /> Locations
        </button>
        <button 
          onClick={() => setActiveTab('terms')}
          className={`px-6 sm:px-10 py-3.5 rounded-[16px] sm:rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${
            activeTab === 'terms' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
              : 'text-slate-500 hover:text-purple-600'
          }`}
        >
          <FileText size={16} /> Global Terms
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 text-left">
        {/* LEFT SIDE: FORM */}
        <div className="lg:col-span-5 xl:col-span-4">
          {activeTab === 'categories' ? (
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-purple-100/40 border border-purple-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Tag size={120} className="text-purple-400 rotate-12" />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-lg md:text-xl">Add Category</h3>
              </div>
              <form onSubmit={handleAddCategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category Name</label>
                  <input 
                    type="text" 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. MUSIC FESTIVAL"
                    className="w-full bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[18px] py-4 px-6 outline-none font-bold text-slate-700 transition-all uppercase text-sm"
                    required
                  />
                </div>
                <button 
                  disabled={isSubmitting} 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-xl hover:shadow-purple-200/50 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  {isSubmitting ? <Loader2 className="animate-spin relative z-10" size={18} /> : (
                    <><span className="relative z-10">Submit Category</span> <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform"/></>
                  )}
                </button>
              </form>
            </div>
          ) : activeTab === 'locations' ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <Info className="text-purple-400" size={28} />
                </div>
                <h3 className="font-black text-xl uppercase italic tracking-tight mb-4">Location Management</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                  Data lokasi di bawah adalah referensi yang tersimpan di sistem.
                </p>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                    <MapPin size={14} className="text-white"/>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">Add/Edit Concert Detail</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <FileText className="text-white/80 mb-4" size={32} />
                <h3 className="font-black text-xl uppercase italic tracking-tight mb-4">Terms Setup</h3>
                <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">
                  Tulis syarat & ketentuan dalam Bahasa Indonesia. Gunakan fitur Auto Translate untuk mengisi versi Inggris secara otomatis.
                </p>
                <button 
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={isTranslating || !globalTerms}
                  className="w-full flex items-center justify-center gap-3 bg-white text-purple-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:bg-purple-50 transition-all disabled:opacity-50 shadow-lg"
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
          <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-purple-100/40 border border-purple-100 overflow-hidden">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-purple-500 mb-6" size={48} strokeWidth={3} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Accessing Database...</p>
              </div>
            ) : activeTab === 'terms' ? (
              <div className="p-8 md:p-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-xl">Global Terms Editor</h3>
                  <div className="flex items-center gap-2 text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                    <Languages size={12} className="text-purple-500"/>
                    Format: Teks Indo | Teks Inggris
                  </div>
                </div>
                <form onSubmit={handleUpdateTerms} className="space-y-6">
                  <textarea 
                    value={globalTerms}
                    onChange={(e) => setGlobalTerms(e.target.value)}
                    placeholder="Tuliskan tiap poin di baris baru...&#10;Contoh: Dilarang membawa makanan | No food allowed"
                    className="w-full min-h-[400px] bg-gradient-to-r from-slate-50 to-white border-2 border-purple-100 focus:border-purple-400 rounded-[24px] p-8 outline-none font-medium text-slate-600 text-sm leading-relaxed transition-all"
                  />
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-xl hover:shadow-purple-200/50 transition-all flex items-center gap-3 group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    {isSubmitting ? <Loader2 className="animate-spin relative z-10" size={16}/> : <><Save size={16} className="relative z-10"/> <span className="relative z-10">Sync Multilanguage Policy</span></>}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-800 to-pink-800">
                        <th className="px-10 py-7 text-[9px] font-black text-white/70 uppercase tracking-[0.3em] rounded-tl-2xl">Entry ID</th>
                        <th className="px-8 py-7 text-[9px] font-black text-white/70 uppercase tracking-[0.3em]">Identified Label</th>
                        <th className="px-10 py-7 text-[9px] font-black text-white/70 uppercase tracking-[0.3em] text-right rounded-tr-2xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50 text-left">
                      {currentData.length > 0 ? currentData.map((item, idx) => (
                        <tr key={item.id} className="group hover:bg-purple-50/30 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <td className="px-10 py-6">
                            <span className="font-black text-purple-500 italic tracking-tighter text-lg">#{item.id}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {activeTab === 'categories' ? (
                                <Tag size={14} className="text-purple-400" />
                              ) : (
                                <MapPin size={14} className="text-purple-400" />
                              )}
                              <span className="font-black text-slate-800 uppercase italic tracking-tight text-sm md:text-base group-hover:text-purple-600 transition-colors">
                                {activeTab === 'locations' ? item.location_name : item.category_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all duration-300 hover:scale-110"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="3" className="px-6 py-24 text-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="p-6 bg-purple-50 rounded-full">
                                <Database size={40} className="text-purple-300" />
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Archives Empty</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="px-6 py-5 border-t border-purple-100 bg-gradient-to-r from-purple-50/20 to-pink-50/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
                    </p>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 bg-white border border-purple-100 rounded-xl text-purple-500 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 disabled:opacity-30 transition-all duration-300 shadow-sm active:scale-90"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <div className="flex gap-1.5">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`w-9 h-9 rounded-xl font-black text-[10px] transition-all duration-300 active:scale-90 shadow-sm ${
                              currentPage === i + 1 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md scale-105' 
                                : 'bg-white text-slate-500 border border-purple-100 hover:bg-purple-50 hover:text-purple-600'
                            }`}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 bg-white border border-purple-100 rounded-xl text-purple-500 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 disabled:opacity-30 transition-all duration-300 shadow-sm active:scale-90"
                      >
                        <ChevronRightIcon size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { width: 0; opacity: 0; }
          to { width: 5rem; opacity: 1; }
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
          opacity: 0;
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
      `}</style>
    </div>
  );
};

export default ManageMasterData;