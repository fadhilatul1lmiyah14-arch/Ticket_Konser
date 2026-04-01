import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Ticket, CheckCircle2, Download, Home, ShieldCheck, Loader2, AlertCircle, Printer } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { QRCodeCanvas } from 'qrcode.react'; 

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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://192.168.0.242:3000/tickets/my-tickets/${orderIdFromUrl}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && (Array.isArray(result) ? result.length > 0 : result)) {
        const data = Array.isArray(result) ? result[0] : result;
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
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR-Ticket-${ticketData?.ticket_code || 'code'}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-purple-500 mb-6" size={64} />
          <h2 className="text-white font-black uppercase italic tracking-widest animate-pulse">
            Verifying Payment...
          </h2>
        </div>
      </MainLayout>
    );
  }

  if (error || !orderIdFromUrl) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-6 text-center">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h2 className="text-3xl font-black text-white uppercase italic mb-4">Ticket Not Found</h2>
          <button onClick={() => navigate('/events')} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
            Back to Events
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#0f172a] min-h-screen py-16 px-6">
        <main className="max-w-3xl mx-auto">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-5 bg-green-500/20 rounded-[30px] border border-green-500/30 mb-6">
              <CheckCircle2 size={56} className="text-green-500" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
              Payment <span className="text-green-400">Success!</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">
              Order ID: {orderIdFromUrl}
            </p>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-700">
            <div className="absolute top-1/2 -left-5 w-10 h-10 bg-[#0f172a] rounded-full z-20 -translate-y-1/2 border-r border-slate-800"></div>
            <div className="absolute top-1/2 -right-5 w-10 h-10 bg-[#0f172a] rounded-full z-20 -translate-y-1/2 border-l border-slate-800"></div>
            
            <div className="bg-[#1e293b] rounded-[50px] shadow-2xl overflow-hidden border border-slate-800">
              <div className="p-10 md:p-14 border-b-2 border-dashed border-slate-800/50">
                <div className="flex justify-between items-start mb-12">
                  <div className="text-left">
                    <span className="bg-purple-600/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-purple-500/30">
                      Official E-Pass
                    </span>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mt-5">
                      {ticketData?.event_name || "Exclusive Concert"}
                    </h3>
                  </div>
                  <ShieldCheck className="text-green-500" size={40} />
                </div>

                <div className="grid grid-cols-2 gap-8 text-left">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Ticket Holder</p>
                    <p className="font-black text-white text-lg italic truncate pr-4">{ticketData?.customer_name || "Verified User"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Ticket Code</p>
                    <p className="font-black text-purple-400 text-lg italic tracking-tight">{ticketData?.ticket_code}</p>
                  </div>
                </div>
              </div>

              <div className="p-12 bg-[#161e2b] flex flex-col items-center">
                <div className="bg-white p-6 rounded-[40px] mb-8 ring-[12px] ring-slate-900/50">
                  <QRCodeCanvas 
                    id="qr-code-canvas"
                    value={ticketData?.ticket_code || "VOID"} 
                    size={180}
                    level={"H"}
                  />
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 no-print">
                  <button onClick={downloadQRCode} className="flex items-center gap-3 text-xs font-black uppercase text-white bg-purple-600 px-10 py-5 rounded-[22px] hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/20">
                    <Download size={20} /> Download QR
                  </button>
                  <button onClick={() => window.print()} className="flex items-center gap-3 text-xs font-black uppercase text-slate-300 bg-slate-800 border border-slate-700 px-10 py-5 rounded-[22px] hover:bg-slate-700 transition-all">
                    <Printer size={20} /> Print Full
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center no-print">
            <button onClick={() => navigate('/')} className="flex items-center gap-4 bg-white text-black px-12 py-6 rounded-[25px] font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all duration-500 shadow-2xl">
              <Home size={22} /> Back to Home
            </button>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print, nav, footer, button { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-[#1e293b] { background: white !important; border: 2px solid #eee !important; }
          .text-white { color: black !important; }
        }
      `}} />
    </MainLayout>
  );
};

export default Success;