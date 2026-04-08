import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Settings, EyeOff, Layout, Check, Shield 
} from 'lucide-react';

const Preferences = () => {
  const { settings, updateSettings } = useConfig();

  const positionOptions = [
    { id: 'top-right', label: 'Top Right' },
    { id: 'top-left', label: 'Top Left' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ];

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 font-sans overflow-x-hidden">
      <header className="mb-8 md:mb-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <span className="w-2 h-2 bg-[#E297C1] rounded-full"></span>
          <h2 className="text-[9px] md:text-[10px] font-black text-[#E297C1] uppercase tracking-[0.5em]">System Configuration</h2>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 uppercase italic tracking-tighter">
          Admin <span className="text-slate-200">Preferences</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* 1. Privacy Section - Kiri */}
        <div className="bg-slate-50 p-6 md:p-8 rounded-[30px] border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-[#E297C1]">
                <EyeOff size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase italic text-sm tracking-widest">Privacy Control</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Mask sensitive data</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 bg-white rounded-[24px] border border-slate-100 shadow-sm">
              <div className="max-w-[200px]">
                <p className="text-xs font-black text-slate-800 uppercase mb-1">Privacy Mode</p>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Blur revenue and earnings in dashboard</p>
              </div>
              <button 
                onClick={() => updateSettings({ privacyMode: !settings.privacyMode })}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.privacyMode ? 'bg-[#E297C1]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.privacyMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
          <Shield className="absolute -right-4 -bottom-4 text-slate-200/50 w-32 h-32 transform -rotate-12 pointer-events-none" />
        </div>

        {/* 2. Info Section - Kanan (Pengganti Suara agar Grid Tetap Bagus) */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-[30px] relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <h3 className="text-[#E297C1] font-black text-xl uppercase italic italic tracking-tighter mb-2">System Status</h3>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
              Konfigurasi antarmuka ini disimpan secara lokal pada perangkat Anda untuk menjaga kenyamanan navigasi admin.
            </p>
          </div>
          <Settings className="absolute -right-6 -top-6 text-white/5 w-40 h-40 animate-spin [animation-duration:20s]" />
        </div>

        {/* 3. Toast Position - Bawah Lebar */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[30px] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-50 rounded-2xl text-[#E297C1]">
              <Layout size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase italic text-sm tracking-widest">Interface Settings</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Toast & Popup Positions</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {positionOptions.map((pos) => (
              <button
                key={pos.id}
                onClick={() => updateSettings({ toastPosition: pos.id })}
                className={`px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all border ${
                  settings.toastPosition === pos.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl -translate-y-1'
                  : 'bg-slate-50 border-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  {pos.label}
                  {settings.toastPosition === pos.id && <Check size={14} className="text-[#E297C1]" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Footer */}
      <div className="mt-8 p-6 bg-emerald-50 rounded-[24px] border border-emerald-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg">
          <Settings size={20} className="animate-spin [animation-duration:8s]" />
        </div>
        <div>
          <p className="text-[11px] text-emerald-800 font-black uppercase tracking-tight">Automatic Node Sync Active</p>
          <p className="text-[10px] text-emerald-700/70 font-medium mt-1">
            Last sync: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Preferences;