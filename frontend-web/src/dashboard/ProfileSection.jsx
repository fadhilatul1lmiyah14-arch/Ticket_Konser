import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api/axiosConfig";
import { 
  Settings, Loader2, Camera, ShieldCheck, CheckCircle2, 
  LayoutGrid, Scissors, Smile, Palette, User, Sparkles
} from "lucide-react";

const ProfileSection = () => {
  const context = useOutletContext();
  const userData = context?.userData;
  const fetchUserData = context?.fetchUserData;
  const lang = context?.lang || "id";
  const isDarkMode = context?.isDarkMode !== undefined ? context?.isDarkMode : true;

  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState("");
  
  const [avatarData, setAvatarData] = useState({
    seed: 'Felix',
    backgroundColor: 'b6e3f4',
    hair: 'bun',
    hairColor: '2c1b18',
    mouth: 'laugh',
    clothesColor: '0b3286',
    clothes: 'shirt'
  });

  const t = useMemo(() => {
    const translations = {
      id: {
        title: "Profil Saya",
        subtitle: "Atur identitas dan kustomisasi avatar unikmu",
        basicInfo: "Informasi Dasar",
        displayName: "Nama Tampilan",
        emailLabel: "Email (Hanya Baca)",
        customTitle: "Kustomisasi Karakter",
        selectBase: "Pilih Karakter Dasar",
        hairStyle: "Gaya Rambut",
        expression: "Ekspresi Wajah",
        clothesType: "Jenis Pakaian",
        hairColor: "Warna Rambut",
        clothesColor: "Warna Pakaian",
        bgColor: "Warna Latar",
        saveBtn: "Simpan Perubahan",
        saving: "Menyimpan...",
        proTip: "Avatar kamu akan digunakan di seluruh platform, termasuk pada e-ticket dan komentar event.",
        success: "✅ Profil berhasil diperbarui!",
        error: "Gagal memperbarui profil."
      },
      en: {
        title: "My Profile",
        subtitle: "Set your identity and customize your unique avatar",
        basicInfo: "Basic Information",
        displayName: "Display Name",
        emailLabel: "Email (Read Only)",
        customTitle: "Character Customization",
        selectBase: "Select Base Character",
        hairStyle: "Hair Style",
        expression: "Face Expression",
        clothesType: "Clothes Type",
        hairColor: "Hair Color",
        clothesColor: "Clothes Color",
        bgColor: "Background Color",
        saveBtn: "Save Changes",
        saving: "Saving...",
        proTip: "Your avatar will be used across the platform, including e-tickets and event comments.",
        success: "✅ Profile updated successfully!",
        error: "Failed to update profile."
      }
    };
    return translations[lang] || translations.id;
  }, [lang]);

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

  const getAvatarUrl = useCallback((data) => {
    return `https://api.dicebear.com/9.x/toon-head/svg?seed=${data.seed}&backgroundColor=${data.backgroundColor}&hair=${data.hair}&hairColor=${data.hairColor}&mouth=${data.mouth}&clothesColor=${data.clothesColor}&clothes=${data.clothes}`;
  }, []);

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      const source = userData.avatar_seed || userData.avatar || "";
      if (source.includes('dicebear.com')) {
        try {
          const url = new URL(source);
          const params = url.searchParams;
          setAvatarData({
            seed: params.get('seed') || 'Felix',
            backgroundColor: params.get('backgroundColor') || 'b6e3f4',
            hair: params.get('hair') || 'bun',
            hairColor: params.get('hairColor') || '2c1b18',
            mouth: params.get('mouth') || 'laugh',
            clothesColor: params.get('clothesColor') || '0b3286',
            clothes: params.get('clothes') || 'shirt'
          });
        } catch (e) {
          console.error("Gagal parsing avatar:", e);
        }
      }
    }
  }, [userData]);

  const handleSave = async () => {
    if (!name) return alert("Nama tidak boleh kosong!");
    setIsUpdating(true);
    const finalAvatarUrl = getAvatarUrl(avatarData);
    
    try {
      await api.patch("/auth/update-profile", { 
        name: name,
        avatar_seed: finalAvatarUrl 
      });
      
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const updatedUser = { 
        ...currentUser, 
        name: name, 
        avatar: finalAvatarUrl,
        avatar_seed: finalAvatarUrl
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('profileUpdated'));
      window.dispatchEvent(new Event('storage')); 

      if (fetchUserData) await fetchUserData();
      alert(t.success);
    } catch (err) {
      console.error("Error 422 Fix:", err.response?.data);
      alert(err.response?.data?.error || t.error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Light mode specific styles
  const headerClass = !isDarkMode 
    ? "bg-white/60 backdrop-blur-xl border-slate-200 shadow-lg" 
    : "bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl";
  const headerTitleClass = !isDarkMode ? "text-slate-800" : "text-white";
  const headerSubtitleClass = !isDarkMode ? "text-slate-500" : "text-slate-400";
  
  const panelClass = !isDarkMode 
    ? "bg-white/60 backdrop-blur-xl border-slate-200 shadow-lg" 
    : "bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl";
  const panelTitleClass = !isDarkMode ? "text-slate-800" : "text-white";
  const labelClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  const inputClass = !isDarkMode 
    ? "bg-white/80 border-slate-200 focus:border-purple-500 focus:bg-white text-slate-800 shadow-sm" 
    : "bg-white/5 border-white/10 focus:border-purple-500/50 focus:bg-white/10 text-white shadow-inner";
  const readOnlyClass = !isDarkMode 
    ? "bg-slate-100 border-slate-200 text-slate-500" 
    : "bg-black/20 border-white/5 text-slate-400";
  
  const baseButtonClass = !isDarkMode 
    ? "border-slate-200 bg-white/60 hover:bg-white/80" 
    : "border-white/5 bg-white/5 hover:bg-white/10";
  const baseButtonActiveClass = !isDarkMode 
    ? "border-purple-500 bg-purple-100 shadow-[0_0_20px_rgba(147,51,234,0.2)] ring-2 ring-purple-400/50" 
    : "border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(147,51,234,0.3)] ring-2 ring-purple-500/50";
  
  const styleButtonClass = !isDarkMode 
    ? "bg-white/80 border-slate-200 text-slate-700 hover:bg-white" 
    : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/10";
  const styleButtonActiveClass = !isDarkMode 
    ? "bg-slate-800 text-white border-slate-800 shadow-xl" 
    : "bg-white text-slate-900 border-white shadow-xl";
  
  const clothesButtonClass = !isDarkMode 
    ? "bg-white/80 border-slate-200 text-slate-700 hover:bg-white" 
    : "bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/10";
  const clothesButtonActiveClass = !isDarkMode 
    ? "bg-purple-500 text-white border-purple-500 shadow-xl" 
    : "bg-indigo-600 text-white border-indigo-600 shadow-xl";
  
  const previewCardClass = !isDarkMode 
    ? "bg-white/70 backdrop-blur-2xl border-slate-200 shadow-lg" 
    : "bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl";
  const previewAvatarBgClass = !isDarkMode ? "bg-slate-100 border-white" : "bg-slate-950 border-white/5";
  const previewNameClass = !isDarkMode ? "text-slate-800" : "text-white";
  const previewEmailClass = !isDarkMode ? "text-slate-500" : "text-slate-500";
  
  const saveButtonClass = !isDarkMode 
    ? "bg-purple-500 text-white hover:bg-white hover:text-purple-600 shadow-lg shadow-purple-200/50" 
    : "bg-purple-600 text-white hover:bg-white hover:text-purple-900 shadow-2xl";
  
  const proTipClass = !isDarkMode 
    ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg" 
    : "bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl";

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Header Profile - Glass Look */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-[2.5rem] border shadow-2xl ${headerClass}`}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20 text-white shrink-0">
              <User size={28} />
          </div>
          <div>
              <h2 className={`text-2xl font-black uppercase italic leading-none ${headerTitleClass}`}>{t.title}</h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${headerSubtitleClass}`}>{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          {/* Basic Info Panel */}
          <div className={`p-8 md:p-10 rounded-[3rem] shadow-2xl border relative overflow-hidden group ${panelClass}`}>
            <div className="absolute top-0 right-0 p-8 opacity-5 hidden sm:block text-white transition-transform group-hover:rotate-12 duration-700">
                <Settings size={120} />
            </div>

            <div className="flex items-center gap-3 mb-8 relative">
              <div className="w-1.5 h-6 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]"></div>
              <h4 className={`text-lg md:text-xl font-black uppercase italic tracking-tighter ${panelTitleClass}`}>{t.basicInfo}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${labelClass}`}>{t.displayName}</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full p-4 md:p-5 rounded-2xl border outline-none font-bold transition-all ${inputClass}`}
                />
              </div>

              <div className="space-y-2 opacity-80">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-2 ${labelClass}`}>{t.emailLabel}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={String(userData?.email || "")} 
                    readOnly 
                    className={`w-full p-4 md:p-5 rounded-2xl border font-bold cursor-not-allowed italic pr-12 ${readOnlyClass}`} 
                  />
                  <ShieldCheck className="absolute right-4 top-4 md:right-5 md:top-5 text-slate-500" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Customization Panel */}
          <div className={`p-8 md:p-10 rounded-[3rem] shadow-2xl border ${panelClass}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"></div>
              <h4 className={`text-lg md:text-xl font-black uppercase italic tracking-tighter ${panelTitleClass}`}>{t.customTitle}</h4>
            </div>

            <div className="space-y-10">
              {/* Base Selection */}
              <div>
                <div className={`flex items-center gap-2 mb-4 ${labelClass}`}>
                  <LayoutGrid size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.selectBase}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {avatarSeeds.map(s => (
                    <button key={s} type="button" onClick={() => setAvatarData({...avatarData, seed: s})} 
                      className={`aspect-square rounded-2xl p-1 border transition-all hover:scale-110 ${avatarData.seed === s ? baseButtonActiveClass : baseButtonClass}`}>
                      <img src={`https://api.dicebear.com/9.x/toon-head/svg?seed=${s}`} alt={s} className="w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Styles & Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className={`flex items-center gap-2 ${labelClass}`}>
                            <Scissors size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.hairStyle}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {hairStyles.map(h => (
                                <button key={h} onClick={() => setAvatarData({...avatarData, hair: h})} className={`py-3 px-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-tighter transition-all border ${avatarData.hair === h ? styleButtonActiveClass : styleButtonClass}`}>
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`flex items-center gap-2 ${labelClass}`}>
                            <Smile size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.expression}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {mouthStyles.map(m => (
                                <button key={m} onClick={() => setAvatarData({...avatarData, mouth: m})} className={`py-3 px-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-tighter transition-all border ${avatarData.mouth === m ? styleButtonActiveClass : styleButtonClass}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className={`flex items-center gap-2 ${labelClass}`}>
                            <Sparkles size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.clothesType}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {clothesStyles.map(c => (
                                <button key={c} onClick={() => setAvatarData({...avatarData, clothes: c})} className={`py-3 px-1 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-tighter transition-all border ${avatarData.clothes === c ? clothesButtonActiveClass : clothesButtonClass}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest block mb-4 italic ${labelClass}`}>{t.hairColor}</span>
                        <div className="flex flex-wrap gap-3">
                            {hairColors.map(c => (
                                <button key={c} onClick={() => setAvatarData({...avatarData, hairColor: c})} 
                                    className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-125 ${avatarData.hairColor === c ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110' : 'border-transparent opacity-80'}`} style={{backgroundColor: `#${c}`}} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest block mb-4 italic ${labelClass}`}>{t.clothesColor}</span>
                        <div className="flex flex-wrap gap-3">
                            {clothesColors.map(c => (
                                <button key={c} onClick={() => setAvatarData({...avatarData, clothesColor: c})} 
                                    className={`w-9 h-9 rounded-full border-2 transition-transform hover:scale-125 ${avatarData.clothesColor === c ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-110' : 'border-transparent opacity-80'}`} style={{backgroundColor: `#${c}`}} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className={`flex items-center gap-2 mb-4 ${labelClass}`}>
                            <Palette size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.bgColor}</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {bgColors.map(c => (
                                <button key={c.hex} onClick={() => setAvatarData({...avatarData, backgroundColor: c.hex})} 
                                    className={`w-10 h-10 rounded-2xl border-2 transition-all hover:rotate-12 ${avatarData.backgroundColor === c.hex ? 'border-white scale-110 shadow-2xl' : 'border-transparent opacity-60'}`} style={{backgroundColor: `#${c.hex}`}} />
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6 order-1 lg:order-2">
          <div className={`p-8 rounded-[3rem] shadow-2xl border flex flex-col items-center text-center relative overflow-hidden group ${previewCardClass}`}>
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-colors"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors"></div>

            <div className="relative mb-6">
              <div className={`w-48 h-48 rounded-[3rem] flex items-center justify-center border-8 shadow-2xl overflow-hidden ${previewAvatarBgClass}`}>
                <img 
                  src={getAvatarUrl(avatarData)} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl border-4 border-slate-900 shadow-xl animate-bounce">
                <Sparkles size={24} />
              </div>
            </div>

            <span className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-600/20">
              {String(userData?.role || 'Customer')} Member
            </span>
            
            <h3 className={`text-3xl font-black uppercase italic tracking-tighter mt-6 truncate w-full px-2 ${previewNameClass}`}>
              {String(name || "User")}
            </h3>
            <p className={`font-bold text-xs uppercase tracking-widest mt-1 mb-8 truncate w-full px-4 ${previewEmailClass}`}>{String(userData?.email || "")}</p>

            <button 
                onClick={handleSave}
                disabled={isUpdating}
                className={`w-full py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 ${saveButtonClass}`}
            >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                        <CheckCircle2 size={20} />
                        {t.saveBtn}
                    </>
                )}
            </button>
          </div>

          <div className={`p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group ${proTipClass}`}>
              <Camera className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-150 transition-transform duration-700" size={100} />
              <h5 className="font-black uppercase italic tracking-tighter text-lg mb-2 relative">Pro Tip!</h5>
              <p className="text-xs font-bold text-white/80 leading-relaxed relative">
                {t.proTip}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;