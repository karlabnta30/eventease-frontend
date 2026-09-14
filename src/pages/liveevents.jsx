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
      backdropFilter: 'blur(12px)' 
    }}>
      <div style={{
        background: 'white', padding: '50px', borderRadius: '32px',
        textAlign: 'center', maxWidth: '450px', width: '90%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)', border: '1px solid #eee'
      }}>
        <div style={{ fontSize: '70px', marginBottom: '20px' }}>🗑️</div>
        <h2 style={{ color: '#000', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '15px' }}>
          Event Removed
        </h2>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '35px', fontSize: '1.1rem', fontWeight: '500' }}>
          "<strong>{eventName}</strong>" has been successfully cancelled and removed from your records.
        </p>
        <button 
          onClick={onClose}
          style={{
            background: '#000', color: '#fff', border: 'none',
            padding: '18px 0', borderRadius: '14px', fontWeight: '800',
            cursor: 'pointer', width: '100%', fontSize: '1.1rem'
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
      backdropFilter: 'blur(12px)' 
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '32px',
        textAlign: 'center', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
        border: '1px solid #eee'
      }}>
        <div style={{ fontSize: '50px', marginBottom: '20px' }}>⚠️</div>
        <h2 style={{ color: '#000', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-1px' }}>Delete Event?</h2>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px', fontWeight: '500' }}>
          Are you sure you want to delete <strong>"{eventName || 'this event'}"</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={onConfirm}
            style={{
              background: '#000', color: 'white', border: 'none',
              padding: '16px', borderRadius: '14px', fontWeight: '800',
              cursor: 'pointer', width: '100%', fontSize: '1rem'
            }}
          >
            CONFIRM DELETE
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}
          >
            Cancel, keep it
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
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
      try {
        const userRes = await axios.get('http://127.0.0.1:8000/api/user', { headers });
        setUser(userRes.data);

        const url = userRole === 'admin' ? 'http://127.0.0.1:8000/api/admin/bookings' : 'http://127.0.0.1:8000/api/bookings';
        const res = await axios.get(url, { headers });
        setBookings(res.data.data || (Array.isArray(res.data) ? res.data : []));
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [navigate]);

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    // SECURITY CHECK: Block cancellation of paid events
    if (eventToDelete.payment_status && eventToDelete.payment_status.toLowerCase() === 'paid') {
        alert("Transaction Secured: Paid events cannot be cancelled through the dashboard.");
        setIsDeleteOpen(false);
        return;
    }

    try {
      const token = localStorage.getItem('token');
      const cleanId = String(eventToDelete.id).split(':')[0];
      const deletedName = eventToDelete.event_name;
      setLastDeletedName(deletedName);

      await axios.delete(`http://127.0.0.1:8000/api/bookings/${cleanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setBookings(prev => prev.filter(item => item.id !== eventToDelete.id));
      notifyEventCancelled(`"${deletedName}" has been removed.`);
      
      setIsDeleteOpen(false);
      setIsSuccessDeleteOpen(true);
    } catch (err) { console.error(err); alert("Delete failed."); }
  };

  const styles = {
    container: { 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh', 
        padding: '40px 20px', 
        fontFamily: "'Inter', sans-serif",
        backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
    },
    content: { maxWidth: '1200px', margin: '0 auto' },
    headerSection: { 
        marginBottom: '40px', 
        borderLeft: '5px solid #000', 
        paddingLeft: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    greeting: { fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', color: '#000', marginBottom: '4px' },
    description: { fontSize: '1rem', color: '#666', fontWeight: '500', maxWidth: '500px' },
    actionRow: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px', 
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.8)'
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' },
    card: { 
        background: 'white', 
        padding: '28px', 
        borderRadius: '28px', 
        border: '1px solid #f0f0f0', 
        position: 'relative', 
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default',
        boxShadow: '0 10px 20px rgba(0,0,0,0.02)'
    },
    deleteBtn: { 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        background: '#fff', 
        border: '1px solid #fee2e2', 
        color: '#ef4444', 
        cursor: 'pointer', 
        padding: '8px', 
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    badge: (status) => ({ 
        background: status === 'accepted' ? '#000' : '#f0f0f0', 
        color: status === 'accepted' ? '#fff' : '#000', 
        padding: '5px 12px', 
        borderRadius: '20px', 
        fontSize: '0.7rem', 
        fontWeight: '700', 
        textTransform: 'uppercase', 
        marginBottom: '15px', 
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
    }),
    infoRow: { display: 'flex', alignItems: 'center', gap: '12px', color: '#555', marginBottom: '12px', fontSize: '0.95rem' },
    detailsBtn: { 
        width: '100%', 
        marginTop: '20px', 
        padding: '15px', 
        borderRadius: '16px', 
        background: '#000', 
        color: '#fff', 
        fontWeight: '700', 
        border: 'none', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    paymentBtn: {
        marginTop: '15px',
        background: '#22c55e',
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
        gap: '10px'
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
        <div style={styles.headerSection}>
            <h1 style={styles.greeting}>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
            <p style={styles.description}>You have {bookings.length} active events in your itinerary. Everything is looking good!</p>
        </div>

        <div style={styles.actionRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={22} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Live Events</h2>
          </div>
          
          {user?.role !== 'admin' && (
            <button 
              onClick={() => navigate('/create-event')} 
              style={{ 
                  background: '#000', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '14px', 
                  fontWeight: '700', 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
              }}
            >
              <Plus size={18} /> Plan New Event
            </button>
          )}
        </div>

        {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <p style={{ fontWeight: '600', color: '#888' }}>Syncing with system records...</p>
            </div>
        ) : (
          <div style={styles.grid}>
            {bookings.length > 0 ? bookings.map((item) => {
              const isPaid = item.payment_status && item.payment_status.toLowerCase() === 'paid';

              return (
              <div key={item.id} style={styles.card}>
                
                {/* CONDITIONAL DELETE BUTTON: Hidden if already Paid */}
                {!isPaid ? (
                  <button 
                      onClick={() => { setEventToDelete(item); setIsDeleteOpen(true); }} 
                      style={styles.deleteBtn}
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <div style={{...styles.deleteBtn, border: 'none', cursor: 'default', opacity: 0.7}}>
                    <ShieldCheck size={18} color="#22c55e" />
                  </div>
                )}
                
                <span style={styles.badge(item.status)}>
                    {item.status === 'accepted' ? <CheckCircle size={12} /> : <Users size={12} />}
                    {item.status === 'accepted' ? 'VENDOR CONFIRMED' : (item.category || 'Event')}
                </span>
                
                <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '18px', letterSpacing: '-0.5px' }}>{item.event_name}</h3>
                
                <div style={styles.infoRow}>
                  <MapPin size={16} color="#000" />
                  <span style={{ fontWeight: '600' }}>{item.location || 'Venue TBD'}</span>
                </div>
                
                <div style={styles.infoRow}>
                  <CreditCard size={16} color="#000" />
                  <span style={{ fontWeight: '600' }}>₱{parseFloat(item.budget || 0).toLocaleString()}</span>
                </div>

                {/* --- PAYMENT BRIDGE --- */}
                {item.status === 'accepted' && !isPaid && (
                    <button 
                        onClick={() => navigate(`/checkout?booking_id=${item.id}&amount=${item.budget}`)}
                        style={styles.paymentBtn}
                    >
                        <CreditCard size={18} /> PROCEED TO PAYMENT
                    </button>
                )}

                {isPaid && (
                    <div style={{ marginTop: '15px', color: '#22c55e', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '10px', borderRadius: '12px', justifyContent: 'center' }}>
                        <CheckCircle size={18} /> BOOKING FULLY PAID
                    </div>
                )}

                <button 
                    onClick={() => navigate(`/booking-details/${item.id}`)} 
                    style={styles.detailsBtn}
                >
                  View Full Details <ArrowRight size={18} />
                </button>
              </div>
            )}) : (
                <div style={{ textAlign: 'center', gridColumn: '1/-1', padding: '80px 20px', background: '#fff', borderRadius: '30px', border: '2px dashed #eee' }}>
                    <div style={{ fontSize: '40px', marginBottom: '15px' }}>🎈</div>
                    <p style={{ color: '#888', fontWeight: '600', fontSize: '1.1rem' }}>Your event list is empty.</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveEvents;