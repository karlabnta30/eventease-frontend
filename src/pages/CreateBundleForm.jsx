import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { Search, Sparkles } from 'lucide-react';

const CreateBundleForm = ({ onBundleCreated }) => {
  const [bundleName, setBundleName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [minPax, setMinPax] = useState('15');
  const [maxPax, setMaxPax] = useState('100');
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  // Kalkulahin ang total price ng mga napiling serbisyo para sa Suggested Price feature
  const calculatedOriginalTotal = useMemo(() => {
    return selectedServices.reduce((sum, id) => {
      const s = availableServices.find(item => item.id === id);
      const itemPrice = s ? parseFloat(s.starting_price || s.price || 0) : 0;
      return sum + itemPrice;
    }, 0);
  }, [selectedServices, availableServices]);

  // I-filter ang mga serbisyo base sa search query ng vendor
  const filteredServices = useMemo(() => {
    if (!searchQuery) return availableServices;
    return availableServices.filter(s => {
      const name = (s.business_name || s.service_name || s.title || '').toLowerCase();
      const cat = (s.category || '').toLowerCase();
      return name.includes(searchQuery.toLowerCase()) || cat.includes(searchQuery.toLowerCase());
    });
  }, [availableServices, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const min = parseInt(minPax, 10);
    const max = parseInt(maxPax, 10);

    if (min > max) {
      setMessage('Error: Minimum Pax cannot be greater than Maximum Pax.');
      return;
    }
    if (min < 15 || max > 100) {
      setMessage('Error: Bundle guest capacity must be between 15 and 100 Pax.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/bundles', {
        bundle_name: bundleName,
        description,
        price,
        min_pax: min,
        max_pax: max,
        services: selectedServices
      });

      setMessage('Bundle created successfully!');
      setBundleName('');
      setDescription('');
      setPrice('');
      setMinPax('15');
      setMaxPax('100');
      setSelectedServices([]);
      setSearchQuery('');
      if (onBundleCreated) onBundleCreated(res.data.data);
    } catch (err) {
      console.error("Error creating bundle", err);
      setMessage(err.response?.data?.error || 'Failed to create bundle.');
    } finally {
      setLoading(false);
    }
  };

  const formStyle = { background: '#ffffff', padding: '0px', borderRadius: '0px', border: 'none', maxWidth: '100%', margin: '0', boxShadow: 'none' };
  const inputStyle = { width: '100%', padding: '14px 16px', marginTop: '6px', marginBottom: '16px', borderRadius: '12px', border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a', fontWeight: '700', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" };

  return (
    <div style={formStyle}>
      {message && <p style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '18px', fontWeight: '700', color: '#0f172a', wordBreak: 'break-word' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Bundle Name</label>
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
          <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Description</label>
          <textarea 
            style={{ ...inputStyle, height: '90px', resize: 'vertical' }} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Describe what is included in this package..." 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Package Price (₱)</label>
            <input 
              type="number" 
              min="0"
              style={inputStyle} 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="Total price..." 
              required 
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Min Pax (15)</label>
            <input 
              type="number" 
              min="15"
              max="100"
              style={inputStyle} 
              value={minPax} 
              onChange={(e) => setMinPax(e.target.value)} 
              placeholder="15" 
              required 
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Max Pax (100)</label>
            <input 
              type="number" 
              min="15"
              max="100"
              style={inputStyle} 
              value={maxPax} 
              onChange={(e) => setMaxPax(e.target.value)} 
              placeholder="100" 
              required 
            />
          </div>
        </div>

        {/* Live Suggested Price Indicator */}
        {selectedServices.length > 0 && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', color: '#166534' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} /> Original Total of Selected Services:
            </span>
            <span>₱{calculatedOriginalTotal.toLocaleString()}</span>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Included Services</label>
            <span style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: '800' }}>{selectedServices.length} Selected</span>
          </div>

          {/* Search Bar for Vendor Services */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search service name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.82rem', fontWeight: '600', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ maxHeight: '160px', overflowY: 'auto', border: '2px solid #f1f5f9', padding: '14px', borderRadius: '12px', background: '#f8fafc', boxSizing: 'border-box' }}>
            {filteredServices.length > 0 ? (
              filteredServices.map(service => {
                const sPrice = service.starting_price || service.price || 0;
                const sName = service.business_name || service.service_name || service.title;
                const sCat = service.category ? `[${service.category}] ` : '';
                return (
                  <label key={service.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.85rem', marginBottom: '10px', cursor: 'pointer', fontWeight: '700', color: '#334155', wordBreak: 'break-word' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedServices.includes(service.id)} 
                      onChange={() => handleCheckboxChange(service.id)} 
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0f172a', flexShrink: '0', marginTop: '1px' }}
                    />
                    <span>{sCat}{sName} <strong style={{ color: '#059669', whiteSpace: 'nowrap' }}>(₱{Number(sPrice).toLocaleString()})</strong></span>
                  </label>
                );
              })
            ) : (
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', margin: 0, fontWeight: '600' }}>No matching services found.</p>
            )}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)' }}
        >
          {loading ? 'Publishing Bundle...' : 'Publish Bundle'}
        </button>
      </form>
    </div>
  );
};

export default CreateBundleForm;