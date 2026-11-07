import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { notifyServiceCreated } from '../toastUtils.jsx'; 
import { AlertCircle, ShieldCheck, Briefcase, Layers, UserCheck } from 'lucide-react';
import CreateBundleForm from '../components/CreateBundleForm';

const AddService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [paxError, setPaxError] = useState('');

  const [serviceData, setServiceData] = useState({
    business_name: '',
    category: '',
    location: '',
    starting_price: '',
    min_pax: '',
    max_pax: '',
    description: '',
    bio: '',
    terms_and_conditions: '50% downpayment required upon booking confirmation; remaining balance due on the event day.', 
    is_available: true 
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 960);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.verification_status === 'verified') {
          setIsVerified(true);
        }
      } catch (error) {
        console.error("Failed to check verification status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };
    checkVerification();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert("Only verified vendors are allowed to add a service.");
      return;
    }

    setPaxError('');
    const min = parseInt(serviceData.min_pax, 10);
    const max = parseInt(serviceData.max_pax, 10);

    // Pax validation checks (Min: 50, Max: 150, and checking if swapped)
    if (!isNaN(min) && !isNaN(max)) {
      if (min > max) {
        setPaxError("Error: Minimum Pax cannot be greater than Maximum Pax (looks like they were swapped).");
        return;
      }
      if (min < 50 || max > 150) {
        setPaxError("Note: Recommended guest capacity range is between 50 and 150 Pax.");
      }
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      await api.post('/vendors', serviceData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      notifyServiceCreated(`"${serviceData.business_name}" is now live!`);
      navigate('/vendor-list'); 

    } catch (error) {
      console.error("Backend Error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to add service.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return <div style={{ padding: '80px', textAlign: 'center', fontWeight: '800', color: '#64748b' }}>Verifying vendor credentials...</div>;
  }

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '50px 20px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Banner Header */}
      <div style={{ marginBottom: '35px', textAlign: 'center' }}>
        <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin: '0 0 10px 0', wordBreak: 'break-word' }}>
          Vendor Operations Hub
        </h1>
        <p style={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#64748b', fontWeight: '500', maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>
          Publish your standalone professional services and bundle packages to expand your reach across client bookings.
        </p>
      </div>

      {/* Side-by-side or stacked layout container */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Service Creator Form */}
        <div style={{ background: '#fff', padding: isMobile ? '24px 20px' : '40px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '16px', color: '#fff', flexShrink: 0 }}>
              <Briefcase size={22} />
            </div>
            <div>
              <h2 style={{ fontWeight: '900', fontSize: isMobile ? '1.2rem' : '1.4rem', color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>Add Standalone Service</h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>Configure your primary offering details</p>
            </div>
          </div>
          
          {/* Verification Warning Banner with Profile Redirect Button */}
          {!isVerified && (
            <div style={{ 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fde68a', 
              padding: '20px', 
              borderRadius: '16px', 
              marginBottom: '25px', 
              color: '#92400e', 
              fontSize: '0.85rem',
              lineHeight: '1.5',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                <AlertCircle size={20} style={{ flexShrink: '0', marginTop: '2px', color: '#d97706' }} />
                <div>
                  <strong>Verification Required:</strong> You must submit a valid identification document or business permit through your profile to publish services and unlock bundle creation.
                </div>
              </div>
              <button 
                onClick={() => navigate('/profile')}
                style={{ 
                  background: '#d97706', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '10px 16px', 
                  borderRadius: '10px', 
                  fontWeight: '800', 
                  fontSize: '0.8rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                <UserCheck size={16} /> Go to Profile to Submit ID / Permit
              </button>
            </div>
          )}

          {paxError && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              marginBottom: '20px', 
              color: '#991b1b', 
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{paxError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', opacity: isVerified ? 1 : 0.65 }}>
            <div>
              <label style={labelStyle}>Business / Service Name</label>
              <input 
                style={inputStyle} 
                type="text" 
                placeholder="e.g., Taylor's Gourmet Catering" 
                value={serviceData.business_name}
                onChange={(e) => setServiceData({...serviceData, business_name: e.target.value})} 
                disabled={!isVerified}
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select 
                  style={inputStyle} 
                  value={serviceData.category}
                  onChange={(e) => setServiceData({...serviceData, category: e.target.value})} 
                  disabled={!isVerified}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Catering">Catering</option>
                  <option value="Photography">Photography</option>
                  <option value="Venue">Venue</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Hosting">Hosting</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Location (City)</label>
                <input 
                  style={inputStyle} 
                  type="text" 
                  placeholder="e.g., Makati City" 
                  value={serviceData.location}
                  onChange={(e) => setServiceData({...serviceData, location: e.target.value})} 
                  disabled={!isVerified}
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Starting Price (₱)</label>
                <input 
                  style={inputStyle} 
                  type="number" 
                  placeholder="e.g., 15000" 
                  value={serviceData.starting_price}
                  onChange={(e) => setServiceData({...serviceData, starting_price: e.target.value})} 
                  disabled={!isVerified}
                  required 
                />
              </div>
              <div>
                <label style={labelStyle}>Min Pax (e.g. 50)</label>
                <input 
                  style={inputStyle} 
                  type="number" 
                  placeholder="50" 
                  value={serviceData.min_pax}
                  onChange={(e) => setServiceData({...serviceData, min_pax: e.target.value})} 
                  disabled={!isVerified}
                />
              </div>
              <div>
                <label style={labelStyle}>Max Pax (e.g. 150)</label>
                <input 
                  style={inputStyle} 
                  type="number" 
                  placeholder="150" 
                  value={serviceData.max_pax}
                  onChange={(e) => setServiceData({...serviceData, max_pax: e.target.value})} 
                  disabled={!isVerified}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Brief Description</label>
              <textarea 
                style={{...inputStyle, height: '90px', resize: 'vertical'}} 
                placeholder="Highlight your expertise, style, or equipment..." 
                value={serviceData.description}
                onChange={(e) => setServiceData({...serviceData, description: e.target.value})} 
                disabled={!isVerified}
              />
            </div>

            <div>
              <label style={labelStyle}>Terms & Conditions / Contract Agreement</label>
              <div style={{
                ...inputStyle, 
                backgroundColor: '#f8fafc', 
                color: '#475569', 
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                50% downpayment required upon booking confirmation; remaining balance due on the event day. (Fixed Policy)
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !isVerified}
              style={{ 
                background: !isVerified ? '#cbd5e1' : (loading ? '#475569' : '#0f172a'), 
                color: 'white', 
                padding: '16px', 
                borderRadius: '14px', 
                border: 'none', 
                fontWeight: '800', 
                fontSize: '0.95rem',
                letterSpacing: '0.5px',
                cursor: !isVerified || loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                boxShadow: isVerified ? '0 4px 14px rgba(15, 23, 42, 0.2)' : 'none',
                transition: 'all 0.2s',
                width: '100%'
              }}
            >
              {loading ? 'PUBLISHING...' : 'PUBLISH SERVICE'}
            </button>
          </form>
        </div>

        {/* Right Column: Bundle Creator Form (Conditional on Verification) */}
        <div style={{ 
          background: '#fff', 
          padding: isMobile ? '24px 20px' : '40px', 
          borderRadius: '28px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}>
          {!isVerified && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(6px)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: isMobile ? '20px' : '40px',
              boxSizing: 'border-box'
            }}>
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '50%', color: '#d97706', marginBottom: '16px', display: 'inline-flex' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>Bundle Creator Locked</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                You must achieve <strong>Verified Status</strong> by submitting a valid identification document via your profile to unlock service bundle creation and packaging.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ background: '#059669', padding: '12px', borderRadius: '16px', color: '#fff', flexShrink: 0 }}>
              <Layers size={22} />
            </div>
            <div>
              <h2 style={{ fontWeight: '900', fontSize: isMobile ? '1.2rem' : '1.4rem', color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>Bundle Maker</h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>Combine multiple services into a unified package</p>
            </div>
          </div>

          <div style={{ opacity: isVerified ? 1 : 0.4, pointerEvents: isVerified ? 'auto' : 'none' }}>
            <CreateBundleForm onBundleCreated={(newBundle) => console.log("Bundle created:", newBundle)} />
          </div>
        </div>

      </div>
    </div>
  );
};

const labelStyle = { 
  display: 'block', 
  fontSize: '0.78rem', 
  fontWeight: '800', 
  textTransform: 'uppercase', 
  color: '#475569', 
  marginBottom: '6px',
  letterSpacing: '0.5px' 
};

const inputStyle = { 
  width: '100%', 
  padding: '14px 16px', 
  border: '2px solid #e2e8f0', 
  borderRadius: '12px', 
  fontSize: '0.95rem', 
  fontWeight: '500', 
  backgroundColor: '#fff', 
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

export default AddService;