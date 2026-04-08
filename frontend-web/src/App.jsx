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
 * Komponen Helper: Otomatis scroll ke atas saat pindah rute
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Komponen pembungkus untuk memproteksi halaman yang butuh login.
 */
const ProtectedRoute = ({ children }) => {
  // Pastikan kunci token konsisten dengan yang kamu simpan saat login
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        {/* Pastikan LandingPage adalah komponen yang berisi Banner, List Konser, dll */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/event/:id" element={<ConcertDetail />} />
        
        {/* --- PAYMENT SUCCESS ROUTES --- */}
        {/* Kita pakai satu path saja agar konsisten */}
        <Route 
          path="/payment-success" 
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          } 
        />

        {/* --- PROTECTED ROUTES --- */}
        <Route 
          path="/cart" 
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/checkout" 
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } 
        />

        {/* --- AREA DASHBOARD USER --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
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