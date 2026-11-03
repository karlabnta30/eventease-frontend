import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { LayoutDashboard, Calendar as CalendarIcon, UserCheck, FileText, CheckCircle, XCircle, MapPin, Users, Briefcase, CreditCard, Clock, X, ArrowUpDown, Search, History } from 'lucide-react';
import './CalendarCustom.css'; 

const AdminDashboard = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [vendors, setVendors] = useState([]); 
  const [vendorPermits, setVendorPermits] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [previewDocument, setPreviewDocument] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [categorySortOrder, setCategorySortOrder] = useState('highest'); 
  const [searchQuery, setSearchQuery] = useState(''); 

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
        api.get('/admin/vendor-permits', { headers }),
        api.get('/activity-logs', { headers }) // Endpoint para makuha ang mga login/logout logs
      ]);
      
      if (results[0].status === 'fulfilled') setAllBookings(results[0].value.data.data || []);
      if (results[1].status === 'fulfilled') setStats(results[1].value.data);
      if (results[2].status === 'fulfilled') setVendors(results[2].value.data.data || []);
      if (results[3].status === 'fulfilled') setVendorPermits(results[3].value.data.data || []);
      if (results[4].status === 'fulfilled') {
        const logsData = results[4].value.data.data || results[4].value.data || [];
        setActivityLogs(Array.isArray(logsData) ? logsData : []);
      }

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

  const pendingPermitsCount = useMemo(() => {
    return vendorPermits.filter(v => !v.verification_status || v.verification_status === 'pending').length;
  }, [vendorPermits]);

  const filteredVendorPermits = useMemo(() => {
    if (!searchQuery) return vendorPermits;
    return vendorPermits.filter(v => 
      (v.business_name || v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.owner_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vendorPermits, searchQuery]);

  const sortedCategories = useMemo(() => {
    if (!stats?.category_data) return [];
    const categoriesCopy = [...stats.category_data];

    return categoriesCopy.sort((a, b) => {
      if (categorySortOrder === 'highest') return b.total - a.total;
      if (categorySortOrder === 'lowest') return a.total - b.total;
      if (categorySortOrder === 'alphabetical') return a.category.localeCompare(b.category);
      return 0;
    });
  }, [stats?.category_data, categorySortOrder]);

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
    padding: isMobile ? '8px 12px' : '12px 24px',
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '3px solid #1a1a1a' : 'none',
    fontWeight: activeTab === tab ? '800' : '500',
    color: activeTab === tab ? '#1a1a1a' : '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: isMobile ? '0.8rem' : '1rem',
    whiteSpace: 'nowrap',
    flexShrink: 0
  });

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', fontWeight: '700' }}>Loading System Overview...</div>;

  return (
    <div style={{ padding: isMobile ? '16px 12px 80px' : '40px', backgroundColor: '#fcfcfd', minHeight: '100vh', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box', width: '100%', overflowX: 'hidden' }}>
      <h1 style={{ fontWeight: '900', fontSize: isMobile ? '1.6rem' : '2.5rem', marginBottom: '16px', wordBreak: 'break-word' }}>System Overview</h1>
      
      {/* Navigation Tabs - Scrollable on Mobile */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #eee', overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
        <div style={tabStyle('analytics')} onClick={() => setActiveTab('analytics')}><LayoutDashboard size={16}/> Analytics</div>
        <div style={tabStyle('schedule')} onClick={() => setActiveTab('schedule')}><CalendarIcon size={16}/> Live Schedule</div>
        <div style={tabStyle('vendors')} onClick={() => setActiveTab('vendors')}>
          <UserCheck size={16}/> Vendor Moderation 
          {pendingPermitsCount > 0 && (
            <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '2px 5px', borderRadius: '10px', fontWeight: '900' }}>
              {pendingPermitsCount}
            </span>
          )}
        </div>
        <div style={tabStyle('logs')} onClick={() => setActiveTab('logs')}><History size={16}/> Login/Logout Logs</div>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
            <StatCard title="Total Users" value={stats?.total_users || 0} color="#3498db" isMobile={isMobile} />
            <StatCard title="Total Bookings" value={stats?.total_bookings || 0} color="#f39c12" isMobile={isMobile} />
            <StatCard title="Projected Revenue" value={`₱${(stats?.total_revenue || 0).toLocaleString()}`} color="#27ae60" isMobile={isMobile} />
          </div>

          <div style={{ background: '#fff', padding: isMobile ? '16px' : '30px', borderRadius: '20px', border: '1px solid #eee', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontWeight: '800', fontSize: isMobile ? '1rem' : '1.3rem', margin: 0 }}>Category Distribution</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpDown size={13} color="#64748b" />
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748b' }}>Sort:</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => setCategorySortOrder('highest')} style={{ background: categorySortOrder === 'highest' ? '#0f172a' : 'transparent', color: categorySortOrder === 'highest' ? '#fff' : '#475569', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>Highest</button>
                  <button onClick={() => setCategorySortOrder('lowest')} style={{ background: categorySortOrder === 'lowest' ? '#0f172a' : 'transparent', color: categorySortOrder === 'lowest' ? '#fff' : '#475569', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>Lowest</button>
                  <button onClick={() => setCategorySortOrder('alphabetical')} style={{ background: categorySortOrder === 'alphabetical' ? '#0f172a' : 'transparent', color: categorySortOrder === 'alphabetical' ? '#fff' : '#475569', border: 'none', padding: '5px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>A-Z</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              {sortedCategories && sortedCategories.length > 0 ? sortedCategories.map(cat => (
                <div key={cat.category} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                    <span style={{ wordBreak: 'break-word', paddingRight: '8px' }}>{cat.category}</span>
                    <span style={{ whiteSpace: 'nowrap' }}>{cat.total} events</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#f0f0f5', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${stats?.total_bookings > 0 ? (cat.total / stats.total_bookings) * 100 : 0}%`, height: '100%', background: '#1a1a1a', borderRadius: '5px' }} />
                  </div>
                </div>
              )) : <p style={{color: '#aaa', fontSize: '0.9rem'}}>No data available.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Live Schedule Tab */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '16px' }}>
          <div style={{ background: '#fff', padding: isMobile ? '16px' : '30px', borderRadius: '20px', border: '1px solid #eee', boxSizing: 'border-box', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CalendarIcon size={18} />
              <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: '800', margin: 0 }}>System Schedule Calendar</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'auto' }}>
              <Calendar onChange={setSelectedDate} value={selectedDate} tileContent={tileContent} className="eventease-main-calendar" />
            </div>
          </div>

          <div style={{ background: '#fff', padding: isMobile ? '16px' : '30px', borderRadius: '20px', border: '1px solid #eee', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={18} />
              <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: '800', margin: 0, wordBreak: 'break-word' }}>Events on {selectedDate.toLocaleDateString()}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: isMobile ? '350px' : '450px', overflowY: 'auto' }}>
              {selectedDateBookings.length > 0 ? selectedDateBookings.map(b => (
                <div key={b.id} style={{ padding: '14px', background: '#fcfcfc', borderRadius: '16px', borderLeft: '4px solid #000', border: '1px solid #f0f0f0', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ fontWeight: '900', fontSize: '1rem', color: '#0f172a', wordBreak: 'break-word', flex: 1 }}>{b.event_name}</div>
                    <div style={{ fontWeight: '900', color: '#059669', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>₱{parseFloat(b.budget || 0).toLocaleString()}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '6px', fontSize: '0.78rem', color: '#475569', marginBottom: '10px', background: '#f1f5f9', padding: '8px 10px', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}>
                      <MapPin size={13} color="#64748b" style={{ flexShrink: 0 }} />
                      <span><strong>Location:</strong> {b.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={13} color="#64748b" style={{ flexShrink: 0 }} />
                      <span><strong>Guests:</strong> {b.guest_count || 1} pax</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={13} color="#64748b" style={{ flexShrink: 0 }} />
                      <span><strong>Category:</strong> {b.category || 'General'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={13} color="#64748b" style={{ flexShrink: 0 }} />
                      <span><strong>Payment:</strong> {b.payment_status || 'Unpaid'}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px', wordBreak: 'break-word' }}>
                    {b.user && <div>👤 <strong>Client:</strong> {b.user.name} ({b.user.email})</div>}
                    {b.service && <div>🛠️ <strong>Assigned Service:</strong> {b.service.business_name || b.service.title}</div>}
                    {b.services && b.services.length > 0 && (
                      <div>📦 <strong>Attached Services:</strong> {b.services.map(s => s.business_name || s.title).join(', ')}</div>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No bookings scheduled for this date.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vendor Moderation Tab */}
      {activeTab === 'vendors' && (
        <div style={{ background: '#fff', padding: isMobile ? '16px' : '30px', borderRadius: '20px', border: '1px solid #eee', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontWeight: '800', margin: 0, fontSize: isMobile ? '1.1rem' : '1.5rem', wordBreak: 'break-word' }}>Vendor Permit Moderation</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', width: isMobile ? '100%' : '280px', boxSizing: 'border-box' }}>
              <Search size={15} color="#64748b" style={{ flexShrink: 0 }} />
              <input 
                type="text" 
                placeholder="Search vendor name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: '100%', fontWeight: '600' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredVendorPermits && filteredVendorPermits.length > 0 ? filteredVendorPermits.map(v => {
              const permitUrl = v.permit_path 
                ? (v.permit_path.startsWith('http') ? v.permit_path : `https://eventease-backend-v9za.onrender.com/storage/${v.permit_path}`)
                : null;

              return (
                <div key={v.id} style={{ background: '#f9f9fb', padding: isMobile ? '14px' : '18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: '12px', boxSizing: 'border-box' }}>
                  <div style={{ wordBreak: 'break-word' }}>
                    <h4 style={{ margin: '0 0 3px 0', fontWeight: '800', fontSize: '1rem' }}>{v.business_name || v.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#666', margin: '0 0 6px 0', wordBreak: 'break-word' }}>Owner: {v.owner_name} ({v.owner_email}) | Category: <strong>{v.category || 'General'}</strong></p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: v.verification_status === 'verified' ? '#dcfce7' : v.verification_status === 'rejected' ? '#fee2e2' : '#fef3c7', color: v.verification_status === 'verified' ? '#166534' : v.verification_status === 'rejected' ? '#991b1b' : '#92400e' }}>
                        Status: {v.verification_status?.toUpperCase() || 'PENDING'}
                      </span>

                      {permitUrl ? (
                        <button 
                          type="button"
                          onClick={() => setPreviewDocument(permitUrl)}
                          style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', cursor: 'pointer', padding: 0 }}
                        >
                          <FileText size={13} /> View Permit Document 🔍
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>No permit uploaded</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box' }}>
                    {v.verification_status !== 'verified' && (
                      <button 
                        onClick={() => handleVerificationAction(v.id, 'verified')}
                        style={{ background: '#10b981', color: '#fff', border: 'none', padding: '9px 12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem', flex: isMobile ? 1 : 'unset' }}
                      >
                        <CheckCircle size={13} /> Approve
                      </button>
                    )}

                    {v.verification_status !== 'rejected' && (
                      <button 
                        onClick={() => handleVerificationAction(v.id, 'rejected')}
                        style={{ background: '#ef4444', color: '#fff', border: '1px solid #ef4444', padding: '9px 12px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.78rem', flex: isMobile ? 1 : 'unset' }}
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              );
            }) : <p style={{color: '#aaa', textAlign: 'center', fontSize: '0.9rem'}}>No vendor records found.</p>}
          </div>
        </div>
      )}

      {/* Login / Logout Activity Logs Tab */}
      {activeTab === 'logs' && (
        <div style={{ background: '#fff', padding: isMobile ? '16px' : '30px', borderRadius: '20px', border: '1px solid #eee', boxSizing: 'border-box' }}>
          <h2 style={{ fontWeight: '800', marginBottom: '6px', fontSize: isMobile ? '1.1rem' : '1.5rem' }}>Account Login & Logout History</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>Subaybayan ang kasaysayan ng pag-login at pag-logout ng mga user at vendor sa sistema.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
            {activityLogs && activityLogs.length > 0 ? activityLogs.map((log, index) => (
              <div key={log.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '200px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: log.action === 'LOGIN' ? '#dcfce7' : '#fee2e2', color: log.action === 'LOGIN' ? '#166534' : '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.7rem', flexShrink: 0 }}>
                    {log.action === 'LOGIN' ? 'IN' : 'OUT'}
                  </div>
                  <div style={{ wordBreak: 'break-word', overflow: 'hidden' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>{log.user_name || log.email || 'Unknown User'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Role: <strong>{log.role || 'User'}</strong> | IP: {log.ip_address || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ textAlign: isMobile ? 'left' : 'right', width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: isMobile ? 'space-between' : 'flex-end', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '3px 7px', borderRadius: '6px', background: log.action === 'LOGIN' ? '#dcfce7' : '#fee2e2', color: log.action === 'LOGIN' ? '#166534' : '#991b1b', marginRight: '6px' }}>
                    {log.action || 'ACTIVITY'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>{log.created_at ? new Date(log.created_at).toLocaleString() : 'Just now'}</span>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem' }}>
                Wala pang naitalang login o logout activity sa kasalukuyan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- POPUP MODAL LIGHTBOX PARA SA PERMIT DOCUMENT (IMAGE & PDF) --- */}
      {previewDocument && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '10px', boxSizing: 'border-box' }} onClick={() => setPreviewDocument(null)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '850px', height: '85vh', backgroundColor: '#fff', padding: isMobile ? '14px' : '20px', borderRadius: '18px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              <h3 style={{ margin: 0, fontWeight: '900', fontSize: isMobile ? '1rem' : '1.2rem', color: '#0f172a' }}>Vendor Permit Document Preview</h3>
              <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} onClick={() => setPreviewDocument(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/\.(jpg|jpeg|png|webp)$/i.test(previewDocument) ? (
                <img src={previewDocument} alt="Permit Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }} />
              ) : (
                <iframe src={previewDocument} title="PDF Permit Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color, isMobile }) => (
  <div style={{ background: '#fff', padding: isMobile ? '16px' : '24px', borderRadius: '20px', borderLeft: `6px solid ${color}`, border: '1px solid #f0f0f5', boxSizing: 'border-box' }}>
    <h4 style={{ margin: 0, color: '#888', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{title}</h4>
    <p style={{ margin: '8px 0 0 0', fontSize: isMobile ? '1.3rem' : '24px', fontWeight: '900', color: '#1a1a1a', wordBreak: 'break-word' }}>{value}</p>
  </div>
);

export default AdminDashboard;