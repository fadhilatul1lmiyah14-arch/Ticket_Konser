import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; // Gunakan config terpusat
import { 
  Trash2, 
  Ticket, 
  Search, 
  Loader2, 
  CheckCircle,
  XCircle,
  QrCode,
  ArrowUpDown,
  ExternalLink
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const ManageTicket = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Ambil Data Tiket yang sudah terjual dari Backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Kita panggil endpoint yang mengembalikan semua tiket yang ada di sistem
        const response = await api.get('/admin/tickets'); 
        // Sesuaikan jika backend kamu membungkus dalam response.data.data
        setTickets(response.data.data || response.data || []);
      } catch (error) {
        console.error("Gagal mengambil data tiket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // 2. Fungsi Hapus Tiket (Jika diperlukan pembatalan manual oleh admin)
  const handleDelete = async (id) => {
    if(window.confirm("Peringatan: Menghapus tiket akan membatalkan akses masuk customer. Lanjutkan?")) {
      try {
        await api.delete(`/admin/tickets/${id}`);
        setTickets(tickets.filter(t => t.id !== id));
        alert("Tiket berhasil dihapus.");
      } catch (error) {
        alert("Gagal menghapus tiket.");
      }
    }
  };

  // Filter pencarian berdasarkan Nama Konser, Nama User, atau Kode Tiket
  const filteredTickets = tickets.filter(t => 
    t.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ticketCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-[#E297C1] mx-auto mb-4" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Loading Sold Tickets...</p>
      </div>
    </div>
  );

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      <Sidebar />
      
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-xs font-black text-[#E297C1] uppercase tracking-[0.4em] mb-1">Ticket Inventory</h2>
            <h1 className="text-4xl font-black text-slate-800 uppercase italic leading-none">Sold Tickets</h1>
          </div>
          
          <button 
            onClick={() => navigate('/admin/scanner')} // Arahkan ke gate scanner
            className="bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-[#E297C1] transition-all shadow-2xl active:scale-95"
          >
            <QrCode size={20} /> Open Gate Scanner
          </button>
        </header>

        {/* TOOLBAR: SEARCH */}
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-5 top-4 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Code, Concert, or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[22px] py-4 px-14 outline-none focus:border-[#E297C1] font-bold shadow-sm transition-all"
          />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Code</th>
                <th className="px-8 py-6 flex items-center gap-2">Event <ArrowUpDown size={12}/></th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5 font-black text-[#E297C1] text-xs font-mono">
                    {ticket.ticketCode}
                  </td>
                  <td className="px-8 py-5 font-black text-slate-700 uppercase italic tracking-tight">
                    {ticket.eventName}
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-500">
                    {ticket.userName}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      {ticket.isScanned ? (
                        <span className="px-4 py-1.5 bg-rose-50 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-rose-100">
                          <XCircle size={12}/> Used / Scanned
                        </span>
                      ) : (
                        <span className="px-4 py-1.5 bg-emerald-50 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                          <CheckCircle size={12}/> Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-3">
                      <a 
                        href={`http://localhost:3000/api/tickets/view/${ticket.ticketCode}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        title="Preview E-Ticket"
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button 
                        onClick={() => handleDelete(ticket.id)}
                        className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        title="Revoke Ticket"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                     <div className="flex flex-col items-center opacity-20">
                        <Ticket size={64} className="mb-4" />
                        <p className="font-black uppercase italic tracking-[0.3em]">No tickets issued yet</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER INFO */}
        <footer className="mt-10 flex flex-col md:flex-row justify-between items-center px-4 gap-4 text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">
          <p>Raly System • Total Sold: {filteredTickets.length}</p>
          <p className="italic">Gate Management Mode</p>
        </footer>
      </main>
    </div>
  );
};

export default ManageTicket;