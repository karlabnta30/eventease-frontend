import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; 
import './auth.css'; 
import Navbar from './components/Navbar';
import Sidebar from './components/sidebar'; 

import LandingPage from "./pages/landingpage"; 
import MainDashboard from "./pages/maindashboard"; 
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp'; 
import ForgotPassword from './pages/ForgotPassword'; 
import LiveEvents from './pages/liveevents';
import CreateEvent from './pages/createevent'; 
import BookingDetails from './pages/bookingdetails';
import ContactPage from './pages/contactpage'; 
import AdminDashboard from './pages/AdminDashboard'; 
import AdminFeedback from './pages/AdminFeedback'; 
import AboutPage from "./pages/aboutpage";
import UserProfile from './pages/UserProfile'; 
import EditEvents from './pages/EditEvents'; 
import VendorProfile from './pages/VendorProfile'; 
import NotificationPage from './pages/NotificationPage';
import Checkout from './pages/Checkout';
import Receipt from './pages/Receipt'; 
import Messages from './pages/messages';
import BundleDetails from './pages/BundleDetails';
import PaymentSuccess from './pages/PaymentSuccess';

// VENDOR IMPORTS
import VendorDashboard from './pages/VendorDashboard'; 
import VendorList from './pages/VendorList';
import AddService from './pages/AddService'; 

// --- PROTECTED ROUTE WRAPPER WITH REAL-TIME CROSS-TAB SYNC ---
const ProtectedRoute = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const handleStorageChange = (event) => {
      if (event.key === 'token' && !event.newValue) {
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) {
          localStorage.clear();
          navigate('/login', { replace: true });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  const location = useLocation();
  const authPaths = ['/login', '/register', '/verify-otp', '/forgot-password']; 
  const isAuthPage = authPaths.includes(location.pathname);
  const isLandingView = location.pathname === '/';
  
  const userRole = localStorage.getItem('userRole');

  const getDefaultDashboard = () => {
    if (userRole === 'admin') return "/admin-dashboard";
    if (userRole === 'vendor') return "/vendor-dashboard";
    return "/main-dashboard";
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {!isAuthPage && <Navbar />} 

      {!isAuthPage && !isLandingView ? (
        <Sidebar>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Navigate to={getDefaultDashboard()} replace />} />

              {/* SHARED ROUTES */}
              <Route path="/live-events" element={<LiveEvents />} />
              <Route path="/profile" element={<UserProfile />} /> 
              <Route path="/booking-details/:id" element={<BookingDetails />} />
              <Route path="/notifications" element={<NotificationPage />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/bundle-details/:id" element={<BundleDetails />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              
              {/* CLIENT ROUTES */}
              <Route 
                path="/main-dashboard" 
                element={!userRole || userRole === 'client' ? <MainDashboard /> : <Navigate to={getDefaultDashboard()} replace />} 
              />
              <Route path="/vendors/:id" element={<VendorProfile />} /> 
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/vendor-list" element={<VendorList />} />
              <Route path="/edit-event/:id" element={<EditEvents />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} /> 
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/receipt" element={<Receipt />} />

              {/* VENDOR ROUTES */}
              <Route 
                path="/vendor-dashboard" 
                element={userRole === 'vendor' ? <VendorDashboard /> : <Navigate to={getDefaultDashboard()} replace />} 
              />
              <Route 
                path="/vendor-services" 
                element={userRole === 'vendor' ? <VendorList /> : <Navigate to={getDefaultDashboard()} replace />} 
              />
              <Route 
                path="/add-service" 
                element={userRole === 'vendor' ? <AddService /> : <Navigate to={getDefaultDashboard()} replace />} 
              />

              {/* ADMIN ROUTES */}
              <Route 
                path="/admin-dashboard" 
                element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to={getDefaultDashboard()} replace />} 
              />
              <Route 
                path="/admin-feedback" 
                element={userRole === 'admin' ? <AdminFeedback /> : <Navigate to={getDefaultDashboard()} replace />} 
              />

              <Route path="*" element={<Navigate to={getDefaultDashboard()} replace />} />
            </Route>
          </Routes>
        </Sidebar>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} /> 
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;