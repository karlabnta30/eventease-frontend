import React, { useState, useEffect } from 'react';
import api from '../api';
import { X, Eye, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

const VendorEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('monitor'); // 'monitor', 'history', 'all'
  const [selectedEventDetails, setSelectedEventDetails] = useState(null); // For View Details Modal
  const [confirmModalData, setConfirmModalData] = useState(null); // For Custom Confirmation Modal

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

  // Function to mark booking as Paid Fully and move to Booking History
  const handleMarkAsPaidFully = async (bookingId) => {
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

      setConfirmModalData(null);
    } catch (error) {
      console.error("Failed to update status:", error);
      setEvents(events.map(event => {
        const id = event.id || event.booking_id;
        if (id === bookingId) {
          return { ...event, payment_status: 'fully_paid', is_fully_paid: true };
        }
        return event;
      }));
      setConfirmModalData(null);
    }
  };

  // Function to delete event/booking record
  const handleDeleteEvent = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      setEvents(events.filter(event => (event.id || event.booking_id) !== bookingId));
      setConfirmModalData(null);
    } catch (error) {
      alert("Failed to delete the event: " + (error.response?.data?.message || "Please try again."));
      setConfirmModalData(null);
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
    <div style={{ padding: '30px', fontFamily: 'Inter', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a', boxSizing: 'border-box' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 5px 0' }}>
            Vendor Event & Payment Monitor
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Monitor your events, view complete information, and manage financial transactions seamlessly.
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
          No events found in this category.
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
                      onClick={() => setConfirmModalData({ type: 'paid', id: bookingId, name: event.event_name || 'Event' })}
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
                    onClick={() => setConfirmModalData({ type: 'delete', id: bookingId, name: event.event_name || 'Event' })}
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

      {/* --- MODAL FOR VIEW DETAILS --- */}
      {selectedEventDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '15px', boxSizing: 'border-box' }} onClick={() => setSelectedEventDetails(null)}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px', backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontWeight: '900', fontSize: '1.4rem', color: '#0f172a' }}>
                Event Details (#{selectedEventDetails.id || selectedEventDetails.booking_id})
              </h2>
              <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setSelectedEventDetails(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem', color: '#334155' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>General Information</h4>
                <p style={{ margin: '4px 0' }}>🏷️ <strong>Event Name:</strong> {selectedEventDetails.event_name || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📂 <strong>Category:</strong> {selectedEventDetails.category || 'General'}</p>
                <p style={{ margin: '4px 0' }}>📍 <strong>Location:</strong> {selectedEventDetails.location || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📅 <strong>Event Date:</strong> {selectedEventDetails.event_date || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>👥 <strong>Guest Count:</strong> {selectedEventDetails.guest_count || 1} pax</p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Client Information</h4>
                <p style={{ margin: '4px 0' }}>👤 <strong>Name:</strong> {selectedEventDetails.user?.name || selectedEventDetails.client_name || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📧 <strong>Email:</strong> {selectedEventDetails.user?.email || selectedEventDetails.client_email || 'N/A'}</p>
                <p style={{ margin: '4px 0' }}>📞 <strong>Contact Number:</strong> {selectedEventDetails.user?.contact_number || selectedEventDetails.client_contact || 'N/A'}</p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Financials & Payment</h4>
                <p style={{ margin: '4px 0' }}>💰 <strong>Total Price (Budget):</strong> ₱{Number(selectedEventDetails.budget || selectedEventDetails.total_price || 0).toLocaleString()}</p>
                <p style={{ margin: '4px 0' }}>⚡ <strong>50% Down Payment:</strong> ₱{(Number(selectedEventDetails.budget || selectedEventDetails.total_price || 0) * 0.50).toLocaleString()}</p>
                <p style={{ margin: '4px 0' }}>📌 <strong>Payment Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: '800', color: '#059669' }}>{selectedEventDetails.payment_status || 'Pending'}</span></p>
              </div>

              {/* Booked Services / Items Section */}
              {((selectedEventDetails.services && selectedEventDetails.services.length > 0) || 
                (selectedEventDetails.items && selectedEventDetails.items.length > 0) || 
                (selectedEventDetails.booking_items && selectedEventDetails.booking_items.length > 0)) && (
                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Booked Services / Items</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {(selectedEventDetails.services || selectedEventDetails.items || selectedEventDetails.booking_items).map((srv, idx) => {
                      const serviceName = srv.business_name || srv.service_name || srv.title || srv.name || `Service #${idx + 1}`;
                      const servicePrice = Number(srv.starting_price || srv.price || srv.pivot?.price || 0);
                      return (
                        <li key={idx} style={{ marginBottom: '6px' }}>
                          <strong>{serviceName}</strong> {servicePrice > 0 ? `(₱${servicePrice.toLocaleString()})` : ''}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                onClick={() => setSelectedEventDetails(null)}
                style={{ backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- CUSTOM CONFIRMATION MODAL --- */}
      {confirmModalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '15px', boxSizing: 'border-box' }} onClick={() => setConfirmModalData(null)}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', boxSizing: 'border-box' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: confirmModalData.type === 'delete' ? '#fee2e2' : '#dcfce7', color: confirmModalData.type === 'delete' ? '#dc2626' : '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <AlertTriangle size={24} />
            </div>
            
            <h3 style={{ margin: '0 0 8px 0', fontWeight: '900', fontSize: '1.2rem', color: '#0f172a' }}>
              {confirmModalData.type === 'delete' ? 'Confirm Deletion' : 'Confirm Full Payment'}
            </h3>
            
            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5' }}>
              {confirmModalData.type === 'delete' 
                ? `Are you sure you want to delete the event "${confirmModalData.name}"?` 
                : `Are you sure you want to mark "${confirmModalData.name}" as fully paid? This will move it to your Booking History.`}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setConfirmModalData(null)}
                style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' 
              }}
              >
                Cancel
              </button>
              
              <button 
                onClick={() => {
                  if (confirmModalData.type === 'delete') {
                    handleDeleteEvent(confirmModalData.id);
                  } else {
                    handleMarkAsPaidFully(confirmModalData.id);
                  }
                }}
                style={{ flex: 1, backgroundColor: confirmModalData.type === 'delete' ? '#dc2626' : '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
              >
                {confirmModalData.type === 'delete' ? 'Yes, Delete' : 'Yes, Paid Fully'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorEventsPage;