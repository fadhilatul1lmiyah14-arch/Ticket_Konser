import axios from 'axios';

const api = axios.create({
  baseURL: 'http://ztk8rh-ip-182-8-194-144.tunnelmole.net', 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Sesuaikan nama key ini dengan apa yang kamu tulis saat proses LOGIN
    // Jika di Login kamu tulis localStorage.setItem('token', ...), maka pakai 'token'
    const token = localStorage.getItem('accessToken') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('adminToken') || 
                  localStorage.getItem('userToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Debugging: Cek apakah interceptor benar-benar tidak menemukan token
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // HANYA bersihkan storage jika error 401 dan BUKAN saat sedang mencoba login
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config.url.includes('/login');
      
      if (!isLoginRequest) {
        console.warn("Sesi kadaluwarsa atau Token Salah.");
        // Jangan langsung clear semua jika tidak yakin
        localStorage.removeItem('accessToken'); 
        localStorage.removeItem('userToken');
        localStorage.removeItem('adminToken');
        
        // redirect ke login jika perlu
        // window.location.href = '/login';
      }
    }
    
    if (!error.response) {
      console.error("Server Down / Tunnelmole Mati!");
    }

    return Promise.reject(error);
  }
);

export default api;