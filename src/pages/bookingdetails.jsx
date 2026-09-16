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
        <div style={{ fontSize: '50px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px' }}>Cancel Event?</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6', fontWeight: '500' }}>
          This will permanently remove <strong>booking records</strong> and notify any assigned vendors. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
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
      const cleanId = getCleanId();
      if (!cleanId) return navigate('/live-events');

      try {
        const res = await api.get(`/bookings/${cleanId}`);
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

    const cleanId = getCleanId();
    
    try {
      await api.delete(`/bookings/${cleanId}`);
      
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
            <DetailBlock label="Hired Service" icon={<ShieldCheck size={18} color="#2563eb"/>} 
              value={event.service?.business_name || event.service?.name || 'Awaiting Vendor'} />
            
            <DetailBlock label="Venue / Location" icon={<MapPin size={18} color="#2563eb"/>} 
              value={event.location} />
            
            <DetailBlock label="Event Date" icon={<Calendar size={18} color="#2563eb"/>} 
              value={event.event_date ? new Date(event.event_date).toDateString() : 'TBD'} />
            
            <DetailBlock label="Duration" icon={<Clock size={18} color="#2563eb"/>} 
              value={event.end_time ? `Until ${event.end_time}` : 'Full Day Event'} />

            <DetailBlock label="Guest Count" icon={<Users size={18} color="#2563eb"/>} 
              value={`${event.guest_count || 0} Expected Guests`} />

            <DetailBlock label="Financial Allocation" icon={<CreditCard size={18} color="#059669"/>} 
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
                <Lock size={20} color="#64748b" /> 
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
  pageWrapper: { backgroundColor: '#f8fafc', minHeight: '100vh', padding: '50px 20px', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '850px', margin: '0 auto' },
  loadingState: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', fontSize: '1.25rem' },
  backBtn: { background: 'none', border: 'none', color: '#64748b', fontWeight: '800', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' },
  card: { background: '#ffffff', padding: '40px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px', borderBottom: '1px solid #f1f5f9', paddingBottom: '25px', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '2.2rem', fontWeight: '900', margin: '8px 0 4px 0', color: '#0f172a', letterSpacing: '-1.5px' },
  categoryBadge: { background: '#0f172a', color: '#fff', padding: '5px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' },
  idLabel: { color: '#94a3b8', fontWeight: '800', fontSize: '0.75rem', marginTop: '4px' },
  statusGroup: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' },
  gridSection: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' },
  detailBlock: { display: 'flex', flexDirection: 'column', gap: '6px' },
  detailLabel: { color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' },
  detailValueRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  detailValue: { fontSize: '1.05rem', color: '#0f172a', fontWeight: '800' },
  footer: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '45px', borderTop: '1px solid #f1f5f9', paddingTop: '30px' },
  adminBanner: { width: '100%', background: '#fffbeb', color: '#92400e', padding: '14px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fef3c7', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '600' },
  primaryBtn: { flex: 2, padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)' },
  secondaryBtn: { flex: 1, padding: '16px', background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem' },
  lockedNotice: { flex: 1, padding: '20px', background: '#f8fafc', color: '#475569', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: '700', border: '1px solid #e2e8f0' },
  statusIndicator: (status) => ({
    padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase',
    background: status === 'pending' ? '#fef3c7' : '#f1f5f9',
    color: status === 'pending' ? '#d97706' : '#0f172a'
  }),
  paymentIndicator: (pay) => ({
    padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase',
    background: pay === 'Paid' ? '#d1fae5' : '#fee2e2',
    color: pay === 'Paid' ? '#059669' : '#ef4444'
  }),
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' },
  modalContent: { background: '#ffffff', padding: '40px', borderRadius: '28px', textAlign: 'center', maxWidth: '420px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' },
  modalCancelBtn: { flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer', fontWeight: '800', color: '#475569' },
  modalDeleteBtn: { flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '900', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }
};

export default BookingDetails;