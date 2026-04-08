import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; 
import { Tag, MapPin, Database, Loader2, Trash2, ChevronRight, Info, AlertCircle } from 'lucide-react';

const ManageMasterData = () => {
  const [activeTab, setActiveTab] = useState('categories'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = activeTab === 'categories' ? '/admin/categories' : '/admin/locations';
      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let result = response.data?.data || response.data || [];
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  // --- ADD DATA (Only for Categories) ---
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
      fetchData(); 
      alert(`✅ Kategori berhasil ditambahkan!`);
    } catch (error) {
      alert("Gagal menyimpan kategori.");
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
      fetchData();
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
    <div className="bg-[#F8FAFC] min-h-screen font-sans p-4 sm:p-8 md:p-12 relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 md:w-[500px] md:h-[500px] bg-[#E297C1]/5 blur-[80px] md:blur-[120px] rounded-full -z-10"></div>

      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
            <Database size={20} strokeWidth={2.5} />
          </div>
          <h2 className="text-[10px] font-black text-[#E297C1] uppercase tracking-[0.3em] md:tracking-[0.5em]">System Core</h2>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
          Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-400 font-light">Data</span>
        </h1>
      </header>

      {/* TABS */}
      <div className="flex flex-col sm:flex-row gap-2 mb-8 md:mb-10 bg-white/50 backdrop-blur-md p-1.5 rounded-[20px] sm:rounded-[24px] border border-white shadow-xl shadow-slate-200/50 w-full sm:w-fit">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        
        {/* LEFT SIDE: FORM (Only for Categories) */}
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
          ) : (
            <div className="bg-slate-900 p-8 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <Info className="text-[#E297C1] mb-4" size={32} />
                <h3 className="font-black text-xl uppercase italic tracking-tight mb-4">Location Management</h3>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                  Data lokasi di bawah adalah referensi yang tersimpan di sistem. Untuk menambahkan lokasi baru dengan **Geolocation Map**, silakan gunakan menu:
                </p>
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="p-2 bg-[#E297C1] rounded-lg">
                    <MapPin size={14} className="text-white"/>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Add/Edit Concert Detail</span>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <MapPin size={200} />
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: TABLE (List Data) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#E297C1] mb-6" size={48} strokeWidth={3} />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Accessing Database...</p>
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
                  <tbody className="divide-y divide-slate-50">
                    {data.length > 0 ? data.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                        <td className="px-10 py-6 font-black text-[#E297C1] italic tracking-tighter text-lg group-hover:scale-105 transition-transform">#{item.id}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 uppercase italic tracking-tight text-sm md:text-base group-hover:text-slate-900 transition-colors">
                              {activeTab === 'locations' ? item.location_name : item.category_name}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity italic">Stored in master data</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all group/trash"
                          >
                            <Trash2 size={18} className="group-hover/trash:rotate-12 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-24 text-center">
                          <div className="flex flex-col items-center opacity-20">
                            <Database size={60} className="mb-4 text-slate-300" strokeWidth={1} />
                            <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-widest">Archives Empty</h3>
                          </div>
                        </td>
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