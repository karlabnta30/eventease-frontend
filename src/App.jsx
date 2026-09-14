import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import AboutPage from './pages/AboutPage'; 
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

function App() {
  const location = useLocation();
  const authPaths = ['/login', '/register', '/verify-otp', '/forgot-password']; 
  const isAuthPage = authPaths.includes(location.pathname);
  const isLandingView = location.pathname === '/';
  const userRole = localStorage.getItem('userRole');

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {!isAuthPage && <Navbar />} 

      {!isAuthPage && !isLandingView ? (
        <Sidebar>
          <Routes>
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
              element={userRole === 'client' ? <MainDashboard /> : <Navigate to="/vendor-dashboard" />} 
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
              element={userRole === 'vendor' ? <VendorDashboard /> : <Navigate to="/main-dashboard" />} 
            />
            <Route 
              path="/vendor-services" 
              element={userRole === 'vendor' ? <VendorList /> : <Navigate to="/main-dashboard" />} 
            />
            <Route 
              path="/add-service" 
              element={userRole === 'vendor' ? <AddService /> : <Navigate to="/main-dashboard" />} 
            />

            {/* ADMIN ROUTES */}
            <Route 
              path="/admin-dashboard" 
              element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/main-dashboard" />} 
            />
            <Route 
              path="/admin-feedback" 
              element={userRole === 'admin' ? <AdminFeedback /> : <Navigate to="/main-dashboard" />} 
            />

            <Route path="*" element={<Navigate to={userRole === 'admin' ? "/admin-dashboard" : (userRole === 'vendor' ? "/vendor-dashboard" : "/main-dashboard")} />} />
          </Routes>
        </Sidebar>
      ) : (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} /> 
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </>
  );
}

export default App;