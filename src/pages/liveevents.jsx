import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { notifyEventCancelled } from "../toastUtils.jsx";
import { Trash2, MapPin, CreditCard, Plus, ArrowRight, Calendar, Users, CheckCircle, ShieldCheck } from 'lucide-react';

// --- SUCCESS DELETE MODAL ---
const SuccessDeleteModal = ({ isOpen, onClose, eventName }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      backdropFilter: 'blur(12px)' 
    }}>
      <div style={{
        background: '#ffffff', padding: '45px', borderRadius: '32px',
        textAlign: 'center', maxWidth: '420px', width: '90%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🗑️</div>
        <h2 style={{ color: '#0f172a', fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '12px' }}>
          Event Cancelled
        </h2>
        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '30px', fontSize: '1rem', fontWeight: '500' }}>
          "{<strong>{eventName}</strong>}" has been successfully cancelled and cleared from your active schedule.
        </p>
        <button 
          onClick={onClose}
          style={{
            background: '#0f172a', color: '#fff', border: 'none',
            padding: '16px 0', borderRadius: '14px', fontWeight: '900',
            cursor: 'pointer', width: '100%', fontSize: '1rem',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)'
          }}
        >
          BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );
};

// --- CUSTOM DELETE CONFIRMATION MODAL ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, eventName }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1100,
      backdropFilter: 'blur(12px)' 
    }}>
      <div style={{
        background: '#ffffff', padding: '40px', borderRadius: '32px',
        textAlign: 'center', maxWidth: '400px', width: '90%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px' }}>Cancel Event?</h2>
        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '25px', fontWeight: '500', fontSize: '0.95rem' }}>
          Are you sure you want to cancel <strong>"{eventName || 'this event'}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={onConfirm}
            style={{
              background: '#ef4444', color: 'white', border: 'none',
              padding: '15px', borderRadius: '14px', fontWeight: '900',
              cursor: 'pointer', width: '100%', fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            YES, CANCEL EVENT
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem' }}
          >
            No, keep it
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveEvents = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSuccessDeleteOpen, setIsSuccessDeleteOpen] = useState(false); 
  const [eventToDelete, setEventToDelete] = useState(null);
  const [lastDeletedName, setLastDeletedName] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole'); 
    if (userRole === 'vendor') { navigate('/vendor-dashboard'); return; }

    const fetchData = async () => {
      try {
        const userRes = await api.get('/user');
        setUser(userRes.data);

        const url = userRole === 'admin' ? '/admin/bookings' : '/bookings';
        const res = await api.get(url);
        setBookings(res.data.data || (Array.isArray(res.data) ? res.data : []));
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [navigate]);

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    if (eventToDelete.payment_status && eventToDelete.payment_status.toLowerCase() === 'paid') {
        alert("Transaction Secured: Paid events cannot be cancelled through the dashboard.");
        setIsDeleteOpen(false);
        return;
    }

    try {
      const cleanId = String(eventToDelete.id).split(':')[0];
      const deletedName = eventToDelete.event_name;
      setLastDeletedName(deletedName);

      await api.delete(`/bookings/${cleanId}`);
      
      setBookings(prev => prev.filter(item => item.id !== eventToDelete.id));
      notifyEventCancelled(`"${deletedName}" has been removed.`);
      
      setIsDeleteOpen(false);
      setIsSuccessDeleteOpen(true);
    } catch (err) { 
      console.error(err); 
      alert("Delete failed."); 
    }
  };

  const styles = {
    container: { 
        backgroundColor: '#f8fafc', 
        minHeight: '100vh', 
        padding: '40px 6%', 
        fontFamily: "'Inter', sans-serif"
    },
    content: { maxWidth: '1200px', margin: '0 auto' },
    heroBanner: { 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        padding: '36px 40px', 
        borderRadius: '24px', 
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '35px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
    },
    greeting: { fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 6px 0' },
    description: { fontSize: '0.95rem', color: '#94a3b8', fontWeight: '500', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
    card: { 
        background: '#ffffff', 
        padding: '28px', 
        borderRadius: '24px', 
        border: '1px solid #e2e8f0', 
        position: 'relative', 
        transition: 'all 0.3s ease',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    deleteBtn: { 
        position: 'absolute', 
        top: '24px', 
        right: '24px', 
        background: '#fee2e2', 
        border: 'none', 
        color: '#ef4444', 
        cursor: 'pointer', 
        padding: '8px', 
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.2s'
    },
    badge: (status) => ({ 
        background: status === 'accepted' ? '#d1fae5' : '#f1f5f9', 
        color: status === 'accepted' ? '#065f46' : '#334155', 
        padding: '4px 10px', 
        borderRadius: '8px', 
        fontSize: '0.7rem', 
        fontWeight: '900', 
        textTransform: 'uppercase', 
        marginBottom: '14px', 
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        width: 'fit-content'
    }),
    infoRow: { display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', marginBottom: '10px', fontSize: '0.9rem' },
    detailsBtn: { 
        width: '100%', 
        marginTop: '20px', 
        padding: '14px', 
        borderRadius: '14px', 
        background: '#0f172a', 
        color: '#fff', 
        fontWeight: '900', 
        border: 'none', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
    },
    paymentBtn: {
        marginTop: '14px',
        background: '#059669',
        color: '#fff',
        width: '100%',
        padding: '14px',
        borderRadius: '14px',
        fontWeight: '900',
        cursor: 'pointer',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
    }
  };

  return (
    <div style={styles.container}>
      <DeleteConfirmationModal 
        isOpen={isDeleteOpen} 
        eventName={eventToDelete?.event_name} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleConfirmDelete} 
      />

      <SuccessDeleteModal 
        isOpen={isSuccessDeleteOpen} 
        eventName={lastDeletedName} 
        onClose={() => setIsSuccessDeleteOpen(false)} 
      />
      
      <div style={styles.content}>
        
        {/* HERO BANNER */}
        <div style={styles.heroBanner}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', fontWeight: '900', padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
                Active Itinerary
              </span>
            </div>
            <h1 style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
            <p style={styles.description}>You have {bookings.length} active event schedules managed in your system.</p>
          </div>
          
          {user?.role !== 'admin' && (
            <button 
              onClick={() => navigate('/create-event')} 
              style={{ 
                  background: '#3b82f6', 
                  color: 'white', 
                  padding: '14px 22px', 
                  borderRadius: '14px', 
                  fontWeight: '900', 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
            >
              <Plus size={18} /> Plan New Event
            </button>
          )}
        </div>

        {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ fontWeight: '700', color: '#64748b' }}>Syncing system itineraries...</p>
            </div>
        ) : (
          <div style={styles.grid}>
            {bookings.length > 0 ? bookings.map((item) => {
              const isPaid = item.payment_status && item.payment_status.toLowerCase() === 'paid';

              return (
              <div key={item.id} style={styles.card}>
                
                {/* CONDITIONAL DELETE BUTTON */}
                {!isPaid ? (
                  <button 
                      onClick={() => { setEventToDelete(item); setIsDeleteOpen(true); }} 
                      style={styles.deleteBtn}
                      title="Cancel Event"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <div style={{...styles.deleteBtn, background: '#d1fae5', color: '#059669', cursor: 'default'}} title="Secured & Paid">
                    <ShieldCheck size={18} />
                  </div>
                )}
                
                <div>
                  <span style={styles.badge(item.status)}>
                      {item.status === 'accepted' ? <CheckCircle size={12} /> : <Users size={12} />}
                      {item.status === 'accepted' ? 'VENDOR CONFIRMED' : (item.category || 'Event')}
                  </span>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '900', marginBottom: '16px', color: '#0f172a', letterSpacing: '-0.5px' }}>{item.event_name}</h3>
                  
                  <div style={styles.infoRow}>
                    <MapPin size={16} color="#3b82f6" />
                    <span style={{ fontWeight: '600' }}>{item.location || 'Venue TBD'}</span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <CreditCard size={16} color="#059669" />
                    <span style={{ fontWeight: '800', color: '#059669' }}>₱{parseFloat(item.budget || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  {/* PAYMENT BRIDGE */}
                  {item.status === 'accepted' && !isPaid && (
                      <button 
                          onClick={() => navigate(`/checkout?booking_id=${item.id}&amount=${item.budget}`)}
                          style={styles.paymentBtn}
                      >
                          <CreditCard size={16} /> PROCEED TO PAYMENT
                      </button>
                  )}

                  {isPaid && (
                      <div style={{ marginTop: '14px', color: '#059669', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '10px', borderRadius: '12px', justifyContent: 'center', fontSize: '0.8rem' }}>
                          <CheckCircle size={16} /> BOOKING FULLY PAID
                      </div>
                  )}

                  <button 
                      onClick={() => navigate(`/booking-details/${item.id}`)} 
                      style={styles.detailsBtn}
                  >
                    View Full Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}) : (
                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '80px 20px', background: '#fff', borderRadius: '24px', border: '2px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '40px', marginBottom: '15px' }}>🎈</div>
                    <p style={{ color: '#64748b', fontWeight: '700', fontSize: '1rem', margin: 0 }}>Your active event list is currently empty.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveEvents;