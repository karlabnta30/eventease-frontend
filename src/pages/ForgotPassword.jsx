import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const partyImages = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80"
];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/forgot-password', { email });
      setMessage(response.data.message || 'Reset code sent to your email.');
      if (response.data.debug_code) {
        console.log("Debug Reset Code:", response.data.debug_code);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Email not found or failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/reset-password', {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation
      });

      toast.success(response.data.message || 'Password reset successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
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
      fontSize: isMobile ? '1.6rem' : '2.2rem',
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
            <button onClick={() => navigate('/')} style={styles.backArrowBtn}>
              <ChevronLeft size={18} color="#ffffff" /> Back to Login
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
            <div style={styles.brandHeader}>
              <h1 style={dynamicStyles.headingTitle}>Reset Password</h1>
              <p style={styles.subtitle}>
                {step === 1 ? 'Enter your registered email to receive a verification code.' : 'Enter the code sent to your email and set a new password.'}
              </p>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {message && <div style={styles.successBox}>{message}</div>}

            {step === 1 ? (
              <form onSubmit={handleRequestCode} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <div style={styles.inputContainer}>
                    <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                    <input 
                      type="email" 
                      required 
                      style={styles.inputField} 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Sending Code...' : 'Send Reset Code'} <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Verification Code</label>
                  <div style={styles.inputContainer}>
                    <KeyRound size={18} color="#94a3b8" style={styles.inputIcon} />
                    <input 
                      type="text" 
                      required 
                      style={styles.inputField} 
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>New Password</label>
                  <div style={styles.inputContainer}>
                    <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                    <input 
                      type="password" 
                      required 
                      style={styles.inputField} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <div style={styles.inputContainer}>
                    <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                    <input 
                      type="password" 
                      required 
                      style={styles.inputField} 
                      placeholder="••••••••"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                  {loading ? 'Updating Password...' : 'Reset Password'} <CheckCircle2 size={18} />
                </button>
              </form>
            )}

            <div style={styles.footerText}>
              <Link to="/" style={styles.backLink}>Back to Login</Link>
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
  },
  brandHeader: { marginBottom: '20px' },
  subtitle: { color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', margin: 0, fontWeight: '600' },
  errorBox: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '16px', border: '1px solid #fecaca' },
  successBox: { backgroundColor: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600', marginBottom: '16px', border: '1px solid #a7f3d0' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  inputContainer: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '16px' },
  inputField: { width: '100%', padding: '12px 16px 12px 46px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontWeight: '500', color: '#0f172a' },
  submitBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px', boxSizing: 'border-box', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)' },
  footerText: { textAlign: 'center', marginTop: '20px' },
  backLink: { color: '#0f172a', fontWeight: '900', fontSize: '0.85rem', textDecoration: 'none' }
};

export default ForgotPassword;