import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './dashboard.css'; 
import ServiceCard from '../components/ServiceCard';
import { notifyNewBooking } from '../toastUtils.jsx'; 
import { AlertTriangle, Building, Clock, CheckSquare, Calendar, Tag, MapPin, X } from 'lucide-react';

const MainDashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  
  const clientName = localStorage.getItem('userName') || 'Valued Client';
  
  const [services, setServices] = useState([]); 
  const [myBookings, setMyBookings] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // --- STATE PARA SA VIEW DETAILS MODAL ---
  const [selectedServiceDetail, setSelectedServiceDetail] = useState(null);

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

  return (
    <div className="main-dashboard-container" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div className="dashboard-wrapper" style={{ paddingTop: '24px', maxWidth: '1400px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>

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
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Catalog Items</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>{services.length} Available</div>
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
              {userRole === 'vendor' ? 'Manage Business & Services' : 'Service Catalog Directory'}
            </h1>
            <p className="dashboard-main-subtitle" style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              {userRole === 'vendor' ? 'Control your listed service status and business offerings.' : 'Browse verified supplier service information and details.'}
            </p>
          </div>
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

        {/* --- CUSTOM DETAILS MODAL PARA SA VIEW DETAILS --- */}
        {selectedServiceDetail && (
          <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300, padding: '16px'
          }}>
            <div style={{
              background: '#ffffff', borderRadius: '28px', width: '100%', maxWidth: '550px',
              maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              boxSizing: 'border-box', position: 'relative'
            }}>
              <button 
                onClick={() => setSelectedServiceDetail(null)}
                style={{ 
                  position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', 
                  border: 'none', borderRadius: '50%', width: '36px', height: '36px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
                }}
              >
                <X size={18} color="#64748b" />
              </button>

              <span style={{ 
                background: '#0f172a', color: '#fff', padding: '6px 14px', 
                borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', display: 'inline-block', marginBottom: '12px' 
              }}>
                {selectedServiceDetail.category || 'General Service'}
              </span>

              <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', wordBreak: 'break-word' }}>
                {selectedServiceDetail.title || selectedServiceDetail.name || selectedServiceDetail.business_name}
              </h2>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={16} /> {selectedServiceDetail.location || 'Metro Manila'}
                </div>
                <div>•</div>
                <div style={{ color: '#16a34a', fontWeight: '900', fontSize: '1.1rem' }}>
                  ₱{Number(selectedServiceDetail.starting_price || selectedServiceDetail.price || 0).toLocaleString()}
                </div>
              </div>

              {(selectedServiceDetail.min_pax || selectedServiceDetail.max_pax) && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '20px' }}>
                  Capacity Range: {selectedServiceDetail.min_pax || 1} - {selectedServiceDetail.max_pax || 'Any'} Guests
                </div>
              )}

              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
                  Service Description & Inclusions
                </h4>
                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6', margin: 0, wordBreak: 'break-word', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  {selectedServiceDetail.description || selectedServiceDetail.details || "No additional description provided."}
                </p>
              </div>

              {selectedServiceDetail.terms_and_conditions && (
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
                    Terms & Conditions
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0, wordBreak: 'break-word', background: '#fef3c7', padding: '14px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    {selectedServiceDetail.terms_and_conditions}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedServiceDetail(null)}
                  style={{
                    flex: 1, background: '#0f172a', color: '#fff', border: 'none',
                    padding: '14px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '0.9rem'
                  }}
                >
                  CLOSE DETAILS
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-content-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          
          <aside className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '2px' }}>
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
                placeholder="Search directory by service name, vendor, category, or location..." 
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
                {activeCategory === 'All' ? 'All Listed Services & Bundles' : `${activeCategory} Services`}
              </h2>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', background: '#fff', padding: '6px 12px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
                {filteredServices.length} Results
              </span>
            </div>
            
            {filteredServices.length > 0 ? (
              <div className="dashboard-services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {filteredServices.map(s => (
                  <div key={s.id} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ flex: 1 }}>
                      <ServiceCard 
                        service={s} 
                        budgetStatus="set_budget"
                        onToggle={handleToggleStatus} 
                        onBook={() => {
                          // Pinalitan ang alert() ng pagbukas ng custom modal
                          setSelectedServiceDetail(s);
                        }} 
                      />
                    </div>
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>
                        ℹ️ Informational Catalog Entry
                      </span>
                    </div>
                  </div>
                ))}
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