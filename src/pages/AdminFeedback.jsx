import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Clock, MessageSquare, Tag } from 'lucide-react';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8000/api/admin/feedback', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Laravel returns { data: [...] }, we unwrap it here
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
    <div style={{ padding: '40px', backgroundColor: '#fcfcfd', minHeight: '100vh' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>Client Feedbacks</h1>
        <p style={{ color: '#666', marginTop: '5px' }}>Manage and review inquiries from EventEase users.</p>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <p style={{ color: '#666' }}>Loading messages...</p>
        </div>
      ) : feedbacks.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' }}>
          {feedbacks.map((fb) => (
            <div key={fb.id} style={styles.card}>
              <div style={styles.header}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '800', fontSize: '18px', color: '#1a1a1a' }}>{fb.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <Tag size={12} color="#6b6382" />
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b6382', textTransform: 'uppercase' }}>{fb.subject}</span>
                    </div>
                </div>
                <span style={styles.date}>
                  <Clock size={14}/> {new Date(fb.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <div style={styles.messageBox}>
                <p style={styles.message}>{fb.message}</p>
              </div>

              <div style={styles.footer}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={styles.iconBox}><Mail size={14} color="#1a1a1a"/></div>
                    <span style={{ fontSize: '13px', color: '#555', fontWeight: '500' }}>{fb.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '100px', backgroundColor: '#fff', padding: '60px', borderRadius: '20px', border: '1px solid #eee' }}>
          <MessageSquare size={48} style={{ marginBottom: '20px', color: '#6b6382', opacity: 0.3 }} />
          <h3 style={{ fontWeight: '800', margin: '0 0 10px 0' }}>No Feedbacks Yet</h3>
          <p style={{ color: '#888', margin: 0 }}>When clients reach out via the contact page, they will appear here.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { 
    background: '#fff', 
    padding: '30px', 
    borderRadius: '20px', 
    border: '1px solid #eee', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  date: { fontSize: '12px', color: '#999', display:'flex', alignItems:'center', gap:'4px', backgroundColor: '#f9f9f9', padding: '4px 10px', borderRadius: '8px' },
  messageBox: { flex: 1 },
  message: { fontSize: '14px', color: '#444', lineHeight: '1.7', margin: '0 0 25px 0', fontStyle: 'italic' },
  footer: { paddingTop: '20px', borderTop: '1px solid #f6f3ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { background: '#f4f1ea', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default AdminFeedback;