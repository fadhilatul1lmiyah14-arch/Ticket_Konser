import axios from 'axios';

const api = axios.create({
  /**
   * Mengambil URL dari variabel lingkungan Vite (.env).
   * Pastikan file .env berada di root folder frontend-web.
   */
  baseURL: import.meta.env.VITE_BACKEND_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    /**
     * SINKRONISASI: 
     * Mengambil token dari berbagai kemungkinan key yang tersimpan di localStorage.
     */
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('user_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response: res, config } = error;

    if (res) {
      // Jika error 401 (Unauthorized)
      if (res.status === 401) {
        // Cek apakah ini request login? Kalau iya, jangan hapus token agar user bisa lihat pesan error
        const isLoginEndpoint = config.url.includes('/login');
        
        if (!isLoginEndpoint) {
          console.warn("Sesi kadaluwarsa atau akses ditolak. Membersihkan storage...");
          
          // Bersihkan semua kemungkinan key token
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          
          // Aktifkan baris di bawah jika ingin otomatis redirect ke login
          // window.location.replace('/login');
        }
      }

      // Jika error 404 (Endpoint tidak ditemukan)
      if (res.status === 404) {
        console.error("Endpoint tidak ditemukan di server:", config.url);
      }
    } else {
      // Jika tidak ada response (Network Error)
      console.error(
        "Koneksi gagal! Pastikan Backend di " + 
        import.meta.env.VITE_BACKEND_URL + 
        " sudah menyala dan dapat diakses."
      );
    }

    return Promise.reject(error);
  }
);

export default api;