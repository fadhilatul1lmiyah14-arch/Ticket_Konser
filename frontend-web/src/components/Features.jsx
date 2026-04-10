import React from "react";
import { CheckCircle, Lock, Zap, Headphones } from "lucide-react";

const Features = () => {
  const currentLang = localStorage.getItem("lang") || "id";

  const featureData = {
    id: {
      title: "Kenapa Pilih",
      subtitle: "Platform tiket event terpercaya dengan pengalaman terbaik untuk Anda",
      items: [
        {
          title: "Pemesanan Mudah",
          desc: "Proses booking tiket cepat dan mudah hanya dalam beberapa langkah sederhana",
          icon: <CheckCircle className="text-purple-400" size={24} />,
        },
        {
          title: "100% Aman & Terpercaya",
          desc: "Transaksi dijamin aman dengan sistem keamanan berlapis dan enkripsi data",
          icon: <Lock className="text-pink-400" size={24} />,
        },
        {
          title: "E-Ticket Instan",
          desc: "Terima tiket elektronik langsung melalui WhatsApp setelah pembayaran berhasil",
          icon: <Zap className="text-amber-400" size={24} />,
        },
        {
          title: "Support 24/7",
          desc: "Tim customer service siap membantu kapan saja melalui chat WhatsApp",
          icon: <Headphones className="text-blue-400" size={24} />,
        },
      ],
    },
    en: {
      title: "Why Choose",
      subtitle: "Trusted event ticket platform with the best experience for you",
      items: [
        {
          title: "Easy Booking",
          desc: "Fast and easy ticket booking process in just a few simple steps",
          icon: <CheckCircle className="text-purple-400" size={24} />,
        },
        {
          title: "100% Secure",
          desc: "Transactions are guaranteed secure with layered security and data encryption",
          icon: <Lock className="text-pink-400" size={24} />,
        },
        {
          title: "Instant E-Ticket",
          desc: "Receive electronic tickets directly via WhatsApp after successful payment",
          icon: <Zap className="text-amber-400" size={24} />,
        },
        {
          title: "24/7 Support",
          desc: "Our customer service team is ready to help anytime via WhatsApp chat",
          icon: <Headphones className="text-blue-400" size={24} />,
        },
      ],
    },
  };

  const content = featureData[currentLang];

  return (
    <section className="relative w-full py-16 bg-transparent">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
<div className="text-center mb-16 relative">
  {/* Dekorasi teks belakang (opsional untuk kesan depth) */}
  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[60px] font-black text-white/[0.02] uppercase italic tracking-[0.2em] whitespace-nowrap select-none">
    RELIABLE PLATFORM
  </div>

  <h2 className="text-2xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-tight drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
    {content.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-amber-500 animate-gradient-x drop-shadow-none">RALY TICKET</span>?
  </h2>
  
  <div className="flex items-center justify-center gap-4 mt-4">
    <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-purple-500/50"></div>
    <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-[0.3em] leading-relaxed italic">
      {content.subtitle}
    </p>
    <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-purple-500/50"></div>
  </div>
</div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.items.map((item, index) => (
            <div 
              key={index}
              className="group p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2"
            >
              {/* Icon Box */}
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-white font-bold text-base mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>
    </section>
  );
};

export default Features;