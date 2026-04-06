import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig'; 
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  Zap, 
  User, 
  Ticket as TicketIcon 
} from 'lucide-react';

const TicketScanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      #reader { border: none !important; width: 100% !important; background: transparent !important; }
      #reader__dashboard_section_csr button { 
        background-color: #E297C1 !important; color: white !important; 
        border: none !important; padding: 12px 24px !important; 
        border-radius: 14px !important; font-weight: 800 !important;
        text-transform: uppercase; font-size: 11px; cursor: pointer;
        transition: all 0.2s ease;
        width: auto !important;
        margin: 10px auto !important;
        display: block !important;
      }
      #reader__dashboard_section_csr button:hover {
        background-color: #d486b2 !important;
        transform: translateY(-1px);
      }
      video { border-radius: 24px !important; object-fit: cover !important; width: 100% !important; height: auto !important; }
      #reader img { display: none !important; }
      #reader__scan_region { background: transparent !important; }
    `;
    document.head.appendChild(style);

    const setupScanner = () => {
      // Menyesuaikan qrbox secara responsif berdasarkan lebar layar
      const qrboxSize = window.innerWidth < 640 ? 200 : 250;
      
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: qrboxSize, height: qrboxSize },
        fps: 20,
        aspectRatio: 1.0,
      });

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    };

    const timeoutId = setTimeout(setupScanner, 400);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  const onScanSuccess = (result) => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }
    setScanResult(result);
    handleVerify(result); 
  };

  const onScanError = (err) => { /* Ignored */ };

  const handleVerify = async (scannedValue) => {
    setIsVerifying(true);
    setErrorMsg("");
    setSuccessData(null);

    const ticketCode = scannedValue.includes('/') 
      ? scannedValue.split('/').pop() 
      : scannedValue;

    try {
      const response = await api.post('/tickets/validate', { code: ticketCode });
      
      if (response.data.valid) {
        setSuccessData(response.data.detail);
      } else {
        setErrorMsg(response.data.message);
      }
    } catch (err) {
      const message = err.response?.data?.message || "Terjadi kesalahan sistem!";
      setErrorMsg(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setSuccessData(null);
    setErrorMsg("");
    setIsVerifying(false);
    
    setTimeout(() => {
      const qrboxSize = window.innerWidth < 640 ? 200 : 250;
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: qrboxSize, height: qrboxSize },
        fps: 20,
        aspectRatio: 1.0,
      });
      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 sm:p-6 bg-slate-50/50">
      <div className="max-w-md w-full bg-white rounded-[32px] sm:rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Tombol Close */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute right-4 top-4 sm:right-8 sm:top-8 p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl z-30 transition-all hover:text-[#E297C1] active:scale-90"
        >
          <X size={18} sm:size={20} />
        </button>

        <div className="pt-10 pb-6 sm:pt-12 sm:pb-8 text-center border-b border-slate-50 px-4">
          <div className="inline-flex p-3 sm:p-4 bg-[#E297C1] rounded-2xl sm:rounded-3xl text-white mb-4 sm:mb-6 shadow-xl shadow-pink-100">
            <Zap size={24} sm:size={28} fill="currentColor" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 uppercase italic leading-none">Gate Keeper</h1>
          <p className="text-[9px] sm:text-[11px] font-bold text-emerald-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 sm:mt-3 italic underline decoration-emerald-200 underline-offset-4">
            Online Validation Mode
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          {!scanResult ? (
            <div className="relative bg-slate-50 rounded-[24px] sm:rounded-[32px] overflow-hidden border-2 border-dashed border-slate-200 min-h-[280px] sm:min-h-[320px] flex items-center justify-center">
                <div id="reader" className="w-full"></div>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-[#E297C1]/40 rounded-[24px] sm:rounded-[32px] animate-pulse"></div>
                </div>
            </div>
          ) : (
            <div className="text-center py-2 sm:py-4">
              {isVerifying ? (
                <div className="flex flex-col items-center py-8 sm:py-10">
                  <Loader2 className="animate-spin text-[#E297C1] mb-4 sm:mb-6" size={48} sm:size={64} />
                  <p className="font-black text-slate-400 uppercase text-[9px] sm:text-[10px] tracking-widest italic">Syncing with Central DB...</p>
                </div>
              ) : errorMsg ? (
                <div className="animate-in zoom-in duration-300">
                  <AlertTriangle className="text-rose-500 mx-auto mb-4 sm:mb-6" size={60} sm:size={80} />
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 uppercase italic leading-none">Access Rejected</h3>
                  <div className="mt-4 px-4 py-3 sm:px-6 sm:py-4 bg-rose-50 rounded-xl sm:rounded-2xl border border-rose-100">
                    <p className="text-[10px] sm:text-[11px] font-bold text-rose-600 uppercase leading-relaxed">{errorMsg}</p>
                  </div>
                  <button onClick={handleReset} className="mt-8 sm:mt-10 w-full py-4 sm:py-5 bg-slate-900 text-white rounded-[20px] sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg">
                    <RefreshCw size={16} sm:size={18} /> Scan Next
                  </button>
                </div>
              ) : (
                <div className="animate-in zoom-in duration-300">
                  <ShieldCheck className="text-emerald-500 mx-auto mb-4 sm:mb-6" size={60} sm:size={80} />
                  <h3 className="text-xl sm:text-2xl font-black text-emerald-600 uppercase italic leading-none">Access Granted</h3>
                  
                  <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-emerald-50/50 rounded-[24px] sm:rounded-[32px] border border-emerald-100 text-left space-y-3 sm:space-y-4">
                    <div>
                      <p className="text-[8px] sm:text-[9px] font-black text-emerald-600/50 uppercase mb-1 flex items-center gap-1">
                        <User size={10} sm:size={12}/> Visitor Name
                      </p>
                      <p className="text-base sm:text-lg font-black text-slate-800 uppercase truncate">{successData?.customer}</p>
                    </div>
                    <div>
                      <p className="text-[8px] sm:text-[9px] font-black text-emerald-600/50 uppercase mb-1 flex items-center gap-1">
                        <TicketIcon size={10} sm:size={12}/> Event Access
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase leading-tight">{successData?.event}</p>
                    </div>
                  </div>

                  <button onClick={handleReset} className="mt-8 sm:mt-10 w-full py-4 sm:py-5 bg-[#E297C1] text-white rounded-[20px] sm:rounded-[24px] font-black text-[10px] sm:text-xs uppercase shadow-xl shadow-pink-100 active:scale-95 transition-transform">
                    Verify Next Visitor
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketScanner;