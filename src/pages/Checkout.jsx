import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { CreditCard, Lock, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('booking_id');
    const amount = searchParams.get('amount');
    
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePayMongoCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Save booking ID to local storage as a fallback backup before triggering checkout
        if (bookingId) {
            localStorage.setItem('pending_booking_id', bookingId);
        }
        
        try {
            const response = await api.post('/create-checkout', {
                amount: amount,
                description: `EventEase Booking #EE-${bookingId}`,
                booking_id: bookingId
            });

            const checkoutUrl = response.data.data.attributes.checkout_url;
            window.location.href = checkoutUrl;

        } catch (error) {
            console.error("PayMongo Error:", error.response?.data || error.message);
            alert(error.response?.data?.error || "Failed to initialize PayMongo checkout.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ ...styles.pageWrapper, padding: isMobile ? '30px 16px' : '60px 20px' }}>
            <div style={styles.container}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <ArrowLeft size={18} /> Return to Details
                </button>

                <div style={{ ...styles.checkoutGrid, gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: isMobile ? '30px' : '60px' }}>
                    <div style={styles.paymentFormSide}>
                        <div style={{ marginBottom: '30px' }}>
                            <h1 style={{ ...styles.title, fontSize: isMobile ? '2rem' : '2.5rem' }}>Secure Checkout</h1>
                            <p style={styles.subtitle}>Pay securely using GCash, Maya, QRPH, or Credit Card via PayMongo.</p>
                        </div>

                        <div style={styles.cardPreview}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={styles.cardChip} />
                                <span style={{ fontWeight: '900', letterSpacing: '1px', fontSize: '0.9rem' }}>PAYMONGO SECURE</span>
                            </div>
                            <div style={{ ...styles.cardNumberDisplay, fontSize: isMobile ? '1.3rem' : '1.6rem' }}>•••• •••• •••• ••••</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                <div>
                                    <div style={styles.cardLabel}>SUPPORTED</div>
                                    <div style={styles.cardUser}>GCASH • MAYA • QRPH</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={styles.cardLabel}>GATEWAY</div>
                                    <div style={styles.cardUser}>CHECKOUT V1</div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handlePayMongoCheckout} style={{ marginTop: '30px' }}>
                            <button type="submit" disabled={loading} style={styles.payBtn}>
                                {loading ? 'CONNECTING TO PAYMONGO...' : <><ShieldCheck size={20} /> PROCEED TO PAY ₱{Number(amount || 0).toLocaleString()}</>}
                            </button>
                        </form>

                        <div style={styles.securityFooter}>
                            <Lock size={14} /> 
                            <span>Your transaction is encrypted and secured by PayMongo & EventEase.</span>
                        </div>
                    </div>

                    <div style={{ ...styles.summarySide, padding: isMobile ? '25px 20px' : '40px' }}>
                        <h3 style={styles.summaryTitle}>Payment Summary</h3>
                        <div style={styles.summaryItem}>
                            <span>Service Provider</span>
                            <span style={styles.summaryValue}>Verified Vendor</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span>Booking ID</span>
                            <span style={styles.summaryValue}>#EE-{bookingId}</span>
                        </div>
                        <div style={styles.summaryItem}>
                            <span>Transaction Fee</span>
                            <span style={styles.summaryValue}>₱0.00</span>
                        </div>
                        <div style={styles.totalDivider} />
                        <div style={{ ...styles.totalRow, fontSize: isMobile ? '1.25rem' : '1.5rem' }}>
                            <span>Amount to Pay</span>
                            <span>₱{Number(amount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: { backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' },
    container: { maxWidth: '1000px', margin: '0 auto' },
    backBtn: { background: 'none', border: 'none', color: '#999', fontWeight: '700', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', padding: 0 },
    checkoutGrid: { display: 'grid', alignItems: 'start' },
    paymentFormSide: { background: 'white' },
    title: { fontWeight: '900', letterSpacing: '-2px', margin: '0 0 10px 0' },
    subtitle: { color: '#666', fontSize: '1rem', fontWeight: '500' },
    cardPreview: { background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)', padding: '30px', borderRadius: '24px', color: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', aspectRatio: '1.6/1', boxSizing: 'border-box' },
    cardChip: { width: '45px', height: '35px', background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)', borderRadius: '8px', marginBottom: '25px' },
    cardNumberDisplay: { fontWeight: '700', letterSpacing: '4px', margin: '20px 0' },
    cardLabel: { fontSize: '0.6rem', fontWeight: '900', color: '#888', letterSpacing: '1px', marginBottom: '5px' },
    cardUser: { fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px' },
    payBtn: { width: '100%', padding: '22px', background: '#000', color: '#fff', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '30px', boxSizing: 'border-box' },
    securityFooter: { marginTop: '25px', display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.8rem', fontWeight: '600', justifyContent: 'center', textAlign: 'center' },
    summarySide: { background: '#fcfcfc', borderRadius: '35px', border: '1px solid #f0f0f0', boxSizing: 'border-box' },
    summaryTitle: { fontSize: '1.4rem', fontWeight: '900', marginBottom: '30px', letterSpacing: '-0.5px' },
    summaryItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem', color: '#666', fontWeight: '500' },
    summaryValue: { color: '#000', fontWeight: '700' },
    totalDivider: { height: '1px', background: '#eee', margin: '25px 0' },
    totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#000', letterSpacing: '-1px' },
};

export default Checkout;