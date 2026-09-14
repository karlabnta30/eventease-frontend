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

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchVendorServices = async () => {
      try {
        const res = await api.get('/vendor/services', {
          headers: { Authorization: `Bearer ${token}` }
        });
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
      }, {
        headers: { Authorization: `Bearer ${token}` }
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

  const formStyle = { background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', maxWidth: '100%', margin: '20px 0' };
  const inputStyle = { width: '100%', padding: '12px', marginTop: '6px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };

  return (
    <div style={formStyle}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '15px', color: '#0f172a' }}>Create Service Bundle</h3>
      
      {message && <p style={{ padding: '10px', background: '#f1f5f9', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Bundle Name</label>
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
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Description</label>
          <textarea 
            style={{ ...inputStyle, height: '80px' }} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Describe what is included in this package..." 
          />
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Package Price (₱)</label>
          <input 
            type="number" 
            style={inputStyle} 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="Enter total bundle price..." 
            required 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>Select Included Services</label>
          <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', background: '#f8fafc' }}>
            {availableServices.length > 0 ? (
              availableServices.map(service => (
                <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', marginBottom: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedServices.includes(service.id)} 
                    onChange={() => handleCheckboxChange(service.id)} 
                  />
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>
                    {service.name || service.service_name || service.title || `Service #${service.id}`}
                  </span>
                  <span style={{ color: '#64748b' }}>
                    (₱{Number(service.price || 0).toLocaleString()})
                  </span>
                </label>
              ))
            ) : (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>No individual services found. Create services first.</p>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
        >
          {loading ? 'Creating Bundle...' : 'Publish Bundle'}
        </button>
      </form>
    </div>
  );
};

export default CreateBundleForm;