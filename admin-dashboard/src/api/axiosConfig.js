import axios from 'axios';

const api = axios.create({
  /**
   * baseURL sekarang menggunakan URL publik dari Tunnelmole.
   * Ini memungkinkan Frontend kamu (meskipun dijalankan di laptop lain atau HP) 
   * untuk tetap bisa menghubungi Backend di laptopmu.
   */
  baseURL: 'https://6pfxyt-ip-182-8-195-136.tunnelmole.net', 
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
    // Ambil token admin (sesuaikan key-nya, misal 'adminToken')
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
      console.error("Sesi berakhir. Silakan login kembali.");
      localStorage.removeItem('adminToken'); // Hapus token saja
      window.location.href = '/login'; 
    }
    
    // Opsional: Menangani error jaringan
    if (!error.response) {
      console.error("Koneksi ke API gagal. Pastikan Tunnelmole & Backend menyala!");
    }

    return Promise.reject(error);
  }
);

export default api;