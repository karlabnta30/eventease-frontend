import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';

const PublicCatalog = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch live services/bundles from your Laravel backend API connected to Aiven
    axios.get('https://eventease-backend-v9za.onrender.com/api/services') 
      .then(response => {
        setServices(response.data.data || response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching public catalog from Aiven database:', error);
        setLoading(false);
      });
  }, []);

  const galleryImages = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80"
  ];

  // Filter services dynamically as the user types in the search bar
  const filteredServices = services.filter(service => {
    const term = searchTerm.toLowerCase();
    const name = (service.bundle_name || service.business_name || service.name || '').toLowerCase();
    const category = (service.category || '').toLowerCase();
    const description = (service.description || '').toLowerCase();
    
    return name.includes(term) || category.includes(term) || description.includes(term);
  });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a', fontFamily: "'Inter', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      
      {/* 🌟 SHOPIFY-STYLE DIAGONAL BACKGROUND GALLERY */}
      <div className="shopify-bg-wrapper" style={{
        position: 'fixed',
        inset: '-50px',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '30px',
        opacity: '0.18',
        transform: 'rotate(-6deg) scale(1.2)'
      }}>
        <div className="diagonal-track" style={{ display: 'flex', gap: '30px', width: 'max-content', animation: 'diagonalMarquee 35s linear infinite' }}>
          {[...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages].map((img, index) => (
            <div key={index} style={{ width: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <img src={img} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
        <div className="diagonal-track" style={{ display: 'flex', gap: '30px', width: 'max-content', animation: 'diagonalMarquee 40s linear infinite reverse' }}>
          {[...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages].map((img, index) => (
            <div key={index} style={{ width: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <img src={img} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Style Injector for Mobile Media Queries */}
      <style>{`
        @media (max-width: 768px) {
          .catalog-nav {
            padding: 15px 20px !important;
            flex-direction: column;
            gap: 15px;
          }
          .catalog-container {
            padding: 0 20px !important;
            margin: 20px auto !important;
          }
          .catalog-title {
            font-size: 2rem !important;
          }
          .catalog-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Main Container Layer */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Top Navbar */}
        <nav className="catalog-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            EVENTEASE
          </h2>
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
        <div className="catalog-container" style={{ maxWidth: '1300px', margin: '40px auto', padding: '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '40px 20px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
            <h1 className="catalog-title" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px', color: '#0f172a' }}>Public Service Catalog</h1>
            <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>Browse available professional packages, services, and event bundles curated by our verified vendors.</p>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder="Search catalog by service name, vendor, category, or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: '600px', padding: '14px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '0.95rem', outline: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '600' }}>Loading available services from Aiven database...</div>
          ) : filteredServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '600' }}>No services found matching your search.</div>
          ) : (
            <div className="catalog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {filteredServices.map(service => (
                <div key={service.id || service.bundle_id} style={{ position: 'relative' }}>
                  <ServiceCard service={service} />
                  {/* Overlay layer prompting login to book */}
                  <div 
                    style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} 
                    onClick={() => navigate('/login')} 
                    title="Log in to book this service" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicCatalog;