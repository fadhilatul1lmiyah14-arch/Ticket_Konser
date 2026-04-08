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
  Zap,
  AlertCircle,
  Tag,
  Clock
} from "lucide-react";

const TicketSection = () => {
  const context = useOutletContext();
  const userData = context?.userData;
  const lang = context?.lang || "id";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Objek Terjemahan
  const t = useMemo(() => {
    const translations = {
      id: {
        loading: "Mendekripsi Akses Aman...",
        verified: "Token Akses Terverifikasi Ditemukan",
        scanned: "Sudah Dipindai",
        ready: "Siap Digunakan",
        viewPass: "Lihat Tiket",
        noTicket: "Tidak Ada Tiket Digital Tersedia",
        secureActive: "Keamanan Aktif",
        officialPass: "Tiket Masuk Resmi",
        holder: "Pemilik Terverifikasi",
        genAdm: "Tiket Umum",
        dateTime: "Tanggal & Waktu",
        passCode: "Kode Tiket",
        print: "Cetak Tiket",
        save: "Simpan ke Galeri",
        nonTransfer: "Tidak Dapat Dipindah Tangankan",
        authorized: "Akses Resmi"
      },
      en: {
        loading: "Decrypting Secure Passes...",
        verified: "Verified Access Tokens Found",
        scanned: "Already Scanned",
        ready: "Ready to Use",
        viewPass: "View Pass",
        noTicket: "No Digital Passes Available",
        secureActive: "Secure Active",
        officialPass: "Official Admission Pass",
        holder: "Verified Holder",
        genAdm: "General Admission",
        dateTime: "Date & Time",
        passCode: "Pass Code",
        print: "Print Ticket",
        save: "Save to Gallery",
        nonTransfer: "Non-Transferable",
        authorized: "Authorized Access"
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
      <div className="flex flex-col items-center justify-center py-32 md:py-40">
        <Loader2 className="animate-spin text-purple-600 mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic text-center px-4">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-700">
      <style>
        {`
          @media print {
            body * { visibility: hidden !important; }
            .print-section, .print-section * { visibility: visible !important; }
            .print-section {
              position: fixed !important;
              left: 0 !important; top: 0 !important;
              width: 100% !important; height: 100% !important;
              margin: 0 !important; padding: 2cm !important;
              background: white !important;
              z-index: 9999 !important;
              display: block !important;
            }
            .print-hidden { display: none !important; }
            @page { size: portrait; margin: 0; }
          }
        `}
      </style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 print:hidden">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Digital <span className="text-purple-600">Vault</span>
          </h2>
          <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> 
            {tickets.length} {t.verified}
          </p>
        </div>
      </div>

      {/* GRID TIKET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 print:hidden">
        {tickets.length > 0 ? (
          tickets.map((t_item) => {
            // PERBAIKAN: Deteksi nama event berdasarkan bahasa
            const displayEventName = typeof t_item.event_name === 'object'
              ? (t_item.event_name[lang] || t_item.event_name['id'] || 'Event')
              : (t_item.event_name || 'Event');

            return (
              <div 
                key={t_item.id} 
                onClick={() => setSelectedTicket(t_item)}
                className="group cursor-pointer relative bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/15 overflow-hidden"
              >
                <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:rotate-12">
                  <Ticket size={140} className="text-slate-900 md:w-[180px] md:h-[180px]" />
                </div>

                <div className="flex justify-between items-start mb-6 md:mb-10 relative z-10">
                  <div className={`px-3 py-1 md:px-4 md:py-1.5 text-[8px] md:text-[9px] font-black rounded-full uppercase tracking-widest border ${
                    t_item.is_scanned 
                    ? "bg-rose-50 text-rose-600 border-rose-100" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}>
                    {t_item.is_scanned ? t.scanned : t.ready}
                  </div>
                  <div className="text-right">
                      <p className="text-slate-400 font-mono text-[9px] md:text-[10px]">#{String(t_item.ticket_code).substring(0, 8)}</p>
                      <p className="text-purple-600 font-black text-[8px] md:text-[9px] uppercase tracking-tighter italic">
                          {t_item.ticket_category || t.genAdm}
                      </p>
                  </div>
                </div>

                <h4 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-6 md:mb-8 leading-[0.9] group-hover:text-purple-600 transition-colors relative z-10 line-clamp-2">
                  {displayEventName}
                </h4>

                <div className="flex flex-wrap items-center gap-4 md:gap-5 text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest relative z-10">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-purple-500 shrink-0" /> 
                    {t_item.event_date ? new Date(t_item.event_date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {day: 'numeric', month: 'long', year: 'numeric'}) : 'TBA'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-purple-500 shrink-0" /> 
                    {t_item.start_time || "--:--"}
                  </div>
                </div>

                <div className="mt-8 md:mt-10 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-purple-600 transition-colors">
                      <Zap size={16} fill="currentColor" />
                    </div>
                    <span className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase">{t.viewPass}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 md:py-32 text-center bg-slate-50 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed border-slate-200 px-6">
            <AlertCircle size={48} className="mx-auto text-slate-200 mb-6" />
            <p className="text-slate-400 font-black uppercase text-sm md:text-base italic tracking-[0.2em]">{t.noTicket}</p>
          </div>
        )}
      </div>

      {/* MODAL DETAIL TIKET */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto print:static print:block print:p-0">
          <div 
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity print:hidden" 
            onClick={() => setSelectedTicket(null)}
          ></div>
          
          <div className="relative w-full max-w-[420px] my-auto animate-in zoom-in duration-300 print:max-w-none print:w-full print:m-0">
            
            <div className="absolute -top-14 left-0 right-0 flex justify-between items-center px-2 print:hidden">
              <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={16} className="text-emerald-400" /> {t.secureActive}
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="w-10 h-10 bg-white hover:bg-red-500 hover:text-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl transition-all group active:scale-90"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="print-section bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl print:shadow-none print:rounded-none">
              <div className="bg-slate-50 py-4 text-center border-b border-slate-100 print:bg-white print:border-b-2 print:border-black">
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] print:text-black">{t.officialPass}</p>
              </div>

              <div className="p-6 md:p-10 text-center">
                <div className="inline-block p-4 bg-white border-[6px] border-slate-900 rounded-[2.5rem] mb-6 shadow-xl print:border-4 print:rounded-2xl">
                  <QRCodeCanvas 
                    id="qr-code-canvas-modal"
                    value={`${QR_BASE_URL}/admin/verify/${selectedTicket.ticket_code}`} 
                    size={220}
                    level={"H"}
                    includeMargin={true}
                  />
                </div>

                <div className="space-y-2 mb-8">
                  {/* PERBAIKAN: Deteksi nama event di dalam modal */}
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight print:text-4xl">
                    {typeof selectedTicket.event_name === 'object'
                      ? (selectedTicket.event_name[lang] || selectedTicket.event_name['id'])
                      : selectedTicket.event_name}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-purple-600 font-black text-[10px] uppercase tracking-widest print:text-black">
                      <User size={14} />
                      <span className="truncate max-w-[150px]">{String(userData?.name || t.holder)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-900 font-black text-[10px] uppercase tracking-widest border-l pl-4 border-slate-200 print:border-black print:text-black">
                      <Tag size={14} />
                      <span>{String(selectedTicket.ticket_category || t.genAdm)}</span>
                    </div>
                  </div>
                </div>

                <div className="relative h-px w-full border-t-2 border-dashed border-slate-200 mb-8 print:border-black">
                  <div className="absolute -left-[45px] md:-left-[60px] -top-5 w-10 h-10 bg-slate-950 rounded-full print:hidden"></div>
                  <div className="absolute -right-[45px] md:-right-[60px] -top-5 w-10 h-10 bg-slate-950 rounded-full print:hidden"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-left mb-8">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter print:text-black">{t.dateTime}</p>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-purple-500 shrink-0 print:text-black" />
                      <p className="text-xs font-black text-slate-900 uppercase print:text-sm">
                        {selectedTicket.event_date ? new Date(selectedTicket.event_date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 ml-5 print:text-black">Starts: {selectedTicket.start_time || "--:--"}</p>
                  </div>
                  <div className="space-y-1 border-l border-slate-100 pl-4 print:border-black">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter print:text-black">{t.passCode}</p>
                    <p className="text-xs font-mono font-black text-slate-900 uppercase break-all print:text-sm">
                        {String(selectedTicket.ticket_code)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 print:hidden">
                  <button 
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg"
                  >
                    <Printer size={18} /> {t.print}
                  </button>
                  <button 
                    onClick={downloadQRCode}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white border-2 border-slate-100 text-slate-900 text-[11px] font-black uppercase rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <Download size={18} /> {t.save}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 py-4 px-8 flex justify-between items-center print:bg-black print:text-white">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest print:text-white">{t.authorized}</p>
                </div>
                <p className="text-[7px] font-bold text-white/40 uppercase tracking-widest italic print:text-white">{t.nonTransfer}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketSection;