import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, MapPin, CheckCircle, ArrowLeft, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const BundleDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const service = state?.service;

  const [loading, setLoading] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');

  // Custom modal state replacing browser default alerts
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  if (!service) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <p className="text-gray-500 font-bold mb-4">No bundle information found.</p>
        <button onClick={() => navigate('/home')} style={{ background: '#000', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const hasVenueService = service.services && service.services.some(s => 
    (s.category && s.category.toLowerCase().includes('venue')) || 
    (s.service_name || s.name || '').toLowerCase().includes('venue')
  );

  const vendorBusinessName = service.vendor?.business_name || service.vendor?.name || service.business_name || 'Registered Vendor';

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const rawId = String(service.id).replace('bundle_', '');
      const venueLocation = hasVenueService ? 'Included in Venue Service' : (location || service.location || 'Manila');

      await axios.post('http://127.0.0.1:8000/api/bookings', {
        event_name: eventName || service.bundle_name,
        event_date: eventDate,
        location: venueLocation,
        budget: service.price,
        bundle_id: rawId,
        category: service.category || (service.services?.[0]?.category) || 'Bundle',
        vendor_id: service.vendor_id || service.vendor?.id || null,
        status: 'pending'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Booking Requested!',
        message: 'Bundle booked successfully! Waiting for vendor approval.'
      });
    } catch (error) {
      console.error("Booking error details:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to complete booking.";
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Booking Failed',
        message: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    const isSuccess = modalConfig.type === 'success';
    setModalConfig({ isOpen: false, type: 'success', title: '', message: '' });
    if (isSuccess) {
      navigate('/home');
    }
  };

  return (
    <div style={{ padding: '40px 10%', backgroundColor: '#fdfbfb', minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      
      {/* Custom Styled Notification / Alert Modal */}
      {modalConfig.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ 
              background: modalConfig.type === 'success' ? '#d1fae5' : '#fee2e2', 
              padding: '12px', borderRadius: '50%', width: 'fit-content', marginBottom: '16px' 
            }}>
              {modalConfig.type === 'success' ? (
                <CheckCircle2 size={24} color="#059669" />
              ) : (
                <AlertTriangle size={24} color="#ef4444" />
              )}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1a1a1a', margin: '0 0 8px 0' }}>
              {modalConfig.title}
            </h3>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              {modalConfig.message}
            </p>
            <button 
              onClick={handleCloseModal}
              style={modalConfig.type === 'success' ? styles.modalSuccessBtn : styles.modalErrorBtn}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px', color: '#64748b' }}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
        
        {/* Left Side: Detailed Bundle Information */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#059669', color: '#fff', padding: '6px 12px', borderRadius: '8px', width: 'fit-content', fontSize: '11px', fontWeight: 'bold', marginBottom: '15px' }}>
            <Package size={14} /> VENDOR BUNDLE PACKAGE
          </div>
          
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 10px 0' }}>{service.bundle_name || service.name}</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
            <MapPin size={16} /> {service.location || 'Available Nationwide'} • Offered by <strong style={{ color: '#0f172a' }}>{vendorBusinessName}</strong>
          </p>

          <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '1rem', marginBottom: '30px' }}>
            {service.description || "Comprehensive event package curated to provide top-tier professional services for your special occasion."}
          </p>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Package Inclusions:</h3>
            {service.services && service.services.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {service.services.map((s, idx) => (
                  <li key={idx} style={{ color: '#334155', fontWeight: '600', fontSize: '0.95rem' }}>
                    {s.service_name || s.name} <span style={{ color: '#059669', fontWeight: 'bold' }}>- ₱{Number(s.price || 0).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 italic">All included core vendor services bundled.</p>
            )}
          </div>
        </div>

        {/* Right Side: Booking Confirmation & Final Review Form */}
        <div style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Review & Book</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b', fontWeight: '600' }}>Total Package Price:</span>
            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669' }}>₱{Number(service.price || 0).toLocaleString()}</span>
          </div>

          <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Event Name</label>
              <input 
                type="text" 
                required 
                style={inputStyle} 
                placeholder="e.g., Sarah & Mark Wedding" 
                value={eventName} 
                onChange={(e) => setEventName(e.target.value)} 
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Event Date</label>
              <input 
                type="date" 
                required 
                style={inputStyle} 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
              />
            </div>

            {!hasVenueService && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Event Venue / Location</label>
                <input 
                  type="text" 
                  required={!hasVenueService} 
                  style={inputStyle} 
                  placeholder="e.g., Manila Hotel" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: '#000', color: '#fff', padding: '16px', borderRadius: '14px', 
                border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <CheckCircle size={18} /> {loading ? 'Submitting Request...' : 'Confirm & Request Booking'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', marginTop: '6px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' };

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalCard: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  modalSuccessBtn: { width: '100%', backgroundColor: '#059669', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' },
  modalErrorBtn: { width: '100%', backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }
};

export default BundleDetails;