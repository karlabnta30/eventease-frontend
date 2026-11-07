import React, { useState, useEffect } from 'react';
import api from '../api';
import { X, Eye, Trash2, CheckCircle } from 'lucide-react';

const VendorEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('monitor'); // 'monitor', 'history', 'all'
  const [selectedEventDetails, setSelectedEventDetails] = useState(null); // Para sa View Details Modal

  useEffect(() => {
    fetchVendorBookings();
  }, []);

  const fetchVendorBookings = () => {
    setLoading(true);
    api.get('/vendor/bookings')
      .then(response => {
        setEvents(response.data.data || response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching vendor events:', error);
        setLoading(false);
      });
  };

  // Function para markahan ang booking bilang Paid Fully at ilipat sa Booking History
  const handleMarkAsPaidFully = async (bookingId) => {
    if (!window.confirm("Mark this event as fully paid? This will move it to your Booking History.")) return;

    try {
      await api.patch(`/bookings/${bookingId}/status`, { payment_status: 'fully_paid', status: 'completed' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setEvents(events.map(event => {
        const id = event.id || event.booking_id;
        if (id === bookingId) {
          return { ...event, payment_status: 'fully_paid', is_fully_paid: true };
        }
        return event;
      }));

      alert("Event marked as fully paid and moved to Booking History!");
    } catch (error) {
      console.error("Failed to update status:", error);
      setEvents(events.map(event => {
        const id = event.id || event.booking_id;
        if (id === bookingId) {
          return { ...event, payment_status: 'fully_paid', is_fully_paid: true };
        }
        return event;
      }));
      alert("Event updated locally and moved to history.");
    }
  };

  // Function para mag-delete ng event/booking record
  const handleDeleteEvent = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/bookings/${bookingId}`);
      setEvents(events.filter(event => (event.id || event.booking_id) !== bookingId));
      alert("Event successfully deleted.");
    } catch (error) {
      alert("Failed to delete the event: " + (error.response?.data?.message || "Please try again."));
    }
  };

  const filteredEvents = events.filter(event => {
    const paymentStatus = (event.payment_status || '').toLowerCase().trim();
    const isFullyPaid = paymentStatus === 'fully_paid' || paymentStatus === 'completed' || paymentStatus === 'paid' || event.is_fully_paid === true;

    if (filter === 'monitor') return !isFullyPaid;
    if (filter === 'history') return isFullyPaid;
    return true; // 'all'
  });

  return (
    <div style={{ padding: '30px', fontFamily: 'Inter', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 5px 0' }}>
            Vendor Event & Payment Monitor
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Subaybayan ang mga kaganapan, tingnan ang buong impormasyon, at pamahalaan ang mga transaksiyon.
          </p>
        </div>

        {/* Tab / Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setFilter('monitor')} 
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: filter === 'monitor' ? '#fff' : 'transparent', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', color: filter === 'monitor' ? '#0f172a' : '#64748b', boxShadow: filter === 'monitor' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          >
            Active Monitor
          </button>
          <button 
            onClick={() => setFilter('history')} 
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: filter === 'history' ? '#fff' : 'transparent', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', color: filter === 'history' ? '#059669' : '#64748b', boxShadow: filter === 'history' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          >
            Booking History 📜
          </button>
          <button 
            onClick={() => setFilter('all')} 
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: filter === 'all' ? '#fff' : 'transparent', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', boxShadow: filter === 'all' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#64748b', fontWeight: '600' }}>Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: '600' }}>
          Wala pang makikitang mga kaganapan sa kategoryang ito.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredEvents.map((event) => {
            const bookingId = event.id || event.booking_id;
            const totalPrice = Number(event.budget || event.total_price || 0);
            const downPayment = totalPrice * 0.50;
            const remainingBalance = totalPrice - downPayment;
            
            const paymentStatus = (event.payment_status || '').toLowerCase().trim();
            const isFullyPaid = paymentStatus === 'fully_paid' || paymentStatus === 'completed' || paymentStatus === 'paid' || event.is_fully_paid === true;
            
            const isDownpaymentPaid = paymentStatus === 'downpayment_paid' || 
                                      paymentStatus === 'paid (50% down payment)' || 
                                      event.is_paid === true;

            return (
              <div key={bookingId} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                
                {/* Event Details Preview */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                      {event.event_name || 'Event Booking'} (#{bookingId})
                    </h3>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      backgroundColor: isFullyPaid ? '#dcfce7' : (isDownpaymentPaid ? '#ecfdf5' : '#fef3c7'),
                      color: isFullyPaid ? '#166534' : (isDownpaymentPaid ? '#059669' : '#d97706'),
                      border: isFullyPaid ? '1px solid #bbf7d0' : (isDownpaymentPaid ? '1px solid #a7f3d0' : '1px solid #fde68a')
                    }}>
                      {isFullyPaid ? '✅ Paid Fully (History)' : (isDownpaymentPaid ? '✔ 50% Down Payment Paid' : '⏳ Pending Payment')}
                    </span>
                  </div>
                  
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>Client: <strong>{event.user?.name || event.client_name || 'N/A'}</strong></p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>Event Date: <strong>{event.event_date || 'TBD'}</strong></p>
                  
                  {/* Financial Breakdown */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>Total Price: <strong>₱{totalPrice.toLocaleString()}</strong></span>
                    <span style={{ fontSize: '0.85rem', color: '#059669' }}>50% Down: <strong>₱{downPayment.toLocaleString()}</strong></span>
                    <span style={{ fontSize: '0.85rem', color: '#d97706' }}>Balance: <strong>₱{isFullyPaid ? '0' : remainingBalance.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Vendor Action Buttons (View Details, Paid Fully, Delete) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setSelectedEventDetails(event)}
                    style={{ 
                      backgroundColor: '#f1f5f9', 
                      color: '#334155', 
                      border: '1px solid #cbd5e1', 
                      padding: '10px 14px', 
                      borderRadius: '12px', 
                      fontWeight: '800', 
                      fontSize: '0.85rem', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Eye size={15} /> View Details
                  </button>

                  {!isFullyPaid && (
                    <button 
                      onClick={() => handleMarkAsPaidFully(bookingId)}
                      style={{ 
                        backgroundColor: '#10b981', 
                        color: '#fff', 
                        border: 'none', 
                        padding: '10px 16px', 
                        borderRadius: '12px', 
                        fontWeight: '800', 
                        fontSize: '0.85rem', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Paid Fully 💰
                    </button>
                  )}

                  <button 
                    onClick={() => handleDeleteEvent(bookingId)}
                    style={{ 
                      backgroundColor: '#fee2e2', 
                      color: '#dc2626', 
                      border: '1px solid #fca5a5', 
                      padding: '10px 16px', 
                      borderRadius: '12px', 
                      fontWeight: '800', 
                      fontSize: '0.85rem', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Delete
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- POPUP MODAL PARA SA BUONG IMPORMASYON NG EVENT --- */}
      {selectedEventDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }} onClick={() => setSelectedEventDetails(null)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px', backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem', color: '#0f172a' }}>
                Buong Impormasyon ng Event (#{selectedEventDetails.id || selectedEventDetails.booking_id})
              </h2>
              <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setSelectedEventDetails(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem', color: '#334155' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Pangkalahatang Detalye</h4>
                <p style={{ margin: '4px 0' }}>🏷️ <strong>Pangalan ng Event:</strong> {selectedEventDetails.event_name || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📂 <strong>Kategorya:</strong> {selectedEventDetails.category || 'General'}</p>
                <p style={{ margin: '4px 0' }}>📍 <strong>Lokasyon:</strong> {selectedEventDetails.location || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📅 <strong>Petsa at Oras:</strong> {selectedEventDetails.event_date || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>👥 <strong>Bilang ng Bisita:</strong> {selectedEventDetails.guest_count || 1} pax</p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Impormasyon ng Kliyente</h4>
                <p style={{ margin: '4px 0' }}>👤 <strong>Pangalan:</strong> {selectedEventDetails.user?.name || selectedEventDetails.client_name || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📧 <strong>Email:</strong> {selectedEventDetails.user?.email || selectedEventDetails.client_email || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📞 <strong>Contact Number:</strong> {selectedEventDetails.user?.contact_number || selectedEventDetails.client_contact || 'N/A'}</p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Pinansyal at Bayarin</h4>
                <p style={{ margin: '4px 0' }}>💰 <strong>Kabuuang Presyo (Budget):</strong> ₱{Number(selectedEventDetails.budget || selectedEventDetails.total_price || 0).toLocaleString()}</p>
                <p style={{ margin: '4px 0' }}>⚡ <strong>50% Down Payment:</strong> ₱{(Number(selectedEventDetails.budget || selectedEventDetails.total_price || 0) * 0.50).toLocaleString()}</p>
                <p style={{ margin: '4px 0' }}>📌 <strong>Status ng Pagbabayad:</strong> <span style={{ textTransform: 'uppercase', fontWeight: '800', color: '#059669' }}>{selectedEventDetails.payment_status || 'Pending'}</span></p>
              </div>

              {selectedEventDetails.services && selectedEventDetails.services.length > 0 && (
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Mga Nakakabit na Serbisyo</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {selectedEventDetails.services.map((srv, idx) => (
                      <li key={idx}><strong>{srv.business_name || srv.title}</strong> (₱{Number(srv.starting_price || 0).toLocaleString()})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedEventDetails(null)}
                style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Isara
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default VendorEventsPage;