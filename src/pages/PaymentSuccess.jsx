import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);
    const [resolvedBookingId, setResolvedBookingId] = useState(null);

    const handleManualSync = async (bookingIdToSync) => {
        setVerifying(true);
        setError(null);
        try {
            const targetId = bookingIdToSync || resolvedBookingId;
            const response = await axios.post('http://127.0.0.1:8000/api/verify-payment', {
                booking_id: targetId
            });
            console.log("Sync response:", response.data);
            localStorage.removeItem('pending_booking_id');
            setVerifying(false);
            navigate('/live-events');
        } catch (err) {
            console.error("Manual sync failed:", err);
            setError(err.response?.data?.error || 'Failed to communicate with Laravel backend.');
            setVerifying(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get('session_id');
        const bookingId = queryParams.get('booking_id') || localStorage.getItem('pending_booking_id');

        setResolvedBookingId(bookingId);

        if (!bookingId) {
            setError('No booking reference found in storage or URL.');
            setVerifying(false);
            return;
        }

        // Automatically attempt sync on load
        handleManualSync(bookingId);
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Inter', sans-serif", padding: '20px' }}>
            <div style={{ background: '#fff', padding: '50px', borderRadius: '32px', textAlign: 'center', maxWidth: '450px', width: '100%', border: '1px solid #eee', boxShadow: '0 25px 50px rgba(0,0,0,0.05)' }}>
                {verifying ? (
                    <>
                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px auto', color: '#000' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '10px' }}>Finalizing Payment...</h2>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Updating MySQL records...</p>
                    </>
                ) : error ? (
                    <>
                        <div style={{ fontSize: '50px', marginBottom: '20px' }}>⚠️</div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '10px' }}>Sync Interrupted</h2>
                        <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</p>
                        <p style={{ color: '#444', fontSize: '0.8rem', marginBottom: '30px' }}>Booking ID: {resolvedBookingId || 'None'}</p>
                        
                        <button onClick={() => handleManualSync(resolvedBookingId)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '800', width: '100%', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <RefreshCw size={18} /> SYNC PAYMENT STATUS NOW
                        </button>
                        <button onClick={() => navigate('/live-events')} style={{ background: '#000', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '800', width: '100%', cursor: 'pointer' }}>
                            RETURN TO LIVE EVENTS
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ color: '#22c55e', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <CheckCircle2 size={70} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '15px' }}>Payment Confirmed!</h2>
                        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '35px', fontWeight: '500', fontSize: '0.95rem' }}>
                            Your transaction was processed successfully. Your booking is now marked as <strong>Paid</strong> in MySQL.
                        </p>
                        <button onClick={() => navigate('/live-events')} style={{ background: '#000', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            RETURN TO DASHBOARD <ArrowRight size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;