import axios from 'axios';

const api = axios.create({
  // Sesuaikan dengan IP backend temanmu yang sedang running
  baseURL: 'http://192.168.0.242:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTOR REQUEST
 * Fungsinya: Setiap kali aplikasi memanggil API, 
 * kode ini akan otomatis mengambil token dari localStorage 
 * dan memasukkannya ke Header Authorization.
 */
api.interceptors.request.use(
  (config) => {
    // Ambil token yang kita simpan saat login tadi
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      // Tempelkan token ke Header dengan format Bearer
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR RESPONSE (Opsional tapi Penting)
 * Fungsinya: Jika tiba-tiba token expired atau tidak valid (401),
 * aplikasi akan otomatis logout dan balik ke halaman login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Token tidak valid atau expired. Mengalihkan ke login...");
      localStorage.clear(); // Hapus semua data login yang lama
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;