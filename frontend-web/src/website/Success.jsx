import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, Home, ShieldCheck, Loader2, AlertCircle, Printer, Calendar, MapPin, User } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { QRCodeCanvas } from 'qrcode.react'; 
import api from '../api/axiosConfig'; 

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState(null);
  const [error, setError] = useState(false);

  const orderIdFromUrl = searchParams.get('external_id') || searchParams.get('order_id');

  const fetchTicketDetails = useCallback(async (retryCount = 0) => {
    if (!orderIdFromUrl) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/customer/my-tickets/${orderIdFromUrl}`);
      const result = response.data;
      const finalData = result.data || result;

      if (finalData && (Array.isArray(finalData) ? finalData.length > 0 : finalData)) {
        const data = Array.isArray(finalData) ? finalData[0] : finalData;
        setTicketData(data);
        setLoading(false);
        setError(false);
      } else {
        if (retryCount < 6) {
          setTimeout(() => fetchTicketDetails(retryCount + 1), 3000);
        } else {
          setLoading(false);
          setError(true);
        }
      }
    } catch (err) {
      if (retryCount < 6) {
        setTimeout(() => fetchTicketDetails(retryCount + 1), 3000);
      } else {
        setLoading(false);
        setError(true);
      }
    }
  }, [orderIdFromUrl]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `TICKET-QR-${ticketData?.ticket_code}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "TBA";
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 md:w-24 md:h-24 bg-purple-600/20 rounded-full animate-ping"></div>
            <Loader2 className="animate-spin text-purple-500 relative z-10" size={48} md:size={64} />
          </div>
          <h2 className="text-white font-black uppercase italic tracking-[0.2em] md:tracking-[0.3em] mt-8 animate-pulse text-xs md:text-sm text-center">
            Validating Payment...
          </h2>
          <p className="text-slate-500 text-[8px] md:text-[9px] uppercase mt-2 font-bold tracking-widest italic text-center">Please do not refresh this page</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !orderIdFromUrl) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-6 text-center">
          <div className="bg-red-500/10 p-5 md:p-6 rounded-full border border-red-500/20 mb-6 md:mb-8">
            <AlertCircle size={48} md:size={64} className="text-red-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic mb-4">Verification Pending</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-sm">Payment detected but ticket is not yet ready. Please check your "My Tickets" dashboard in a few moments.</p>
          <button onClick={() => navigate('/my-tickets')} className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
            Go to My Tickets
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#020617] min-h-screen py-8 md:py-12 px-4 font-sans print:bg-white print:p-0">
        <main className="max-w-2xl mx-auto print:max-w-full">
          
          <div className="text-center mb-10 md:mb-12 print:hidden animate-in fade-in slide-in-from-top-6 duration-700 px-2">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
              <CheckCircle2 size={32} md:size={40} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-3 break-words">
              PAYMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">SECURED</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px] truncate">ORDER ID: {orderIdFromUrl}</p>
          </div>

          <div className="ticket-container relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="relative bg-[#1e293b] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-slate-700 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] print:bg-white print:border-4 print:border-black print:rounded-none print:shadow-none">
              
              <div className="relative p-6 md:p-10 pb-6 bg-gradient-to-b from-slate-800/50 to-transparent print:bg-none print:text-black">
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div className="px-3 py-1 md:px-4 md:py-1.5 bg-purple-600 rounded-full text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest print:bg-black">
                    Official Admission
                  </div>
                  <div className="text-right max-w-[40%]">
                    <p className="text-slate-500 text-[8px] font-bold uppercase tracking-tighter print:text-black">Hash</p>
                    <p className="text-white font-mono text-[10px] md:text-xs truncate print:text-black">{orderIdFromUrl?.substring(0, 16)}</p>
                  </div>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-[0.95] mb-6 md:mb-8 print:text-black break-words">
                  {ticketData?.event_name || "EXCLUSIVE EVENT"}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-y border-slate-700/50 py-6 print:border-black">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 print:text-black">
                      <Calendar size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Date & Time</span>
                    </div>
                    <p className="text-white font-black text-sm uppercase print:text-black">
                        {formatDate(ticketData?.event_date)}
                    </p>
                    <p className="text-purple-400 font-bold text-xs print:text-black italic">
                      Gate Opens {formatTime(ticketData?.start_time)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-500 print:text-black">
                      <MapPin size={12} />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Venue</span>
                    </div>
                    <p className="text-white font-black text-sm uppercase print:text-black truncate">
                        {ticketData?.location || "Main Arena"}
                    </p>
                    <p className="text-slate-400 font-bold text-xs print:text-black">
                        {ticketData?.ticket_type || "General Admission"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-10 flex items-center justify-between px-[-10px] print:h-8">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#020617] -ml-3 md:-ml-4 border border-slate-700 print:bg-white print:border-black"></div>
                <div className="flex-1 border-t-2 md:border-t-4 border-dashed border-slate-700 mx-2 print:border-black"></div>
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#020617] -mr-3 md:-mr-4 border border-slate-700 print:bg-white print:border-black"></div>
              </div>

              <div className="p-6 md:p-10 pt-2 bg-[#161e2e] print:bg-white print:text-black">
                <div className="flex flex-col items-center">
                  <div className="w-full flex justify-between mb-6 md:mb-8 opacity-20 print:hidden">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-slate-500 rounded-full"></div>
                    ))}
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-4 bg-purple-500/10 rounded-[2rem] blur-xl print:hidden"></div>
                    <div className="relative bg-white p-3 md:p-5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl print:ring-2 print:ring-black print:p-2 print:rounded-lg">
                      <QRCodeCanvas 
                        id="qr-code-canvas"
                        value={ticketData?.ticket_code || "VOID"} 
                        size={window.innerWidth < 640 ? 140 : 180}
                        level={"H"}
                        includeMargin={false}
                      />
                    </div>
                  </div>

                  <div className="mt-6 md:mt-8 text-center space-y-2">
                    <p className="text-white font-mono text-2xl md:text-3xl font-black tracking-[0.2em] md:tracking-[0.3em] print:text-black">
                      {ticketData?.ticket_code}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-slate-800 rounded-full print:bg-transparent print:border print:border-black">
                      <User size={12} className="text-purple-400 print:text-black" />
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest print:text-black">
                        {ticketData?.customer_name || "GUEST HOLDER"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-1 h-6 md:h-8 opacity-30 print:opacity-100">
                    {[2, 4, 1, 3, 2, 6, 2, 1, 4, 2, 1, 3, 5, 2].map((w, i) => (
                      <div key={i} className="bg-slate-500 print:bg-black" style={{ width: `${w}px` }}></div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-10 md:mt-12 print:hidden">
                  <button onClick={downloadQRCode} className="w-full flex-1 flex items-center justify-center gap-3 text-[10px] md:text-[11px] font-black uppercase text-white bg-slate-800 border border-slate-700 py-4 rounded-2xl hover:bg-slate-700 transition-all active:scale-95">
                    <Download size={18} /> Save Image
                  </button>
                  <button onClick={() => window.print()} className="w-full flex-1 flex items-center justify-center gap-3 text-[10px] md:text-[11px] font-black uppercase text-white bg-gradient-to-r from-purple-600 to-indigo-600 py-4 rounded-2xl shadow-lg hover:scale-[1.02] transition-all active:scale-95">
                    <Printer size={18} /> Print Pass
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 py-3 px-6 md:px-8 border-t border-slate-800/50 flex justify-between items-center print:bg-black print:text-white">
                <p className="text-[6px] md:text-[7px] font-bold text-slate-500 uppercase tracking-[0.2em] md:tracking-[0.3em] print:text-white">VALID FOR 1 PERSON • SECURED BY TICKETO</p>
                <ShieldCheck size={14} className="text-emerald-500 print:text-white" />
              </div>
            </div>
          </div>

          <div className="mt-10 md:mt-12 text-center print:hidden px-4">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[9px] md:text-[10px] transition-all group">
              <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" /> 
              Back to Explore
            </button>
          </div>
        </main>
      </div>

      <style>{`
        @media print {
          header, nav, footer, .print\\:hidden { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          @page { margin: 0; size: portrait; }
          body { background: white !important; padding: 1.5cm; }
          .ticket-container { width: 100% !important; max-width: 16cm !important; margin: 0 auto !important; }
        }
      `}</style>
    </MainLayout>
  );
};

export default Success;