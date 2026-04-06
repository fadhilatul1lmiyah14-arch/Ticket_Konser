import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  // Load settings dari localStorage atau gunakan default
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('admin_prefs');
    return saved ? JSON.parse(saved) : {
      notificationSound: 'chime', // muted, chime, alert
      toastPosition: 'top-right',  // top-right, bottom-right, top-left
      privacyMode: false,          // true = blur sensitive data
    };
  });

  // Simpan setiap ada perubahan
  useEffect(() => {
    localStorage.setItem('admin_prefs', JSON.stringify(settings));
    
    // Logic tambahan untuk Privacy Mode (tambah class ke body)
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
    <ConfigContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);