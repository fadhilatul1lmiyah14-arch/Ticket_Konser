import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ConfigContext = createContext();

// Shortcut: Link audio publik agar tidak perlu download file ke folder public
const soundUrls = {
  chime: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  alert: "https://pixabay.com/static/audio/2022/03/15/audio_78330a8037.mp3",
};

export const ConfigProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('admin_prefs');
    return saved ? JSON.parse(saved) : {
      notificationSound: 'chime', // muted, chime, alert
      toastPosition: 'top-right',
      privacyMode: false,
    };
  });

  // Fungsi pusat untuk memutar suara
  const playNotificationSound = useCallback((forcedSoundId = null) => {
    // Gunakan soundId yang dipassing (untuk preview) atau dari settings (untuk notif real-time)
    const soundId = forcedSoundId || settings.notificationSound;

    if (soundId === 'muted') return;
    
    const url = soundUrls[soundId];
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(err => console.log("Audio play blocked: Klik layar dulu sekali agar suara aktif."));
    }
  }, [settings.notificationSound]);

  useEffect(() => {
    localStorage.setItem('admin_prefs', JSON.stringify(settings));
    
    // Privacy Mode Logic
    if (settings.privacyMode) {
      document.documentElement.classList.add('privacy-active');
    } else {
      document.documentElement.classList.remove('privacy-active');
    }
  }, [settings]);

  const updateSettings = (newPrefs) => {
    setSettings(prev => ({ ...prev, ...newPrefs }));
  };

  return (
    <ConfigContext.Provider value={{ settings, updateSettings, playNotificationSound }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);