import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

// --- SUCCESS MODAL ---
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(6px)' 
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '24px',
        textAlign: 'center', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>📩</div>
        <h2 style={{ color: '#000', fontSize: '1.8rem', fontWeight: 'bold' }}>Feedback Sent!</h2>
        <p style={{ color: '#000', lineHeight: '1.6', marginBottom: '30px', fontWeight: '500' }}>
          Thank you for helping us improve. Your feedback and targeted vendor notice have been recorded successfully.
        </p>
        <button 
          onClick={onClose}
          style={{
            background: '#000', color: 'white', border: 'none',
            padding: '15px 40px', borderRadius: '12px', fontWeight: 'bold',
            cursor: 'pointer', width: '100%', fontSize: '1rem'
          }}
        >
          BACK TO HOME
        </button>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [userName, setUserName] = useState(''); 
  const [formData, setFormData] = useState({
    subject: '',
    vendor_email: '', // Added targeted vendor email field as requested by TA notes
    message: ''
  });

  // Comprehensive User Detection Fix
  useEffect(() => {
    const keys = ['user', 'userData', 'authUser', 'profile', 'username'];
    let foundName = '';

    for (const key of keys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          foundName = (parsed.user?.name) || parsed.name || parsed.first_name || parsed.userName || parsed.username;
          if (foundName) break;
        } catch (e) {
          if (typeof stored === 'string' && stored.length < 50) foundName = stored;
        }
      }
    }
    setUserName(foundName || 'User');
  }, []);

  const styles = {
    container: { display: 'flex', height: 'calc(100vh - 80px)', fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff' },
    leftPanel: { 
        flex: '0 0 45%', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80")', 
        backgroundSize: 'cover', backgroundPosition: 'center' 
    },
    overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(255, 255, 255, 0.05)', zIndex: 1 },
    heroTitle: { position: 'relative', zIndex: 2, fontSize: '5rem', fontWeight: '900', color: '#000000', letterSpacing: '-3px', textTransform: 'lowercase' },
    rightPanel: { 
        flex: '1', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '0 10% 0 12%',
        overflowY: 'auto'
    },
    label: { fontSize: '0.85rem', fontWeight: '800', color: '#000000', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' },
    input: { width: '100%', padding: '14px 18px', margin: '0 0 20px 0', border: '2px solid #000000', borderRadius: '12px', fontSize: '1rem', outline: 'none', color: '#000000', backgroundColor: '#ffffff', boxSizing: 'border-box' },
    submitBtn: { width: '100%', padding: '16px', backgroundColor: '#000000', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      alert("Please enter a subject and your feedback.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/contact', formData);
      setIsSuccessOpen(true); 
      setFormData({ subject: '', vendor_email: '', message: '' });
    } catch (err) {
      alert("System error. Contact your Admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <SuccessModal isOpen={isSuccessOpen} onClose={() => navigate('/home')} />

      <div style={styles.leftPanel}>
        <div style={styles.overlay}></div>
        <h1 style={styles.heroTitle}>feedback.</h1>
      </div>

      <div style={styles.rightPanel}>
        <div style={{ maxWidth: '480px', width: '100%', margin: '40px 0' }}>
          <h2 style={{ color: '#000000', fontSize: '2.5rem', marginBottom: '12px', fontWeight: '900', letterSpacing: '-1.5px' }}>
            Hi {userName}, help us improve.
          </h2>
          <p style={{ color: '#000000', marginBottom: '35px', fontSize: '1.1rem', lineHeight: '1.5', fontWeight: '500' }}>
            Share your thoughts, report issues, or provide targeted feedback directly to a vendor.
          </p>
          
          <form onSubmit={handleSubmit}>
            <label style={styles.label}>Subject</label>
            <input 
              type="text" placeholder="What is this regarding?" style={styles.input} 
              value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />

            <label style={styles.label}>Vendor Email (Optional / Targeted Feedback)</label>
            <input 
              type="email" placeholder="vendor@example.com" style={styles.input} 
              value={formData.vendor_email} onChange={(e) => setFormData({ ...formData, vendor_email: e.target.value })}
            />

            <label style={styles.label}>Feedback / Message</label>
            <textarea 
              placeholder="Your message..." style={{ ...styles.input, height: '140px', resize: 'none' }}
              value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            ></textarea>
            
            <button 
              type="submit" disabled={loading}
              style={{ ...styles.submitBtn, backgroundColor: loading ? '#555' : '#000000' }}
            >
              {loading ? 'SENDING...' : 'SUBMIT FEEDBACK'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.8rem', color: '#000000', fontWeight: '800' }}>
            EVENT_EASE // ADAMSON UNIVERSITY 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;