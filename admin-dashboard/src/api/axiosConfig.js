import axios from 'axios';

const api = axios.create({
  /**
   * baseURL sekarang mengambil nilai dari file .env.
   * Jika sedang development, ia akan mengambil VITE_BACKEND_URL.
   * Pastikan URL di .env diawali dengan http:// atau https://
   */
  baseURL: import.meta.env.VITE_BACKEND_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTOR REQUEST
 * Fungsinya: Mengambil token admin dari localStorage dan mengirimkannya 
 * di setiap request agar server tahu bahwa ini adalah Admin yang sah.
 */
api.interceptors.request.use(
  (config) => {
    // Ambil token admin
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      // Masukkan token ke Header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR RESPONSE
 * Fungsinya: Menangani jika token habis (expired) atau server error.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika server merespons 401 (Unauthorized), paksa logout
    if (error.response && error.response.status === 401) {
      console.error("Sesi berakhir atau tidak sah. Silakan login kembali.");
      localStorage.removeItem('adminToken'); // Hapus token
      
      // Gunakan replace agar user tidak bisa klik 'back' ke halaman admin
      window.location.replace('/login'); 
    }
    
    // Menangani error jaringan (misal: Backend mati atau IP salah)
    if (!error.response) {
      console.error("Koneksi ke API gagal. Periksa apakah Backend di " + import.meta.env.VITE_BACKEND_URL + " sudah menyala.");
    }

    return Promise.reject(error);
  }
);

export default api;