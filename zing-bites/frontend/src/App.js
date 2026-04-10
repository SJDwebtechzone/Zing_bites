import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import OpeningAnimation from './components/OpeningAnimation';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import { Login, Register, VerifyOTP, AdminLogin } from './pages/Auth';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Reviews from './pages/Reviews';
import Feedback from './pages/Feedback';

import './styles/globals.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>🚚</div>;
  
  return user ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function AppContent() {
  const [showOpening, setShowOpening] = useState(!sessionStorage.getItem('zb_opened'));

  const handleAnimationComplete = useCallback(() => {
    sessionStorage.setItem('zb_opened', '1');
    setShowOpening(false);
  }, []);

  return (
    <>
      {showOpening && <OpeningAnimation onComplete={handleAnimationComplete} />}
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/feedback/:orderId" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px' },
          success: { iconTheme: { primary: '#FF6B35', secondary: 'white' } },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
