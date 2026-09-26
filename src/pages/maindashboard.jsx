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
    try {
      const endpoint = userRole === 'vendor' ? '/vendor/services' : '/vendors';
      
      const servicesRes = await api.get(endpoint);
      
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
          const bundlesRes = await api.get('/bundles');
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

      const token = localStorage.getItem('token');
      if (token && userRole !== 'admin') {
        const bookingsRes = await api.get('/bookings');
        setMyBookings(bookingsRes.data.data || (Array.isArray(bookingsRes.data) ? bookingsRes.data : []));

        const notifRes = await api.get('/notifications');
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
      await api.post(`/vendors/toggle/${id}`);
      fetchData(); 
    } catch (error) { 
      console.error("Toggle failed", error); 
    }
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
      await api.delete(`/bookings/${bookingToCancel}`);
      setMyBookings(myBookings.filter(b => b.id !== bookingToCancel));
    } catch (error) { 
      alert("Failed to cancel booking."); 
    } finally {
      setBookingToCancel(null);
    }
  };

  if (userRole === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white font-sans">
        <h2 className="text-2xl font-black mb-2 tracking-tight">Admin Portal Active</h2>
        <p className="text-slate-400 mb-6 text-sm font-medium">Manage platform verifications and system logs.</p>
        <button className="bg-white hover:bg-slate-200 text-black px-8 py-3 rounded-2xl font-black transition-all shadow-xl" onClick={() => navigate('/admin-dashboard')}>
          Go to Admin Panel
        </button>
      </div>
    );
  }

  const cardStyle = { 
    backgroundColor: '#ffffff', 
    padding: '28px', 
    borderRadius: '24px', 
    border: '1px solid #eaeaea', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
  };

  const inputStyle = { 
    width: '100%', 
    padding: '14px 18px', 
    marginTop: '8px', 
    borderRadius: '14px', 
    border: '2px solid #f1f5f9', 
    boxSizing: 'border-box', 
    fontSize: '0.9rem', 
    outline: 'none', 
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s'
  };

  return (
    <div className="main-dashboard" style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px' }}>
      
      {/* DYNAMIC HERO BANNER HEADER WITH SLIDESHOW */}
      <div style={{ 
        position: 'relative',
        padding: '60px 6%', 
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        overflow: 'hidden',
        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url(${heroImages[currentImageIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out'
      }}>
        <div style={{ zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ background: '#ffffff', color: '#000000', fontSize: '0.7rem', fontWeight: '900', padding: '4px 12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {userRole === 'vendor' ? 'Vendor Portal' : 'Client Planner'}
            </span>
            <span style={{ color: '#a1a1aa', fontSize: '0.85rem', fontWeight: '600' }}>• EventEase Architecture Suite</span>
          </div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px', margin: 0, color: '#ffffff' }}>
            {userRole === 'vendor' ? 'Manage Your Business & Services' : 'Design Your Perfect Event'}
          </h1>
        </div>
        <div style={{ zIndex: 2 }}>
          <button 
            onClick={() => navigate('/create-event')}
            style={{ background: '#ffffff', color: '#000000', border: 'none', padding: '16px 28px', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', transition: 'transform 0.2s' }}
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
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#000', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Cancel Booking</h3>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: '0 0 24px 0', lineHeight: '1.5', fontWeight: '500' }}>
              Are you sure you want to cancel this scheduled event?
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button onClick={() => setBookingToCancel(null)} style={styles.modalCancelBtn}>Keep Event</button>
              <button onClick={confirmCancelBooking} style={styles.modalConfirmBtn}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', padding: '50px 6%', flexWrap: 'wrap', alignItems: 'flex-start', maxWidth: '1440px', margin: '0 auto' }}>
        
        {/* LEFT SIDEBAR: BUNDLE ARCHITECT & SCHEDULES */}
        <aside style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Bundle Architect Toolbox */}
          <div style={{ ...cardStyle, border: '2px solid #000', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: '#000', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <ShoppingBag size={18} /> Bundle Architect
              </h4>
              <span style={{ background: '#000', color: '#fff', fontSize: '0.75rem', fontWeight: '900', padding: '4px 12px', borderRadius: '999px' }}>
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

            <div style={{ marginTop: '16px', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {architectItems.length > 0 ? architectItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: '900', color: '#000', fontSize: '0.85rem' }}>{item.name || item.title}</div>
                    <div style={{ color: '#047857', fontSize: '0.75rem', fontWeight: '800', marginTop: '2px' }}>₱{Number(item.price || 0).toLocaleString()}</div>
                  </div>
                  <button onClick={() => handleRemoveFromArchitect(item.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )) : (
                <div style={{ background: '#fafafa', border: '2px dashed #e2e8f0', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', margin: 0, fontWeight: '500' }}>
                    Your blueprint is empty. Click <strong>"Add to Blueprint"</strong> on any service card below!
                  </p>
                </div>
              )}
            </div>

            {architectItems.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '2px dashed #eaeaea', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1.05rem', color: '#000', marginBottom: '16px' }}>
                  <span>Total Cost:</span>
                  <span style={{ color: '#047857' }}>₱{architectTotalCost.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleDeployCustomBundle}
                  disabled={isSavingBundle}
                  style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', fontSize: '0.9rem' }}
                >
                  {isSavingBundle ? 'DEPLOYING...' : 'DEPLOY CUSTOM BUNDLE'} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* My Scheduled Events Widget */}
          <div style={{ ...cardStyle, background: '#ffffff', border: '1px solid #eaeaea' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '2px solid #f8fafc', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                  <Calendar size={20} color="#000" />
                </div>
                <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.1rem', color: '#000' }}>My Scheduled Events</h3>
              </div>
              <span style={{ background: '#f8fafc', color: '#334155', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                {myBookings.length} Active
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '2px' }}>
              {myBookings.length > 0 ? myBookings.map((booking) => (
                <div key={booking.id} style={{ backgroundColor: '#fafafa', padding: '16px', borderRadius: '16px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: '900', color: '#000', fontSize: '0.95rem' }}>{booking.event_name}</span>
                    <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.65rem', fontWeight: '900', padding: '3px 8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>Confirmed</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                    <span>📅 {booking.event_date}</span>
                    <span style={{ color: '#047857', fontWeight: '900' }}>₱{parseFloat(booking.budget || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eaeaea', paddingTop: '8px' }}>
                    <button onClick={() => setBookingToCancel(booking.id)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '800', padding: '6px 12px', borderRadius: '8px' }}>
                      Cancel Booking
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ background: '#fafafa', padding: '24px', borderRadius: '16px', textAlign: 'center', border: '2px dashed #eaeaea' }}>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, fontWeight: '500' }}>No events scheduled currently.</p>
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* --- RIGHT MAIN SECTION: CATALOG WITH TABS --- */}
        <main style={{ flex: '3 1 600px' }}>
          
          {/* Search Bar */}
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="🔍 Search catalog by service name, vendor, category, or location..." 
              style={{ width: '100%', padding: '16px 24px', borderRadius: '18px', border: '2px solid #eaeaea', backgroundColor: '#fff', outline: 'none', fontSize: '0.95rem', fontWeight: '600', boxSizing: 'border-box', boxShadow: '0 5px 20px rgba(0,0,0,0.02)' }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          {/* --- CATALOG TABS SWITCHER --- */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', borderBottom: '2px solid #eaeaea', paddingBottom: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('all')}
              style={{
                padding: '12px 22px', borderRadius: '14px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'all' ? '#000' : '#fff',
                color: activeTab === 'all' ? '#fff' : '#666',
                border: activeTab === 'all' ? 'none' : '1px solid #eaeaea',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: activeTab === 'all' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <Layers size={16} /> All Catalog ({services.length})
            </button>
            <button 
              onClick={() => setActiveTab('service')}
              style={{
                padding: '12px 22px', borderRadius: '14px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'service' ? '#000' : '#fff',
                color: activeTab === 'service' ? '#fff' : '#666',
                border: activeTab === 'service' ? 'none' : '1px solid #eaeaea',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: activeTab === 'service' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <Wrench size={16} /> Independent Services ({services.filter(s => s.type === 'service').length})
            </button>
            <button 
              onClick={() => setActiveTab('bundle')}
              style={{
                padding: '12px 22px', borderRadius: '14px', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer',
                background: activeTab === 'bundle' ? '#000' : '#fff',
                color: activeTab === 'bundle' ? '#fff' : '#666',
                border: activeTab === 'bundle' ? 'none' : '1px solid #eaeaea',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: activeTab === 'bundle' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              <Package size={16} /> Pre-made Bundles ({services.filter(s => s.type === 'bundle').length})
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 className="text-2xl font-black text-black tracking-tight" style={{ margin: 0 }}>
              {activeTab === 'all' ? 'Available Services & Bundles' : (activeTab === 'service' ? 'Independent Services Catalog' : 'Pre-made Vendor Bundles')}
            </h2>
            <span className="text-xs font-extrabold text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              {filteredServices.length} Results
            </span>
          </div>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
              <Loader2 size={36} className="animate-spin text-black" />
            </div>
          ) : filteredServices.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '28px' }}>
              {filteredServices.map(s => {
                const isAlreadyAdded = architectItems.some(item => item.id === s.id);

                return (
                  <div key={s.id} style={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid #eaeaea', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', transition: 'transform 0.2s' }}>
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
                    <div style={{ padding: '16px 22px 22px 22px', background: '#fff', borderTop: '1px solid #f8fafc' }}>
                      <button 
                        onClick={() => handleAddToArchitect(s)}
                        disabled={isAlreadyAdded}
                        style={{
                          width: '100%',
                          backgroundColor: isAlreadyAdded ? '#047857' : '#000000',
                          color: '#fff',
                          border: 'none',
                          padding: '14px',
                          borderRadius: '14px',
                          fontWeight: '900',
                          fontSize: '0.85rem',
                          cursor: isAlreadyAdded ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: isAlreadyAdded ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'
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
            <div style={{ background: '#fafafa', padding: '60px', borderRadius: '24px', textAlign: 'center', border: '1px solid #eaeaea' }}>
              <p className="text-sm text-slate-500 font-semibold italic">No services or bundles found matching your filter criteria.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
  modalCard: { backgroundColor: '#fff', padding: '36px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid #eaeaea' },
  modalCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }
};

export default MainDashboard;