import axios from 'axios';

const api = axios.create({
  // SESUAIKAN: Ganti dengan IP Backend temanmu (Pastikan Backend nyala)
  baseURL: 'http://192.168.0.242:3000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Otomatis nempelun Token ke setiap request (Admin & Customer)
api.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage (bisa adminToken atau userToken)
    const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken');
    
    if (token) {
      // Tempelkan ke header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Kalau token expired (401), otomatis logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      // window.location.href = '/login'; // Opsional: paksa ke login
    }
    return Promise.reject(error);
  }
);

export default api;