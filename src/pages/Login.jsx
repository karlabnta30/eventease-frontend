import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const partyImages = [
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80", 
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80", 
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % partyImages.length);
    }, 8000); 

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password });

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role); 
        localStorage.setItem('userName', response.data.user.name);
        
        if (response.data.user.role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else if (response.data.user.role === 'vendor') {
          navigate('/vendor-dashboard', { replace: true });
        } else {
          navigate('/main-dashboard', { replace: true });
        }
      } else if (response.data.requires_verification) {
        navigate('/verify-otp', { state: { email } });
      } else {
        setError('Login response did not return a valid session token.');
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* BACKGROUND ARTWORK BLUR/MATCH THAT EXTENDS OUTSIDE THE CARD */}
      {partyImages.map((img, index) => (
        <div 
          key={'bg-' + index}
          style={{
            ...styles.globalBackgroundMatch,
            backgroundImage: `url(${img})`,
            opacity: index === currentImageIndex ? 0.35 : 0,
          }}
        />
      ))}
      <div style={styles.globalBackdropOverlay} />

      <div style={styles.cardWrapper}>
        
        {/* Left Side: Curved Artwork Box synchronized with carousel */}
        <div style={styles.leftCardSection}>
          {partyImages.map((img, index) => (
            <div 
              key={index}
              style={{
                ...styles.carouselImage,
                backgroundImage: `url(${img})`,
                opacity: index === currentImageIndex ? 1 : 0,
              }}
            />
          ))}
          <div style={styles.imageOverlay} />
          
          <div style={styles.leftTopBar}>
            <span style={styles.selectedWorks}>Selected Works</span>
            <div style={styles.leftNavActions}>
              <Link to="/register" style={styles.navLinkText}>Sign Up</Link>
              <button style={styles.joinUsBtn} onClick={() => navigate('/register')}>Join Us</button>
            </div>
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
        <div style={styles.rightCardSection}>
          <div style={styles.rightTopBar}>
            <div style={styles.logoGroup} onClick={() => navigate('/')}>
              <div style={styles.logoBadge}></div>
              <span style={styles.brandTitle}>EventEase</span>
            </div>
            <div style={styles.langSelector}>EN ▾</div>
          </div>

          <div style={styles.formContentArea}>
            <div style={styles.welcomeHeader}>
              <h1 style={styles.headingTitle}>Hi Planner</h1>
              <p style={styles.headingSub}>Welcome to EventEase</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input 
                    type="email" 
                    required 
                    style={styles.inputField} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input 
                    type="password" 
                    required 
                    style={styles.inputField} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={styles.submitBtn}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                {loading ? 'SIGNING IN...' : 'Login'}
              </button>
            </form>

            <div style={styles.footerText}>
              <p>Don't have an account? <Link to="/register" style={styles.signupLink}>Sign up</Link></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#070b19',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    padding: '40px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
  },
  globalBackgroundMatch: {
    position: 'absolute',
    inset: '-20px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(35px) brightness(0.6)',
    transition: 'opacity 1.5s ease-in-out',
    zIndex: 0
  },
  globalBackdropOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(7, 11, 25, 0.45)',
    zIndex: 1
  },
  cardWrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '1100px',
    height: '680px',
    backgroundColor: '#ffffff',
    borderRadius: '36px',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    zIndex: 2
  },
  leftCardSection: {
    flex: '1.1',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#070b19',
    borderRadius: '28px',
    margin: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '30px 40px',
    boxSizing: 'border-box'
  },
  carouselImage: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'opacity 1.5s ease-in-out',
    zIndex: 1
  },
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
  selectedWorks: {
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  leftNavActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  navLinkText: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  joinUsBtn: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.4)',
    padding: '8px 20px',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
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
  rightCardSection: {
    flex: '1.2',
    display: 'flex',
    flexDirection: 'column',
    padding: '30px 60px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff'
  },
  rightTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px'
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
  langSelector: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#64748b',
    cursor: 'pointer'
  },
  formContentArea: {
    maxWidth: '380px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1
  },
  welcomeHeader: {
    marginBottom: '30px'
  },
  headingTitle: {
    fontSize: '2.4rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 6px 0',
    letterSpacing: '-1.5px'
  },
  headingSub: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: 0,
    fontWeight: '600'
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '10px 14px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '16px',
    border: '1px solid #fecaca'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  inputField: {
    width: '100%',
    padding: '14px 16px 14px 46px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: '500'
  },
  forgotLink: {
    fontSize: '0.75rem',
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '700'
  },
  submitBtn: {
    marginTop: '10px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '14px',
    fontWeight: '900',
    fontSize: '0.9rem',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
    transition: 'background-color 0.2s ease'
  },
  footerText: {
    textAlign: 'center',
    marginTop: '25px',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  signupLink: {
    color: '#0f172a',
    fontWeight: '900',
    textDecoration: 'none'
  }
};

export default Login;