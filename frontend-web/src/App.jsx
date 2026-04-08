import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// --- HALAMAN WEBSITE UTAMA ---
import LandingPage from './website/Home';
import Events from './website/Events'; 
import ConcertDetail from './website/ConcertDetail';
import Cart from './website/Cart';
import Checkout from './website/Checkout';
import Success from './website/Success'; 
import Login from './website/Login';
import Register from './website/Register';

// --- HALAMAN DASHBOARD ---
import UserDashboard from './dashboard/UserDashboard'; 
import ProfileSection from './dashboard/ProfileSection'; 
import OrderSection from './dashboard/OrderSection';     
import TicketSection from './dashboard/TicketSection';   
import DashboardOverview from './dashboard/DashboardOverview';

/**
 * Helper: Scroll ke atas otomatis saat ganti halaman
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Proteksi Halaman: Cek apakah token ada
 */
const ProtectedRoute = ({ children }) => {
  // PERBAIKAN: Ambil 'token' (sesuai standar Login.jsx yang baru)
  // Kita tambahkan fallback ke 'accessToken' agar lebih aman
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const location = useLocation();
  
  if (!token) {
    // Debugging (opsional, hapus jika sudah lancar)
    console.warn("Akses ditolak: Token tidak ditemukan. Mengalihkan ke login...");
    
    // Balikkan ke login jika token tidak ada
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

/**
 * Proteksi Auth: Mencegah user yang sudah login masuk ke Login/Register
 */
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:id" element={<ConcertDetail />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* --- PROTECTED WEB ROUTES --- */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payment-success" element={<ProtectedRoute><Success /></ProtectedRoute>} />

        {/* --- USER DASHBOARD (NESTED ROUTES) --- */}
        {/* PERHATIKAN: Path "/dashboard" tidak menggunakan asterisk (*).
            Komponen didalamnya akan dipanggil berdasarkan route di bawahnya.
        */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          {/* Jika user akses "/dashboard", langsung lempar ke "/dashboard/overview" 
            Ini krusial agar halaman tidak kosong saat diakses manual
          */}
          <Route index element={<Navigate to="/dashboard/overview" replace />} />
          
          {/* Child Routes - Path ini relatif terhadap /dashboard */}
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="profile" element={<ProfileSection />} />
          <Route path="orders" element={<OrderSection />} />
          <Route path="tickets" element={<TicketSection />} />
        </Route>

        {/* --- 404 FALLBACK --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;