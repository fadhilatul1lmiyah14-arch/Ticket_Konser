import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; 
import { Tag, MapPin, Plus, Trash2, Database, Loader2, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const ManageMasterData = () => {
  const [activeTab, setActiveTab] = useState('categories'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  // Fungsi ambil data (GET)
  const fetchData = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const token = localStorage.getItem('adminToken');
      // Sesuai Swagger: /admin/categories atau /admin/locations
      const endpoint = activeTab === 'categories' ? '/admin/categories' : '/admin/locations';
      
      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log(`Data ${activeTab}:`, response.data);

      // Handle berbagai format response backend
      let result = [];
      if (Array.isArray(response.data)) {
        result = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        result = response.data.data;
      } else if (response.data[activeTab]) {
        result = response.data[activeTab];
      }

      setData(result);
    } catch (error) {
      console.error("Fetch error:", error);
      setErrorStatus(error.response?.status || "Network Error");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetchData setiap kali tab berubah
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Fungsi tambah data (POST)
  const handleAddData = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = activeTab === 'categories' ? '/admin/categories' : '/admin/locations';
      
      // Kirim payload. Note: Biasanya backend minta field 'name' 
      // tapi saya siapkan fallback ke 'category_name' jika perlu
      const payload = { name: inputValue };

      await api.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setInputValue('');
      fetchData(); // Refresh list setelah nambah
    } catch (error) {
      console.error("Add error:", error);
      alert("Gagal menambah data. Pastikan backend sudah support POST untuk rute ini.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi hapus data (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm(`Yakin ingin menghapus ${activeTab} ini?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = activeTab === 'categories' ? '/admin/categories' : '/admin/locations';
      
      await api.delete(`${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchData();
    } catch (error) {
      alert("Gagal menghapus. Data mungkin masih digunakan di tabel Event.");
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <Database size={16} />
            </div>
            <h2 className="text-xs font-black text-[#E297C1] uppercase tracking-[0.4em]">Resource Control</h2>
          </div>
          <h1 className="text-4xl font-black text-slate-800 uppercase italic leading-none">Master Data Manager</h1>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 w-fit">
          <button 
            onClick={() => setActiveTab('categories')}
            className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 transition-all ${
              activeTab === 'categories' ? 'bg-[#E297C1] text-white shadow-lg shadow-pink-100' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Tag size={14} /> Categories
          </button>
          <button 
            onClick={() => setActiveTab('locations')}
            className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 transition-all ${
              activeTab === 'locations' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-slate-50'
            }`}
          >
            <MapPin size={14} /> Locations
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah */}
          <div className="bg-white p-8 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 h-fit">
            <h3 className="font-black text-slate-800 uppercase italic mb-6">Create New Entry</h3>
            <form onSubmit={handleAddData} className="space-y-5">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter ${activeTab} name...`}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 outline-none focus:border-[#E297C1] font-bold transition-all"
                required
              />
              <button 
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#E297C1] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Add to System</>}
              </button>
            </form>
          </div>

          {/* Tabel Data */}
          <div className="lg:col-span-2 bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#E297C1] mb-4" size={40} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Database...</p>
              </div>
            ) : errorStatus ? (
              <div className="p-24 text-center">
                <AlertCircle className="mx-auto text-rose-500 mb-4" size={48} />
                <p className="font-black text-slate-800 uppercase italic">Error {errorStatus}</p>
                <p className="text-xs text-slate-400 mt-2 font-bold uppercase">Backend belum siap atau rute GET salah.</p>
                <button onClick={fetchData} className="mt-6 text-[10px] font-black uppercase text-[#E297C1] border-b-2 border-[#E297C1]">Try Again</button>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Reference ID</th>
                    <th className="px-8 py-6">Label Name</th>
                    <th className="px-8 py-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.length > 0 ? data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-5 font-black text-[#E297C1] italic">#{item.id}</td>
                      <td className="px-8 py-5 font-black text-slate-700 uppercase italic">
                        {item.name || item.category_name || item.location_name}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" className="p-24 text-center text-slate-300 font-black uppercase italic tracking-widest">
                        No Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageMasterData;