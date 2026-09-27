import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard'; // Adjust path if needed

const PublicCatalog = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch your public services/bundles from your Laravel backend API
    axios.get('https://your-backend-url.onrender.com/api/services') // Update with your actual endpoint
      .then(response => {
        setServices(response.data.data || response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching public catalog:', error);
        setLoading(false);
      });
  }, []);

  const filteredServices = services.filter(service => 
    (service.bundle_name || service.business_name || service.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#0f172a', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', borderBottom: '1px solid #f1f5f9' }}>
        <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-0.5px' }}>EVENTEASE</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ backgroundColor: 'transparent', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/login')}
            style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: '1300px', margin: '40px auto', padding: '0 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px' }}>Public Service Catalog</h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Browse available professional packages, services, and event bundles curated by our verified vendors.</p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
          <input 
            type="text" 
            placeholder="Search catalog by service name, vendor, category, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '600px', padding: '14px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '600' }}>Loading available services from Aiven database...</div>
        ) : filteredServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '600' }}>No services found matching your search.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredServices.map(service => (
              <div key={service.id} style={{ position: 'relative' }}>
                <ServiceCard service={service} />
                {/* Overlay layer or handling so clicking prompts them to log in to book */}
                <div style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} onClick={() => navigate('/login')} title="Log in to book this service" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicCatalog;