import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar-custom.css'; 

const EventCalendar = ({ bookings = [] }) => {
  const [date, setDate] = useState(new Date());

  // Helper to find if a specific calendar tile has a booking
  const getTileClassName = ({ date, view }) => {
    // Only apply indicators to the 'month' view
    if (view === 'month') {
      // Format the tile date to YYYY-MM-DD to match database format
      const dateString = date.toISOString().split('T')[0];
      
      // Check if any booking matches this date
      const isBooked = bookings.some(b => b.event_date.startsWith(dateString));
      
      return isBooked ? 'booked-day' : null;
    }
  };

  return (
    <div className="calendar-wrapper">
      <Calendar 
        onChange={setDate} 
        value={date} 
        next2Label={null} 
        prev2Label={null}
        tileClassName={getTileClassName} // This adds the 'booked-day' class
      />
      <div style={{ marginTop: '20px', padding: '10px', background: '#fcfcfd', borderRadius: '8px', fontSize: '13px' }}>
        Selected: <strong>{date.toDateString()}</strong>
      </div>
    </div>
  );
};

export default EventCalendar;