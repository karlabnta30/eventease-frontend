import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { Search, Sparkles } from 'lucide-react';

const CreateBundleForm = ({ onBundleCreated }) => {
  const [bundleName, setBundleName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
  }, [token]);

  const handleCheckboxChange = (serviceId) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const calculatedOriginalTotal = useMemo(() => {
    return selectedServices.reduce((sum, id) => {
      const s = availableServices.find(item => item.id === id);
      const itemPrice = s ? parseFloat(s.starting_price || s.price || 0) : 0;
      return sum + itemPrice;
    }, 0);
  }, [selectedServices, availableServices]);

  const filteredServices = useMemo(() => {
    if (!searchQuery) return availableServices;
    return availableServices.filter(s => {
      const name = (s.business_name || s.name || s.service_name || s.title || '').toLowerCase();
      const cat = (s.category || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase()) || cat.includes(searchQuery.toLowerCase());
    });
  }, [availableServices, searchQuery]);

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
      setSearchQuery('');
      if (onBundleCreated) onBundleCreated(res.data.data);
    } catch (err) {
      console.error("Error creating bundle", err);
      setMessage(err.response?.data?.error || err.response?.data?.message || 'Failed to create bundle.');
    } finally {
      setLoading(false);
    }
  };

  const formStyle = { background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', maxWidth: '100%', margin: '20px 0' };
  const inputStyle = { width: '100%', padding: '12px', marginTop: '6px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };

  return (
    <div style={formStyle}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '15px', color: '#0f172a' }}>Create Service Bundle</h3>
      
      {message && <p style={{ padding: '10px', background: message.includes('success') ? '#f0fdf4' : '#fef2f2', color: message.includes('success') ? '#166534' : '#991b1b', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '15px', fontWeight: '700' }}>{message}</p>}

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
            min="0"
            style={inputStyle} 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="Enter total bundle price..." 
            required 
          />
        </div>

        {selectedServices.length > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '10px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#166534' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} /> Original Total of Selected:
            </span>
            <span>₱{calculatedOriginalTotal.toLocaleString()}</span>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Select Included Services</label>
            <span style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: '800' }}>{selectedServices.length} Selected</span>
          </div>

          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search service name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.82rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', background: '#f8fafc' }}>
            {filteredServices.length > 0 ? (
              filteredServices.main || filteredServices.map ? filteredServices.map(service => {
                const sPrice = service.starting_price || service.price || 0;
                const sName = service.business_name || service.name || service.service_name || service.title || `Service #${service.id}`;
                const sCat = service.category ? `[${service.category}] ` : '';
                return (
                  <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', marginBottom: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedServices.includes(service.id)} 
                      onChange={() => handleCheckboxChange(service.id)} 
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0f172a', flexShrink: 0 }}
                    />
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      {sCat}{sName}
                    </span>
                    <span style={{ color: '#059669', fontWeight: '700', marginLeft: 'auto' }}>
                      (₱{Number(sPrice).toLocaleString()})
                    </span>
                  </label>
                );
              }) : null
            ) : (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No matching services found.</p>
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