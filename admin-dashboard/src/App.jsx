import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Import Pages
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/Auth/AdminLogin';
import ManageConcert from './pages/Concerts/ManageConcert';
import AddConcert from './pages/Concerts/AddConcert';
import EditConcert from './pages/Concerts/EditConcert'; 
import ManageTicket from './pages/Tickets/ManageTicket';
import ManageMasterData from './pages/MasterData/ManageMasterData';
import OrderHistory from './pages/Orders/OrderHistory';

// Helper: Scroll ke atas setiap kali ganti halaman
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Komponen Pelindung (Sesuai Flowchart: Cek Auth Admin)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    // Jika tidak ada token, tendang ke login
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Komponen Kebalikan: Jika sudah login, dilarang masuk ke halaman Login lagi
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ==============================
            AUTH ROUTES 
           ============================== */}
        <Route path="/login" element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } />

        {/* ==============================
            MAIN DASHBOARD & MANAGEMENT
           ============================== */}
        
        {/* 1. Dashboard Utama (Path Root) */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* PERBAIKAN: Menambahkan path /dashboard agar sinkron dengan navigate('/dashboard') */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* 2. Manajemen Konser (Events) */}
        <Route path="/concerts" element={
          <ProtectedRoute>
            <ManageConcert />
          </ProtectedRoute>
        } />
        
        <Route path="/add-concert" element={
          <ProtectedRoute>
            <AddConcert />
          </ProtectedRoute>
        } />
        
        <Route path="/edit-concert/:id" element={
          <ProtectedRoute>
            <EditConcert />
          </ProtectedRoute>
        } />
        
        {/* 3. Manajemen Tiket & Stok */}
        <Route path="/tickets" element={
          <ProtectedRoute>
            <ManageTicket />
          </ProtectedRoute>
        } />
        
        {/* 4. Monitoring Pesanan Pembeli (Order History) */}
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        } />
        
        {/* 5. Master Data (Category & Location) */}
        <Route path="/master-data" element={
          <ProtectedRoute>
            <ManageMasterData />
          </ProtectedRoute>
        } />

        {/* ==============================
            ERROR HANDLING (404)
           ============================== */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-6 text-center">
            <div className="relative">
                <h1 className="text-[150px] font-black text-slate-200 italic leading-none select-none">404</h1>
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-slate-800 font-black uppercase tracking-[0.3em] text-lg italic">
                    Lost in Space?
                </p>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-4">
                Halaman yang kamu cari tidak ditemukan atau telah dipindahkan.
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="mt-12 px-10 py-5 bg-slate-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#E297C1] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] active:scale-95 flex items-center gap-3"
            >
              Take Me Home
            </button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;