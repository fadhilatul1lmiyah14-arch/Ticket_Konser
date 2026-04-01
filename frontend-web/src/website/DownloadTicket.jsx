import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ticket, QrCode, ArrowLeft, Printer } from 'lucide-react';

const DownloadTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mengambil data dari halaman Success, atau default ke World of Dance sesuai screenshot terbaru Putra
  const ticket = location.state || {
    concert: "WORLD OF DANCE AMBON",
    artist: "Dance Comp",
    date: "25 October 2026",
    location: "Ambon City Center",
    seat: "Regular Floor",
    orderId: "#WOD20261025"
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans p-6 md:p-12 flex flex-col items-center">
      {/* Tombol Kembali (Hanya muncul di web, tidak ikut tercetak) */}
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-purple-600 transition"
        >
          <ArrowLeft size={16} /> Back to Confirmation
        </button>
        
        <button 
          onClick={() => window.print()}
          className="bg-white p-3 rounded-full shadow-md text-slate-600 hover:text-purple-600 transition"
          title="Print Ticket"
        >
          <Printer size={20} />
        </button>
      </div>

      {/* AREA TIKET (Persis Gambar 2 / Desain Canva) */}
      <main className="w-full max-w-xl bg-white rounded-[3rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-200 p-12 text-center animate-in fade-in zoom-in duration-700">
        
        {/* Label Header Kecil */}
        <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mb-12">
          Download Ticket
        </p>

        {/* Judul Konser */}
        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight mb-10 border-b border-slate-50 pb-8">
          {ticket.concert}
        </h1>

        {/* Rincian Tiket (Layout Bersih Sesuai Gambar 2) */}
        <div className="space-y-4 text-slate-700 mb-12 max-w-xs mx-auto text-sm">
          <div className="flex justify-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Artist :</span>
            <span className="font-black text-slate-900">{ticket.artist}</span>
          </div>
          <div className="flex justify-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date :</span>
            <span className="font-black text-slate-900">{ticket.date}</span>
          </div>
          <div className="flex justify-center gap-2 text-center">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Location :</span>
            <span className="font-black text-slate-900 leading-tight">{ticket.location}</span>
          </div>
          <div className="flex justify-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Seat :</span>
            <span className="font-black text-slate-900">{ticket.seat}</span>
          </div>
        </div>

        {/* QR Code Section (Placeholder) */}
        <div className="flex flex-col items-center gap-6 py-10 border-y-2 border-dashed border-slate-100 mb-10 relative">
          {/* Efek Potongan Tiket di Garis Putus-putus */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-full shadow-inner"></div>
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-full shadow-inner"></div>
          
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <QrCode size={120} className="text-slate-900" />
          </div>
          
          <div className="space-y-1">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Order ID</p>
             <p className="text-xl font-black text-slate-900 italic tracking-tighter">{ticket.orderId}</p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic uppercase tracking-wider">
          Your ticket has been successfully<br />
          downloaded and is ready to use.
        </p>

        {/* Branding Kecil di Paling Bawah */}
        <div className="mt-14 flex justify-center items-center gap-2 opacity-30 group">
          <div className="bg-slate-900 p-1 rounded group-hover:bg-purple-600 transition-colors">
            <Ticket size={12} className="text-white rotate-45" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">Raly Ticket</span>
        </div>
      </main>

      {/* Instruksi Print (Hanya muncul di web) */}
      <p className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] print:hidden">
        Press <span className="text-purple-600 underline">Ctrl + P</span> to Save as PDF
      </p>
    </div>
  );
};

export default DownloadTicket;