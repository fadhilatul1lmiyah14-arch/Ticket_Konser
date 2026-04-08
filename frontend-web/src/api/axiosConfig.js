import axios from 'axios';

/**
 * Konfigurasi Axios untuk Frontend (Customer/Pembeli)
 */
const api = axios.create({
  // UPDATE: Menggunakan link Tunnelmole terbaru agar bisa diakses internet
  baseURL: 'http://ztk8rh-ip-182-8-194-144.tunnelmole.net', 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTOR REQUEST
 * Fungsinya: Otomatis menempelkan Token ke setiap request (Admin & Customer).
 * Ini penting agar saat user melihat riwayat tiket, server tahu itu siapa.
 */
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage (bisa adminToken atau userToken)
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    
    if (token) {
      // Tempelkan ke header Authorization dengan format Bearer
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
 * Fungsinya: Jika token expired (401), otomatis bersihkan data login.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesi kadaluwarsa, silakan login kembali.");
      localStorage.clear();
      // window.location.href = '/login'; // Aktifkan jika ingin otomatis redirect
    }
    
    // Memberikan pesan jika server (backend) mati
    if (!error.response) {
      console.error("Gagal terhubung ke server. Pastikan Backend & Tunnelmole nyala!");
    }

    return Promise.reject(error);
  }
);

export default api;