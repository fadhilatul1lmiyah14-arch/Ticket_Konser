import React from 'react';
import { useConfig } from '../../context/ConfigContext';
import { 
  Settings, 
  Bell, 
  EyeOff, 
  Layout, 
  Volume2, 
  VolumeX, 
  Check,
  Shield
} from 'lucide-react';

const Preferences = () => {
  const { settings, updateSettings } = useConfig();

  // Opsi Suara Notifikasi
  const soundOptions = [
    { id: 'muted', label: 'Muted', icon: <VolumeX size={16} /> },
    { id: 'chime', label: 'Chime', icon: <Volume2 size={16} /> },
    { id: 'alert', label: 'Alert Tone', icon: <Volume2 size={16} /> },
  ];

  // Opsi Posisi Toast
  const positionOptions = [
    { id: 'top-right', label: 'Top Right' },
    { id: 'top-left', label: 'Top Left' },
    { id: 'bottom-right', label: 'Bottom Right' },
  ];

  const handleTogglePrivacy = () => {
    updateSettings({ privacyMode: !settings.privacyMode });
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 font-sans overflow-x-hidden">
      {/* Header */}
      <header className="mb-8 md:mb-10 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
          <span className="w-2 h-2 bg-[#E297C1] rounded-full"></span>
          <h2 className="text-[9px] md:text-[10px] font-black text-[#E297C1] uppercase tracking-[0.3em] md:tracking-[0.5em]">System Configuration</h2>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">
          Admin <span className="text-slate-200">Preferences</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Section 1: Security & Privacy */}
        <div className="bg-slate-50 p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-[#E297C1] shrink-0">
                <EyeOff size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase italic text-xs md:text-sm tracking-widest">Privacy Control</h3>
                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mask sensitive data</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:p-6 bg-white rounded-[24px] md:rounded-[30px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="max-w-[200px]">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">Privacy Mode</p>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Blur revenue and earnings in dashboard</p>
              </div>
              <button 
                onClick={handleTogglePrivacy}
                className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${settings.privacyMode ? 'bg-[#E297C1]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.privacyMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
          <Shield className="absolute -right-4 -bottom-4 text-slate-200/50 w-24 h-24 md:w-32 md:h-32 transform -rotate-12 pointer-events-none" />
        </div>

        {/* Section 2: Notifications */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-[30px] md:rounded-[40px] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="p-3 bg-white/5 rounded-2xl text-[#E297C1] shrink-0">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="font-black text-white uppercase italic text-xs md:text-sm tracking-widest">Notification Sound</h3>
                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alert Audio Settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {soundOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => updateSettings({ notificationSound: option.id })}
                  className={`flex items-center justify-between p-4 rounded-xl md:rounded-2xl transition-all border active:scale-[0.98] ${
                    settings.notificationSound === option.id 
                    ? 'bg-[#E297C1] border-[#E297C1] text-white shadow-lg shadow-pink-500/20' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{option.icon}</span>
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{option.label}</span>
                  </div>
                  {settings.notificationSound === option.id && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Interface Layout */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="p-3 bg-slate-50 rounded-2xl text-[#E297C1] shrink-0">
              <Layout size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase italic text-xs md:text-sm tracking-widest">Interface Settings</h3>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Toast & Popup Positions</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
            {positionOptions.map((pos) => (
              <button
                key={pos.id}
                onClick={() => updateSettings({ toastPosition: pos.id })}
                className={`px-6 sm:px-8 py-4 rounded-[16px] md:rounded-[20px] text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all border active:scale-95 ${
                  settings.toastPosition === pos.id
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-y-[-2px]'
                  : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="mt-8 md:mt-12 p-6 md:p-8 bg-emerald-50 rounded-[24px] md:rounded-[30px] border border-emerald-100 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200/50">
          <Settings size={20} className="animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-[10px] md:text-[11px] text-emerald-800 font-black uppercase tracking-tight leading-relaxed">
            Automatic Node Sync Active
          </p>
          <p className="text-[10px] md:text-[11px] text-emerald-700/70 font-medium leading-relaxed mt-1">
            Settings are synchronized across your current session and stored in browser local storage. 
            <span className="block mt-1 opacity-60 font-bold uppercase tracking-widest">Last sync: {new Date().toLocaleTimeString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Preferences;