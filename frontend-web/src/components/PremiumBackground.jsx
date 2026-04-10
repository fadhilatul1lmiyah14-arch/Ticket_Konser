import React, { useMemo } from 'react';
import { Music, Mic2, Disc, Speaker, Radio, Play, Star } from 'lucide-react';

const PremiumBackground = ({ children }) => {
  // Komponen Ikon untuk dekorasi melayang
  const floatingIcons = [Music, Mic2, Disc, Speaker, Radio, Star, Play];

  const items = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      size: Math.random() * 20 + 20,
      duration: Math.random() * 10 + 10 + 's',
      delay: Math.random() * -10 + 's',
      opacity: Math.random() * 0.1 + 0.05,
      Icon: floatingIcons[Math.floor(Math.random() * floatingIcons.length)]
    }));
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#020617] overflow-hidden">
      {/* --- CINEMATIC CONCERT LAYER --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        
        {/* 1. Main Stage Glow (Cahaya Panggung Utama) */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full h-[600px] bg-purple-600/20 blur-[160px] rounded-full opacity-50"></div>
        
        {/* 2. Beam Lights (Lampu Sorot Panggung) */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[10%] left-[15%] w-[2px] h-[120%] bg-gradient-to-b from-purple-500/40 via-purple-500/10 to-transparent rotate-[25deg] blur-sm animate-[beam_7s_infinite_alternate]"></div>
          <div className="absolute -top-[10%] right-[20%] w-[1px] h-[120%] bg-gradient-to-b from-blue-500/30 via-blue-500/5 to-transparent -rotate-[15deg] blur-sm animate-[beam_9s_infinite_alternate_1s]"></div>
          <div className="absolute -top-[10%] left-[45%] w-[1px] h-[120%] bg-gradient-to-b from-indigo-500/20 via-transparent to-transparent rotate-[5deg] blur-sm animate-[beam_12s_infinite_alternate_2s]"></div>
        </div>

        {/* 3. Floating Icons with Neon Glow */}
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute animate-float-icon"
            style={{
              left: item.left,
              top: item.top,
              opacity: item.opacity,
              animationDuration: item.duration,
              animationDelay: item.delay,
            }}
          >
            <item.Icon size={item.size} className="text-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
          </div>
        ))}

        {/* 4. Moving Nebula & Mesh Gradients */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-900/30 rounded-full blur-[140px] animate-[pulse_10s_infinite]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[140px] animate-[pulse_15s_infinite_reverse]"></div>

        {/* 5. Dynamic Particles (Sparkles) */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white rounded-full animate-sparkle"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.4,
                animationDuration: (Math.random() * 4 + 3) + 's',
                animationDelay: (Math.random() * 5) + 's'
              }}
            ></div>
          ))}
        </div>

        {/* 6. Vignette Overlay (Efek Fokus Gelap di Pinggir) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]"></div>
      </div>

      {/* --- CONTENT --- */}
      <div className="relative z-10 w-full">
        {children}
      </div>

      <style>{`
        @keyframes beam {
          0% { transform: rotate(15deg) translateX(-20px); opacity: 0.2; }
          100% { transform: rotate(35deg) translateX(20px); opacity: 0.5; }
        }

        @keyframes float-icon {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-40px) rotate(15deg) scale(1.1); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }

        /* Smooth scrolling for entire page */
        html {
          scroll-behavior: smooth;
        }

        /* Hide scrollbar for clean look */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PremiumBackground;