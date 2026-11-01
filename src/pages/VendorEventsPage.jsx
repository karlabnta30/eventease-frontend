import React, { useState, useEffect } from 'react';
import api from '../api';

const VendorEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'pending'

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

  // Function to delete an event/booking record
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

  // Filtering logic based on the selected filter button
  const filteredEvents = events.filter(event => {
    const isPaid = event.payment_status?.toLowerCase().includes('paid') || event.payment_status?.toLowerCase().includes('accepted');
    if (filter === 'paid') return isPaid;
    if (filter === 'pending') return !isPaid;
    return true; // 'all'
  });

  return (
    <div style={{ padding: '30px', fontFamily: 'Inter', backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 5px 0' }}>
            Vendor Event & Down Payment Monitor
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Monitor events and verify if clients have completed the 50% down payment before approval.
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setFilter('all')} 
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: filter === 'all' ? '#fff' : 'transparent', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', boxShadow: filter === 'all' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('paid')} 
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: filter === 'paid' ? '#fff' : 'transparent', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', color: '#059669', boxShadow: filter === 'paid' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          >
            Paid (50% Down)
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: filter === 'pending' ? '#fff' : 'transparent', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem', color: '#d97706', boxShadow: filter === 'pending' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
          >
            Pending / Unpaid
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
            const isPaid = event.payment_status?.toLowerCase().includes('paid') || event.payment_status?.toLowerCase().includes('accepted');

            return (
              <div key={bookingId} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                
                {/* Event Details */}
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
                      backgroundColor: isPaid ? '#ecfdf5' : '#fef3c7',
                      color: isPaid ? '#059669' : '#d97706',
                      border: isPaid ? '1px solid #a7f3d0' : '1px solid #fde68a'
                    }}>
                      {isPaid ? '✔ 50% Down Payment Paid' : '⏳ Pending 50% Payment'}
                    </span>
                  </div>
                  
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>Client: <strong>{event.user?.name || event.client_name || 'N/A'}</strong></p>
                  <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>Event Date: <strong>{event.event_date || 'TBD'}</strong></p>
                  
                  {/* Financial Breakdown */}
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>Total Price: <strong>₱{totalPrice.toLocaleString()}</strong></span>
                    <span style={{ fontSize: '0.85rem', color: '#059669' }}>Required 50% Down: <strong>₱{downPayment.toLocaleString()}</strong></span>
                    <span style={{ fontSize: '0.85rem', color: '#d97706' }}>Remaining Balance: <strong>₱{remainingBalance.toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Actions / Delete Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  >
                    Delete
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorEventsPage;