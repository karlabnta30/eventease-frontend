import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, MapPin, Calendar, Users, CreditCard, Clock, ShieldCheck, Trash2, Edit3, Lock, ShieldAlert } from 'lucide-react';

// --- 1. MODAL COMPONENT ---
const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
        <h2 style={{ color: '#1a1a1a', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-1px' }}>Cancel Event?</h2>
        <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.5' }}>
          This will permanently remove <strong>booking records</strong> and notify any assigned vendors. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={onCancel} style={styles.modalCancelBtn}>No, Keep it</button>
          <button onClick={onConfirm} style={styles.modalDeleteBtn}>Yes, Cancel Event</button>
        </div>
      </div>
    </div>
  );
};

// --- 2. MAIN COMPONENT ---
const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Get User Role to handle Admin permissions
  const userRole = localStorage.getItem('userRole');

  const getCleanId = () => (id && id.includes(':') ? id.split(':')[0] : id);

  useEffect(() => {
    const fetchEventDetails = async () => {
      const token = localStorage.getItem('token');
      const cleanId = getCleanId();

      if (!cleanId) return navigate('/live-events');

      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/bookings/${cleanId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvent(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching details:", err);
        if (err.response?.status === 500) {
            alert("Database Error: Could not retrieve details.");
        }
        navigate('/live-events');
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id, navigate]);

  const handleConfirmDelete = async () => {
    // SECURITY CHECK: Prevent API call if status is Paid, UNLESS the user is an Admin
    if (event?.payment_status?.toLowerCase() === 'paid' && userRole !== 'admin') {
        alert("Action Restricted: Paid events cannot be cancelled by clients.");
        setIsDeleteModalOpen(false);
        return;
    }

    const token = localStorage.getItem('token');
    const cleanId = getCleanId();
    
    try {
      await axios.delete(`http://127.0.0.1:8000/api/bookings/${cleanId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Navigate back based on role
      if (userRole === 'admin') {
          navigate('/admin-dashboard');
      } else {
          navigate('/live-events');
      }
    } catch (err) {
        alert(err.response?.data?.error || "Unauthorized action.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) return <div style={styles.loadingState}>Synchronizing event data...</div>;
  if (!event) return <div style={styles.loadingState}>Event not found.</div>;

  // Logic check for locking the UI
  // LOCKED if Paid AND NOT Admin
  const isPaid = event.payment_status?.toLowerCase() === 'paid';
  const isLocked = isPaid && userRole !== 'admin';
  const isAdminOverride = isPaid && userRole === 'admin';

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={18} /> Back
        </button>
        
        <div style={styles.card}>
          {/* Header Section */}
          <div style={styles.header}>
            <div>
              <span style={styles.categoryBadge}>{event.category}</span>
              <h1 style={styles.title}>{event.event_name}</h1>
              <div style={styles.idLabel}>BOOKING ID: #00{getCleanId()}</div>
            </div>
            <div style={styles.statusGroup}>
                <div style={styles.statusIndicator(event.status)}>{event.status}</div>
                <div style={styles.paymentIndicator(event.payment_status)}>{event.payment_status || 'Unpaid'}</div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={styles.gridSection}>
            <DetailBlock label="Hired Service" icon={<ShieldCheck size={18} color="#000"/>} 
              value={event.service?.business_name || event.service?.name || 'Awaiting Vendor'} />
            
            <DetailBlock label="Venue / Location" icon={<MapPin size={18} color="#000"/>} 
              value={event.location} />
            
            <DetailBlock label="Event Date" icon={<Calendar size={18} color="#000"/>} 
              value={event.event_date ? new Date(event.event_date).toDateString() : 'TBD'} />
            
            <DetailBlock label="Duration" icon={<Clock size={18} color="#000"/>} 
              value={event.end_time ? `Until ${event.end_time}` : 'Full Day Event'} />

            <DetailBlock label="Guest Count" icon={<Users size={18} color="#000"/>} 
              value={`${event.guest_count || 0} Expected Guests`} />

            <DetailBlock label="Financial Allocation" icon={<CreditCard size={18} color="#000"/>} 
              value={`₱${parseFloat(event.budget || 0).toLocaleString()}`} />
          </div>

          {/* Action Footer */}
          <div style={styles.footer}>
            {/* Show Admin Override Banner if applicable */}
            {isAdminOverride && (
                <div style={styles.adminBanner}>
                    <ShieldAlert size={18} />
                    <span><strong>Administrator Access:</strong> You have override permissions to manage this paid event.</span>
                </div>
            )}

            {!isLocked ? (
              <>
                <button onClick={() => navigate(`/edit-event/${event.id}`)} style={styles.primaryBtn}>
                  <Edit3 size={18} /> Update Planning
                </button>
                <button onClick={() => setIsDeleteModalOpen(true)} style={styles.secondaryBtn}>
                  <Trash2 size={18} /> Cancel Booking
                </button>
              </>
            ) : (
              <div style={styles.lockedNotice}>
                <Lock size={20} /> 
                <span>This event is secured and fully paid. Planning is now finalized.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

// --- HELPER COMPONENT ---
const DetailBlock = ({ label, value, icon }) => (
    <div style={styles.detailBlock}>
        <div style={styles.detailLabel}>{label}</div>
        <div style={styles.detailValueRow}>
            {icon}
            <span style={styles.detailValue}>{value}</span>
        </div>
    </div>
);

// --- STYLES ---
const styles = {
  pageWrapper: { backgroundColor: '#ffffff', minHeight: '100vh', padding: '60px 20px', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '850px', margin: '0 auto' },
  loadingState: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#000', letterSpacing: '-1px', fontSize: '1.5rem' },
  backBtn: { background: 'none', border: 'none', color: '#888', fontWeight: '700', cursor: 'pointer', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' },
  card: { background: 'white', padding: '50px', borderRadius: '35px', border: '1px solid #f0f0f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '45px', borderBottom: '1px solid #f8f8f8', paddingBottom: '30px' },
  title: { fontSize: '2.8rem', fontWeight: '900', margin: '10px 0 5px 0', color: '#000', letterSpacing: '-2px' },
  categoryBadge: { background: '#000', color: '#fff', padding: '6px 16px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' },
  idLabel: { color: '#ccc', fontWeight: '800', fontSize: '0.8rem' },
  statusGroup: { display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' },
  gridSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' },
  detailBlock: { display: 'flex', flexDirection: 'column', gap: '8px' },
  detailLabel: { color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1.5px' },
  detailValueRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  detailValue: { fontSize: '1.1rem', color: '#000', fontWeight: '800' },
  footer: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '60px', borderTop: '1px solid #f8f8f8', paddingTop: '40px' },
  adminBanner: { width: '100%', background: '#fffbeb', color: '#92400e', padding: '15px 25px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #fef3c7', fontSize: '0.9rem', marginBottom: '10px' },
  primaryBtn: { flex: 2, padding: '20px', background: '#000', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1rem' },
  secondaryBtn: { flex: 1, padding: '20px', background: '#fff', color: '#ff4d4d', border: '1px solid #ffebeb', borderRadius: '20px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  lockedNotice: { flex: 1, padding: '25px', background: '#f8f9fa', color: '#666', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '0.95rem', fontWeight: '600', border: '1px solid #eee' },
  statusIndicator: (status) => ({
    padding: '8px 18px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase',
    background: status === 'pending' ? '#fff9db' : '#000',
    color: status === 'pending' ? '#f08c00' : '#fff',
    border: status === 'pending' ? '1px solid #fff3bf' : 'none'
  }),
  paymentIndicator: (pay) => ({
    padding: '8px 18px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase',
    background: pay === 'Paid' ? '#ebfbee' : '#fff0f0',
    color: pay === 'Paid' ? '#2f9e44' : '#e03131',
    border: `1px solid ${pay === 'Paid' ? '#d3f9d8' : '#ffc9c9'}`
  }),
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' },
  modalContent: { background: 'white', padding: '50px', borderRadius: '40px', textAlign: 'center', maxWidth: '450px', boxShadow: '0 40px 100px rgba(0,0,0,0.2)' },
  modalCancelBtn: { flex: 1, padding: '18px', borderRadius: '18px', border: 'none', background: '#f5f5f7', cursor: 'pointer', fontWeight: '900', color: '#000' },
  modalDeleteBtn: { flex: 1, padding: '18px', borderRadius: '18px', border: 'none', background: '#000', color: 'white', cursor: 'pointer', fontWeight: '900' }
};

export default BookingDetails;