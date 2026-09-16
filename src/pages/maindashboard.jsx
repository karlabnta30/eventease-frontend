import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './dashboard.css'; 
import ServiceCard from '../components/ServiceCard';
import { notifyNewBooking } from '../toastUtils.jsx'; 
import { AlertTriangle, Loader2, CheckCircle, ShoppingBag, Trash2, Plus, ArrowRight, Calendar, Layers, Wrench, Package } from 'lucide-react';

const MainDashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  
  const [services, setServices] = useState([]); 
  const [myBookings, setMyBookings] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Catalog tab filter state ('all', 'service', 'bundle')
  const [activeTab, setActiveTab] = useState('all');

  // --- HERO BANNER SLIDESHOW STATES ---
  const heroImages = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80'
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(slideInterval);
  }, []);

  // --- BUNDLE ARCHITECT STATES ---
  const [architectItems, setArchitectItems] = useState([]);
  const [bundleName, setBundleName] = useState('My Custom Event Blueprint');
  const [isSavingBundle, setIsSavingBundle] = useState(false);

  // Custom confirmation modal state
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const endpoint = userRole === 'vendor' ? 'http://127.0.0.1:8000/api/vendor/services' : 'http://127.0.0.1:8000/api/vendors';
      
      const servicesRes = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let allServices = [];

      if (userRole === 'vendor') {
        const vendorServicesList = servicesRes.data.data || servicesRes.data || [];
        vendorServicesList.forEach(service => {
          allServices.push({
            ...service,
            type: 'service',
            business_name: service.vendor?.business_name || service.business_name || 'My Business',
            location: service.location || 'Manila'
          });
        });
      } else {
        const vendorList = servicesRes.data.data || servicesRes.data || [];
        
        vendorList.forEach(vendor => {
          const vendorServices = vendor.services || vendor.vendor_services || vendor.offerings || [];
          if (Array.isArray(vendorServices) && vendorServices.length > 0) {
            vendorServices.forEach(service => {
              allServices.push({
                ...service,
                type: 'service',
                business_name: vendor.name || vendor.business_name || 'Verified Vendor',
                vendor_id: vendor.id,
                location: vendor.address || 'Manila'
              });
            });
          }
        });

        try {
          const bundlesRes = await axios.get('http://127.0.0.1:8000/api/bundles', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const bundleList = bundlesRes.data.data || bundlesRes.data || [];
          bundleList.forEach(bundle => {
            allServices.push({
              ...bundle,
              type: 'bundle',
              id: 'bundle_' + bundle.id,
              title: bundle.bundle_name || bundle.name,
              name: bundle.bundle_name || bundle.name,
              business_name: bundle.vendor?.business_name || bundle.vendor?.name || 'Vendor Bundle Package',
              location: bundle.vendor?.address || 'Available Nationwide'
            });
          });
        } catch (bundleErr) {
          console.error("Bundle fetch error:", bundleErr);
        }
      }

      setServices(allServices);

      if (token && userRole !== 'admin') {
        const bookingsRes = await axios.get('http://127.0.0.1:8000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyBookings(bookingsRes.data.data || (Array.isArray(bookingsRes.data) ? bookingsRes.data : []));

        const notifRes = await axios.get('http://127.0.0.1:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const unread = notifRes.data.filter(n => !n.is_read);
        if (unread.length > 0) {
          notifyNewBooking(unread[0].message);
        }
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') return; 
    fetchData();
  }, [userRole]); 

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:8000/api/vendors/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); 
    } catch (error) { console.error("Toggle failed", error); }
  };

  const handleAddToArchitect = (service) => {
    if (architectItems.some(item => item.id === service.id)) {
      alert("This service is already added to your blueprint.");
      return;
    }
    setArchitectItems([...architectItems, service]);
  };

  const handleRemoveFromArchitect = (id) => {
    setArchitectItems(architectItems.filter(item => item.id !== id));
  };

  const architectTotalCost = useMemo(() => {
    return architectItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [architectItems]);

  const handleDeployCustomBundle = async () => {
    if (architectItems.length === 0) {
      alert("Your Bundle Architect canvas is empty! Add services first.");
      return;
    }
    setIsSavingBundle(true);
    try {
      const customBundlePayload = {
        id: 'custom_' + Date.now(),
        bundle_name: bundleName,
        total_price: architectTotalCost,
        items: architectItems,
        created_at: new Date().toISOString()
      };
      
      notifyNewBooking(`Custom Bundle "${bundleName}" architected successfully!`);
      navigate(`/bundle-details/custom`, { state: { service: customBundlePayload, isCustomArchitect: true } });
    } catch (err) {
      console.error("Failed to deploy bundle:", err);
      alert("Error saving custom bundle architecture.");
    } finally {
      setIsSavingBundle(false);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (service.business_name || service.name || "").toLowerCase().includes(term) || 
                            (service.category || "").toLowerCase().includes(term) || 
                            (service.location || "").toLowerCase().includes(term) ||
                            (service.title || "").toLowerCase().includes(term) ||
                            (service.description || "").toLowerCase().includes(term);
      
      const matchesTab = activeTab === 'all' ? true : service.type === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [services, searchTerm, activeTab]);

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/bookings/${bookingToCancel}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      setMyBookings(myBookings.filter(b => b.id !== bookingToCancel));
    } catch (error) { 
      alert("Failed to cancel booking."); 
    } finally {
      setBookingToCancel(null);
    }
  };

  if (userRole === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <h2 className="text-2xl font-black mb-2">Admin Portal Active</h2>
        <p className="text-slate-400 mb-6">Manage platform verifications and system logs.</p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30" onClick={() => navigate('/admin-dashboard')}>
          Go to Admin Panel
        </button>
      </div>
    );
  }

  const cardStyle = { 
    backgroundColor: '#ffffff', 
    padding: '24px', 
    borderRadius: '24px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)'
  };

  const inputStyle = { 
    width: '100%', 
    padding: '12px 16px', 
    marginTop: '6px', 
    borderRadius: '14px', 
    border: '2px solid #f1f5f9', 
    boxSizing: 'border-box', 
    fontSize: '0.9rem', 
    outline: 'none', 
    backgroundColor: '#f8fafc'
  };

  return (
    <div className="main-dashboard" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
      
      {/* DYNAMIC HERO BANNER HEADER WITH 10-SECOND CHANGING BACKGROUND IMAGE */}
      <div style={{ 
        position: 'relative',
        padding: '50px 6%', 
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9)), url(${heroImages[currentImageIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out'
      }}>
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', fontWeight: '900', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
              {userRole === 'vendor' ? 'Vendor Portal' : 'Client Planner'}
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>• EventEase Architecture Suite</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: 0 }}>
            {userRole === 'vendor' ? 'Manage Your Business & Services' : 'Design Your Perfect Event'}
          </h1>
        </div>
        <div style={{ zIndex: 2 }}>
          <button 
            onClick={() => navigate('/create-event')}
            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> New Event Plan
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {bookingToCancel && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ background: '#fee2e2', padding: '14px', borderRadius: '50%', width: 'fit-content', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1a1a1a', margin: '0 0 8px 0' }}>Cancel Booking</h3>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Are you sure you want to cancel this scheduled event?
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button onClick={() => setBookingToCancel(null)} style={styles.modalCancelBtn}>Keep Event</button>
              <button onClick={confirmCancelBooking} style={styles.modalConfirmBtn}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', padding: '40px 6%', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* LEFT SIDEBAR: BUNDLE ARCHITECT & SCHEDULES */}
        <aside style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Bundle Architect Toolbox */}
          <div style={{ ...cardStyle, border: '2px solid #3b82f6', background: 'linear-gradient(to bottom, #ffffff, #f0fdf4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: '#1d4ed8', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                <ShoppingBag size={18} /> Bundle Architect
              </h4>
              <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: '900', padding: '3px 10px', borderRadius: '999px' }}>
                {architectItems.length} Selected
              </span>
            </div>

            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Custom Blueprint Name</label>
            <input 
              type="text" 
              style={{ ...inputStyle, fontWeight: '800', color: '#0f172a' }} 
              value={bundleName} 
              onChange={(e) => setBundleName(e.target.value)} 
              placeholder="e.g. Dream Wedding Package" 
            />

            <div style={{ marginTop: '14px', maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {architectItems.length > 0 ? architectItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '10px 14px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <div>
                    <div style={{ fontWeight: '900', color: '#1e3a8a', fontSize: '0.85rem' }}>{item.name || item.title}</div>
                    <div style={{ color: '#059669', fontSize: '0.75rem', fontWeight: '800' }}>₱{Number(item.price || 0).toLocaleString()}</div>
                  </div>
                  <button onClick={() => handleRemoveFromArchitect(item.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )) : (
                <div style={{ background: '#f8fafc', border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                    Your blueprint is empty. Click <strong>"Add to Blueprint"</strong> on any service card below!
                  </p>
                </div>
              )}
            </div>

            {architectItems.length > 0 && (
              <div style={{ marginTop: '16px', borderTop: '2px dashed #bfdbfe', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1rem', color: '#1e3a8a', marginBottom: '14px' }}>
                  <span>Total Cost:</span>
                  <span style={{ color: '#059669' }}>₱{architectTotalCost.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleDeployCustomBundle}
                  disabled={isSavingBundle}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                >
                  {isSavingBundle ? 'DEPLOYING...' : 'DEPLOY CUSTOM BUNDLE'} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* My Scheduled Events Widget */}
          <div style={{ ...cardStyle, background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#dbeafe', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                  <Calendar size={20} color="#2563eb" />
                </div>
                <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.05rem', color: '#0f172a' }}>My Scheduled Events</h3>
              </div>
              <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '999px' }}>
                {myBookings.length} Active
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '2px' }}>
              {myBookings.length > 0 ? myBookings.map((booking) => (
                <div key={booking.id} style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: '900', color: '#1e293b', fontSize: '0.9rem' }}>{booking.event_name}</span>
                    <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.65rem', fontWeight: '800', padding: '2px 6px', borderRadius: '6px' }}>Confirmed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>📅 {booking.event_date}</span>
                    <span style={{ color: '#059669', fontWeight: '900' }}>₱{parseFloat(booking.budget || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
                    <button onClick={() => setBookingToCancel(booking.id)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                      Cancel Booking
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', textAlign: 'center', border: '2px dashed #e2e8f0' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>No events scheduled currently.</p>
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* --- RIGHT MAIN SECTION: CATALOG WITH TABS --- */}
        <main style={{ flex: '3 1 600px' }}>
          
          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="🔍 Search catalog by service name, vendor, category, or location..." 
              style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #e2e8f0', backgroundColor: '#fff', outline: 'none', fontSize: '0.95rem', fontWeight: '600', boxSizing: 'border-box' }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          {/* --- CATALOG TABS SWITCHER --- */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <button 
              onClick={() => setActiveTab('all')}
              style={{
                padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'all' ? '#0f172a' : '#fff',
                color: activeTab === 'all' ? '#fff' : '#475569',
                border: activeTab === 'all' ? 'none' : '1px solid #cbd5e1',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Layers size={16} /> All Catalog ({services.length})
            </button>
            <button 
              onClick={() => setActiveTab('service')}
              style={{
                padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'service' ? '#0f172a' : '#fff',
                color: activeTab === 'service' ? '#fff' : '#475569',
                border: activeTab === 'service' ? 'none' : '1px solid #cbd5e1',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Wrench size={16} /> Independent Services ({services.filter(s => s.type === 'service').length})
            </button>
            <button 
              onClick={() => setActiveTab('bundle')}
              style={{
                padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'bundle' ? '#0f172a' : '#fff',
                color: activeTab === 'bundle' ? '#fff' : '#475569',
                border: activeTab === 'bundle' ? 'none' : '1px solid #cbd5e1',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Package size={16} /> Pre-made Bundles ({services.filter(s => s.type === 'bundle').length})
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="text-xl font-black text-slate-900">
              {activeTab === 'all' ? 'Available Services & Bundles' : (activeTab === 'service' ? 'Independent Services Catalog' : 'Pre-made Vendor Bundles')}
            </h2>
            <span className="text-xs font-extrabold text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200">
              {filteredServices.length} Results
            </span>
          </div>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <Loader2 size={36} className="animate-spin text-blue-600" />
            </div>
          ) : filteredServices.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {filteredServices.map(s => {
                const isAlreadyAdded = architectItems.some(item => item.id === s.id);

                return (
                  <div key={s.id} style={{ backgroundColor: '#fff', borderRadius: '22px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
                    <div style={{ flex: 1 }}>
                      <ServiceCard 
                        service={s} 
                        budgetStatus="set_budget"
                        onToggle={handleToggleStatus} 
                        onBook={(serviceData) => {
                          const rawId = String(serviceData.id).startsWith('bundle_') ? String(serviceData.id).replace('bundle_', '') : serviceData.id;
                          navigate(`/bundle-details/${rawId}`, { state: { service: serviceData } });
                        }} 
                      />
                    </div>
                    <div style={{ padding: '16px 20px 20px 20px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                      <button 
                        onClick={() => handleAddToArchitect(s)}
                        disabled={isAlreadyAdded}
                        style={{
                          width: '100%',
                          backgroundColor: isAlreadyAdded ? '#059669' : '#0f172a',
                          color: '#fff',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '12px',
                          fontWeight: '900',
                          fontSize: '0.85rem',
                          cursor: isAlreadyAdded ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {isAlreadyAdded ? <CheckCircle size={16} /> : <Plus size={16} />}
                        {isAlreadyAdded ? 'Added to Blueprint' : 'Add to Blueprint'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: '#fff', padding: '60px', borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <p className="text-sm text-slate-500 font-semibold italic">No services or bundles found matching your filter criteria.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
  modalCard: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  modalCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }
};

export default MainDashboard;