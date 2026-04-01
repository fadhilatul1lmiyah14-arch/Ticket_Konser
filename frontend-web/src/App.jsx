import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- HALAMAN WEBSITE UTAMA ---
import LandingPage from './website/Home';
import Events from './website/Events'; 
import ConcertDetail from './website/ConcertDetail';
import Cart from './website/Cart';
import Checkout from './website/Checkout';
import Success from './website/Success'; // Halaman yang akan menampilkan tiket
import DownloadTicket from './website/DownloadTicket';
import Login from './website/Login';
import Register from './website/Register';

// --- HALAMAN DASHBOARD ---
import UserDashboard from './dashboard/UserDashboard'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC WEBSITE ROUTES --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<Events />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* DETAIL KONSER */}
        <Route path="/concertdetail/:id" element={<ConcertDetail />} />
        
        {/* Fallback jika user akses /concertdetail tanpa ID */}
        <Route path="/concertdetail" element={<ConcertDetail />} />

        {/* --- TRANSACTIONAL ROUTES --- */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* PERBAIKAN PENTING: 
          Path ini harus "/payment-success" karena di backend (Xendit Redirect) 
          kita menset URL-nya ke /payment-success.
        */}
        <Route path="/payment-success" element={<Success />} />
        
        <Route path="/success" element={<Success />} /> {/* Fallback saja */}
        <Route path="/download-ticket" element={<DownloadTicket />} />
        
        {/* --- USER AREA --- */}
        <Route path="/dashboard" element={<UserDashboard />} />

        {/* --- 404 FALLBACK --- */}
        {/* Jika route tidak ditemukan, balikkan ke Landing Page */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;