import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext'; // Pastikan path ini benar

// Import Layouts & Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Profile from './components/Profile';

// Import Pages
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/Auth/AdminLogin';
import ManageConcert from './pages/Concerts/ManageConcert';
import AddConcert from './pages/Concerts/AddConcert';
import EditConcert from './pages/Concerts/EditConcert'; 
import ManageTicket from './pages/Tickets/ManageTicket';
import ManageMasterData from './pages/MasterData/ManageMasterData';
import OrderHistory from './pages/Orders/OrderHistory';
import TicketScanner from './pages/Admin/TicketScanner';
import Preferences from './pages/Admin/Preferences';

// --- HELPER COMPONENTS ---

// 1. Scroll ke atas setiap kali ganti halaman
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * 2. Admin Layout: Induk Utama
 * Perbaikan: Menambahkan struktur container yang solid agar 
 * background putih di halaman anak (Outlet) tidak "bolong" atau double sidebar.
 */
const AdminLayout = () => {
  return (
    <div className="flex bg-[#0F0F1E] min-h-screen font-sans text-white overflow-hidden">
      {/* Sidebar Utama (Hanya ada satu di sini) */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Navbar Utama */}
        <Navbar />

        {/* Area Konten Utama 
            bg-white di sini memastikan jika halaman anak punya bg-white, 
            dia akan memenuhi seluruh layar dengan rapi.
        */}
        <main className="flex-1 overflow-y-auto bg-white p-6 md:p-10 text-slate-900">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// 3. Protected Route: Cek Auth
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) return <Navigate to="/login" replace />;
  return children ? children : <Outlet />;
};

// 4. Public Route: Cegah user login masuk ke page login
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (token) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

// --- MAIN APP ---

function App() {
  return (
    <ConfigProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* ==============================
              AUTH ROUTES (Tanpa Sidebar)
             ============================== */}
          <Route path="/login" element={
            <PublicRoute>
              <AdminLogin />
            </PublicRoute>
          } />

          {/* Redirect Root ke Dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* ==============================
              ADMIN ROUTES (Pake Sidebar & Navbar)
             ============================== */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* PENTING: Pastikan di dalam file Dashboard.jsx, ManageConcert.jsx, dll 
                SUDAH TIDAK ADA lagi pemanggilan <Sidebar /> atau <Navbar />.
            */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="manage-concert" element={<ManageConcert />} />
            <Route path="add-concert" element={<AddConcert />} />
            <Route path="edit-concert/:id" element={<EditConcert />} />
            <Route path="tickets" element={<ManageTicket />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="master-data" element={<ManageMasterData />} />
            <Route path="scanner" element={<TicketScanner />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ==============================
              ERROR HANDLING (404)
             ============================== */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0F0F1E] font-sans p-6 text-center text-white">
              <div className="relative">
                  <h1 className="text-[120px] md:text-[180px] font-black text-white/5 italic leading-none select-none">404</h1>
                  <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-white font-black uppercase tracking-[0.3em] text-lg italic">
                      Lost in Space?
                  </p>
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-4 max-w-xs mx-auto">
                  The page you are looking for doesn't exist or has been moved to another dimension.
              </p>
              <button 
                onClick={() => window.location.href = '/admin/dashboard'} 
                className="mt-12 px-10 py-5 bg-[#E297C1] text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[#E297C1] transition-all shadow-2xl active:scale-95"
              >
                Back to Command Center
              </button>
            </div>
          } />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;