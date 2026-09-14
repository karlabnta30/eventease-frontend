import React, { useState } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || { bookingId: null, amount: 0 };
  
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cardNumber.length !== 16) return alert("Please enter a valid 16-digit GCash Card number.");

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      await axios.post('http://127.0.0.1:8000/api/pay', {
        booking_id: bookingData.bookingId,
        card_number: cardNumber,
        amount: bookingData.amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Payment Successful!");
      navigate('/home');
    } catch (err) {
      alert("Payment failed: " + (err.response?.data?.error || "Check connection."));
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff', fontFamily: 'Inter' },
    card: { padding: '40px', border: '2px solid #000', borderRadius: '24px', maxWidth: '400px', width: '90%' },
    title: { fontWeight: '900', fontSize: '2rem', marginBottom: '20px' },
    input: { width: '100%', padding: '15px', margin: '10px 0', border: '2px solid #000', borderRadius: '12px', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>gcash card.</h2>
        <p>Paying for Booking: <strong>#{bookingData.bookingId}</strong></p>
        <p>Total Amount: <strong>PHP {bookingData.amount}</strong></p>
        <form onSubmit={handlePayment}>
          <label style={{fontWeight: '800', fontSize: '0.8rem'}}>16-DIGIT CARD NUMBER</label>
          <input 
            type="text" 
            maxLength="16"
            placeholder="0000 0000 0000 0000" 
            style={styles.input} 
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
          />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'PROCESSING...' : 'CONFIRM PAYMENT'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;