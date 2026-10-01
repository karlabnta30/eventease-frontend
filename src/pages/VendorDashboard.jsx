import React, { useState, useEffect } from 'react';
import api from '../api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Check, X, CreditCard, Package, Bell, Calendar as CalendarIcon, Clock, MapPin, LayoutGrid, Trash2, Edit3, Users, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notifyNewBooking, notifySuccess } from '../toastUtils.jsx'; 
import { Toaster } from 'react-hot-toast';
import './CalendarCustom.css'; 

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [vendorBundles, setVendorBundles] = useState([]);
  const [stats, setStats] = useState({ earnings: 0, pending: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // State for tracking active bill negotiation edits
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [newBudgetInput, setNewBudgetInput] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userRole = localStorage.getItem('userRole'); 

      try {
        const results = await Promise.allSettled([
          api.get('/vendor/bookings'),
          api.get('/bundles'),
          api.get('/notifications')
        ]);

        if (results[0].status === 'fulfilled') {
          setBookings(results[0].value.data.data || results[0].value.data.bookings || []);
          setStats(results[0].value.data.stats || { earnings: 0, pending: 0 });
        }

        if (results[1].status === 'fulfilled') {
          const bundlesData = Array.isArray(results[1].value.data) ? results[1].value.data : (results[1].value.data.data || []);
          setVendorBundles(bundlesData);
        }

        if (results[2].status === 'fulfilled') {
          const notifications = Array.isArray(results[2].value.data) ? results[2].value.data : (results[2].value.data.data || []);
          const unread = notifications.filter(n => !n.is_read);

          unread.slice(0, 3).forEach((n, i) => {
            if (userRole === 'vendor') {
              setTimeout(() => { notifyNewBooking(n.message); }, i * 1500);
            }
          });
        }

      } catch (err) { 
        console.error("Dashboard Fetch Error:", err); 
      }
    };
    fetchData();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      
      const statRes = await api.get('/vendor/bookings');
      setStats(statRes.data.stats);
      notifySuccess(`Booking successfully ${status}!`);
    } catch (err) { 
      alert("Failed to update status."); 
    }
  };

  const handleAdjustBill = async (bookingId) => {
    if (!newBudgetInput || isNaN(newBudgetInput)) {
      alert("Please enter a valid numeric budget amount.");
      return;
    }

    try {
      await api.patch(`/bookings/${bookingId}/adjust-bill`, {
        budget: Number(newBudgetInput)
      });

      setBookings(bookings.map(b => b.id === bookingId ? { ...b, budget: Number(newBudgetInput) } : b));
      setEditingBookingId(null);
      setNewBudgetInput('');
      notifySuccess('Final bill successfully updated and negotiated!');
    } catch (err) {
      alert('Error updating bill adjustment.');
    }
  };

  const handleDeleteBundle = async (id) => {
    if (window.confirm("Are you sure you want to delete this bundle?")) {
      const cleanId = String(id).replace('bundle_', '');
      
      try {
        await api.delete(`/bundles/${cleanId}`);
        setVendorBundles(vendorBundles.filter(b => b.id !== id && String(b.id) !== String(cleanId)));
        notifySuccess('Bundle deleted successfully!');
      } catch (err1) {
        try {
          await api.delete(`/vendor/bundles/${cleanId}`);
          setVendorBundles(vendorBundles.filter(b => b.id !== id && String(b.id) !== String(cleanId)));
          notifySuccess('Bundle deleted successfully!');
        } catch (err2) {
          console.error("Bundle deletion error:", err2);
          alert("Failed to delete bundle. Please check your Laravel backend delete route mapping.");
        }
      }
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasBooking = bookings.some(b => 
        b.status === 'accepted' && new Date(b.event_date).toDateString() === date.toDateString()
      );
      return hasBooking ? <div className="calendar-dot"></div> : null;
    }
  };

  const selectedDateBookings = bookings.filter(b => 
    b.status === 'accepted' && new Date(b.event_date).toDateString() === selectedDate.toDateString()
  );

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="top-right" />
      
      <div style={{ marginBottom: isMobile ? '25px' : '40px', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
        <div>
            <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', color: '#1a1a1a', margin: 0 }}>Vendor Command Center</h1>
            <p style={{ color: '#666', fontWeight: '500', marginTop: '8px', fontSize: isMobile ? '0.9rem' : '1rem' }}>Your central hub for event management, bill adjustments, and scheduling.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/vendor-services')} style={{ ...styles.manageBtn, flex: isMobile ? 1 : 'unset', justifyContent: 'center' }}>
                <LayoutGrid size={18} /> Manage My Services
            </button>
            <button onClick={() => navigate('/notifications')} style={{ ...styles.notifBtn, flex: isMobile ? 1 : 'unset', justifyContent: 'center' }}>
                <Bell size={18} /> Notifications
            </button>
        </div>
      </div>
      
      {/* Top Stats Box including Revenue, Awaiting Approval, and Active Bundles */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '20px', marginBottom: isMobile ? '30px' : '50px' }}>
        <div style={styles.statBox}>
          <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '14px', flexShrink: 0 }}>
            <CreditCard size={24} color="#000" />
          </div>
          <div>
            <p style={styles.statLabel}>Revenue</p>
            <h2 style={styles.statValue}>₱{(stats.earnings || 0).toLocaleString()}</h2>
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={{ background: '#000', padding: '15px', borderRadius: '14px', flexShrink: 0 }}>
            <Package size={24} color="#fff" />
          </div>
          <div>
            <p style={styles.statLabel}>Awaiting Approval</p>
            <h2 style={styles.statValue}>{stats.pending || 0}</h2>
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={{ background: '#059669', padding: '15px', borderRadius: '14px', flexShrink: 0 }}>
            <Package size={24} color="#fff" />
          </div>
          <div>
            <p style={styles.statLabel}>Active Bundles</p>
            <h2 style={styles.statValue}>{vendorBundles.length}</h2>
          </div>
        </div>
      </div>

      {/* Live Active Bundles Grid on Vendor Dashboard with working Delete permissions */}
      <div style={{ background: '#f8fafc', padding: isMobile ? '18px' : '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: isMobile ? '30px' : '50px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '16px', color: '#0f172a' }}>
          My Active Bundles ({vendorBundles.length})
        </h3>
        {vendorBundles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {vendorBundles.map(bundle => (
              <div key={bundle.id} style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ minWidth: 0, paddingRight: '10px' }}>
                  <p style={{ fontWeight: '800', fontSize: '1rem', margin: '0 0 4px 0', color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bundle.bundle_name}</p>
                  <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '800', margin: 0 }}>₱{Number(bundle.price).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleDeleteBundle(bundle.id)}
                  style={{
                    background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', 
                    borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}
                  title="Delete Bundle"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No active bundles created yet.</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '30px', marginBottom: isMobile ? '30px' : '50px' }}>
        <div style={styles.mainCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <CalendarIcon size={22} />
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>Availability Calendar</h2>
            </div>
            <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={tileContent} className="eventease-main-calendar" />
        </div>

        <div style={styles.mainCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Clock size={22} />
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>Schedule: {selectedDate.toLocaleDateString()}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {selectedDateBookings.length > 0 ? selectedDateBookings.map(b => (
                    <div key={b.id} style={styles.eventItem}>
                        {/* Event Header with Name & Budget */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '5px' }}>
                          <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#0f172a', wordBreak: 'break-word' }}>{b.event_name}</div>
                          <div style={{ fontWeight: '900', color: '#059669', fontSize: '1rem' }}>₱{parseFloat(b.budget || 0).toLocaleString()}</div>
                        </div>

                        {/* Comprehensive Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '12px', background: '#f1f5f9', padding: '10px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={14} color="#64748b" style={{ flexShrink: 0 }} />
                                <span style={{ wordBreak: 'break-word' }}><strong>Location:</strong> {b.location}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users size={14} color="#64748b" style={{ flexShrink: 0 }} />
                                <span><strong>Guests:</strong> {b.guest_count || 1} pax</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Briefcase size={14} color="#64748b" style={{ flexShrink: 0 }} />
                                <span><strong>Category:</strong> {b.category || 'General'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CreditCard size={14} color="#64748b" style={{ flexShrink: 0 }} />
                                <span><strong>Payment:</strong> {b.payment_status || 'Unpaid'}</span>
                            </div>
                        </div>

                        {/* Client & Vendor / Service Breakdown Info */}
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px', wordBreak: 'break-word' }}>
                            {b.user && <div>👤 <strong>Client:</strong> {b.user.name} ({b.user.email})</div>}
                            {b.service && <div>🛠️ <strong>Assigned Service:</strong> {b.service.business_name || b.service.title}</div>}
                            {b.services && b.services.length > 0 && (
                                <div>📦 <strong>Attached Services:</strong> {b.services.map(s => s.business_name || s.title).join(', ')}</div>
                            )}
                        </div>

                        {/* Bill Adjustment Footer Controls */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                            {editingBookingId === b.id ? (
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <input 
                                  type="number" 
                                  value={newBudgetInput} 
                                  onChange={(e) => setNewBudgetInput(e.target.value)} 
                                  placeholder="New budget" 
                                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: isMobile ? '100%' : '120px', fontSize: '0.85rem' }}
                                />
                                <div style={{ display: 'flex', gap: '6px', width: isMobile ? '100%' : 'auto', justifyContent: 'flex-end' }}>
                                  <button onClick={() => handleAdjustBill(b.id)} style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', flex: isMobile ? 1 : 'unset' }}>Save</button>
                                  <button onClick={() => setEditingBookingId(null)} style={{ background: '#e2e8f0', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', flex: isMobile ? 1 : 'unset' }}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => { setEditingBookingId(b.id); setNewBudgetInput(b.budget); }} style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '800' }}>
                                <Edit3 size={14} /> Adjust Bill / Negotiate Terms
                              </button>
                            )}
                        </div>
                    </div>
                )) : <div style={{ textAlign: 'center', padding: '40px 0' }}><p style={{ color: '#aaa', fontWeight: '500' }}>No confirmed events.</p></div>}
            </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Pending Hire Requests</h2>
        <div style={{ flex: 1, height: '2px', background: '#f0f0f0', minWidth: '50px' }}></div>
      </div>

      <div style={styles.requestList}>
        {bookings.filter(b => b.status === 'pending').map(job => (
          <div key={job.id} style={{ ...styles.requestCard, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '20px' : '0' }}>
            <div style={{ flex: 1, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={styles.categoryBadge}>{job.category}</span>
                  <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1.15rem', wordBreak: 'break-word' }}>{job.event_name}</h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#555', margin: 0, fontWeight: '500', wordBreak: 'break-word' }}>📍 {job.location} | ₱{parseFloat(job.budget || 0).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
              <button onClick={() => handleStatus(job.id, 'accepted')} style={{ ...styles.acceptBtn, flex: isMobile ? 1 : 'unset', justifyContent: 'center' }}><Check size={18}/> Accept</button>
              <button onClick={() => handleStatus(job.id, 'rejected')} style={{ ...styles.rejectBtn, flex: isMobile ? 'unset' : 'unset', justifyContent: 'center' }}><X size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  statBox: { flex: 1, background: '#fff', padding: '24px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f0f0f0', boxShadow: '0 15px 35px rgba(0,0,0,0.03)' },
  mainCard: { background: '#fff', padding: '24px', borderRadius: '32px', border: '1px solid #f0f0f0', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' },
  statLabel: { margin: 0, color: '#888', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
  statValue: { margin: 0, fontSize: '1.8rem', fontWeight: '900', color: '#1a1a1a' },
  requestCard: { background: '#fff', padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  categoryBadge: { background: '#f0f0f0', color: '#000', padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' },
  acceptBtn: { background: '#000', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' },
  rejectBtn: { background: '#fff', color: '#ff4d4d', border: '1px solid #fee2e2', padding: '12px 16px', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  notifBtn: { background: '#fff', border: '2px solid #f0f0f0', padding: '12px 18px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' },
  manageBtn: { background: '#1a1a1a', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' },
  eventItem: { padding: '16px', background: '#fcfcfc', borderRadius: '20px', borderLeft: '5px solid #000', marginBottom: '15px' }
};

export default VendorDashboard;