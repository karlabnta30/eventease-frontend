import React, { useState, useEffect } from 'react';
import api from '../api';

const CreateBundleForm = ({ onBundleCreated }) => {
  const [bundleName, setBundleName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchVendorServices = async () => {
      try {
        const res = await api.get('/vendor/services');
        setAvailableServices(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error fetching vendor services", err);
      }
    };
    fetchVendorServices();
  }, []);

  const handleCheckboxChange = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/bundles', {
        bundle_name: bundleName,
        description,
        price,
        services: selectedServices
      });

      setMessage('Bundle created successfully!');
      setBundleName('');
      setDescription('');
      setPrice('');
      setSelectedServices([]);
      if (onBundleCreated) onBundleCreated(res.data.data);
    } catch (err) {
      console.error("Error creating bundle", err);
      setMessage(err.response?.data?.error || 'Failed to create bundle.');
    } finally {
      setLoading(false);
    }
  };

  const formStyle = { background: '#ffffff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '100%', margin: '20px 0', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.03)' };
  const inputStyle = { width: '100%', padding: '14px 16px', marginTop: '6px', marginBottom: '16px', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" };

  return (
    <div style={formStyle}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '18px', color: '#0f172a', letterSpacing: '-0.5px' }}>Create Service Bundle</h3>
      
      {message && <p style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '18px', fontWeight: '700', color: '#0f172a' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bundle Name</label>
          <input 
            type="text" 
            style={inputStyle} 
            value={bundleName} 
            onChange={(e) => setBundleName(e.target.value)} 
            placeholder="e.g. Ultimate Wedding Package" 
            required 
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
          <textarea 
            style={{ ...inputStyle, height: '100px', resize: 'vertical' }} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Describe what is included in this package..." 
          />
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Package Price (₱)</label>
          <input 
            type="number" 
            min="0"
            style={inputStyle} 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="Enter total bundle price..." 
            required 
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Included Services</label>
          <div style={{ maxHeight: '160px', overflowY: 'auto', border: '2px solid #f1f5f9', padding: '14px', borderRadius: '14px', background: '#f8fafc' }}>
            {availableServices.length > 0 ? (
              availableServices.map(service => (
                <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', marginBottom: '10px', cursor: 'pointer', fontWeight: '700', color: '#334155' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedServices.includes(service.id)} 
                    onChange={() => handleCheckboxChange(service.id)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0f172a' }}
                  />
                  <span>{service.service_name || service.title} <strong style={{ color: '#059669' }}>(₱{Number(service.price || 0).toLocaleString()})</strong></span>
                </label>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', margin: 0, fontWeight: '600' }}>No individual services found. Create services first.</p>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)' }}
        >
          {loading ? 'Creating Bundle...' : 'Publish Bundle'}
        </button>
      </form>
    </div>
  );
};

export default CreateBundleForm;