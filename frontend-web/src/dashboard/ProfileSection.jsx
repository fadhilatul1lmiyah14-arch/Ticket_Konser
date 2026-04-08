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

  const avatarSeeds = ['Felix', 'Ab', 'Abcd', 'Jack', 'Avery', 'Luna', 'Milo', 'Oliver', 'Bella', 'Jasp', 'Le', 'Maya', 'Nina', 'Oscar', 'Penny', 'Quinn'];
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

  // Helper untuk buat query string avatar
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
    
    // Kita buat URL lengkap sebagai "seed" kustom agar Backend menerimanya
    const finalAvatarUrl = getAvatarUrl(avatarData);
    
    try {
      // PERBAIKAN: Kirim field 'avatar_seed' sesuai permintaan Backend
      await api.patch("/auth/update-profile", { 
        name: name,
        avatar_seed: finalAvatarUrl // Backend minta avatar_seed, kita beri URL lengkapnya di sini
      });
      
      // Update LocalStorage agar UI langsung berubah
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      const updatedUser = { 
        ...currentUser, 
        name: name, 
        avatar: finalAvatarUrl,
        avatar_seed: finalAvatarUrl
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Trigger event untuk komponen lain
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 md:mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200 text-white shrink-0">
            <User size={28} />
        </div>
        <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{t.title}</h2>
            <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-8 space-y-6 md:space-y-8 order-2 lg:order-1">
          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 hidden sm:block text-slate-900">
                <Settings size={120} />
            </div>

            <div className="flex items-center gap-3 mb-6 md:mb-8 relative">
              <div className="w-1.5 h-6 bg-purple-600 rounded-full"></div>
              <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase italic tracking-tighter">{t.basicInfo}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.displayName}</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 p-4 md:p-5 rounded-2xl border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none font-bold transition-all text-slate-700 shadow-inner"
                />
              </div>

              <div className="space-y-2 opacity-80">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.emailLabel}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={String(userData?.email || "")} 
                    readOnly 
                    className="w-full bg-slate-100 p-4 md:p-5 rounded-2xl border-2 border-slate-200 font-bold cursor-not-allowed text-slate-500 italic pr-12" 
                  />
                  <ShieldCheck className="absolute right-4 top-4 md:right-5 md:top-5 text-slate-400" size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              <h4 className="text-lg md:text-xl font-black text-slate-900 uppercase italic tracking-tighter">{t.customTitle}</h4>
            </div>

            <div className="space-y-8 md:space-y-10">
              <div>
                <div className="flex items-center gap-2 mb-4 text-slate-500">
                  <LayoutGrid size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.selectBase}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 md:gap-3">
                  {avatarSeeds.map(s => (
                    <button key={s} type="button" onClick={() => setAvatarData({...avatarData, seed: s})} 
                      className={`aspect-square rounded-xl md:rounded-2xl p-1 border-2 transition-all hover:scale-110 ${avatarData.seed === s ? 'border-purple-500 bg-purple-50 shadow-md ring-4 ring-purple-100' : 'border-slate-100 opacity-60 hover:opacity-100'}`}>
                      <img src={`https://api.dicebear.com/9.x/toon-head/svg?seed=${s}`} alt={s} className="w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Scissors size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.hairStyle}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {hairStyles.map(h => (
                                <button key={h} onClick={() => setAvatarData({...avatarData, hair: h})} className={`py-3 px-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${avatarData.hair === h ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'}`}>
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Smile size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.expression}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {mouthStyles.map(m => (
                                <button key={m} onClick={() => setAvatarData({...avatarData, mouth: m})} className={`py-3 px-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-tighter transition-all border-2 ${avatarData.mouth === m ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-slate-500">
                            <Sparkles size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.clothesType}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {clothesStyles.map(c => (
                                <button key={c} onClick={() => setAvatarData({...avatarData, clothes: c})} className={`py-3 px-1 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-tighter transition-all border-2 ${avatarData.clothes === c ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                    <div>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 block mb-4 italic">{t.hairColor}</span>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {hairColors.map(c => (
                                <button key={c} onClick={() => setAvatarData({...avatarData, hairColor: c})} 
                                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-4 transition-transform hover:scale-125 ${avatarData.hairColor === c ? 'border-purple-500 shadow-lg scale-110' : 'border-white shadow-sm'}`} style={{backgroundColor: `#${c}`}} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 block mb-4 italic">{t.clothesColor}</span>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {clothesColors.map(c => (
                                <button key={c} onClick={() => setAvatarData({...avatarData, clothesColor: c})} 
                                    className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-4 transition-transform hover:scale-125 ${avatarData.clothesColor === c ? 'border-purple-500 shadow-lg scale-110' : 'border-white shadow-sm'}`} style={{backgroundColor: `#${c}`}} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4 text-slate-500">
                            <Palette size={16} /><span className="text-[10px] md:text-xs font-black uppercase tracking-widest">{t.bgColor}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {bgColors.map(c => (
                                <button key={c.hex} onClick={() => setAvatarData({...avatarData, backgroundColor: c.hex})} 
                                    className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl border-4 transition-all hover:rotate-12 ${avatarData.backgroundColor === c.hex ? 'border-slate-900 scale-110 shadow-xl' : 'border-white shadow-sm'}`} style={{backgroundColor: `#${c.hex}`}} />
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6 order-1 lg:order-2">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-24 h-24 md:w-32 md:h-32 bg-purple-50 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>

            <div className="relative mb-6">
              <div className="w-36 h-36 md:w-48 md:h-48 bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center border-4 md:border-8 border-slate-50 shadow-2xl overflow-hidden group">
                <img 
                  src={getAvatarUrl(avatarData)} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-emerald-500 text-white p-2 md:p-3 rounded-xl md:rounded-2xl border-4 border-white shadow-lg animate-bounce">
                <Sparkles size={20} className="md:w-6 md:h-6" />
              </div>
            </div>

            <span className="px-4 py-1.5 bg-purple-600 text-white rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-purple-200">
              {String(userData?.role || 'Customer')} Member
            </span>
            
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter mt-6 truncate w-full px-2">
              {String(name || "User")}
            </h3>
            <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1 mb-8 truncate w-full px-4">{String(userData?.email || "")}</p>

            <button 
                onClick={handleSave}
                disabled={isUpdating}
                className="w-full bg-slate-900 text-white py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-[0.2em] hover:bg-purple-600 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
            >
                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                        <CheckCircle2 size={20} />
                        {t.saveBtn}
                    </>
                )}
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
              <Camera className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-150 transition-transform duration-700" size={100} />
              <h5 className="font-black uppercase italic tracking-tighter text-base md:text-lg mb-2 relative">Pro Tip!</h5>
              <p className="text-[10px] md:text-xs font-bold text-white/80 leading-relaxed relative">
                {t.proTip}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;