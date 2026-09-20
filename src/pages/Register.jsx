import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, X } from 'lucide-react';
import '../auth.css'; 

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
  
  const navigate = useNavigate();

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
      
      // Fallback helper for cloud environments where SMTP might be blocked
      if (response.data.debug_otp) {
        console.log("TESTING MODE - YOUR OTP IS:", response.data.debug_otp);
        alert(`Cloud SMTP blocked or email failed. Your test OTP is: ${response.data.debug_otp}`);
      }
      
      navigate('/verify-otp', { state: { email } });
      
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      
      // See exact validation errors in the console:
      console.log("Validation errors:", error.response?.data?.errors);

      const errorData = error.response?.data;
      let errorMsg = "Registration failed. Check console for details.";
      
      if (typeof errorData === 'string') {
        errorMsg = errorData;
      } else if (errorData?.message) {
        errorMsg = errorData.message;
      } else if (errorData?.errors) {
        errorMsg = Object.values(errorData.errors).flat().join('\n');
      }
      
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-screen">
      <div className="auth-form-side">
        <div className="form-content-wrapper">
          
          <div className="auth-nav-header-left">
            <button onClick={() => navigate('/login')} className="back-arrow-btn">
              <ChevronLeft size={20} />
            </button>
            <span className="section-title-small">CREATE ACCOUNT</span>
          </div>

          <div className="brand-header">
            <h1 className="eventease-logo">EventEase</h1>
            <p className="form-subtext">Join the EventEase Community</p>
          </div>

          <form onSubmit={handleRegister} autoComplete="off">
            <div className="input-field-group">
              <label>Full Name</label>
              <input 
                className="minimal-input"
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-field-group">
              <label>Email Address</label>
              <input 
                className="minimal-input"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="none"
              />
            </div>

            <div className="input-field-group">
              <label>Contact Number</label>
              <input 
                className="minimal-input"
                type="text" 
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
            </div>

            <div className="input-field-group">
              <label>Home Address</label>
              <input 
                className="minimal-input"
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="input-field-group">
              <label>Password</label>
              <input 
                className="minimal-input"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' }}>
              <input 
                type="checkbox" 
                id="vendorCheck" 
                style={{ width: 'auto', cursor: 'pointer' }}
                onChange={(e) => setRole(e.target.checked ? 'vendor' : 'client')}
              />
              <label htmlFor="vendorCheck" style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', cursor: 'pointer' }}>
                Join as a Vendor (I want to provide services/venues)
              </label>
            </div>

            <div className="terms-section">
              <div className="checkbox-row">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label htmlFor="terms">
                  I accept the <span style={{ color: '#7c3aed', cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>terms & conditions</span> of my EventEase account*
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="eventease-continue-btn" 
              disabled={loading || !acceptedTerms}
            >
              {loading ? 'SENDING OTP...' : 'CONTINUE'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login" className="signin-link">Sign in</Link></p>
          </div>
        </div>
      </div>

      <div className="auth-image-side party-aesthetic"></div>

      {showTermsModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <div style={modalStyles.header}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>EventEase Terms & Conditions</h2>
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