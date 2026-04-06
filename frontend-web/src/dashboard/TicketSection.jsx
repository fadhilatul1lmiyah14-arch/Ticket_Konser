import React, { useEffect, useState } from "react";
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
  const { userData } = useOutletContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const QR_BASE_URL = window.location.origin.includes('localhost') 
    ? "http://localhost:3000" 
    : window.location.origin.replace('dashboard.', 'api.');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get("/customer/tickets");
        setTickets(res.data.data || []);
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
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic text-center px-4">Decrypting Secure Passes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 animate-in fade-in duration-700">
      
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            .print-section, .print-section * {
              visibility: visible !important;
            }
            .print-section {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              z-index: 9999 !important;
              display: flex !important;
              flex-direction: column !important;
            }
            @page {
              size: portrait;
              margin: 0;
            }
          }
        `}
      </style>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 print:hidden">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Digital <span className="text-purple-600">Vault</span>
          </h2>
          <p className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> 
            {tickets.length} Verified Access Tokens Found
          </p>
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 print:hidden">
        {tickets.length > 0 ? (
          tickets.map((t) => (
            <div 
              key={t.id} 
              onClick={() => setSelectedTicket(t)}
              className="group cursor-pointer relative bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/15 overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-700 group-hover:rotate-12">
                <Ticket size={140} className="text-slate-900 md:w-[180px] md:h-[180px]" />
              </div>

              <div className="flex justify-between items-start mb-6 md:mb-10 relative z-10">
                <div className={`px-3 py-1 md:px-4 md:py-1.5 text-[8px] md:text-[9px] font-black rounded-full uppercase tracking-widest border ${
                  t.is_scanned 
                  ? "bg-rose-50 text-rose-600 border-rose-100" 
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}>
                  {t.is_scanned ? "Already Scanned" : "Ready to Use"}
                </div>
                <div className="text-right">
                    <p className="text-slate-400 font-mono text-[9px] md:text-[10px]">#{t.ticket_code?.substring(0, 8)}</p>
                    <p className="text-purple-600 font-black text-[8px] md:text-[9px] uppercase tracking-tighter italic">
                        {t.ticket_category || 'General Admission'}
                    </p>
                </div>
              </div>

              <h4 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-6 md:mb-8 leading-[0.9] group-hover:text-purple-600 transition-colors relative z-10 line-clamp-2">
                {t.event_name}
              </h4>

              <div className="flex flex-wrap items-center gap-4 md:gap-5 text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest relative z-10">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-purple-500 shrink-0" /> 
                  {t.event_date ? new Date(t.event_date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : 'TBA'}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-purple-500 shrink-0" /> 
                  {t.start_time || "--:--"}
                </div>
              </div>

              <div className="mt-8 md:mt-10 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-purple-600 transition-colors">
                    <Zap size={16} md:size={18} fill="currentColor" />
                  </div>
                  <span className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase">View Pass</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 md:py-32 text-center bg-slate-50 rounded-[2.5rem] md:rounded-[4rem] border-2 border-dashed border-slate-200 px-6">
            <AlertCircle size={48} className="mx-auto text-slate-200 mb-6" />
            <p className="text-slate-400 font-black uppercase text-sm md:text-base italic tracking-[0.2em]">No Digital Passes Available</p>
          </div>
        )}
      </div>

      {/* MODAL TICKET */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto print:block print:p-0 print:static print:bg-white">
          <div 
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md transition-opacity print:hidden" 
            onClick={() => setSelectedTicket(null)}
          ></div>
          
          <div className="relative w-full max-w-[420px] my-auto animate-in zoom-in slide-in-from-bottom-10 duration-400 print:max-w-none print:w-full print:m-0 print:animate-none">
            
            <div className="absolute -top-14 left-0 right-0 flex justify-between items-center px-2 print:hidden">
              <div className="flex items-center gap-2 text-white/50 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={16} className="text-emerald-400" /> Secure Active
              </div>
              <button 
                onClick={() => setSelectedTicket(null)} 
                className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-red-500 hover:text-white text-slate-900 rounded-full flex items-center justify-center shadow-2xl transition-all group active:scale-90"
              >
                <X size={20} md:size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="print-section bg-white rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl print:shadow-none print:rounded-none print:w-full print:h-screen print:flex print:flex-col">
              
              <div className="bg-slate-50 py-4 md:py-5 text-center border-b border-slate-100 print:bg-white print:border-b-2 print:border-black">
                <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.5em] print:text-black">Official Admission Pass</p>
              </div>

              <div className="p-6 md:p-10 text-center print:p-6 print:flex-1">
                <div className="inline-block p-4 md:p-5 bg-white border-[4px] md:border-[6px] border-slate-900 rounded-[2rem] md:rounded-[3rem] mb-6 md:mb-8 shadow-2xl shadow-slate-200 print:border-4 print:rounded-2xl print:mb-4 print:shadow-none">
                  <div className="p-2">
                    <QRCodeCanvas 
                      id="qr-code-canvas-modal"
                      value={`${QR_BASE_URL}/admin/verify/${selectedTicket.ticket_code}`} 
                      size={window.innerWidth < 768 ? 160 : 210}
                      level={"H"}
                      includeMargin={false}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-8 md:mb-10 print:mb-6">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight print:text-5xl">
                    {selectedTicket.event_name}
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-purple-600 font-black text-[9px] md:text-[11px] uppercase tracking-widest print:text-black print:text-sm">
                            <User size={12} md:size={14} />
                            <span className="truncate max-w-[120px] md:max-w-none">{userData?.name || "Verified Holder"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-900 font-black text-[9px] md:text-[11px] uppercase tracking-widest border-l pl-3 md:pl-4 border-slate-200 print:border-black print:text-black print:text-sm">
                            <Tag size={12} md:size={14} />
                            <span>{selectedTicket.ticket_category || 'General Admission'}</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-px w-full border-t-2 border-dashed border-slate-200 mb-8 md:mb-10 print:border-black print:mb-8 print:mt-8">
                  <div className="absolute -left-[42px] md:-left-[56px] -top-4 md:-top-5 w-8 h-8 md:w-10 md:h-10 bg-slate-950 rounded-full shadow-inner print:hidden"></div>
                  <div className="absolute -right-[42px] md:-right-[56px] -top-4 md:-top-5 w-8 h-8 md:w-10 md:h-10 bg-slate-950 rounded-full shadow-inner print:hidden"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 text-left mb-8 md:mb-10 print:mb-8">
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tighter print:text-[12px] print:text-black">Admission Date</p>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-purple-500 print:text-black shrink-0" />
                            <p className="text-xs md:text-sm font-black text-slate-900 uppercase print:text-lg">
                                {selectedTicket.event_date ? new Date(selectedTicket.event_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-purple-500 print:text-black shrink-0" />
                            <p className="text-[10px] md:text-xs font-bold text-slate-600 uppercase print:text-black print:text-sm">
                                Doors: {selectedTicket.start_time || "--:--"}
                            </p>
                        </div>
                    </div>
                  </div>
                  <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 print:border-black">
                    <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tighter print:text-[12px] print:text-black">Pass ID</p>
                    <p className="text-xs md:text-sm font-mono font-black text-slate-900 uppercase break-all print:text-lg">
                        {selectedTicket.ticket_code}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 print:hidden">
                  <button 
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-3 py-4 md:py-5 bg-slate-900 text-white text-[10px] md:text-[11px] font-black uppercase rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                  >
                    <Printer size={18} /> Print Ticket
                  </button>
                  <button 
                    onClick={downloadQRCode}
                    className="w-full flex items-center justify-center gap-3 py-4 md:py-5 bg-white border-2 border-slate-100 text-slate-900 text-[10px] md:text-[11px] font-black uppercase rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                  >
                    <Download size={18} /> Save to Gallery
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 py-4 md:py-5 px-6 md:px-10 flex justify-between items-center print:bg-black print:text-white print:mt-auto">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full print:bg-white"></div>
                    <p className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.4em] print:text-white">Authorized Access</p>
                </div>
                <p className="text-[7px] md:text-[8px] font-bold text-white/40 uppercase tracking-widest italic print:text-white">Non-Transferable</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketSection;