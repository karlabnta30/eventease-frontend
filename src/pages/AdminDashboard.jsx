import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { LayoutDashboard, Calendar as CalendarIcon, UserCheck, FileText, CheckCircle, XCircle, MapPin, Users, Briefcase, CreditCard, Clock, X } from 'lucide-react';
import './CalendarCustom.css'; 

const AdminDashboard = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [vendors, setVendors] = useState([]); 
  const [vendorPermits, setVendorPermits] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [previewImage, setPreviewImage] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      const results = await Promise.allSettled([
        api.get('/admin/bookings', { headers }),
        api.get('/admin/stats', { headers }),
        api.get('/admin/vendors', { headers }),
        api.get('/admin/vendor-permits', { headers })
      ]);
      
      if (results[0].status === 'fulfilled') setAllBookings(results[0].value.data.data || []);
      if (results[1].status === 'fulfilled') setStats(results[1].value.data);
      if (results[2].status === 'fulfilled') setVendors(results[2].value.data.data || []);
      if (results[3].status === 'fulfilled') setVendorPermits(results[3].value.data.data || []);

    } catch (error) {
      console.error("Admin fetch failed:", error);
      toast.error("System sync failed. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerificationAction = async (vendorId, status) => {
    const token = localStorage.getItem('token');
    
    setVendorPermits(prevPermits => 
      prevPermits.map(v => v.id === vendorId ? { ...v, verification_status: status } : v)
    );
    toast.success(`Vendor permit ${status}!`);

    try {
      await api.patch(`/admin/vendors/${vendorId}/verify`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Verification update error:", error);
      toast.error("Failed to sync status with server.");
      fetchAdminData();
    }
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const hasBooking = allBookings.some(b => 
        new Date(b.event_date).toDateString() === date.toDateString()
      );
      return hasBooking ? <div className="calendar-dot"></div> : null;
    }
  };

  const selectedDateBookings = allBookings.filter(b => 
    new Date(b.event_date).toDateString() === selectedDate.toDateString()
  );

  const tabStyle = (tab) => ({
    padding: isMobile ? '10px 14px' : '12px 24px',
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '3px solid #1a1a1a' : 'none',
    fontWeight: activeTab === tab ? '800' : '500',
    color: activeTab === tab ? '#1a1a1a' : '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: isMobile ? '0.85rem' : '1rem',
    whiteSpace: 'nowrap'
  });

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading System Overview...</div>;

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '40px', backgroundColor: '#fcfcfd', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontWeight: '900', fontSize: isMobile ? '1.8rem' : '2.5rem', marginBottom: '20px', wordBreak: 'break-word' }}>System Overview</h1>
      
      <div style={{ display: 'flex', gap: '5px', marginBottom: '30px', borderBottom: '1px solid #eee', overflowX: 'auto', width: '100%' }}>
        <div style={tabStyle('analytics')} onClick={() => setActiveTab('analytics')}><LayoutDashboard size={18}/> Analytics</div>
        <div style={tabStyle('schedule')} onClick={() => setActiveTab('schedule')}><CalendarIcon size={18}/> Live Schedule</div>
        <div style={tabStyle('vendors')} onClick={() => setActiveTab('vendors')}><UserCheck size={18}/> Vendor Moderation</div>
      </div>

      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', marginBottom: '30px' }}>
            <StatCard title="Total Users" value={stats?.total_users || 0} color="#3498db" />
            <StatCard title="Total Bookings" value={stats?.total_bookings || 0} color="#f39c12" />
            <StatCard title="Projected Revenue" value={`₱${(stats?.total_revenue || 0).toLocaleString()}`} color="#27ae60" />
          </div>

          <div style={{ background: '#fff', padding: isMobile ? '20px' : '30px', borderRadius: '24px', border: '1px solid #eee' }}>
            <h3 style={{ fontWeight: '800', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>Category Distribution</h3>
            <div style={{ marginTop: '20px' }}>
              {stats?.category_data && stats.category_data.length > 0 ? stats.category_data.map(cat => (
                <div key={cat.category} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                    <span>{cat.category}</span>
                    <span>{cat.total} events</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: '#f0f0f5', borderRadius: '6px' }}>
                    <div style={{ 
                      width: `${stats?.total_bookings > 0 ? (cat.total / stats.total_bookings) * 100 : 0}%`, 
                      height: '100%', background: '#1a1a1a', borderRadius: '6px' 
                    }} />
                  </div>
                </div>
              )) : <p style={{color: '#aaa'}}>No data available.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '20px' }}>
          <div style={{ background: '#fff', padding: isMobile ? '20px' : '30px', borderRadius: '24px', border: '1px solid #eee', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CalendarIcon size={20} />
              <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '800', margin: 0 }}>System Schedule Calendar</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={tileContent} className="eventease-main-calendar" />
            </div>
          </div>

          <div style={{ background: '#fff', padding: isMobile ? '20px' : '30px', borderRadius: '24px', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Clock size={20} />
              <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', fontWeight: '800', margin: 0, wordBreak: 'break-word' }}>Events on {selectedDate.toLocaleDateString()}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '450px', overflowY: 'auto' }}>
              {selectedDateBookings.length > 0 ? selectedDateBookings.map(b => (
                <div key={b.id} style={{ padding: isMobile ? '16px' : '20px', background: '#fcfcfc', borderRadius: '20px', borderLeft: '5px solid #000', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#0f172a', wordBreak: 'break-word' }}>{b.event_name}</div>
                    <div style={{ fontWeight: '900', color: '#059669', fontSize: '1rem', whiteSpace: 'nowrap' }}>₱{parseFloat(b.budget || 0).toLocaleString()}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: '#475569', marginBottom: '12px', background: '#f1f5f9', padding: '10px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}>
                      <MapPin size={14} color="#64748b" style={{ flexShrink: 0 }} />
                      <span><strong>Location:</strong> {b.location}</span>
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

                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px', wordBreak: 'break-word' }}>
                    {b.user && <div>👤 <strong>Client:</strong> {b.user.name} ({b.user.email})</div>}
                    {b.service && <div>🛠️ <strong>Assigned Service:</strong> {b.service.business_name || b.service.title}</div>}
                    {b.services && b.services.length > 0 && (
                      <div>📦 <strong>Attached Services:</strong> {b.services.map(s => s.business_name || s.title).join(', ')}</div>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: '#aaa', fontWeight: '500' }}>No bookings scheduled for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vendors' && (
        <div style={{ background: '#fff', padding: isMobile ? '20px' : '30px', borderRadius: '24px', border: '1px solid #eee' }}>
          <h2 style={{ fontWeight: '800', marginBottom: '20px', fontSize: isMobile ? '1.2rem' : '1.5rem', wordBreak: 'break-word' }}>Vendor Permit Moderation & Status Directory</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {vendorPermits && vendorPermits.length > 0 ? vendorPermits.map(v => {
              const permitUrl = v.permit_path 
                ? (v.permit_path.startsWith('http') ? v.permit_path : `https://eventease-backend-v9za.onrender.com/storage/${v.permit_path}`)
                : null;
              const isImage = permitUrl && /\.(jpg|jpeg|png|webp)$/i.test(permitUrl);

              return (
                <div key={v.id} style={{ background: '#f9f9fb', padding: isMobile ? '16px' : '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '15px' }}>
                  <div style={{ wordBreak: 'break-word' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', fontSize: '1.05rem' }}>{v.business_name || v.name}</h4>
                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>Owner: {v.owner_name} ({v.owner_email}) | Category: <strong>{v.category || 'General'}</strong></p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', background: v.verification_status === 'verified' ? '#dcfce7' : v.verification_status === 'rejected' ? '#fee2e2' : '#fef3c7', color: v.verification_status === 'verified' ? '#166534' : v.verification_status === 'rejected' ? '#991b1b' : '#92400e' }}>
                        Status: {v.verification_status?.toUpperCase() || 'PENDING'}
                      </span>

                      {permitUrl ? (
                        isImage ? (
                          <button 
                            type="button"
                            onClick={() => setPreviewImage(permitUrl)}
                            style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700', color: '#2563eb', cursor: 'pointer', padding: 0 }}
                          >
                            <FileText size={14} /> View Permit Document 🔍
                          </button>
                        ) : (
                          <a href={permitUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: '700', color: '#2563eb', textDecoration: 'none' }}>
                            <FileText size={14} /> View PDF Document ↗
                          </a>
                        )
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>No permit uploaded</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
                    {v.verification_status !== 'verified' && (
                      <button 
                        onClick={() => handleVerificationAction(v.id, 'verified')}
                        style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.82rem', flex: isMobile ? 1 : 'unset' }}
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                    )}

                    {v.verification_status !== 'rejected' && (
                      <button 
                        onClick={() => handleVerificationAction(v.id, 'rejected')}
                        style={{ background: '#ef4444', color: '#fff', border: '1px solid #ef4444', padding: '10px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.82rem', flex: isMobile ? 1 : 'unset' }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            }) : <p style={{color: '#aaa', textAlign: 'center'}}>No vendor records found.</p>}
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL PREVIEW FOR ADMIN */}
      {previewImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px' }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: 'relative', maxWidth: '95%', maxHeight: '90%', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: '10px', right: '10px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 1010 }} onClick={() => setPreviewImage(null)}>
              <X size={20} />
            </button>
            <img src={previewImage} alt="Enlarged Permit Preview" style={{ maxWidth: '100%', maxHeight: '75vh', display: 'block', borderRadius: '8px', objectFit: 'contain', margin: '0 auto' }} />
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', borderLeft: `8px solid ${color}`, border: '1px solid #f0f0f5', boxSizing: 'border-box' }}>
    <h4 style={{ margin: 0, color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{title}</h4>
    <p style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: '900', color: '#1a1a1a', wordBreak: 'break-word' }}>{value}</p>
  </div>
);

export default AdminDashboard;