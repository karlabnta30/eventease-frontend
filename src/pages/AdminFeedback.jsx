import React, { useState, useEffect } from 'react';
import api from '../api';
import { Mail, Clock, MessageSquare, Tag } from 'lucide-react';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/admin/feedback', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = response.data.data || response.data;
        setFeedbacks(Array.isArray(data) ? data : []);
        
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '40px', backgroundColor: '#fcfcfd', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: isMobile ? '1.8rem' : '28px', fontWeight: '900', color: '#1a1a1a', margin: 0, wordBreak: 'break-word' }}>Client Feedbacks</h1>
        <p style={{ color: '#666', marginTop: '5px', fontSize: isMobile ? '0.9rem' : '1rem' }}>Manage and review inquiries from EventEase users.</p>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <p style={{ color: '#666' }}>Loading messages...</p>
        </div>
      ) : feedbacks.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {feedbacks.map((fb) => (
            <div key={fb.id} style={styles.card}>
              <div style={styles.header}>
                <div style={{ display: 'flex', flexDirection: 'column', wordBreak: 'break-word', paddingRight: '8px' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1a1a1a' }}>{fb.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <Tag size={12} color="#6b6382" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b6382', textTransform: 'uppercase', wordBreak: 'break-word' }}>{fb.subject}</span>
                    </div>
                </div>
                <span style={styles.date}>
                  <Clock size={13}/> {new Date(fb.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <div style={styles.messageBox}>
                <p style={styles.message}>{fb.message}</p>
              </div>

              <div style={styles.footer}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word' }}>
                    <div style={styles.iconBox}><Mail size={14} color="#1a1a1a"/></div>
                    <span style={{ fontSize: '12.5px', color: '#555', fontWeight: '500' }}>{fb.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '80px', backgroundColor: '#fff', padding: isMobile ? '30px 20px' : '60px', borderRadius: '20px', border: '1px solid #eee' }}>
          <MessageSquare size={48} style={{ marginBottom: '20px', color: '#6b6382', opacity: 0.3 }} />
          <h3 style={{ fontWeight: '800', margin: '0 0 10px 0', fontSize: '1.2rem' }}>No Feedbacks Yet</h3>
          <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>When clients reach out via the contact page, they will appear here.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { 
    background: '#fff', 
    padding: '24px', 
    borderRadius: '20px', 
    border: '1px solid #eee', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  date: { fontSize: '11.5px', color: '#999', display:'flex', alignItems:'center', gap:'4px', backgroundColor: '#f9f9f9', padding: '4px 10px', borderRadius: '8px', whiteSpace: 'nowrap' },
  messageBox: { flex: 1 },
  message: { fontSize: '0.9rem', color: '#444', lineHeight: '1.7', margin: '0 0 20px 0', fontStyle: 'italic', wordBreak: 'break-word' },
  footer: { paddingTop: '16px', borderTop: '1px solid #f6f3ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { background: '#f4f1ea', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
};

export default AdminFeedback;