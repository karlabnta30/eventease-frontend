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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          const assignedBookings = rawBookings.filter(item => item.vendor_id || item.vendor || item.service_id);
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
    padding: '12px 14px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
  };

  const inputStyle = { 
    width: '100%', 
    padding: '8px 12px', 
    marginTop: '4px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    boxSizing: 'border-box', 
    fontSize: '0.82rem', 
    outline: 'none', 
    backgroundColor: '#ffffff'
  };

  return (
    <div className="main-dashboard-container" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Ginawang full-width ang padding para mawala ang malalaking blangko sa gilid */}
      <div className="dashboard-wrapper" style={{ paddingTop: '8px', width: '100%', maxWidth: '100%', margin: '0', paddingLeft: '8px', paddingRight: '8px', paddingBottom: '40px', boxSizing: 'border-box' }}>

        {/* --- COMPACT MOBILE HEADER --- */}
        {userRole !== 'vendor' && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.58rem', fontWeight: '800', padding: '2px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>
                  Client Portal
                </span>
                <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: '700' }}>
                  {myBookings.length > 0 ? `${myBookings.length} Active Bookings` : 'Ready to Plan'}
                </span>
              </div>
              
              <h1 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 2px 0', color: '#0f172a', wordBreak: 'break-word' }}>
                Hi, {clientName}! 👋
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0, fontWeight: '400' }}>
                Manage your event preparation and custom service bundles below.
              </p>
            </div>

            {/* Metrics Row (Naka-fill ng buong lapad) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Vendors</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginTop: '1px' }}>{myBookings.length} Active</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Blueprint</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', marginTop: '1px' }}>{architectItems.length} Items</div>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 4px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Status</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#16a34a', marginTop: '1px' }}>Online</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            {userRole === 'vendor' ? 'Manage Business & Services' : 'Service Catalog'}
          </h2>
          
          {userRole !== 'admin' && (
            <button onClick={() => navigate('/create-event')} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '7px 10px', borderRadius: '8px', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', flexShrink: 0 }}>
              <Plus size={13} /> New Event Plan
            </button>
          )}
        </div>

        {bookingToCancel && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '50%', width: 'fit-content', marginBottom: '10px' }}>
                <AlertTriangle size={18} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#1a1a1a', margin: '0 0 4px 0' }}>Cancel Booking</h3>
              <p style={{ color: '#666', fontSize: '0.8rem', margin: '0 0 14px 0' }}>
                Are you sure you want to cancel this scheduled event?
              </p>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button onClick={() => setBookingToCancel(null)} style={styles.modalCancelBtn}>Keep Event</button>
                <button onClick={confirmCancelBooking} style={styles.modalConfirmBtn}>Yes, Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN FLUID GRID LAYOUT --- */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'grid', gridTemplateColumns: isMobile ? '1fr' : '300px 1fr', gap: '10px', alignItems: 'start', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Sidebar Area (Bundle Architect & My Events) */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
            
            {/* --- BUNDLE ARCHITECT CANVAS --- */}
            <div style={{ ...cardStyle, border: '1px solid #cbd5e1', background: '#ffffff', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px', color: '#0f172a', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <ShoppingBag size={13} /> Bundle Architect
                </h4>
                <span style={{ background: '#0f172a', color: '#fff', fontSize: '0.58rem', fontWeight: '800', padding: '2px 5px', borderRadius: '999px' }}>
                  {architectItems.length} Items
                </span>
              </div>

              <label style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Blueprint Name</label>
              <input 
                type="text" 
                style={{ ...inputStyle, fontWeight: '700', color: '#0f172a' }} 
                value={bundleName} 
                onChange={(e) => setBundleName(e.target.value)} 
                placeholder="e.g. Dream Wedding Package" 
              />

              <div style={{ marginTop: '8px', maxHeight: '130px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {architectItems.length > 0 ? architectItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ minWidth: 0, paddingRight: '6px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name || item.title}</div>
                      <div style={{ color: '#16a34a', fontSize: '0.65rem', fontWeight: '700' }}>₱{Number(item.price || 0).toLocaleString()}</div>
                    </div>
                    <button onClick={() => handleRemoveFromArchitect(item.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '3px', borderRadius: '4px', display: 'flex', flexShrink: 0 }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                )) : (
                  <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.68rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>Blueprint is empty. Add services below.</p>
                  </div>
                )}
              </div>

              {architectItems.length > 0 && (
                <div style={{ marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.78rem', color: '#0f172a', marginBottom: '6px' }}>
                    <span>Total Cost:</span>
                    <span style={{ color: '#16a34a' }}>₱{architectTotalCost.toLocaleString()}</span>
                  </div>

                  <button 
                    onClick={handleDeployCustomBundle}
                    disabled={isSavingBundle}
                    style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}
                  >
                    {isSavingBundle ? 'DEPLOYING...' : 'DEPLOY BUNDLE'} <ArrowRight size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* --- MY SCHEDULED EVENTS --- */}
            <div style={{ ...cardStyle, background: '#ffffff', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={13} color="#0f172a" />
                  <h3 style={{ margin: 0, fontWeight: '800', fontSize: '0.75rem', color: '#0f172a' }}>Scheduled Events</h3>
                </div>
                <span style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.58rem', fontWeight: '700', padding: '2px 5px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                  {myBookings.length} Active
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {myBookings.length > 0 ? myBookings.map((booking) => (
                  <div key={booking.id} style={{ backgroundColor: '#f8fafc', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.72rem', wordBreak: 'break-word' }}>{booking.event_name}</span>
                      <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.55rem', fontWeight: '700', padding: '1px 3px', borderRadius: '3px', flexShrink: 0 }}>Confirmed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b' }}>
                      <span>📅 {booking.event_date}</span>
                      <span style={{ color: '#16a34a', fontWeight: '800' }}>₱{parseFloat(booking.budget || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '3px', marginTop: '1px' }}>
                      <button onClick={() => setBookingToCancel(booking.id)} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', fontSize: '0.6rem', fontWeight: '700', padding: '2px 5px', borderRadius: '3px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                    <p style={{ fontSize: '0.65rem', color: '#64748b', margin: 0, fontStyle: 'italic' }}>No events scheduled currently.</p>
                  </div>
                )}
              </div>
            </div>

          </aside>

          {/* Main Services Catalog Area */}
          <main style={{ width: '100%', boxSizing: 'border-box' }}>
            
            <div style={{ marginBottom: '8px', width: '100%', boxSizing: 'border-box' }}>
              <input 
                type="text" 
                placeholder="Search services, vendors, locations..." 
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', outline: 'none', fontSize: '0.8rem', fontWeight: '500', boxSizing: 'border-box' }} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '10px', WebkitOverflowScrolling: 'touch', width: '100%', boxSizing: 'border-box' }}>
              {availableCategories.map((category) => (
                <button 
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{ whiteSpace: 'nowrap', padding: '5px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: '600', border: '1px solid #cbd5e1', background: activeCategory === category ? '#0f172a' : '#fff', color: activeCategory === category ? '#fff' : '#334155', cursor: 'pointer' }}
                >
                  {category}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {activeCategory === 'All' ? 'Available Services & Bundles' : `${activeCategory}`}
              </h3>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: '#64748b', background: '#fff', padding: '2px 6px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                {filteredServices.length} Results
              </span>
            </div>
            
            {filteredServices.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                {filteredServices.map(s => {
                  const isAlreadyAdded = architectItems.some(item => item.id === s.id);

                  return (
                    <div key={s.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', width: '100%', boxSizing: 'border-box' }}>
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
                      <div style={{ padding: '8px 10px 10px 10px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                        <button 
                          onClick={() => handleAddToArchitect(s)}
                          disabled={isAlreadyAdded}
                          style={{
                            width: '100%',
                            backgroundColor: isAlreadyAdded ? '#16a34a' : '#0f172a',
                            color: '#fff',
                            border: 'none',
                            padding: '7px',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '0.72rem',
                            cursor: isAlreadyAdded ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          {isAlreadyAdded ? <CheckCircle size={12} /> : <Plus size={12} />}
                          {isAlreadyAdded ? 'Added to Blueprint' : 'Add to Blueprint'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500', margin: 0, fontStyle: 'italic' }}>No services found matching your filter criteria.</p>
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: '10px' },
  modalCard: { backgroundColor: '#fff', padding: '16px', borderRadius: '14px', width: '100%', maxWidth: '300px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', border: '1px solid #e2e8f0' },
  modalCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '7px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '7px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }
};

export default MainDashboard;