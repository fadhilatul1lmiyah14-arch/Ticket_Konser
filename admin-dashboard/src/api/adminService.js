import api from './axiosConfig';

export const adminService = {
  // Mengambil statistik dashboard
  getStats: (period) => api.get(`/admin/dashboard/stats?period=${period}`),
  
  // Mengambil list notifikasi
  getNotifications: () => api.get('/admin/dashboard/notifications'),
  
  // Menandai semua notifikasi sudah dibaca
  markAllNotificationsAsRead: () => api.post('/admin/dashboard/notifications/read-all'),
};