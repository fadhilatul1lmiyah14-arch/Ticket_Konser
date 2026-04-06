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

// --- HALAMAN DASHBOARD (STRUKTUR MODULAR) ---
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
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');
  
  if (!token) {
    // Jika tidak ada token, arahkan ke login
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* SESUAIKAN DENGAN NAVIGASI DI HOME: /event/:id */}
        <Route path="/event/:id" element={<ConcertDetail />} />
        
        {/* --- PAYMENT SUCCESS ROUTES --- */}
        <Route 
          path="/payment-success" 
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/success" 
          element={
            <ProtectedRoute>
              <Success />
            </ProtectedRoute>
          } 
        />

        {/* --- PROTECTED ROUTES (Halaman Wajib Login) --- */}
        
        {/* Transaksi & Keranjang */}
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

        {/* --- AREA DASHBOARD USER (NESTED ROUTES) --- */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        >
          {/* Default Redirect: Saat akses /dashboard langsung ke /dashboard/overview */}
          <Route index element={<Navigate to="overview" replace />} />
          
          {/* Sub-halaman dashboard */}
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