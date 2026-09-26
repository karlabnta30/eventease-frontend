import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, X, User, Mail, Phone, MapPin, Lock } from 'lucide-react';

const partyImages = [
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80", 
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80", 
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); 
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % partyImages.length);
    }, 8000); 

    return () => clearInterval(timer);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault(); 
    if (!acceptedTerms) return;

    setLoading(true);
    try {
      const response = await api.post('/register', {
        name,
        email,
        contact_number: contactNumber,
        address,
        password,
        role 
      });
      
      if (response.data.debug_otp && !response.data.error_details) {
        console.log("TESTING MODE - YOUR OTP IS:", response.data.debug_otp);
      }
      
      navigate('/verify-otp', { state: { email } });
      
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      
      const errorData = error.response?.data;
      let errorMsg = "Registration failed. Check console for details.";
      
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.errors) {
        errorMsg = Object.values(errorData.errors).flat().join('\n');
      } else if (errorData?.error_details) {
        errorMsg = `Email error: ${errorData.error_details}`;
      }
      
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      
      {/* SYNCHRONIZED FULL-PAGE BACKGROUND CAROUSEL */}
      {partyImages.map((img, index) => (
        <div 
          key={'bg-' + index}
          style={{
            ...styles.globalBackground,
            backgroundImage: `url(${img})`,
            opacity: index === currentImageIndex ? 1 : 0,
          }}
        />
      ))}
      <div style={styles.globalBackdropOverlay} />

      {/* CENTRAL CARD CONTAINER WITH MATCHING DESIGN AS LOGIN */}
      <div style={styles.cardWrapper}>
        
        {/* Left Side: Curved Artwork Box synchronized with the background */}
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
            <button onClick={() => navigate('/login')} style={styles.backArrowBtn}>
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
              <h1 style={styles.headingTitle}>Create Account</h1>
              <p style={styles.headingSub}>Join the EventEase Community</p>
            </div>

            <form onSubmit={handleRegister} autoComplete="off" style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <User size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input 
                    style={styles.inputField}
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input 
                    style={styles.inputField}
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    autoComplete="none"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <Phone size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input 
                    style={styles.inputField}
                    type="text" 
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Contact Number"
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <MapPin size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input 
                    style={styles.inputField}
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Home Address"
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.inputContainer}>
                  <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                  <input 
                    style={styles.inputField}
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
                <input 
                  type="checkbox" 
                  id="vendorCheck" 
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }}
                  onChange={(e) => setRole(e.target.checked ? 'vendor' : 'client')}
                />
                <label htmlFor="vendorCheck" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                  Join as a Vendor (I want to provide services/venues)
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }}
                />
                <label htmlFor="terms" style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
                  I accept the <span style={{ color: '#059669', cursor: 'pointer', textDecoration: 'underline', fontWeight: '800' }} onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>terms & conditions</span>*
                </label>
              </div>
              
              <button 
                type="submit" 
                style={styles.submitBtn}
                disabled={loading || !acceptedTerms}
                onMouseOver={(e) => { if (!loading && acceptedTerms) e.currentTarget.style.backgroundColor = '#059669'; }}
                onMouseOut={(e) => { if (!loading && acceptedTerms) e.currentTarget.style.backgroundColor = '#10b981'; }}
              >
                {loading ? 'SENDING OTP...' : 'CONTINUE'}
              </button>
            </form>

            <div style={styles.footerText}>
              <p>Already have an account? <Link to="/login" style={styles.signupLink}>Sign in</Link></p>
            </div>
          </div>
        </div>

      </div>

      {showTermsModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.header}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '900' }}>EventEase Terms & Conditions</h2>
              <button onClick={() => setShowTermsModal(false)} style={modalStyles.closeBtn}>
                <X size={20} />
              </button>
            </div>
            <div style={modalStyles.body}>
              <p><strong>1. Acceptance of Terms</strong><br />By creating an account and accessing EventEase, you agree to comply with and be bound by these terms and conditions.</p>
              <p><strong>2. User Accounts & Security</strong><br />You are responsible for maintaining the confidentiality of your password and account credentials. All activities under your account are your responsibility.</p>
              <p><strong>3. Vendor & Client Bookings</strong><br />EventEase acts as a platform connecting event clients with independent vendors. We facilitate scheduling, communications, and secure payment processing.</p>
              <p><strong>4. Privacy Policy</strong><br />Your personal data, contact information, and event data are securely stored and handled in accordance with data privacy guidelines.</p>
            </div>
            <div style={modalStyles.footer}>
              <button onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} style={modalStyles.acceptBtn}>
                I Understand & Accept
              </button>
            </div>
          </div>
        </div>
      )}
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
  globalBackground: {
    position: 'absolute',
    inset: '-30px',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(45px) brightness(0.4)',
    transition: 'opacity 1.5s ease-in-out',
    zIndex: 0
  },
  globalBackdropOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(7, 11, 25, 0.65)',
    zIndex: 1
  },
  cardWrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '1150px',
    height: '720px',
    backgroundColor: '#ffffff',
    borderRadius: '36px',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    position: 'relative',
    zIndex: 2
  },
  leftCardSection: {
    flex: '1.1',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#070b19',
    borderTopLeftRadius: '28px',
    borderBottomLeftRadius: '28px',
    borderTopRightRadius: '160px',
    borderBottomRightRadius: '28px',
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
  rightCardSection: {
    flex: '1.2',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 50px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    overflowY: 'auto'
  },
  rightTopBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
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
    marginBottom: '20px'
  },
  headingTitle: {
    fontSize: '2.1rem',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 4px 0',
    letterSpacing: '-1.5px'
  },
  headingSub: {
    color: '#64748b',
    fontSize: '0.85rem',
    margin: 0,
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
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
    padding: '12px 16px 12px 46px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '0.9rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontWeight: '500'
  },
  submitBtn: {
    marginTop: '8px',
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
    marginTop: '15px',
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

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '80vh'
  },
  header: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b'
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    fontSize: '0.9rem',
    color: '#334155',
    lineHeight: '1.6',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#f8fafc'
  },
  acceptBtn: {
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem'
  }
};

export default Register;