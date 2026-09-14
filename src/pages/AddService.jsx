import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { notifyServiceCreated } from '../toastUtils.jsx'; 
import { AlertCircle, ShieldCheck, Sparkles, Briefcase, Layers } from 'lucide-react';
import CreateBundleForm from '../components/CreateBundleForm';

const AddService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [serviceData, setServiceData] = useState({
    business_name: '',
    category: '',
    location: '',
    starting_price: '',
    description: '',
    bio: '',
    terms_and_conditions: '', 
    is_available: true 
  });

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/user', {
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

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://127.0.0.1:8000/api/vendors', serviceData, {
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
    <div style={{ padding: '50px 20px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Top Banner Header */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-1px', margin: '0 0 10px 0' }}>
          Vendor Operations Hub
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500', maxWidth: '600px', margin: '0 auto' }}>
          Publish your standalone professional services and bundle packages to expand your reach across client bookings.
        </p>
      </div>

      {/* Side-by-side layout container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '35px', alignItems: 'start' }}>
        
        {/* Left Column: Service Creator Form */}
        <div style={{ background: '#fff', padding: '40px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ background: '#0f172a', padding: '12px', borderRadius: '16px', color: '#fff' }}>
              <Briefcase size={22} />
            </div>
            <div>
              <h2 style={{ fontWeight: '900', fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Add Standalone Service</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>Configure your primary offering details</p>
            </div>
          </div>
          
          {!isVerified && (
            <div style={{ 
              backgroundColor: '#fffbeb', 
              border: '1px solid #fde68a', 
              padding: '20px', 
              borderRadius: '16px', 
              marginBottom: '25px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '14px', 
              color: '#92400e', 
              fontWeight: '600',
              fontSize: '0.9rem',
              lineHeight: '1.5'
            }}>
              <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
              <span><strong>Verification Required:</strong> You must have a verified business permit to publish services. Bundle creation is also locked until verification is approved.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', opacity: isVerified ? 1 : 0.65 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
              <textarea 
                style={{...inputStyle, height: '100px', resize: 'vertical'}} 
                placeholder="e.g., 50% downpayment required upon booking confirmation..." 
                value={serviceData.terms_and_conditions}
                onChange={(e) => setServiceData({...serviceData, terms_and_conditions: e.target.value})} 
                disabled={!isVerified}
              />
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
                fontSize: '1rem',
                letterSpacing: '0.5px',
                cursor: !isVerified || loading ? 'not-allowed' : 'pointer',
                marginTop: '10px',
                boxShadow: isVerified ? '0 4px 14px rgba(15, 23, 42, 0.2)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'PUBLISHING...' : 'PUBLISH SERVICE'}
            </button>
          </form>
        </div>

        {/* Right Column: Bundle Creator Form (Conditional on Verification) */}
        <div style={{ 
          background: '#fff', 
          padding: '40px', 
          borderRadius: '28px', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {!isVerified && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(6px)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItem: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '50%', color: '#d97706', marginBottom: '16px', display: 'inline-flex' }}>
                <ShieldCheck size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>Bundle Creator Locked</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
                You must achieve <strong>Verified Status</strong> by uploading a valid business permit to unlock service bundle creation and packaging.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ background: '#059669', padding: '12px', borderRadius: '16px', color: '#fff' }}>
              <Layers size={22} />
            </div>
            <div>
              <h2 style={{ fontWeight: '900', fontSize: '1.4rem', color: '#0f172a', margin: 0 }}>Bundle Maker</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0 0' }}>Combine multiple services into a unified package</p>
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
  fontSize: '0.8rem', 
  fontWeight: '800', 
  textTransform: 'uppercase', 
  color: '#475569', 
  marginBottom: '8px',
  letterSpacing: '0.5px' 
};

const inputStyle = { 
  width: '100%', 
  padding: '14px 16px', 
  border: '2px solid #e2e8f0', 
  borderRadius: '12px', 
  fontSize: '0.95icon', 
  fontWeight: '500', 
  backgroundColor: '#fff', 
  color: '#0f172a',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s'
};

export default AddService;