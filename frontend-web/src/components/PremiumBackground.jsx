import React, { useMemo } from 'react';
import { Music, Mic2, Disc, Speaker, Radio, Play, Star, Sparkles, Guitar, Piano } from 'lucide-react';

const PremiumBackground = ({ children, isLightMode }) => {
  // Komponen Ikon untuk dekorasi melayang - lebih variatif
  const floatingIcons = [Music, Mic2, Disc, Speaker, Radio, Star, Play, Sparkles, Guitar, Piano];

  const items = useMemo(() => {
    return [...Array(16)].map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      size: Math.random() * 24 + 16,
      duration: Math.random() * 12 + 12 + 's',
      delay: Math.random() * -8 + 's',
      opacity: Math.random() * 0.15 + 0.05,
      Icon: floatingIcons[Math.floor(Math.random() * floatingIcons.length)]
    }));
  }, []);

  // Light Mode Styles - Premium & Elegan (CERAH & NYAMAN)
  const styles = {
    // 1. Background Utama - Light Mode lebih cerah
    containerBg: isLightMode 
      ? "bg-white" // PUTIH BERSIH
      : "bg-[#020617]", // Tetap Gelap di Dark Mode
    
    // 2. Main Stage Glow - Light Mode hampir tidak terlihat
    mainGlow: isLightMode
      ? "bg-gradient-to-r from-purple-200/15 via-pink-200/10 to-indigo-200/15"
      : "bg-purple-600/20",
    
    // 3. Beam Lights (Lampu Sorot) - Light Mode sangat subtle
    beamPurple: isLightMode
      ? "from-purple-300/10 via-purple-200/5 to-transparent"
      : "from-purple-500/40 via-purple-500/10 to-transparent",
    
    beamBlue: isLightMode
      ? "from-indigo-200/8 via-indigo-100/3 to-transparent"
      : "from-blue-500/30 via-blue-500/5 to-transparent",

    beamPink: isLightMode
      ? "from-pink-200/8 via-pink-100/3 to-transparent"
      : "from-pink-500/25 via-pink-500/5 to-transparent",

    // 4. Floating Icons - Light Mode lebih soft
    iconTextColor: isLightMode 
      ? "text-purple-300/30" 
      : "text-purple-400",
    iconGlow: isLightMode 
      ? "drop-shadow-[0_0_3px_rgba(147,51,234,0.15)]" 
      : "drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",

    // 5. Nebula / Cloud Effect - Light Mode sangat soft
    nebulaBottom: isLightMode 
      ? "bg-gradient-to-r from-purple-100/20 via-pink-50/15 to-indigo-100/20" 
      : "bg-indigo-900/30",
    nebulaTop: isLightMode 
      ? "bg-gradient-to-l from-indigo-100/15 via-purple-50/10 to-pink-100/15" 
      : "bg-purple-900/20",
    nebulaCenter: isLightMode
      ? "bg-gradient-to-t from-purple-100/10 to-transparent"
      : "bg-purple-800/15",

    // 6. Vignette - Light Mode sangat soft
    vignette: isLightMode
      ? "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.02)_100%)]"
      : "bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)]",
    
    // 7. Sparkles - Light mode warna soft
    sparkleColor: isLightMode 
      ? "bg-gradient-to-r from-purple-300 to-pink-300" 
      : "bg-white",
    
    // 8. Grid Pattern - Light mode sangat soft
    gridPattern: isLightMode
      ? "bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(139,92,246,0.04)_2px,rgba(139,92,246,0.04)_4px),repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(139,92,246,0.04)_2px,rgba(139,92,246,0.04)_4px)]"
      : "bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(139,92,246,0.08)_2px,rgba(139,92,246,0.08)_4px),repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(139,92,246,0.08)_2px,rgba(139,92,246,0.08)_4px)]"
  };

  return (
    // PERBAIKAN UTAMA: HAPUS overflow-hidden dari container utama
    <div className={`relative min-h-screen w-full ${styles.containerBg} transition-colors duration-700`}>
      
      {/* --- CINEMATIC CONCERT LAYER - Dipindahkan ke fixed + overflow-hidden --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        
        {/* Grid Pattern Premium */}
        <div className={`absolute inset-0 ${isLightMode ? 'opacity-20' : 'opacity-30'} ${styles.gridPattern}`} style={{ backgroundSize: '40px 40px' }}></div>

        {/* 1. Main Stage Glow (Cahaya Panggung Utama) - Light Mode sangat redup */}
        <div className={`absolute top-[-15%] left-1/2 -translate-x-1/2 w-[90%] h-[600px] ${styles.mainGlow} blur-[180px] rounded-full ${isLightMode ? 'opacity-20' : 'opacity-40'} animate-pulse`} style={{ animationDuration: '8s' }}></div>
        
        {/* 2. Beam Lights (Lampu Sorot Panggung) - Light Mode hampir tidak terlihat */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-[10%] left-[10%] w-[3px] h-[140%] bg-gradient-to-b ${styles.beamPurple} rotate-[20deg] blur-md animate-[beam_8s_infinite_alternate] ${isLightMode ? 'opacity-30' : 'opacity-100'}`}></div>
          <div className={`absolute -top-[10%] right-[15%] w-[2px] h-[140%] bg-gradient-to-b ${styles.beamBlue} -rotate-[25deg] blur-md animate-[beam_10s_infinite_alternate_1s] ${isLightMode ? 'opacity-30' : 'opacity-100'}`}></div>
          <div className={`absolute -top-[10%] left-[40%] w-[2px] h-[130%] bg-gradient-to-b ${styles.beamPink} rotate-[5deg] blur-md animate-[beam_12s_infinite_alternate_2s] ${isLightMode ? 'opacity-30' : 'opacity-100'}`}></div>
          <div className={`absolute -top-[10%] right-[45%] w-[1.5px] h-[130%] bg-gradient-to-b ${styles.beamPurple} -rotate-[10deg] blur-sm animate-[beam_9s_infinite_alternate_1.5s] ${isLightMode ? 'opacity-30' : 'opacity-100'}`}></div>
        </div>

        {/* 3. Floating Icons with Neon Glow - Light Mode lebih soft */}
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute animate-float-icon"
            style={{
              left: item.left,
              top: item.top,
              opacity: isLightMode ? item.opacity * 0.6 : item.opacity,
              animationDuration: item.duration,
              animationDelay: item.delay,
            }}
          >
            <item.Icon size={item.size} className={`${styles.iconTextColor} filter ${styles.iconGlow} transition-all duration-300 hover:scale-110`} />
          </div>
        ))}

        {/* 4. Moving Nebula & Mesh Gradients - Light Mode sangat soft */}
        <div className={`absolute -bottom-[25%] -left-[15%] w-[70%] h-[70%] ${styles.nebulaBottom} rounded-full blur-[160px] animate-[pulse_12s_infinite] ${isLightMode ? 'opacity-40' : 'opacity-100'}`}></div>
        <div className={`absolute top-[15%] -right-[15%] w-[60%] h-[60%] ${styles.nebulaTop} rounded-full blur-[160px] animate-[pulse_15s_infinite_reverse] ${isLightMode ? 'opacity-40' : 'opacity-100'}`}></div>
        <div className={`absolute top-[40%] left-[25%] w-[40%] h-[40%] ${styles.nebulaCenter} rounded-full blur-[140px] animate-[pulse_18s_infinite] ${isLightMode ? 'opacity-30' : 'opacity-100'}`} style={{ animationDelay: '2s' }}></div>

        {/* 5. Dynamic Particles (Sparkles) - Light Mode lebih sedikit dan soft */}
        <div className="absolute inset-0">
          {[...Array(isLightMode ? 20 : 25)].map((_, i) => (
            <div 
              key={i}
              className={`absolute ${styles.sparkleColor} rounded-full animate-sparkle`}
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: isLightMode ? 0.3 : 0.4,
                animationDuration: (Math.random() * 5 + 3) + 's',
                animationDelay: (Math.random() * 6) + 's'
              }}
            ></div>
          ))}
        </div>

        {/* 6. Light Mode Exclusive - Soft Wave Pattern (lebih subtle) */}
        {isLightMode && (
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-purple-100/10 to-transparent pointer-events-none"></div>
        )}

        {/* 7. Vignette Overlay */}
        <div className={`absolute inset-0 ${styles.vignette}`}></div>

        {/* 8. Light Mode Exclusive - Subtle Top Light (lebih subtle) */}
        {isLightMode && (
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
        )}
      </div>

      {/* --- CONTENT - Sekarang overflow-visible sehingga sticky bisa berfungsi --- */}
      <div className="relative z-10 w-full overflow-visible">
        {children}
      </div>

      <style>{`
        @keyframes beam {
          0% { transform: rotate(15deg) translateX(-30px); opacity: 0.15; }
          50% { opacity: 0.4; }
          100% { transform: rotate(35deg) translateX(30px); opacity: 0.15; }
        }

        @keyframes float-icon {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          33% { transform: translateY(-35px) rotate(12deg) scale(1.08); }
          66% { transform: translateY(15px) rotate(-8deg) scale(0.98); }
          100% { transform: translateY(0) rotate(0deg) scale(1); }
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.15); opacity: 0.45; }
        }

        @keyframes pulseReverse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }

        .animate-pulse-reverse {
          animation: pulseReverse 12s ease-in-out infinite;
        }

        html {
          scroll-behavior: smooth;
        }

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