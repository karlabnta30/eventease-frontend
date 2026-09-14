import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, Trash2, ListChecks } from 'lucide-react';
import { toast } from 'react-hot-toast';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastNotifId = useRef(null); 

  // --- FETCH LOGIC ---
  const fetchNotifs = useCallback(async (isAutoPoll = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('http://127.0.0.1:8000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      
      // Update state with fresh data
      setNotifications(data);
    } catch (err) {
      console.error("Fetch Notifs Error:", err);
    } finally {
      if (!isAutoPoll) setLoading(false);
    }
  }, []);

  // --- EFFECT 1: Initial Load ---
  useEffect(() => { 
    fetchNotifs(); 
  }, [fetchNotifs]);

  // --- EFFECT 2: Polling (Runs every 10 seconds) ---
  useEffect(() => {
    const interval = setInterval(() => { fetchNotifs(true); }, 10000); 
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  // --- EFFECT 3: Toast Trigger (The Fix for the Red Error & Double Toasts) ---
  useEffect(() => {
    if (notifications.length > 0) {
      // We look at the top-most (latest) notification
      const latest = notifications[0];
      
      // Only toast if it's unread AND we haven't toasted this specific ID in this session
      if (latest && latest.is_read === 0 && latest.id !== lastNotifId.current) {
        lastNotifId.current = latest.id;
        
        toast.success(`${latest.title}: ${latest.message}`, {
          position: 'top-right',
          duration: 6000,
          icon: '🔔',
          style: { 
            borderRadius: '15px', 
            background: '#000', 
            color: '#fff', 
            fontWeight: '700' 
          }
        });
      }
    }
  }, [notifications]); 

  const markRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://127.0.0.1:8000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) { console.error("Mark Read Error:", err); }
  };

  const handleReadAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success("All notifications marked as read");
    } catch (err) { console.error(err); }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://127.0.0.1:8000/api/notifications/delete-all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications([]);
        toast.success("Notification inbox cleared");
      } catch (err) { console.error(err); }
    }
  };

  const styles = {
    container: { padding: '40px 60px', backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    header: { fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '10px', color: '#000' },
    bulkActions: { display: 'flex', gap: '15px', marginBottom: '35px' },
    readAllBtn: { background: '#000', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    clearBtn: { background: '#fff', color: '#ff4d4d', border: '1px solid #fee2e2', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
    card: (isRead) => ({ 
      padding: '25px', backgroundColor: isRead ? '#fff' : '#fcfcfc', borderRadius: '20px', border: isRead ? '1px solid #eee' : '2px solid #000', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.3s ease', boxShadow: isRead ? 'none' : '0 8px 24px rgba(0,0,0,0.08)'
    }),
    unreadDot: { width: '10px', height: '10px', background: '#000', borderRadius: '50%', marginRight: '15px' },
    emptyState: { textAlign: 'center', padding: '100px 0', color: '#aaa' }
  };

  if (loading) return <div style={styles.container}>Synchronizing alerts...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Notifications</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Stay updated with your event schedules and service requests.</p>
      
      {notifications.length > 0 && (
        <div style={styles.bulkActions}>
            <button onClick={handleReadAll} style={styles.readAllBtn}><ListChecks size={16}/> Mark all as Read</button>
            <button onClick={handleDeleteAll} style={styles.clearBtn}><Trash2 size={16}/> Clear Inbox</button>
        </div>
      )}
      
      {notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <Bell size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
          <p style={{ fontWeight: '600' }}>No new alerts.</p>
        </div>
      ) : (
        notifications.map(n => (
          <div key={n.id} style={styles.card(n.is_read)}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {!n.is_read && <div style={styles.unreadDot} />}
              <div>
                <h4 style={{ margin: 0, fontWeight: '850', fontSize: '1.1rem' }}>{n.title || 'Event Update'}</h4>
                <p style={{ margin: '5px 0 0 0', color: '#555', lineHeight: '1.4' }}>{n.message}</p>
                <small style={{ color: '#999', marginTop: '10px', display: 'block', fontSize: '0.75rem' }}>
                    {new Date(n.created_at).toLocaleString()}
                </small>
              </div>
            </div>
            {!n.is_read && (
              <button onClick={() => markRead(n.id)} style={{ border: 'none', background: '#000', color: '#fff', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}>
                <Check size={18} />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationPage;