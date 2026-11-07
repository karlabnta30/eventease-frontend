import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { notifyServiceCreated } from '../toastUtils.jsx'; 
import { AlertCircle, ShieldCheck, Briefcase, Layers, UserCheck, MapPin, Navigation } from 'lucide-react';
import CreateBundleForm from '../components/CreateBundleForm';

const AddService = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);
  const [paxError, setPaxError] = useState('');

  const [serviceData, setServiceData] = useState({
    business_name: '',
    category: '',
    location: 'Makati City', // Default initial location
    pin_x: 50, // Pin X percentage position (0-100)
    pin_y: 50, // Pin Y percentage position (0-100)
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

  // 1. Kapag nag-click sa mapa: Awtomatikong alamin ang lugar base sa quadrant at i-sync sa text box[cite: 12]
  const handleMapClick = (e) => {
    if (!isVerified) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Tukuyin ang lugar o siyudad base sa kung saang bahagi ng mapa pinindot
    let detectedLocation = 'Makati City';
    if (x < 40 && y < 40) detectedLocation = 'Quezon City';
    else if (x >= 40 && x <= 60 && y >= 40 && y <= 60) detectedLocation = 'Makati City';
    else if (x > 60 && y > 50) detectedLocation = 'BGC Taguig';
    else if (x < 50 && y > 50) detectedLocation = 'Pasay City';
    else if (x > 50 && y < 50) detectedLocation = 'Pasig City';

    setServiceData(prev => ({
      ...prev,
      pin_x: x,
      pin_y: y,
      location: detectedLocation
    }));
  };

  // 2. Kapag nag-type sa Text Box: Awtomatikong igagalaw ang pin sa tamang pwesto sa mapa[cite: 12]
  const handleLocationTextChange = (e) => {
    const val = e.target.value;
    let newX = serviceData.pin_x;
    let newY = serviceData.pin_y;

    const lowerVal = val.toLowerCase();
    if (lowerVal.includes('makati')) { newX = 50; newY = 50; }
    else if (lowerVal.includes('bgc') || lowerVal.includes('taguig')) { newX = 70; newY = 65; }
    else if (lowerVal.includes('quezon')) { newX = 30; newY = 25; }
    else if (lowerVal.includes('manila')) { newX = 35; newY = 50; }
    else if (lowerVal.includes('pasay')) { newX = 40; newY = 70; }
    else if (lowerVal.includes('pasig')) { newX = 65; newY = 35; }

    setServiceData(prev => ({
      ...prev,
      location: val,
      pin_x: newX,
      pin_y: newY
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      alert("Only verified vendors are allowed to add a service.");
      return;
    }

    setPaxError('');
    const min = parseInt(serviceData.min_pax, 10);
    const max = parseInt(serviceData.max_pax, 10);

    if (isNaN(min) || isNaN(max)) {
      setPaxError("Error: Please provide valid numbers for both Minimum and Maximum Pax.");
      return;
    }

    if (min > max) {
      setPaxError("Error: Minimum Pax cannot be greater than Maximum Pax.");
      return;
    }

    if (min < 15) {
      setPaxError("Error: Minimum Pax cannot be lower than 15.");
      return;
    }

    if (max > 100) {
      setPaxError("Error: Maximum Pax cannot exceed 100.");
      return;
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
                  <strong>Verification Required:</strong> You must submit a valid identification document or business permit through your profile to publish services.
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
                <label style={labelStyle}>Location (City / Address)</label>
                <input 
                  style={inputStyle} 
                  type="text" 
                  placeholder="e.g., Makati City o BGC Taguig" 
                  value={serviceData.location}
                  onChange={handleLocationTextChange} 
                  disabled={!isVerified}
                  required 
                />
              </div>
            </div>

            {/* 2-Way Synced Interactive Map Section */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} color="#2563eb" /> Interactive Map Pin (Click to Sync)[cite: 12]
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600' }}>2-Way Synced with Location Box</span>
              </div>

              {/* Map Preview Container */}
              <div 
                ref={mapRef}
                onClick={handleMapClick}
                style={{ 
                  height: '160px', 
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)', 
                  borderRadius: '12px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  cursor: isVerified ? 'crosshair' : 'not-allowed'
                }}
              >
                <div style={{ position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: 'radial-gradient(#0f172a 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
                
                {/* Synced Pin Element */}
                <div style={{ 
                  position: 'absolute', 
                  left: `${serviceData.pin_x}%`, 
                  top: `${serviceData.pin_y}%`, 
                  transform: 'translate(-50%, -100%)',
                  transition: 'left 0.25s ease, top 0.25s ease',
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 3
                }}>
                  <div style={{ background: '#ef4444', color: '#fff', padding: '6px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <Navigation size={15} />
                  </div>
                  <span style={{ background: '#0f172a', color: '#fff', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap', marginTop: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
                    {serviceData.location || 'Selected Area'}
                  </span>
                </div>

                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', color: '#0f172a' }}>
                  💡 I-click kahit saan sa mapa para ilipat ang pin at i-update ang location[cite: 12]
                </div>
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
                <label style={labelStyle}>Min Pax (Min: 15)</label>
                <input 
                  style={inputStyle} 
                  type="number" 
                  min="15"
                  max="100"
                  placeholder="15" 
                  value={serviceData.min_pax}
                  onChange={(e) => setServiceData({...serviceData, min_pax: e.target.value})} 
                  disabled={!isVerified}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Max Pax (Max: 100)</label>
                <input 
                  style={inputStyle} 
                  type="number" 
                  min="15"
                  max="100"
                  placeholder="100" 
                  value={serviceData.max_pax}
                  onChange={(e) => setServiceData({...serviceData, max_pax: e.target.value})} 
                  disabled={!isVerified}
                  required
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