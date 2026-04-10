import React, { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api/axiosConfig";
import { QRCodeCanvas } from "qrcode.react";
import { 
  Ticket, 
  Calendar, 
  Loader2, 
  User, 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  AlertCircle,
  Tag,
  Clock,
  ArrowUpRight
} from "lucide-react";

const TicketSection = () => {
  const context = useOutletContext();
  const userData = context?.userData;
  const lang = context?.lang || "id";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const t = useMemo(() => {
    const translations = {
      id: {
        loading: "Mendekripsi Akses...",
        verified: "Akses Terverifikasi",
        scanned: "Sudah Digunakan",
        ready: "Siap Digunakan",
        viewPass: "Buka Tiket",
        noTicket: "Brankas Tiket Kosong",
        secureActive: "Enkripsi Aktif",
        officialPass: "OFFICIAL CONCERT PASS",
        holder: "PEMEGANG TIKET",
        genAdm: "TIKET UMUM",
        dateTime: "JADWAL ACARA",
        passCode: "KODE UNIK",
        print: "Cetak Fisik",
        save: "Simpan Gambar",
        nonTransfer: "Proteksi Non-Transfer",
        authorized: "AKSES OTORISASI"
      },
      en: {
        loading: "Decrypting Access...",
        verified: "Verified Access",
        scanned: "Already Used",
        ready: "Ready to Use",
        viewPass: "Open Pass",
        noTicket: "Ticket Vault Empty",
        secureActive: "Encryption Active",
        officialPass: "OFFICIAL CONCERT PASS",
        holder: "VERIFIED HOLDER",
        genAdm: "General Admission",
        dateTime: "EVENT SCHEDULE",
        passCode: "UNIQUE CODE",
        print: "Print Hardcopy",
        save: "Save Image",
        nonTransfer: "Non-Transferable Protection",
        authorized: "AUTHORIZED ACCESS"
      }
    };
    return translations[lang] || translations.id;
  }, [lang]);

  const QR_BASE_URL = window.location.origin.includes('localhost') 
    ? "http://localhost:3000" 
    : window.location.origin.replace('dashboard.', 'api.');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get("/customer/tickets");
        const data = res.data.data || [];
        const sortedTickets = [...data].sort((a, b) => b.id - a.id);
        setTickets(sortedTickets);
      } catch (err) {
        console.error("Gagal mengambil data tiket:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas-modal");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    const fileName = selectedTicket?.ticket_code || "TICKET";
    downloadLink.href = pngUrl;
    downloadLink.download = `PASS-${fileName}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-purple-500" size={32} />
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6 animate-in fade-in zoom-in-95 duration-500">
      <style>
        {`
          @media print {
            body * { visibility: hidden !important; }
            .print-section, .print-section * { visibility: visible !important; }
            .print-section {
              position: fixed !important;
              left: 50% !important; top: 50% !important;
              transform: translate(-50%, -50%) scale(1.2) !important;
              width: 20cm !important;
              height: 8cm !important;
              margin: 0 !important; padding: 0 !important;
              background: white !important;
              z-index: 9999 !important;
              display: flex !important;
              border: 1px solid black !important;
              color: black !important;
              filter: grayscale(100%) brightness(1.1) !important;
              box-shadow: none !important;
            }
            .print-hide { display: none !important; }
            @page { size: landscape; margin: 0; }
          }
          .ticket-cut-left { clip-path: circle(12px at 0 50%); }
          .ticket-cut-right { clip-path: circle(12px at 100% 50%); }
          .modal-scroll::-webkit-scrollbar { width: 4px; }
          .modal-scroll::-webkit-scrollbar-track { background: transparent; }
          .modal-scroll::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.2); border-radius: 10px; }
        `}
      </style>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
            Digital <span className="text-purple-500">Vault</span>
          </h2>
          <div className="flex items-center gap-2 mt-3">
             <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[9px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
               <ShieldCheck size={12} /> {tickets.length} {t.verified}
             </span>
          </div>
        </div>
      </div>

      {/* TICKETS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:hidden">
        {tickets.length > 0 ? (
          tickets.map((t_item) => {
            const displayEventName = typeof t_item.event_name === 'object'
              ? (t_item.event_name[lang] || t_item.event_name['id'] || 'Event')
              : (t_item.event_name || 'Event');

            return (
              <div 
                key={t_item.id} 
                onClick={() => setSelectedTicket(t_item)}
                className="group relative bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:border-purple-500/30 cursor-pointer overflow-hidden"
              >
                <Ticket size={120} className="absolute -bottom-4 -right-4 opacity-[0.03] text-white group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className={`px-2.5 py-1 text-[8px] font-black rounded-lg uppercase tracking-tighter border ${
                    t_item.is_scanned 
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {t_item.is_scanned ? t.scanned : t.ready}
                  </span>
                  <p className="text-slate-500 font-mono text-[9px] bg-black/20 px-2 py-1 rounded">
                    #{String(t_item.ticket_code).substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <h4 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {displayEventName}
                </h4>
                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-6">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-purple-500" /> 
                    {t_item.event_date ? new Date(t_item.event_date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {day: 'numeric', month: 'short', year: 'numeric'}) : 'TBA'}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-purple-500" /> 
                    {t_item.start_time || "--:--"}
                  </div>
                </div>
                <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-purple-400 uppercase italic bg-purple-500/10 px-2 py-0.5 rounded">
                      {t_item.ticket_category || t.genAdm}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase group-hover:translate-x-1 transition-transform">
                    {t.viewPass} <ArrowUpRight size={14} className="text-purple-500" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
            <AlertCircle size={40} className="text-slate-600 mb-4" />
            <p className="text-slate-500 font-black uppercase text-xs tracking-widest italic">{t.noTicket}</p>
          </div>
        )}
      </div>

      {/* TICKET DETAIL MODAL (MODERN LANDSCAPE) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden print:static print:block print:p-0">
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl print:hidden" onClick={() => setSelectedTicket(null)}></div>
          
          <div className="relative w-full max-w-[850px] max-h-[95vh] overflow-y-auto modal-scroll animate-in zoom-in-95 duration-300 print:max-w-none print:w-full print:overflow-visible">
            
            {/* Modal Controls */}
            <div className="flex justify-between items-center mb-4 px-2 print:hidden">
              <div className="flex items-center gap-2 text-white/50 text-[9px] font-bold uppercase bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5">
                <ShieldCheck size={14} className="text-emerald-500" /> {t.secureActive}
              </div>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="w-9 h-9 bg-white/10 hover:bg-purple-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95"><Printer size={18} /></button>
                <button onClick={() => setSelectedTicket(null)} className="w-9 h-9 bg-white/10 hover:bg-rose-500 text-white rounded-full flex items-center justify-center transition-all hover:rotate-90 active:scale-95"><X size={20} /></button>
              </div>
            </div>

            {/* Ticket Card Content */}
            <div className="print-section flex flex-col md:flex-row bg-white rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] print:shadow-none print:rounded-none relative">
              
              {/* Left Side: QR Section (Stub) */}
              <div className="w-full md:w-[260px] p-8 bg-slate-950 flex flex-col items-center justify-center border-r-2 border-dashed border-white/20 relative print:bg-white print:border-black">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-[-11px] w-[22px] h-[22px] bg-slate-950 rounded-full print:hidden"></div>
                <div className="absolute bottom-0 right-[-11px] w-[22px] h-[22px] bg-slate-950 rounded-full print:hidden"></div>
                
                <div className="p-2 bg-white rounded-xl shadow-lg mb-4 print:border print:border-black">
                  <QRCodeCanvas 
                    id="qr-code-canvas-modal"
                    value={`${QR_BASE_URL}/admin/verify/${selectedTicket.ticket_code}`} 
                    size={150}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-mono font-black text-white uppercase tracking-[0.2em] print:text-black">
                    {String(selectedTicket.ticket_code)}
                  </p>
                  <p className="text-[7px] font-bold text-slate-500 uppercase mt-1 print:text-black">Scan at Entrance</p>
                </div>
              </div>

              {/* Right Side: Event Details (Main Pass) */}
              <div className="flex-1 p-8 flex flex-col justify-between relative bg-white">
                
                {/* Top Section */}
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-purple-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest print:border print:border-black print:text-black print:bg-white">
                    {t.officialPass}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none">{selectedTicket.ticket_category || t.genAdm}</p>
                    <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Access Type</p>
                  </div>
                </div>

                {/* Event Name */}
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.9] mb-8 border-l-4 border-purple-600 pl-4 print:border-black">
                  {typeof selectedTicket.event_name === 'object'
                    ? (selectedTicket.event_name[lang] || selectedTicket.event_name['id'])
                    : selectedTicket.event_name}
                </h3>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-4">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.holder}</p>
                    <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-sm">
                      <User size={14} className="text-purple-600 print:text-black" />
                      {String(userData?.name || "Verified Guest")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{t.dateTime}</p>
                    <div className="flex items-center gap-2 text-slate-900 font-black uppercase text-sm">
                      <Calendar size={14} className="text-purple-600 print:text-black" />
                      {selectedTicket.event_date ? new Date(selectedTicket.event_date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px] mt-0.5">
                       <Clock size={10} /> {selectedTicket.start_time || "--:--"}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Section */}
                <div className="flex justify-between items-end pt-4 border-t border-slate-100 print:border-black mt-2">
                  <div className="flex gap-4 print:hidden">
                    <button onClick={downloadQRCode} className="text-[9px] font-black uppercase flex items-center gap-1.5 text-slate-400 hover:text-purple-600 transition-colors">
                      <Download size={14} /> {t.save}
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black text-purple-600 uppercase italic tracking-widest print:text-black">{t.authorized}</p>
                    <p className="text-[7px] font-bold text-slate-300 uppercase tracking-tighter">{t.nonTransfer}</p>
                  </div>
                </div>
              </div>

              {/* Hologram-like Side Bar (Screen Only) */}
              <div className="hidden md:block w-4 bg-gradient-to-b from-purple-600 via-indigo-600 to-purple-600 print:hidden"></div>
            </div>

            {/* Instruction Text */}
            <p className="mt-6 text-center text-white/40 text-[9px] font-bold uppercase tracking-[0.3em] animate-pulse print:hidden">
              PLEASE PRESENT THIS TICKET AT THE GATE FOR ADMISSION
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketSection;