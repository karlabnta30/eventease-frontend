import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowRight, Lock, Mail } from 'lucide-react';

const partyImages = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80", 
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80", 
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80", 
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80"  
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
    }, 10000); 

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', 
        { email, password },
        { headers: { 'Accept': 'application/json' } } 
      );

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role); 
        localStorage.setItem('userName', response.data.user.name);
        
        if (response.data.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (response.data.user.role === 'vendor') {
          navigate('/vendor-dashboard');
        } else {
          navigate('/main-dashboard');
        }
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Left Column: Enlarged containers and text/logo */}
      <div style={styles.leftColumn}>
        <div style={styles.formWrapper}>
          
          <div style={styles.brandHeader}>
            <h1 style={styles.title}>EventEase</h1>
            <p style={styles.subtitle}>Sign in to your EventEase Account</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputContainer}>
                <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
                <input 
                  type="email" 
                  required 
                  style={styles.inputField} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@gmail.com"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Password</label>
                <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div style={styles.inputContainer}>
                <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
                <input 
                  type="password" 
                  required 
                  style={styles.inputField} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'} <ArrowRight size={20} />
            </button>
          </form>

          <div style={styles.footerText}>
            <p>Don't have an Account yet? <Link to="/register" style={styles.signupLink}>Sign up</Link></p>
          </div>

        </div>
      </div>

      {/* Right Column: 10-Second Auto-Switching Party Background Carousel */}
      <div style={styles.rightColumn}>
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
        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>"The ultimate platform for bringing seamless event experiences to life."</p>
          <span style={styles.quoteAuthor}>EventEase Curated Collections</span>
        </div>
      </div>

    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#fafaf9',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden'
  },
  leftColumn: {
    flex: '1.1 1 520px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    backgroundColor: '#fff',
    zIndex: 2,
    boxShadow: '10px 0 30px rgba(0,0,0,0.02)'
  },
  formWrapper: {
    width: '100%',
    maxWidth: '460px',
    display: 'flex',
    flexDirection: 'column'
  },
  brandHeader: {
    marginBottom: '40px'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1.05rem',
    margin: 0
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '14px 18px',
    borderRadius: '14px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '20px',
    border: '1px solid #fca5a5'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '18px',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  inputField: {
    width: '100%',
    padding: '16px 18px 16px 52px',
    borderRadius: '16px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#f8fafc',
    fontSize: '1.05rem',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  forgotLink: {
    fontSize: '13px',
    color: '#7c3aed',
    textDecoration: 'none',
    fontWeight: '600'
  },
  submitBtn: {
    marginTop: '12px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '18px',
    borderRadius: '16px',
    fontWeight: 'bold',
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'background-color 0.2s',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)'
  },
  footerText: {
    textAlign: 'center',
    marginTop: '35px',
    color: '#64748b',
    fontSize: '0.95rem'
  },
  signupLink: {
    color: '#7c3aed',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  rightColumn: {
    flex: '1.6 1 650px',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000'
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
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)',
    zIndex: 2
  },
  quoteBox: {
    position: 'absolute',
    bottom: '60px',
    left: '60px',
    right: '60px',
    zIndex: 3,
    color: '#fff'
  },
  quoteText: {
    fontSize: '2rem',
    fontWeight: '800',
    lineHeight: '1.3',
    marginBottom: '12px',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  quoteAuthor: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#cbd5e1',
    letterSpacing: '0.05em',
    textTransform: 'uppercase'
  }
};

export default Login;