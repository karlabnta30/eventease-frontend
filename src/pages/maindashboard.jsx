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
  
  const [activeTab, setActiveTab] = useState('all');

  const [architectItems, setArchitectItems] = useState([]);
  const [bundleName, setBundleName] = useState('My Custom Event Blueprint');
  const [isSavingBundle, setIsSavingBundle] = useState(false);

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
    border: '1px solid #eaeaea', 
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
    <div className="main-dashboard" style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", padding: '40px 50px 100px' }}>
      
      {/* PROPERLY SPACED CONTAINER EXPANDED TO FILL AVAILABLE SCREEN WIDTH */}
      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto' }}>

        {/* CLEAN MINIMALIST EVENTEASE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '35px', borderBottom: '2px solid #f0f0f0', paddingBottom: '25px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-1.5px', color: '#000', margin: '0 0 6px 0' }}>
              {userRole === 'vendor' ? 'Manage Business & Services' : 'Design Your Perfect Event'}
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '600', margin: 0 }}>
              {userRole === 'vendor' ? 'Control your listed service status and business offerings.' : 'Explore service catalogs, build blueprints, and manage your schedules.'}
            </p>
          </div>
          
          {userRole !== 'admin' && (
            <button 
              onClick={() => navigate('/create-event')} 
              style={{ 
                  background: '#000', 
                  color: '#fff', 
                  padding: '14px 24px', 
                  borderRadius: '14px', 
                  fontWeight: '900', 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <Plus size={16} /> New Event Plan
            </button>
          )}
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

        {/* MAIN GRID LAYOUT: SIDEBAR + CATALOG */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '35px', alignItems: 'start' }}>
          
          {/* LEFT SIDEBAR: BUNDLE ARCHITECT & SCHEDULES */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '25px', position: 'sticky', top: '30px' }}>
            
            {/* Bundle Architect Toolbox */}
            <div style={{ ...cardStyle, border: '2px solid #000', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: '#000', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  <ShoppingBag size={18} /> Bundle Architect
                </h4>
                <span style={{ background: '#000', color: '#fff', fontSize: '0.75rem', fontWeight: '900', padding: '3px 10px', borderRadius: '999px' }}>
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
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                    <div>
                      <div style={{ fontWeight: '900', color: '#000', fontSize: '0.85rem' }}>{item.name || item.title}</div>
                      <div style={{ color: '#047857', fontSize: '0.75rem', fontWeight: '800' }}>₱{Number(item.price || 0).toLocaleString()}</div>
                    </div>
                    <button onClick={() => handleRemoveFromArchitect(item.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                )) : (
                  <div style={{ background: '#fafafa', border: '2px dashed #eaeaea', padding: '20px', borderRadius: '14px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                      Your blueprint is empty. Click <strong>"Add to Blueprint"</strong> on any service card below!
                    </p>
                  </div>
                )}
              </div>

              {architectItems.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '2px dashed #eaeaea', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '1rem', color: '#000', marginBottom: '14px' }}>
                    <span>Total Cost:</span>
                    <span style={{ color: '#047857' }}>₱{architectTotalCost.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={handleDeployCustomBundle}
                    disabled={isSavingBundle}
                    style={{ width: '100%', background: '#000', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    {isSavingBundle ? 'DEPLOYING...' : 'DEPLOY CUSTOM BUNDLE'} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* My Scheduled Events Widget */}
            <div style={{ ...cardStyle, background: '#ffffff', border: '1px solid #eaeaea' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '2px solid #f8fafc', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '12px', display: 'flex' }}>
                    <Calendar size={20} color="#000" />
                  </div>
                  <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.05rem', color: '#000' }}>My Scheduled Events</h3>
                </div>
                <span style={{ background: '#f8fafc', color: '#334155', fontSize: '0.75rem', fontWeight: '800', padding: '4px 10px', borderRadius: '999px', border: '1px solid #eaeaea' }}>
                  {myBookings.length} Active
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', paddingRight: '2px' }}>
                {myBookings.length > 0 ? myBookings.map((booking) => (
                  <div key={booking.id} style={{ backgroundColor: '#fafafa', padding: '14px', borderRadius: '14px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: '900', color: '#000', fontSize: '0.9rem' }}>{booking.event_name}</span>
                      <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.65rem', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>Confirmed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>📅 {booking.event_date}</span>
                      <span style={{ color: '#047857', fontWeight: '900' }}>₱{parseFloat(booking.budget || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #eaeaea', paddingTop: '6px' }}>
                      <button onClick={() => setBookingToCancel(booking.id)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ background: '#fafafa', padding: '20px', borderRadius: '14px', textAlign: 'center', border: '2px dashed #eaeaea' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>No events scheduled currently.</p>
                  </div>
                )}
              </div>
            </div>

          </aside>

          {/* --- RIGHT MAIN SECTION: CATALOG WITH TABS --- */}
          <main style={{ width: '100%', minWidth: 0 }}>
            
            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="🔍 Search catalog by service name, vendor, category, or location..." 
                style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '2px solid #eaeaea', backgroundColor: '#fff', outline: 'none', fontSize: '0.95rem', fontWeight: '600', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            {/* --- CATALOG TABS SWITCHER --- */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '2px solid #eaeaea', paddingBottom: '15px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                  background: activeTab === 'all' ? '#000' : '#fff',
                  color: activeTab === 'all' ? '#fff' : '#666',
                  border: activeTab === 'all' ? 'none' : '1px solid #eaeaea',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: activeTab === 'all' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                <Layers size={16} /> All Catalog ({services.length})
              </button>
              <button 
                onClick={() => setActiveTab('service')}
                style={{
                  padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                  background: activeTab === 'service' ? '#000' : '#fff',
                  color: activeTab === 'service' ? '#fff' : '#666',
                  border: activeTab === 'service' ? 'none' : '1px solid #eaeaea',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: activeTab === 'service' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                <Wrench size={16} /> Independent Services ({services.filter(s => s.type === 'service').length})
              </button>
              <button 
                onClick={() => setActiveTab('bundle')}
                style={{
                  padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer',
                  background: activeTab === 'bundle' ? '#000' : '#fff',
                  color: activeTab === 'bundle' ? '#fff' : '#666',
                  border: activeTab === 'bundle' ? 'none' : '1px solid #eaeaea',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: activeTab === 'bundle' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                <Package size={16} /> Pre-made Bundles ({services.filter(s => s.type === 'bundle').length})
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="text-xl font-black text-black tracking-tight" style={{ margin: 0 }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '24px' }}>
                {filteredServices.map(s => {
                  const isAlreadyAdded = architectItems.some(item => item.id === s.id);

                  return (
                    <div key={s.id} style={{ backgroundColor: '#fff', borderRadius: '22px', border: '1px solid #eaeaea', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
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
                      <div style={{ padding: '16px 20px 20px 20px', background: '#fff', borderTop: '1px solid #f8fafc' }}>
                        <button 
                          onClick={() => handleAddToArchitect(s)}
                          disabled={isAlreadyAdded}
                          style={{
                            width: '100%',
                            backgroundColor: isAlreadyAdded ? '#047857' : '#000000',
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
              <div style={{ background: '#fafafa', padding: '60px', borderRadius: '24px', textAlign: 'center', border: '1px solid #eaeaea' }}>
                <p className="text-sm text-slate-500 font-semibold italic">No services or bundles found matching your filter criteria.</p>
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' },
  modalCard: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid #eaeaea' },
  modalCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }
};

export default MainDashboard;