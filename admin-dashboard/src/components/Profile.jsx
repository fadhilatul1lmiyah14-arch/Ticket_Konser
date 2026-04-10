import React, { useState, useEffect } from 'react';
import { User, Shield, Save, RefreshCw, CheckCircle2, LayoutGrid, Palette, Scissors, Smile, Sparkles } from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatarSeed: 'Felix',
    avatarBg: 'b6e3f4',
    hair: 'bun',
    hairColor: '2c1b18',
    mouth: 'laugh',
    clothes: 'shirt',
    clothesColor: '0b3286'
  });
  const [isSaving, setIsSaving] = useState(false);

  const avatarSeeds = ['Felix', 'Ab', 'dae', 'Jack', 'Avery', 'imut', 'simut', 'Oliver', 'Bell', 'Jasp', 'Le', 'help', 'habibi', 'yanto', 'tasya', 'Quinn'];
  const hairStyles = ['bun', 'sideComed', 'spiky', 'undercut'];
  const hairColors = ['2c1b18', '724133', 'a55728', 'd6863b', 'f59797', 'c93305', 'e9b4b4'];
  const mouthStyles = ['angry', 'laugh', 'sad', 'smile'];
  const clothesStyles = ['shirt', 'openJacket', 'dress'];
  const clothesColors = ['0b3286', '147f3c', '731ac3', 'c120e0', 'd6863b', '1c1917', 'f59797', '2c1b18'];
  const bgColors = [
    { name: 'Sky', hex: 'b6e3f4' }, { name: 'Pink', hex: 'ffd5dc' }, { name: 'Emerald', hex: 'c0aede' },
    { name: 'Amber', hex: 'ffdfbf' }, { name: 'Slate', hex: 'd1d5db' }, { name: 'Violet', hex: 'e297c1' },
    { name: 'Dark', hex: '374151' }, { name: 'Red', hex: 'f87171' }, { name: 'Black', hex: '000000' }
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const urlObj = new URL(parsed.avatar || 'https://api.dicebear.com/9.x/toon-head/svg?seed=Felix');
        
        setFormData({
          name: parsed.name || 'Administrator',
          email: parsed.email || '',
          avatarSeed: urlObj.searchParams.get('seed') || 'Felix',
          avatarBg: urlObj.searchParams.get('backgroundColor') || 'b6e3f4',
          hair: urlObj.searchParams.get('hair') || 'bun',
          hairColor: urlObj.searchParams.get('hairColor') || '2c1b18',
          mouth: urlObj.searchParams.get('mouth') || 'laugh',
          clothes: urlObj.searchParams.get('clothes') || 'shirt',
          clothesColor: urlObj.searchParams.get('clothesColor') || '0b3286'
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const getAvatarUrl = (data) => {
    return `https://api.dicebear.com/9.x/toon-head/svg?seed=${data.avatarSeed}&backgroundColor=${data.avatarBg}&hair=${data.hair}&hairColor=${data.hairColor}&mouth=${data.mouth}&clothes=${data.clothes}&clothesColor=${data.clothesColor}`;
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const finalAvatarUrl = getAvatarUrl(formData);
      
      const updatedUser = { 
        ...currentUser, 
        name: formData.name, 
        avatar: finalAvatarUrl 
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('profileUpdated'));
      
      setIsSaving(false);
      alert("✅ Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-4 sm:p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 md:mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="p-2 bg-slate-900 rounded-lg text-white"><User size={18} /></div>
            <h2 className="text-[9px] md:text-[10px] font-black text-[#E297C1] uppercase tracking-[0.4em]">Identity Management</h2>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-400 font-light">Profile</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT: Customizer */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-8 shadow-2xl border border-white h-full">
              <div className="relative w-32 h-32 md:w-44 md:h-44 mx-auto mb-6">
                <div className="w-full h-full bg-slate-900 rounded-[28px] md:rounded-[38px] p-1 overflow-hidden border-4 border-[#E297C1]/20 group">
                  <img 
                    src={getAvatarUrl(formData)} 
                    alt="Avatar" 
                    className="w-full h-full object-cover rounded-[22px] md:rounded-[30px] transition-transform group-hover:scale-110 duration-500" 
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-[#E297C1] text-white p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg border-4 border-white animate-pulse">
                  <CheckCircle2 size={16} className="md:w-5 md:h-5" />
                </div>
              </div>

              <div className="space-y-6 md:max-h-[500px] lg:max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Seed Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-3 justify-center text-slate-400">
                    <LayoutGrid size={14} /><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Base Character</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-2">
                    {avatarSeeds.map(s => (
                      <button key={s} type="button" onClick={() => setFormData({...formData, avatarSeed: s})} 
                        className={`aspect-square rounded-xl p-1 border-2 transition-all hover:scale-105 ${formData.avatarSeed === s ? 'border-[#E297C1] bg-pink-50 ring-2 ring-pink-100' : 'border-slate-100 opacity-60'}`}>
                        <img src={`https://api.dicebear.com/9.x/toon-head/svg?seed=${s}`} alt={s} className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair & Expression Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <Scissors size={14} /><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Hair Style</span>
                    </div>
                    <select value={formData.hair} onChange={(e) => setFormData({...formData, hair: e.target.value})} className="w-full text-[11px] font-bold p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-pink-200">
                      {hairStyles.map(h => <option key={h} value={h}>{h.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <Smile size={14} /><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Expression</span>
                    </div>
                    <select value={formData.mouth} onChange={(e) => setFormData({...formData, mouth: e.target.value})} className="w-full text-[11px] font-bold p-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-pink-200">
                      {mouthStyles.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                    </select>
                  </div>
                </div>

                {/* Clothes Style Selection */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3 text-slate-400 justify-center">
                    <Sparkles size={14} /><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Clothes Style</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {clothesStyles.map(c => (
                      <button 
                        key={c} 
                        type="button"
                        onClick={() => setFormData({...formData, clothes: c})} 
                        className={`py-2 px-1 rounded-xl border-2 text-[8px] md:text-[10px] font-black uppercase transition-all ${formData.clothes === c ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors Selection */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 text-center">Hair Tone</span>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {hairColors.map(c => (
                        <button key={c} type="button" onClick={() => setFormData({...formData, hairColor: c})} 
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-4 transition-transform hover:scale-110 ${formData.hairColor === c ? 'border-[#E297C1] shadow-lg' : 'border-white'}`} style={{backgroundColor: `#${c}`}} />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 text-center">Outfit Palette</span>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {clothesColors.map(c => (
                        <button key={c} type="button" onClick={() => setFormData({...formData, clothesColor: c})} 
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-4 transition-transform hover:scale-110 ${formData.clothesColor === c ? 'border-[#E297C1] shadow-lg' : 'border-white'}`} style={{backgroundColor: `#${c}`}} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2 justify-center text-slate-400"><Palette size={14} /><span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Background Aura</span></div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {bgColors.map(c => (
                        <button key={c.hex} type="button" onClick={() => setFormData({...formData, avatarBg: c.hex})} 
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-lg md:rounded-xl border-4 transition-all hover:rotate-12 ${formData.avatarBg === c.hex ? 'border-slate-900 shadow-md scale-110' : 'border-white'}`} style={{backgroundColor: `#${c.hex}`}} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <form onSubmit={handleSave} className="bg-white rounded-[30px] md:rounded-[40px] p-6 md:p-10 shadow-2xl border border-white space-y-6 md:space-y-8 h-full flex flex-col">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#E297C1] rounded-full"></div>
                <h3 className="font-black text-slate-800 uppercase italic text-lg md:text-xl">Account Credentials</h3>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-slate-50 border-2 border-transparent rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 outline-none focus:border-[#E297C1] focus:bg-white font-bold text-slate-700 transition-all text-sm md:text-base" 
                    required 
                  />
                </div>
                
                <div className="space-y-2 opacity-60">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Access</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={formData.email} 
                      disabled 
                      className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-slate-400 cursor-not-allowed italic text-sm md:text-base" 
                    />
                    <Shield size={16} className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-slate-900 rounded-[25px] md:rounded-[32px] flex flex-col sm:flex-row gap-4 sm:gap-5 items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E297C1]/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <Shield className="text-[#E297C1]" size={20} md:size={24} />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-wider">Visual Identity Synced</h4>
                  <p className="text-[9px] md:text-[10px] text-white/40 font-medium leading-relaxed mt-1">Toon-head modifications are reflected across the entire administrative node.</p>
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-xl md:rounded-[22px] font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] hover:bg-[#E297C1] transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                >
                  {isSaving ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Save size={18} /> 
                      Sync Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;