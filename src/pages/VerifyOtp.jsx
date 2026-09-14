import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// --- SUCCESS POPUP MODAL ---
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: '#fff', padding: '50px', borderRadius: '32px',
        textAlign: 'center', maxWidth: '450px', width: '90%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)', border: '1px solid #eee'
      }}>
        <div style={{ fontSize: '70px', marginBottom: '20px' }}>✨</div>
        <h2 style={{ 
          color: '#000', fontSize: '2.2rem', fontWeight: '900', 
          letterSpacing: '-1.5px', marginBottom: '15px', fontFamily: "'Inter', sans-serif"
        }}>
          Account Verified!
        </h2>
        <p style={{ 
          color: '#444', lineHeight: '1.6', marginBottom: '35px', 
          fontSize: '1.1rem', fontWeight: '500', fontFamily: "'Inter', sans-serif"
        }}>
          Your email has been successfully verified. You can now sign in to your EventEase account.
        </p>
        <button 
          onClick={onClose}
          style={{
            background: '#000', color: '#fff', border: 'none',
            padding: '18px 0', borderRadius: '14px', fontWeight: '800',
            cursor: 'pointer', width: '100%', fontSize: '1.1rem',
            transition: 'transform 0.2s', fontFamily: "'Inter', sans-serif"
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          SIGN IN
        </button>
      </div>
    </div>
  );
};

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || localStorage.getItem('regEmail') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  useEffect(() => {
    if (location.state?.email) {
      localStorage.setItem('regEmail', location.state.email);
    }
  }, [location.state]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email address is missing. Please register again.");
      navigate('/register');
      return;
    }
    if (!otp) {
      toast.error("Please enter the 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/auth/verify-otp', {
        email,
        otp
      });

      localStorage.removeItem('regEmail'); 
      setIsModalOpen(true); // Open the styled center modal on success
    } catch (error) {
      console.error("Verification error:", error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
      
      {/* Success Modal Component */}
      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => navigate('/login')} 
      />

      <div style={{ background: 'white', padding: '40px', borderRadius: '28px', border: '1px solid #f0f0f0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ background: '#f8fafc', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShieldCheck size={28} color="#2563eb" />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px', color: '#0f172a' }}>Check Your Email</h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', marginBottom: '25px' }}>
          We’ve sent a 6-digit verification code to <strong style={{ color: '#0f172a' }}>{email || 'your email'}</strong>. Enter it below to activate your account.
        </p>

        <form onSubmit={handleVerify}>
          <input 
            type="text" 
            maxLength="6"
            placeholder="123456" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            style={{ width: '100%', padding: '16px', border: '2px solid #e2e8f0', borderRadius: '14px', fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', letterSpacing: '8px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
          />

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: '#000', color: 'white', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? 'VERIFYING...' : 'VERIFY CODE'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;