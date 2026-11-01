import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || { bookingId: null, amount: 0 };
  
  // Kunin ang total amount at i-compute ang 50% Down Payment
  const totalAmount = Number(bookingData.amount) || 0;
  const downPaymentAmount = totalAmount * 0.50;
  const remainingBalance = totalAmount - downPaymentAmount;

  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (cardNumber.length !== 16) return alert("Please enter a valid 16-digit GCash Card number.");

    setLoading(true);

    try {
      // Ipinapadala natin ang downPaymentAmount sa backend alinsunod sa T&C
      await api.post('/pay', {
        booking_id: bookingData.bookingId,
        card_number: cardNumber,
        amount: downPaymentAmount 
      });
      
      alert("50% Down Payment Successful!");
      navigate('/home');
    } catch (err) {
      alert("Payment failed: " + (err.response?.data?.error || "Check connection."));
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fff', fontFamily: 'Inter', boxSizing: 'border-box', padding: isMobile ? '20px' : '0' },
    card: { padding: isMobile ? '25px 20px' : '40px', border: '2px solid #000', borderRadius: '24px', maxWidth: '420px', width: '100%', boxSizing: 'border-box' },
    title: { fontWeight: '900', fontSize: isMobile ? '1.75rem' : '2rem', marginBottom: '15px', wordBreak: 'break-word' },
    input: { width: '100%', padding: '15px', margin: '10px 0', border: '2px solid #000', borderRadius: '12px', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' },
    btn: { width: '100%', padding: '15px', background: '#000', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', boxSizing: 'border-box' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>gcash card.</h2>
        <p style={{ wordBreak: 'break-word', fontSize: '0.95rem', margin: '0 0 5px 0' }}>Paying for Booking: <strong>#{bookingData.bookingId}</strong></p>
        
        {/* Breakdown ng Presyo batay sa 50% T&C Policy */}
        <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '15px 0' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#64748b' }}>
            Total Package Price: <strong>PHP {totalAmount.toLocaleString()}</strong>
          </p>
          <p style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#059669', fontWeight: '800' }}>
            Required 50% Down Payment: PHP {downPaymentAmount.toLocaleString()}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            Remaining Balance: PHP {remainingBalance.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handlePayment}>
          <label style={{fontWeight: '800', fontSize: '0.8rem', display: 'block'}}>16-DIGIT CARD NUMBER</label>
          <input 
            type="text" 
            maxLength="16"
            placeholder="0000 0000 0000 0000" 
            style={styles.input} 
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
          />
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'PROCESSING...' : `PAY PHP ${downPaymentAmount.toLocaleString()} (50%)`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;