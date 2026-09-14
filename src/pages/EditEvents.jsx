import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Users, Wallet, ArrowLeft, Trash2, Save, Clock } from 'lucide-react';

const EditEvents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    event_name: '',
    category: '',
    location: '',
    event_date: '',
    start_time: '',
    end_time: '',
    budget: '',
    guest_count: ''
  });

  const fetchEvent = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:8000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data;
      
      setFormData({
        event_name: data.event_name || '',
        category: data.category || '',
        location: data.location || '',
        
        // FIX 1: Ensure we only get YYYY-MM-DD for the date input
        event_date: data.event_date ? data.event_date.split(' ')[0] : '', 
        
        // FIX 2: Explicitly map start_time and end_time, stripping seconds
        // This prevents "2026-" from entering the time field
        start_time: data.start_time ? data.start_time.substring(0, 5) : '',
        end_time: data.end_time ? data.end_time.substring(0, 5) : '',
        
        budget: data.budget || '',
        guest_count: data.guest_count || ''
      });
    } catch (err) {
      toast.error("Could not load event data.");
      navigate('/live-events');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading("Updating your event...");
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:8000/api/bookings/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Event updated successfully!", { id: loadToast });
      navigate(`/booking-details/${id}`);
    } catch (err) {
      // FIX 3: Detailed error feedback for 422 validation issues
      const errMsg = err.response?.data?.message || "Update failed.";
      toast.error(errMsg, { id: loadToast });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      const loadToast = toast.loading("Deleting event...");
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://127.0.0.1:8000/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Event deleted.", { id: loadToast });
        navigate('/live-events');
      } catch (err) {
        toast.error("Delete failed.", { id: loadToast });
      }
    }
  };

  const styles = {
    container: { padding: '60px 5%', backgroundColor: '#fcfcfd', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    card: { backgroundColor: '#ffffff', padding: '50px', borderRadius: '32px', border: '1px solid #f0f0f5', maxWidth: '850px', margin: '0 auto', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' },
    inputGroup: { marginBottom: '10px' },
    label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: '800', color: '#b0b0b0', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' },
    input: { width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #f0f0f5', backgroundColor: '#f9f9fb', fontSize: '1rem', fontWeight: '500', outline: 'none', color: '#1a1a1a', transition: 'all 0.2s ease' },
    btnContainer: { display: 'flex', gap: '20px', marginTop: '40px' },
    submitBtn: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '18px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '18px', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', transition: 'transform 0.1s ease' },
    deleteBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '18px', background: '#fff', color: '#ff4d4d', border: '1px solid #ffccd1', borderRadius: '18px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6b6382', fontWeight: '700' }}>
      Fetching details...
    </div>
  );

  return (
    <div style={styles.container}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '30px', color: '#6b6382', fontWeight: '800', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={18} /> BACK TO DETAILS
      </button>
      
      <div style={styles.card}>
        <header style={{ marginBottom: '35px' }}>
            <h1 style={{ fontWeight: '900', fontSize: '2.2rem', margin: 0, color: '#1a1a1a', letterSpacing: '-1px' }}>Manage Event</h1>
            <p style={{ color: '#888', marginTop: '5px', fontSize: '0.95rem' }}>Refine the details for <b>{formData.event_name}</b></p>
        </header>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <span style={styles.label}>Event Name</span>
            <input 
              name="event_name"
              style={styles.input} 
              value={formData.event_name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '15px' }}>
            <div style={styles.inputGroup}>
              <span style={styles.label}><MapPin size={14}/> Location</span>
              <input name="location" style={styles.input} value={formData.location} onChange={handleChange} required />
            </div>
            <div style={styles.inputGroup}>
              <span style={styles.label}><Calendar size={14}/> Event Date</span>
              <input name="event_date" type="date" style={styles.input} value={formData.event_date} onChange={handleChange} required />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}><Clock size={14}/> Start Time</span>
              <input name="start_time" type="time" style={styles.input} value={formData.start_time} onChange={handleChange} required />
            </div>
            <div style={styles.inputGroup}>
              <span style={styles.label}><Clock size={14}/> End Time</span>
              <input name="end_time" type="time" style={styles.input} value={formData.end_time} onChange={handleChange} required />
            </div>

            <div style={styles.inputGroup}>
              <span style={styles.label}><Wallet size={14}/> Budget (₱)</span>
              <input name="budget" type="number" style={styles.input} value={formData.budget} onChange={handleChange} required />
            </div>
            <div style={styles.inputGroup}>
              <span style={styles.label}><Users size={14}/> Guest Count</span>
              <input name="guest_count" type="number" style={styles.input} value={formData.guest_count} onChange={handleChange} required />
            </div>
          </div>

          <div style={styles.btnContainer}>
            <button 
              type="submit" 
              style={styles.submitBtn}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Save size={18} /> SAVE CHANGES
            </button>
            <button 
              type="button" 
              onClick={handleDelete} 
              style={styles.deleteBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fff5f5';
                e.currentTarget.style.borderColor = '#ff4d4d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#ffccd1';
              }}
            >
              <Trash2 size={18} /> DELETE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvents;