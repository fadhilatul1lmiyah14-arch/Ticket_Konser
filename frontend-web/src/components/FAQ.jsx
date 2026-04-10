import React, { useState } from "react";
import { ChevronDown, MessageCircle, HelpCircle } from "lucide-react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const currentLang = localStorage.getItem("lang") || "id";

  const faqData = {
    id: [
      {
        q: "Bagaimana cara memesan tiket?",
        a: "Pilih event yang Anda inginkan, tentukan kategori tiket dan jumlahnya, lalu selesaikan pembayaran. E-ticket akan segera dikirimkan setelah status pembayaran berhasil."
      },
      {
        q: "Kapan saya akan menerima e-ticket?",
        a: "E-ticket akan dikirim otomatis ke email dan menu 'Tiket Saya' segera setelah pembayaran berhasil dilakukan. Biasanya dalam hitungan detik."
      },
      {
        q: "Metode pembayaran apa saja yang tersedia?",
        a: "Kami mendukung berbagai metode pembayaran mulai dari Transfer Bank (VA), E-Wallet (QRIS, Dana, OVO), hingga kartu kredit."
      },
      {
        q: "Apakah tiket bisa direfund?",
        a: "Tiket yang sudah dibeli tidak dapat dibatalkan atau direfund kecuali event tersebut resmi dibatalkan oleh pihak penyelenggara."
      }
    ],
    en: [
      {
        q: "How to book tickets?",
        a: "Select your desired event, choose the ticket category and quantity, then complete the payment. Your e-ticket will be sent immediately once payment is confirmed."
      },
      {
        q: "When will I receive my e-ticket?",
        a: "E-tickets are sent automatically to your email and 'My Tickets' menu as soon as the payment is successful, usually within seconds."
      },
      {
        q: "What payment methods are available?",
        a: "We support various methods including Bank Transfer (VA), E-Wallets (QRIS, Dana, OVO), and credit cards."
      },
      {
        q: "Can tickets be refunded?",
        a: "Purchased tickets cannot be cancelled or refunded unless the event is officially cancelled by the organizer."
      }
    ]
  };

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="relative w-full py-16 bg-transparent overflow-hidden">
      {/* Premium Decor Background */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-4">
            <HelpCircle size={14} className="text-purple-400" />
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">FAQ Support</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
            {currentLang === 'id' ? 'Pertanyaan Umum' : 'General Questions'}
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {faqData[currentLang].map((item, index) => (
            <div 
              key={index}
              className={`group transition-all duration-300 rounded-2xl border ${
                activeIndex === index 
                ? 'bg-white/10 border-purple-500/50 backdrop-blur-md' 
                : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className={`font-bold text-sm md:text-base tracking-tight transition-colors ${
                  activeIndex === index ? 'text-purple-400' : 'text-slate-200 group-hover:text-white'
                }`}>
                  {item.q}
                </span>
                <div className={`p-1 rounded-lg transition-all duration-300 ${
                  activeIndex === index ? 'bg-purple-500 text-white rotate-180' : 'bg-white/5 text-slate-500'
                }`}>
                  <ChevronDown size={18} />
                </div>
              </button>

              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-5 text-xs md:text-sm text-slate-400 leading-relaxed font-medium">
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Hint */}
        <div className="mt-10 flex flex-col items-center gap-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {currentLang === 'id' ? 'Masih bingung?' : 'Still need help?'}
            </p>
            <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:scale-105 transition-all shadow-lg shadow-emerald-900/20">
                <MessageCircle size={16} />
                {currentLang === 'id' ? 'HUBUNGI ADMIN' : 'CHAT WITH US'}
            </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;