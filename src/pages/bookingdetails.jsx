import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, MapPin, Calendar, Users, CreditCard, Clock, ShieldCheck, Trash2, Edit3, Lock, ShieldAlert } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={{ fontSize: '45px', marginBottom: '12px' }}>⚠️</div>
        <h2 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '10px' }}>Cancel Event?</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '25px', lineHeight: '1.6', fontWeight: '500' }}>
          This will permanently remove <strong>booking records</strong> and notify any assigned vendors. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexDirection: window.innerWidth <= 768 ? 'column' : 'row' }}>
          <button onClick={onCancel} style={styles.modalCancelBtn}>No, Keep it</button>
          <button onClick={onConfirm} style={styles.modalDeleteBtn}>Yes, Cancel Event</button>
        </div>
      </div>
    </div>
  );
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (event?.payment_status?.toLowerCase() === 'paid' && userRole !== 'admin') {
        alert("Action Restricted: Paid events cannot be cancelled by clients.");
        setIsDeleteModalOpen(false);
        return;
    }

    const cleanId = getCleanId();
    
    try {
      await api.delete(`/bookings/${cleanId}`);
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

  const isPaid = event.payment_status?.toLowerCase() === 'paid';
  const isLocked = isPaid && userRole !== 'admin';
  const isAdminOverride = isPaid && userRole === 'admin';

  return (
    <div style={{ ...styles.pageWrapper, padding: isMobile ? '20px 16px' : '50px 20px' }}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={18} /> Back
        </button>
        
        <div style={{ ...styles.card, padding: isMobile ? '24px 20px' : '40px' }}>
          <div style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ width: isMobile ? '100%' : 'auto' }}>
              <span style={styles.categoryBadge}>{event.category}</span>
              <h1 style={{ ...styles.title, fontSize: isMobile ? '1.75rem' : '2.2rem', wordBreak: 'break-word' }}>{event.event_name}</h1>
              <div style={styles.idLabel}>BOOKING ID: #00{getCleanId()}</div>
            </div>
            <div style={{ ...styles.statusGroup, alignItems: isMobile ? 'flex-start' : 'flex-end', marginTop: isMobile ? '12px' : '0' }}>
                <div style={styles.statusIndicator(event.status)}>{event.status}</div>
                <div style={styles.paymentIndicator(event.payment_status)}>{event.payment_status || 'Unpaid'}</div>
            </div>
          </div>

          <div style={{ ...styles.gridSection, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <DetailBlock label="Hired Service" icon={<ShieldCheck size={18} color="#2563eb" style={{ flexShrink: 0 }}/>} 
              value={event.service?.business_name || event.service?.name || 'Awaiting Vendor'} />
            <DetailBlock label="Venue / Location" icon={<MapPin size={18} color="#2563eb" style={{ flexShrink: 0 }}/>} 
              value={event.location} />
            <DetailBlock label="Event Date" icon={<Calendar size={18} color="#2563eb" style={{ flexShrink: 0 }}/>} 
              value={event.event_date ? new Date(event.event_date).toDateString() : 'TBD'} />
            <DetailBlock label="Duration" icon={<Clock size={18} color="#2563eb" style={{ flexShrink: 0 }}/>} 
              value={event.end_time ? `Until ${event.end_time}` : 'Full Day Event'} />
            <DetailBlock label="Guest Count" icon={<Users size={18} color="#2563eb" style={{ flexShrink: 0 }}/>} 
              value={`${event.guest_count || 0} Expected Guests`} />
            <DetailBlock label="Financial Allocation" icon={<CreditCard size={18} color="#059669" style={{ flexShrink: 0 }}/>} 
              value={`₱${parseFloat(event.budget || 0).toLocaleString()}`} />
          </div>

          <div style={{ ...styles.footer, flexDirection: isMobile ? 'column' : 'row' }}>
            {isAdminOverride && (
                <div style={styles.adminBanner}>
                    <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                    <span><strong>Administrator Access:</strong> You have override permissions to manage this paid event.</span>
                </div>
            )}

            {!isLocked ? (
              <>
                <button onClick={() => navigate(`/edit-event/${event.id}`)} style={{ ...styles.primaryBtn, width: isMobile ? '100%' : 'unset' }}>
                  <Edit3 size={18} /> Update Planning
                </button>
                <button onClick={() => setIsDeleteModalOpen(true)} style={{ ...styles.secondaryBtn, width: isMobile ? '100%' : 'unset' }}>
                  <Trash2 size={18} /> Cancel Booking
                </button>
              </>
            ) : (
              <div style={styles.lockedNotice}>
                <Lock size={20} color="#64748b" style={{ flexShrink: 0 }} /> 
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

const DetailBlock = ({ label, value, icon }) => (
    <div style={styles.detailBlock}>
        <div style={styles.detailLabel}>{label}</div>
        <div style={styles.detailValueRow}>
            {icon}
            <span style={{ ...styles.detailValue, wordBreak: 'break-word' }}>{value}</span>
        </div>
    </div>
);

const styles = {
  pageWrapper: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: '850px', margin: '0 auto' },
  loadingState: { padding: '100px', textAlign: 'center', fontWeight: '800', color: '#0f172a', letterSpacing: '-1px', fontSize: '1.25rem' },
  backBtn: { background: 'none', border: 'none', color: '#64748b', fontWeight: '800', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: 0 },
  card: { background: '#ffffff', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.04)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '25px', gap: '15px' },
  title: { fontWeight: '900', margin: '8px 0 4px 0', color: '#0f172a', letterSpacing: '-1.5px' },
  categoryBadge: { background: '#0f172a', color: '#fff', padding: '5px 14px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block' },
  idLabel: { color: '#94a3b8', fontWeight: '800', fontSize: '0.75rem', marginTop: '4px' },
  statusGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  gridSection: { display: 'grid', gap: '25px' },
  detailBlock: { display: 'flex', flexDirection: 'column', gap: '6px' },
  detailLabel: { color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.5px' },
  detailValueRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  detailValue: { fontSize: '1.02rem', color: '#0f172a', fontWeight: '800' },
  footer: { display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '35px', borderTop: '1px solid #f1f5f9', paddingTop: '25px' },
  adminBanner: { width: '100%', background: '#fffbeb', color: '#92400e', padding: '14px 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fef3c7', fontSize: '0.88rem', marginBottom: '8px', fontWeight: '600', boxSizing: 'border-box' },
  primaryBtn: { flex: 2, padding: '15px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)' },
  secondaryBtn: { flex: 1, padding: '15px 20px', background: '#fff', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' },
  lockedNotice: { flex: 1, padding: '18px', background: '#f8fafc', color: '#475569', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '0.88rem', fontWeight: '700', border: '1px solid #e2e8f0', boxSizing: 'border-box', textAlign: 'center' },
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
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(10px)', padding: '16px', boxSizing: 'border-box' },
  modalContent: { background: '#ffffff', padding: '30px 20px', borderRadius: '28px', textAlign: 'center', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0', boxSizing: 'border-box' },
  modalCancelBtn: { flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer', fontWeight: '800', color: '#475569', fontSize: '0.88rem', width: '100%' },
  modalDeleteBtn: { flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '900', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', width: '100%' }
};

export default BookingDetails;