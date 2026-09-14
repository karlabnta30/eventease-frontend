import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State for tracking active bill negotiation edits
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [newBudgetInput, setNewBudgetInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole'); 

      try {
        const res = await axios.get('http://127.0.0.1:8000/api/vendor/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setBookings(res.data.data || res.data.bookings || []);
        setStats(res.data.stats || { earnings: 0, pending: 0 });

        const bundlesRes = await axios.get('http://127.0.0.1:8000/api/bundles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVendorBundles(bundlesRes.data || []);

        const notifRes = await axios.get('http://127.0.0.1:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const notifications = Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data.data || []);
        const unread = notifications.filter(n => !n.is_read);

        unread.slice(0, 3).forEach((n, i) => {
          if (userRole === 'vendor') {
            setTimeout(() => { notifyNewBooking(n.message); }, i * 1500);
          }
        });

      } catch (err) { console.error("Dashboard Fetch Error:", err); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://127.0.0.1:8000/api/bookings/${id}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      
      const statRes = await axios.get('http://127.0.0.1:8000/api/vendor/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statRes.data.stats);

    } catch (err) { alert("Failed to update status."); }
  };

  const handleAdjustBill = async (bookingId) => {
    const token = localStorage.getItem('token');
    if (!newBudgetInput || isNaN(newBudgetInput)) {
      alert("Please enter a valid numeric budget amount.");
      return;
    }

    try {
      await axios.patch(`http://127.0.0.1:8000/api/bookings/${bookingId}/adjust-bill`, {
        budget: Number(newBudgetInput)
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('token');
      const cleanId = String(id).replace('bundle_', '');
      
      try {
        await axios.delete(`http://127.0.0.1:8000/api/bundles/${cleanId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVendorBundles(vendorBundles.filter(b => b.id !== id && String(b.id) !== String(cleanId)));
      } catch (err1) {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/vendor/bundles/${cleanId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setVendorBundles(vendorBundles.filter(b => b.id !== id && String(b.id) !== String(cleanId)));
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

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontWeight: '800' }}>Synchronizing Command Center...</div>;

  return (
    <div style={{ padding: '40px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <Toaster position="top-right" />
      
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', color: '#1a1a1a', margin: 0 }}>Vendor Command Center</h1>
            <p style={{ color: '#666', fontWeight: '500', marginTop: '10px' }}>Your central hub for event management, bill adjustments, and scheduling.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => navigate('/vendor-services')} style={styles.manageBtn}>
                <LayoutGrid size={18} /> Manage My Services
            </button>
            <button onClick={() => navigate('/notifications')} style={styles.notifBtn}>
                <Bell size={18} /> View All Notifications
            </button>
        </div>
      </div>
      
      {/* Top Stats Box including Revenue, Awaiting Approval, and Active Bundles */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '50px' }}>
        <div style={styles.statBox}>
          <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '14px' }}>
            <CreditCard size={24} color="#000" />
          </div>
          <div>
            <p style={styles.statLabel}>Revenue</p>
            <h2 style={styles.statValue}>₱{(stats.earnings || 0).toLocaleString()}</h2>
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={{ background: '#000', padding: '15px', borderRadius: '14px' }}>
            <Package size={24} color="#fff" />
          </div>
          <div>
            <p style={styles.statLabel}>Awaiting Approval</p>
            <h2 style={styles.statValue}>{stats.pending || 0}</h2>
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={{ background: '#059669', padding: '15px', borderRadius: '14px' }}>
            <Package size={24} color="#fff" />
          </div>
          <div>
            <p style={styles.statLabel}>Active Bundles</p>
            <h2 style={styles.statValue}>{vendorBundles.length}</h2>
          </div>
        </div>
      </div>

      {/* Live Active Bundles Grid on Vendor Dashboard with working Delete permissions */}
      <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '50px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '16px', color: '#0f172a' }}>
          My Active Bundles ({vendorBundles.length})
        </h3>
        {vendorBundles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {vendorBundles.map(bundle => (
              <div key={bundle.id} style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: '800', fontSize: '1rem', margin: '0 0 4px 0', color: '#1a1a1a' }}>{bundle.bundle_name}</p>
                  <p style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '800', margin: 0 }}>₱{Number(bundle.price).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleDeleteBundle(bundle.id)}
                  style={{
                    background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', 
                    borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginBottom: '50px' }}>
        <div style={styles.mainCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <CalendarIcon size={22} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Availability Calendar</h2>
            </div>
            <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={tileContent} className="eventease-main-calendar" />
        </div>

        <div style={styles.mainCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Clock size={22} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Schedule: {selectedDate.toLocaleDateString()}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {selectedDateBookings.length > 0 ? selectedDateBookings.map(b => (
                    <div key={b.id} style={styles.eventItem}>
                        {/* Event Header with Name & Budget */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ fontWeight: '900', fontSize: '1.15rem', color: '#0f172a' }}>{b.event_name}</div>
                          <div style={{ fontWeight: '900', color: '#059669', fontSize: '1.05rem' }}>₱{parseFloat(b.budget || 0).toLocaleString()}</div>
                        </div>

                        {/* Comprehensive Details Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '12px', background: '#f1f5f9', padding: '10px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <MapPin size={14} color="#64748b" />
                                <span><strong>Location:</strong> {b.location}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users size={14} color="#64748b" />
                                <span><strong>Guests:</strong> {b.guest_count || 1} pax</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Briefcase size={14} color="#64748b" />
                                <span><strong>Category:</strong> {b.category || 'General'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CreditCard size={14} color="#64748b" />
                                <span><strong>Payment:</strong> {b.payment_status || 'Unpaid'}</span>
                            </div>
                        </div>

                        {/* Client & Vendor / Service Breakdown Info */}
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {b.user && <div>👤 <strong>Client:</strong> {b.user.name} ({b.user.email})</div>}
                            {b.service && <div>🛠️ <strong>Assigned Service:</strong> {b.service.business_name || b.service.title}</div>}
                            {b.services && b.services.length > 0 && (
                                <div>📦 <strong>Attached Services:</strong> {b.services.map(s => s.business_name || s.title).join(', ')}</div>
                            )}
                        </div>

                        {/* Bill Adjustment Footer Controls */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                            {editingBookingId === b.id ? (
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', justifyContent: 'flex-end' }}>
                                <input 
                                  type="number" 
                                  value={newBudgetInput} 
                                  onChange={(e) => setNewBudgetInput(e.target.value)} 
                                  placeholder="New budget" 
                                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '120px', fontSize: '0.85rem' }}
                                />
                                <button onClick={() => handleAdjustBill(b.id)} style={{ background: '#000', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>Save</button>
                                <button onClick={() => setEditingBookingId(null)} style={{ background: '#e2e8f0', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>Pending Hire Requests</h2>
        <div style={{ flex: 1, height: '2px', background: '#f0f0f0', marginLeft: '15px' }}></div>
      </div>

      <div style={styles.requestList}>
        {bookings.filter(b => b.status === 'pending').map(job => (
          <div key={job.id} style={styles.requestCard}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={styles.categoryBadge}>{job.category}</span>
                  <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1.25rem' }}>{job.event_name}</h4>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#555', margin: 0, fontWeight: '500' }}>📍 {job.location} | ₱{parseFloat(job.budget || 0).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleStatus(job.id, 'accepted')} style={styles.acceptBtn}><Check size={18}/> Accept</button>
              <button onClick={() => handleStatus(job.id, 'rejected')} style={styles.rejectBtn}><X size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  statBox: { flex: 1, background: '#fff', padding: '30px', borderRadius: '28px', display: 'flex', alignItems: 'center', gap: '25px', border: '1px solid #f0f0f0', boxShadow: '0 15px 35px rgba(0,0,0,0.03)' },
  mainCard: { background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #f0f0f0', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' },
  statLabel: { margin: 0, color: '#888', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
  statValue: { margin: 0, fontSize: '2rem', fontWeight: '900', color: '#1a1a1a' },
  requestCard: { background: '#fff', padding: '30px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: '1px solid #f0f0f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  categoryBadge: { background: '#f0f0f0', color: '#000', padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' },
  acceptBtn: { background: '#000', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  rejectBtn: { background: '#fff', color: '#ff4d4d', border: '1px solid #fee2e2', padding: '14px', borderRadius: '14px', cursor: 'pointer' },
  notifBtn: { background: '#fff', border: '2px solid #f0f0f0', padding: '12px 20px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  manageBtn: { background: '#1a1a1a', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  eventItem: { padding: '20px', background: '#fcfcfc', borderRadius: '20px', borderLeft: '5px solid #000', marginBottom: '15px' }
};

export default VendorDashboard;