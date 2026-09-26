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
      backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      backdropFilter: 'blur(8px)' 
    }}>
      <div style={{
        background: '#ffffff', padding: '40px', borderRadius: '24px',
        textAlign: 'center', maxWidth: '400px', width: '90%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #eaeaea'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
        <h2 style={{ color: '#000', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px' }}>
          Event Cancelled
        </h2>
        <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '25px', fontSize: '0.95rem', fontWeight: '500' }}>
          "{<strong>{eventName}</strong>}" has been successfully cleared from your itinerary.
        </p>
        <button 
          onClick={onClose}
          style={{
            background: '#000', color: '#fff', border: 'none',
            padding: '14px 0', borderRadius: '14px', fontWeight: '900',
            cursor: 'pointer', width: '100%', fontSize: '0.9rem'
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1100,
      backdropFilter: 'blur(8px)' 
    }}>
      <div style={{
        background: '#ffffff', padding: '40px', borderRadius: '24px',
        textAlign: 'center', maxWidth: '400px', width: '90%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #eaeaea'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#000', fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px' }}>Cancel Event?</h2>
        <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '25px', fontWeight: '500', fontSize: '0.9rem' }}>
          Are you sure you want to cancel <strong>"{eventName || 'this event'}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={onConfirm}
            style={{
              background: '#ef4444', color: 'white', border: 'none',
              padding: '14px', borderRadius: '14px', fontWeight: '900',
              cursor: 'pointer', width: '100%', fontSize: '0.9rem'
            }}
          >
            YES, CANCEL EVENT
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontWeight: '800', fontSize: '0.85rem' }}
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
        backgroundColor: '#ffffff', 
        minHeight: '100vh', 
        padding: '50px 60px', 
        fontFamily: "'Inter', sans-serif"
    },
    content: { maxWidth: '1300px', margin: '0 auto' },
    headerWrapper: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end', 
        marginBottom: '40px',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '25px',
        flexWrap: 'wrap',
        gap: '20px'
    },
    greeting: { fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', color: '#000', margin: '0 0 6px 0' },
    description: { fontSize: '0.95rem', color: '#64748b', fontWeight: '600', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' },
    card: { 
        background: '#ffffff', 
        padding: '30px', 
        borderRadius: '24px', 
        border: '1px solid #eaeaea', 
        position: 'relative', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease'
    },
    deleteBtn: { 
        position: 'absolute', 
        top: '25px', 
        right: '25px', 
        background: '#fee2e2', 
        border: 'none', 
        color: '#ef4444', 
        cursor: 'pointer', 
        padding: '8px', 
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    badge: (status) => ({ 
        background: status === 'accepted' ? '#ecfdf5' : '#f8fafc', 
        color: status === 'accepted' ? '#047857' : '#475569', 
        padding: '5px 12px', 
        borderRadius: '8px', 
        fontSize: '0.7rem', 
        fontWeight: '900', 
        textTransform: 'uppercase', 
        marginBottom: '16px', 
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        border: status === 'accepted' ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
    }),
    infoRow: { display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', marginBottom: '10px', fontSize: '0.9rem' },
    detailsBtn: { 
        width: '100%', 
        marginTop: '20px', 
        padding: '14px', 
        borderRadius: '14px', 
        background: '#000', 
        color: '#fff', 
        fontWeight: '900', 
        border: 'none', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.85rem'
    },
    paymentBtn: {
        marginTop: '14px',
        background: '#10b981',
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
        fontSize: '0.85rem'
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
        
        {/* CLEAN EVENTEASE MINIMALIST HEADER (NO HERO BANNER) */}
        <div style={styles.headerWrapper}>
          <div>
            <h1 style={styles.greeting}>Live Events Itinerary</h1>
            <p style={styles.description}>
              Welcome back, {user?.name || 'User'}. You have {bookings.length} active scheduled event(s).
            </p>
          </div>
          
          {user?.role !== 'admin' && (
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
                  fontSize: '0.9rem'
              }}
            >
              <Plus size={16} /> Plan New Event
            </button>
          )}
        </div>

        {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <p style={{ fontWeight: '800', color: '#64748b' }}>Loading active itineraries...</p>
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
                  <div style={{...styles.deleteBtn, background: '#ecfdf5', color: '#047857', cursor: 'default'}} title="Secured & Paid">
                    <ShieldCheck size={18} />
                  </div>
                )}
                
                <div>
                  <span style={styles.badge(item.status)}>
                      {item.status === 'accepted' ? <CheckCircle size={12} /> : <Users size={12} />}
                      {item.status === 'accepted' ? 'VENDOR CONFIRMED' : (item.category || 'Event')}
                  </span>
                  
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '14px', color: '#000', letterSpacing: '-0.5px' }}>{item.event_name}</h3>
                  
                  <div style={styles.infoRow}>
                    <MapPin size={16} color="#000" />
                    <span style={{ fontWeight: '600' }}>{item.location || 'Venue TBD'}</span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <CreditCard size={16} color="#000" />
                    <span style={{ fontWeight: '800', color: '#000' }}>₱{parseFloat(item.budget || 0).toLocaleString()}</span>
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
                      <div style={{ marginTop: '14px', color: '#047857', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '12px', borderRadius: '12px', justifyContent: 'center', fontSize: '0.8rem', border: '1px solid #a7f3d0' }}>
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
                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '80px 20px', background: '#fafafa', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
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