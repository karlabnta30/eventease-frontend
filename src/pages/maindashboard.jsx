import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './dashboard.css'; 
import ServiceCard from '../components/ServiceCard';
import { notifyNewBooking } from '../toastUtils.jsx'; 
import { AlertTriangle, CheckCircle, ShoppingBag, Trash2, Plus, ArrowRight, Calendar, Tag, Building, Clock, CheckSquare } from 'lucide-react';

const MainDashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  
  const clientName = localStorage.getItem('userName') || 'Valued Client';
  
  const [services, setServices] = useState([]); 
  const [myBookings, setMyBookings] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('All');

  const [architectItems, setArchitectItems] = useState([]);
  const [bundleName, setBundleName] = useState('My Custom Event Blueprint');
  const [isSavingBundle, setIsSavingBundle] = useState(false);

  const [bookingToCancel, setBookingToCancel] = useState(null);

  const fetchData = async () => {
    try {
      const endpoint = userRole === 'vendor' ? '/vendor/services' : '/vendors';
      
      const promises = [api.get(endpoint)];
      const token = localStorage.getItem('token');
      
      if (userRole !== 'admin') {
        if (userRole !== 'vendor') {
          promises.push(api.get('/bundles').catch(() => ({ data: [] })));
        }
        if (token) {
          promises.push(api.get('/bookings').catch(() => ({ data: [] })));
          promises.push(api.get('/notifications').catch(() => ({ data: [] })));
        }
      }

      const results = await Promise.allSettled(promises);
      let allServices = [];

      if (results[0].status === 'fulfilled') {
        const servicesRes = results[0].value;
        const rawData = servicesRes.data.data || servicesRes.data || [];

        if (userRole === 'vendor') {
          rawData.forEach(service => {
            allServices.push({
              ...service,
              type: 'service',
              category: service.category || 'General',
              business_name: service.vendor?.business_name || service.business_name || 'My Business',
              location: service.location || 'Manila'
            });
          });
        } else {
          rawData.forEach(item => {
            if (item.price && (item.title || item.name)) {
              allServices.push({
                ...item,
                type: 'service',
                category: item.category || 'General',
                business_name: item.business_name || 'Verified Vendor',
                location: item.location || 'Manila'
              });
            } else {
              const vendorServices = item.services || item.vendor_services || item.offerings || item.items || [];
              if (Array.isArray(vendorServices) && vendorServices.length > 0) {
                vendorServices.forEach(service => {
                  allServices.push({
                    ...service,
                    type: 'service',
                    category: service.category || item.category || 'General',
                    business_name: item.name || item.business_name || 'Verified Vendor',
                    vendor_id: item.id,
                    location: item.address || 'Manila'
                  });
                });
              }
            }
          });
        }
      }

      if (userRole !== 'admin' && userRole !== 'vendor' && results[1] && results[1].status === 'fulfilled') {
        const bundlesRes = results[1].value;
        const bundleList = bundlesRes.data.data || bundlesRes.data || [];
        bundleList.forEach(bundle => {
          allServices.push({
            ...bundle,
            type: 'bundle',
            category: 'Bundle Package',
            id: 'bundle_' + bundle.id,
            title: bundle.bundle_name || bundle.name,
            name: bundle.bundle_name || bundle.name,
            business_name: bundle.vendor?.business_name || bundle.vendor?.name || 'Vendor Bundle Package',
            location: bundle.vendor?.address || 'Available Nationwide'
          });
        });
      }

      setServices(allServices);

      const bookingsIndex = userRole !== 'vendor' ? 2 : 1;
      const notifsIndex = userRole !== 'vendor' ? 3 : 2;

      if (token && userRole !== 'admin') {
        if (results[bookingsIndex] && results[bookingsIndex].status === 'fulfilled') {
          const bookingsRes = results[bookingsIndex].value;
          const rawBookings = bookingsRes.data.data || (Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
          
          // Naayos ang pag-filter upang masalo ang lahat ng active bookings na may event_name o ID
          const assignedBookings = rawBookings.filter(item => item.id || item.event_name || item.vendor_id || item.vendor || item.service_id);
          setMyBookings(assignedBookings);
        }

        if (results[notifsIndex] && results[notifsIndex].status === 'fulfilled') {
          const notifRes = results[notifsIndex].value;
          const notifList = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data.data || []);
          const unread = notifList.filter(n => !n.is_read);
          if (unread.length > 0) {
            notifyNewBooking(unread[0].message);
          }
        }
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') return; 
    fetchData();
  }, [userRole]); 

  const availableCategories = useMemo(() => {
    const categories = new Set();
    services.forEach(s => {
      if (s.category) {
        categories.add(s.category.trim());
      }
    });
    return ['All', ...Array.from(categories)];
  }, [services]);

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
      const primaryServiceId = architectItems.length > 0 ? architectItems[0].id : null;
      const cleanServiceId = primaryServiceId && String(primaryServiceId).startsWith('bundle_') 
        ? null 
        : Number(primaryServiceId);

      const customBundlePayload = {
        event_name: bundleName,
        location: 'Custom Architect Location',
        category: 'Custom Bundle Package',
        event_date: new Date().toISOString().slice(0, 10),
        budget: architectTotalCost,
        guest_count: 50,
        service_id: cleanServiceId,
        contract_agreed: true
      };
      
      const res = await api.post('/bookings', customBundlePayload);
      
      if (res.status === 201 || res.status === 200) {
        notifyNewBooking(`Custom Bundle "${bundleName}" deployed and added to Live Events successfully!`);
        
        const createdBookingId = res.data.data?.id || res.data.id;
        if (createdBookingId && architectItems.length > 0) {
          const serviceIds = architectItems
            .map(item => String(item.id).startsWith('bundle_') ? null : Number(item.id))
            .filter(Boolean);
            
          if (serviceIds.length > 0) {
            await api.post(`/bookings/${createdBookingId}/services`, { services: serviceIds }).catch(() => {});
          }
        }

        navigate('/live-events');
      }
    } catch (err) {
      console.error("Failed to deploy bundle:", err);
      alert("Error saving custom bundle architecture to database.");
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
      
      const matchesCategory = activeCategory === 'All' || (service.category && service.category.toLowerCase() === activeCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, activeCategory]);

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
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-4">
        <h2 className="text-2xl font-black mb-2 text-center">Admin Portal Active</h2>
        <p className="text-slate-400 mb-6 text-center">Manage platform verifications and system logs.</p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30" onClick={() => navigate('/admin-dashboard')}>
          Go to Admin Panel
        </button>
      </div>
    );
  }

  const cardStyle = { 
    backgroundColor: '#ffffff', 
    padding: '24px', 
    borderRadius: '20px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)'
  };

  const inputStyle = { 
    width: '100%', 
    padding: '12px 16px', 
    marginTop: '6px', 
    borderRadius: '12px', 
    border: '1px solid #cbd5e1', 
    boxSizing: 'border-box', 
    fontSize: '0.9rem', 
    outline: 'none', 
    backgroundColor: '#ffffff'
  };

  return (
    <div className="main-dashboard-container" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div className="dashboard-wrapper" style={{ paddingTop: '24px', maxWidth: '1400px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>

        {/* --- DYNAMIC CLIENT HEADER & CONDITIONAL EVENT STATUS --- */}
        {userRole !== 'vendor' && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px 28px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e2e8f0' }}>
                    Client Portal
                  </span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Event Management</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 4px 0', color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Welcome back, {clientName}! 👋
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: '400' }}>
                  Here is the current overview of your upcoming event preparations and service bookings.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '14px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                    {myBookings.length > 0 ? 'Active Phase' : 'No Events'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                    {myBookings.length > 0 ? 'Status: Preparation' : 'Status: Ready to Plan'}
                  </div>
                </div>
                <div style={{ width: '1px', background: '#cbd5e1' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: myBookings.length > 0 ? '#0284c7' : '#94a3b8' }}>
                    {myBookings.length > 0 ? `${myBookings.length} Booked` : 'No Events'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Suppliers Confirmed</div>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#f0f9ff', color: '#0284c7', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                  <Building size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Booked Vendors</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>
                    {myBookings.length > 0 ? `${myBookings.length} Active` : 'No Events'}
                  </div>
                </div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                  <CheckSquare size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Blueprint Items</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{architectItems.length} Services</div>
                </div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#fffbeb', color: '#d97706', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>System Connectivity</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Online & Synced</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-header-container" style={{ marginTop: '0', paddingTop: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="dashboard-main-title" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {userRole === 'vendor' ? 'Manage Business & Services' : 'Service Catalog & Bundle Architect'}
            </h1>
            <p className="dashboard-main-subtitle" style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              {userRole === 'vendor' ? 'Control your listed service status and business offerings.' : 'Browse verified supplier services and build your custom event package.'}
            </p>
          </div>
          
          {userRole !== 'admin' && (
            <button onClick={() => navigate('/create-event')} className="new-event-btn" style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <Plus size={16} /> New Event Plan
            </button>
          )}
        </div>

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

        <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          
          <aside className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* --- BUNDLE ARCHITECT CANVAS --- */}
            <div style={{ ...cardStyle, border: '1px solid #cbd5e1', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <ShoppingBag size={16} /> Bundle Architect
                </h4>
                <span style={{ background: '#0f172a', color: '#fff', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '999px' }}>
                  {architectItems.length} Items
                </span>
              </div>

              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Custom Blueprint Name</label>
              <input 
                type="text" 
                style={{ ...inputStyle, fontWeight: '700', color: '#0f172a' }} 
                value={bundleName} 
                onChange={(e) => setBundleName(e.target.value)} 
                placeholder="e.g. Dream Wedding Package" 
              />

              <div style={{ marginTop: '12px', maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {architectItems.length > 0 ? architectItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.8rem' }}>{item.name || item.title}</div>
                      <div style={{ color: '#16a34a', fontSize: '0.75rem', fontWeight: '700' }}>₱{Number(item.price || 0).toLocaleString()}</div>
                    </div>
                    <button onClick={() => handleRemoveFromArchitect(item.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                )) : (
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                      Blueprint is empty. Add services from the catalog.
                    </p>
                  </div>
                )}
              </div>

              {architectItems.length > 0 && (
                <div style={{ marginTop: '14px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.9rem', color: '#0f172a', marginBottom: '10px' }}>
                    <span>Total Cost:</span>
                    <span style={{ color: '#16a34a' }}>₱{architectTotalCost.toLocaleString()}</span>
                  </div>

                  <button 
                    onClick={handleDeployCustomBundle}
                    disabled={isSavingBundle}
                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
                  >
                    {isSavingBundle ? 'DEPLOYING...' : 'DEPLOY OPTIMIZED BUNDLE'} <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* --- MY SCHEDULED EVENTS --- */}
            <div style={{ ...cardStyle, background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                    <Calendar size={16} color="#0f172a" />
                  </div>
                  <h3 style={{ margin: 0, fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>My Scheduled Events</h3>
                </div>
                <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.7rem', fontWeight: '700', padding: '2px 8px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                  {myBookings.length} Active
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto', paddingRight: '2px' }}>
                {myBookings.length > 0 ? myBookings.map((booking) => (
                  <div key={booking.id} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.85rem' }}>{booking.event_name}</span>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.65rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>Confirmed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                      <span>📅 {booking.event_date}</span>
                      <span style={{ color: '#16a34a', fontWeight: '800' }}>₱{parseFloat(booking.budget || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '2px' }}>
                      <button onClick={() => setBookingToCancel(booking.id)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '0.7rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>No events scheduled currently.</p>
                  </div>
                )}
              </div>
            </div>

          </aside>

          <main className="dashboard-main-area">
            
            <div style={{ marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Search catalog by service name, vendor, category, or location..." 
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '0.9rem', fontWeight: '500', boxSizing: 'border-box', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div className="dashboard-tabs-container" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
              {availableCategories.map((category) => (
                <button 
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`dashboard-tab-btn ${activeCategory === category ? 'active' : ''}`}
                  style={{ whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid #cbd5e1', background: activeCategory === category ? '#0f172a' : '#fff', color: activeCategory === category ? '#fff' : '#334155', cursor: 'pointer' }}
                >
                  <Tag size={13} style={{ display: 'inline', marginRight: '4px' }} /> {category} {category === 'All' ? `(${services.length})` : `(${services.filter(s => s.category?.toLowerCase() === category.toLowerCase()).length})`}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {activeCategory === 'All' ? 'All Available Services & Bundles' : `${activeCategory} Services`}
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', background: '#fff', padding: '6px 12px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                {filteredServices.length} Results
              </span>
            </div>
            
            {filteredServices.length > 0 ? (
              <div className="dashboard-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {filteredServices.map(s => {
                  const isAlreadyAdded = architectItems.some(item => item.id === s.id);

                  return (
                    <div key={s.id} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ flex: 1 }}>
                        <ServiceCard 
                          service={s} 
                          budgetStatus="set_budget"
                          onToggle={handleToggleStatus} 
                          onBook={(serviceData) => {
                            const isBundle = String(serviceData.id).startsWith('bundle_');
                            const rawId = isBundle ? String(serviceData.id).replace('bundle_', '') : serviceData.id;
                            
                            navigate(isBundle ? `/bundle-details/${rawId}` : `/service-details/${rawId}`, { 
                              state: { service: serviceData, type: isBundle ? 'bundle' : 'service' } 
                            });
                          }} 
                        />
                      </div>
                      <div style={{ padding: '14px 16px 16px 16px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                        <button 
                          onClick={() => handleAddToArchitect(s)}
                          disabled={isAlreadyAdded}
                          style={{
                            width: '100%',
                            backgroundColor: isAlreadyAdded ? '#16a34a' : '#0f172a',
                            color: '#fff',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: isAlreadyAdded ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          {isAlreadyAdded ? <CheckCircle size={15} /> : <Plus size={15} />}
                          {isAlreadyAdded ? 'Added to Blueprint' : 'Add to Blueprint'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', margin: 0, fontStyle: 'italic' }}>No services or bundles found matching your filter criteria.</p>
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalCard: { backgroundColor: '#fff', padding: '28px', borderRadius: '20px', width: '100%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid #e2e8f0' },
  modalCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }
};

export default MainDashboard;