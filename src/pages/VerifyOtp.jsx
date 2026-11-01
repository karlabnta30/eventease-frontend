import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { ShieldCheck, ArrowRight, RefreshCw, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const partyImages = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80"
];

// --- SUCCESS POPUP MODAL ---
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      backdropFilter: 'blur(8px)', padding: '20px', boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#fff', padding: '35px 25px', borderRadius: '28px',
        textAlign: 'center', maxWidth: '420px', width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0',
        boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '50px', marginBottom: '12px' }}>✨</div>
        <h2 style={{ 
          color: '#0f172a', fontSize: '1.6rem', fontWeight: '900', 
          letterSpacing: '-1px', marginBottom: '10px', fontFamily: "'Inter', sans-serif"
        }}>
          Account Verified!
        </h2>
        <p style={{ 
          color: '#64748b', lineHeight: '1.5', marginBottom: '24px', 
          fontSize: '0.95rem', fontWeight: '500', fontFamily: "'Inter', sans-serif"
        }}>
          Your email has been successfully verified. You can now sign in to your EventEase account.
        </p>
        <button 
          onClick={onClose}
          style={{
            background: '#10b981', color: '#fff', border: 'none',
            padding: '14px 0', borderRadius: '14px', fontWeight: '900',
            cursor: 'pointer', width: '100%', fontSize: '0.95rem',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
            fontFamily: "'Inter', sans-serif"
          }}
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
  const [resending, setResending] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      await api.post('/verify-otp', {
        email,
        otp
      });

      localStorage.removeItem('regEmail'); 
      setIsModalOpen(true); 
    } catch (error) {
      console.error("Verification error:", error.response?.data);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email address is missing.");
      return;
    }

    setResending(true);
    try {
      const response = await api.post('/send-otp', { email });
      
      if (response.data.debug_otp) {
        console.log("TESTING MODE - NEW RESENT OTP IS:", response.data.debug_otp);
      }
      toast.success("New verification code sent to your email!");
    } catch (error) {
      console.error("Resend error:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const dynamicStyles = {
    pageContainer: {
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f8fafc',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: isMobile ? '12px' : '40px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    },
    cardWrapper: {
      display: 'flex',
      width: '100%',
      maxWidth: isMobile ? '400px' : '1100px',
      height: isMobile ? 'auto' : '680px',
      minHeight: isMobile ? '580px' : 'unset',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: '36px',
      boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      position: 'relative',
      zIndex: 2,
      flexDirection: isMobile ? 'column' : 'row'
    },
    leftCardSection: {
      display: isMobile ? 'none' : 'flex',
      flex: '1.1',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#0f172a',
      borderRadius: '28px',
      margin: '12px',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '30px 40px',
      boxSizing: 'border-box'
    },
    rightCardSection: {
      flex: '1.2',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '32px 24px' : '30px 60px',
      boxSizing: 'border-box',
      backgroundColor: 'transparent',
      width: '100%',
      justifyContent: 'center'
    },
    rightTopBar: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginBottom: isMobile ? '20px' : '30px'
    },
    headingTitle: {
      fontSize: isMobile ? '1.6rem' : '2rem',
      fontWeight: '900',
      color: '#0f172a',
      margin: '0 0 6px 0',
      letterSpacing: '-1.5px'
    }
  };

  return (
    <div style={dynamicStyles.pageContainer}>
      
      {/* SHOPIFY-STYLE DIAGONAL BACKGROUND MARQUEE ANIMATION */}
      <div className="shopify-bg-wrapper" style={{
        position: 'fixed',
        inset: '-50px',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '30px',
        opacity: '0.18',
        transform: 'rotate(-6deg) scale(1.2)'
      }}>
        <div className="diagonal-track" style={{ display: 'flex', gap: '30px', width: 'max-content', animation: 'diagonalMarquee 35s linear infinite' }}>
          {[...partyImages, ...partyImages, ...partyImages, ...partyImages].map((img, index) => (
            <div key={index} style={{ width: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <img src={img} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
        <div className="diagonal-track" style={{ display: 'flex', gap: '30px', width: 'max-content', animation: 'diagonalMarquee 40s linear infinite reverse' }}>
          {[...partyImages, ...partyImages, ...partyImages, ...partyImages].map((img, index) => (
            <div key={index} style={{ width: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <img src={img} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => navigate('/login')} 
      />

      <div style={dynamicStyles.cardWrapper}>
        
        {/* Left Side: Artwork Box */}
        <div style={dynamicStyles.leftCardSection}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${partyImages[0]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          <div style={styles.imageOverlay} />
          
          <div style={styles.leftTopBar}>
            <button onClick={() => navigate('/register')} style={styles.backArrowBtn}>
              <ChevronLeft size={18} color="#ffffff" /> Back to Register
            </button>
            <span style={styles.selectedWorks}></span>
          </div>

          <div style={styles.leftBottomProfile}>
            <div style={styles.profileAvatar}>
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#000' }}>EV</span>
            </div>
            <div>
              <div style={styles.profileName}>EventEase</div>
              <div style={styles.profileSub}>Event Management System</div>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Form Section */}
        <div style={dynamicStyles.rightCardSection}>
          <div style={dynamicStyles.rightTopBar}>
            <div style={styles.logoGroup} onClick={() => navigate('/')}>
              <div style={styles.logoBadge}></div>
              <span style={styles.brandTitle}>EventEase</span>
            </div>
          </div>

          <div style={styles.formContentArea}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid #e2e8f0' }}>
                <ShieldCheck size={24} color="#10b981" />
              </div>
              <h2 style={dynamicStyles.headingTitle}>Check Your Email</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0, wordBreak: 'break-word', fontWeight: '500' }}>
                We’ve sent a 6-digit verification code to <strong style={{ color: '#0f172a' }}>{email || 'your email'}</strong>. Enter it below to activate your account.
              </p>
            </div>

            <form onSubmit={handleVerify}>
              <input 
                type="text" 
                maxLength="6"
                placeholder="123456" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                style={{ width: '100%', padding: '14px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '1.2rem', fontWeight: '800', textAlign: 'center', letterSpacing: '6px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#0f172a' }}
              />

              <button 
                type="submit" 
                disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#10b981', color: 'white', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', boxSizing: 'border-box', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)' }}
              >
                {loading ? 'VERIFYING...' : 'VERIFY CODE'} <ArrowRight size={18} />
              </button>
            </form>

            <div style={{ textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 min 6px 0', fontWeight: '600' }}>Didn't receive the code?</p>
              <button 
                onClick={handleResendCode}
                disabled={resending}
                style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
                {resending ? 'RESENDING...' : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(7,11,25,0.85) 0%, rgba(7,11,25,0.3) 50%, rgba(7,11,25,0.1) 100%)',
    zIndex: 2
  },
  leftTopBar: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backArrowBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: 0
  },
  selectedWorks: {
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  leftBottomProfile: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  profileName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '0.9rem'
  },
  profileSub: {
    color: '#94a3b8',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  logoBadge: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(16,185,129,0.5)'
  },
  brandTitle: {
    fontSize: '1.1rem',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.5px',
    textTransform: 'uppercase'
  },
  formContentArea: {
    maxWidth: '380px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
};

export default VerifyOtp;