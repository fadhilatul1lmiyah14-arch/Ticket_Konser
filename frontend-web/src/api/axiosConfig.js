import axios from 'axios';

const api = axios.create({
  // URL Tunnelmole kamu
  baseURL: 'http://evvwt3-ip-182-8-211-179.tunnelmole.net', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    /**
     * SINKRONISASI: 
     * Kita prioritaskan key 'token' sesuai dengan yang kita set di Login.jsx
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
        // Cek apakah ini request login? Kalau iya, jangan hapus token (biarkan user lihat error password salah)
        const isLoginEndpoint = config.url.includes('/login');
        
        if (!isLoginEndpoint) {
          console.warn("Sesi kadaluwarsa atau akses ditolak. Membersihkan storage...");
          
          // Bersihkan semua kemungkinan key token
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          
          // Opsional: Redirect ke login jika bukan di halaman home/public
          // window.location.href = '/login';
        }
      }

      // Jika error 404 (Endpoint tidak ditemukan)
      if (res.status === 404) {
        console.error("Endpoint tidak ditemukan di server:", config.url);
      }
    } else {
      // Jika tidak ada response sama sekali (Server mati / Internet putus)
      console.error("Koneksi gagal! Pastikan Tunnelmole atau Server Backend menyala.");
    }

    return Promise.reject(error);
  }
);

export default api;