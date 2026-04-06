import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../api/axiosConfig'; 
import { Tag, MapPin, Plus, Trash2, Database, Loader2, Info, Search, Map as MapIcon, ChevronRight, AlertTriangle } from 'lucide-react';

// --- LEAFLET SETUP ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ setInputValue, setSelectedLocation }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation([lat, lng]);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        if (data) {
          const name = data.name || data.address.amenity || data.address.building || data.address.road || "Unknown Location";
          const city = data.address.city || data.address.town || "";
          const formatted = city ? `${name}, ${city}` : name;
          setInputValue(formatted.toUpperCase());
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

const ManageMasterData = () => {
  const [activeTab, setActiveTab] = useState('categories'); 
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchTimeoutRef = useRef(null);

  // --- VALIDATION LOGIC ---
  const validateInput = (text) => {
    const toxicWords = [
      'TAI', 'ANJING', 'KONTOL', 'MEMEK', 'ASU', 'BAJINGAN', 'GOBLOK', 'TOLOL', 
      'FUCK', 'SHIT', 'BITCH', 'ADMIN', 'ROOT', 'ALAY', 'ANJ', 'BNST'
    ]; 
    
    const cleanText = text.trim().toUpperCase();
    const isValidChar = /^[a-zA-Z0-9 -]*$/.test(text);
    if (!isValidChar) return { valid: false, msg: "Simbol atau karakter spesial tidak diizinkan!" };

    for (let word of toxicWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(cleanText)) {
            return { valid: false, msg: `Kata "${word}" dilarang oleh sistem keamanan!` };
        }
    }

    if (cleanText.length < 2) return { valid: false, msg: "Input terlalu pendek!" };
    return { valid: true };
  };

  const handleSearchLocation = async (query) => {
    if (!query || query.length < 3 || activeTab !== 'locations') return;
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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (activeTab === 'locations') {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        handleSearchLocation(value);
      }, 800);
    }
  };

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

  const handleAddData = async (e) => {
    e.preventDefault();
    const rawValue = inputValue.trim();
    if (!rawValue) return;

    const check = validateInput(rawValue);
    if (!check.valid) {
      alert(check.msg);
      return;
    }

    const formattedValue = rawValue.toUpperCase();
    const isDuplicate = data.some(item => {
      const existingName = activeTab === 'locations' ? item.location_name : item.category_name;
      return existingName?.toUpperCase() === formattedValue;
    });

    if (isDuplicate) {
      alert(`⚠️ Nama ${activeTab === 'categories' ? 'Kategori' : 'Lokasi'} sudah ada!`);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = activeTab === 'categories' ? '/admin/categories' : '/admin/locations';
      // Sesuaikan payload sesuai kebutuhan backend (beberapa butuh {name}, beberapa {location_name})
      const payload = activeTab === 'categories' ? { name: formattedValue } : { name: formattedValue, lat: selectedLocation?.[0], lng: selectedLocation?.[1] };
      
      await api.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInputValue('');
      setSelectedLocation(null);
      fetchData(); 
    } catch (error) {
      alert(error.response?.status === 422 ? "Gagal: Data sudah ada atau tidak valid." : "Gagal menyimpan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIC HAPUS DENGAN CEK RELASI ---
  const handleDelete = async (id) => {
    const type = activeTab === 'categories' ? 'Kategori' : 'Lokasi';
    
    if (!window.confirm(`Hapus ${type} ini secara permanen?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      const endpoint = activeTab === 'categories' ? '/admin/categories' : '/admin/locations';
      
      await api.delete(`${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Jika berhasil
      fetchData();
      alert(`✅ ${type} berhasil dihapus.`);

    } catch (error) {
      // Mengecek jika backend mengirimkan error karena data masih digunakan (Integrity Constraint)
      if (error.response && (error.response.status === 409 || error.response.status === 422)) {
        alert(`❌ Tidak dapat menghapus ${type}!\n\nData ini masih digunakan di beberapa Event. Silakan hapus atau ubah Event yang terkait terlebih dahulu.`);
      } else {
        alert("Gagal menghapus data. Terjadi kesalahan pada server.");
      }
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans p-4 sm:p-8 md:p-12 relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 md:w-[500px] md:h-[500px] bg-[#E297C1]/5 blur-[80px] md:blur-[120px] rounded-full -z-10"></div>

      <header className="mb-8 md:mb-12 animate-in slide-in-from-left duration-700">
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

      <div className="flex flex-col sm:flex-row gap-2 mb-8 md:mb-10 bg-white/50 backdrop-blur-md p-1.5 rounded-[20px] sm:rounded-[24px] border border-white shadow-xl shadow-slate-200/50 w-full sm:w-fit animate-in fade-in duration-1000">
        <button 
          onClick={() => { setActiveTab('categories'); setInputValue(''); }}
          className={`px-6 sm:px-10 py-3.5 rounded-[16px] sm:rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${activeTab === 'categories' ? 'bg-[#E297C1] text-white shadow-lg shadow-[#E297C1]/30 scale-100 sm:scale-105' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Tag size={16} /> Categories
        </button>
        <button 
          onClick={() => { setActiveTab('locations'); setInputValue(''); }}
          className={`px-6 sm:px-10 py-3.5 rounded-[16px] sm:rounded-[18px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all duration-500 ${activeTab === 'locations' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 scale-100 sm:scale-105' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <MapPin size={16} /> Locations
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 animate-in slide-in-from-bottom duration-700">
          <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 hidden sm:block">
                <Plus size={120} />
            </div>
            
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-1.5 h-6 bg-[#E297C1] rounded-full"></div>
              <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-lg md:text-xl">Register New</h3>
            </div>

            <form onSubmit={handleAddData} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label Name</label>
                  <span className="text-[8px] font-black text-slate-300 italic">No toxic words</span>
                </div>
                <div className="relative group">
                  {activeTab === 'locations' && (
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                      {isSearching ? <Loader2 size={18} className="animate-spin text-[#E297C1]" /> : <Search size={18} className="text-slate-300 group-focus-within:text-[#E297C1] transition-colors" />}
                    </div>
                  )}
                  <input 
                    type="text" 
                    value={inputValue} 
                    onChange={handleInputChange}
                    placeholder={activeTab === 'categories' ? 'e.g. ELECTRONIC EXPO' : 'Search or type location...'}
                    className={`w-full bg-slate-50 border-2 border-slate-50 rounded-[18px] md:rounded-[22px] py-4 md:py-5 px-6 ${activeTab === 'locations' ? 'pl-14' : ''} outline-none focus:border-[#E297C1] focus:bg-white font-bold text-slate-700 transition-all shadow-inner uppercase text-sm`}
                    required
                  />
                </div>
              </div>
              
              {activeTab === 'locations' && (
                <div className="space-y-3 animate-in zoom-in duration-500">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#E297C1] uppercase tracking-widest flex items-center gap-2">
                      <MapIcon size={12}/> Map Geolocation
                    </label>
                    {selectedLocation && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded-md">Locked</span>}
                  </div>
                  <div className="w-full rounded-[24px] md:rounded-[28px] overflow-hidden border-4 border-slate-50 h-[220px] md:h-[280px] shadow-inner relative z-0">
                    <MapContainer center={[-6.2088, 106.8456]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker setInputValue={setInputValue} setSelectedLocation={setSelectedLocation} />
                      {selectedLocation && <Marker position={selectedLocation} />}
                      <RecenterMap position={selectedLocation} />
                    </MapContainer>
                  </div>
                </div>
              )}

              <button 
                disabled={isSubmitting} 
                className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-[18px] md:rounded-[22px] font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] hover:bg-[#E297C1] transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                  <>Submit Record <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/></>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7 xl:col-span-8 animate-in slide-in-from-right duration-700">
          <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
            {loading ? (
              <div className="py-32 md:py-40 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#E297C1] mb-6" size={48} strokeWidth={3} />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">Accessing Database...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="px-6 md:px-10 py-6 md:py-8 text-[9px] md:text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Entry ID</th>
                      <th className="px-6 md:px-8 py-6 md:py-8 text-[9px] md:text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Identified Label</th>
                      <th className="px-6 md:px-10 py-6 md:py-8 text-[9px] md:text-[10px] font-black text-white/50 uppercase tracking-[0.3em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.length > 0 ? data.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                        <td className="px-6 md:px-10 py-5 md:py-7 font-black text-[#E297C1] italic tracking-tighter text-base md:text-lg group-hover:scale-105 transition-transform">#{item.id}</td>
                        <td className="px-6 md:px-8 py-5 md:py-7">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 uppercase italic tracking-tight text-sm md:text-base group-hover:text-slate-900 transition-colors">
                              {activeTab === 'locations' ? item.location_name : item.category_name}
                            </span>
                            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity italic hidden sm:block">Stored in master data</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-10 py-5 md:py-7 text-right">
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="p-3 md:p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[14px] md:rounded-[18px] transition-all duration-300 group/trash"
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