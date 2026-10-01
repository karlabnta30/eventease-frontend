import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { CheckCircle2, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);
    const [resolvedBookingId, setResolvedBookingId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleManualSync = async (bookingIdToSync) => {
        setVerifying(true);
        setError(null);
        try {
            const targetId = bookingIdToSync || resolvedBookingId;
            const response = await api.post('/verify-payment', {
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Inter', sans-serif", padding: isMobile ? '16px' : '20px', boxSizing: 'border-box' }}>
            <div style={{ background: '#fff', padding: isMobile ? '30px 20px' : '50px', borderRadius: '32px', textAlign: 'center', maxWidth: '450px', width: '100%', border: '1px solid #eee', boxShadow: '0 25px 50px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
                {verifying ? (
                    <>
                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px auto', color: '#000' }} />
                        <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.5rem', fontWeight: '900', marginBottom: '10px' }}>Finalizing Payment...</h2>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Updating database records...</p>
                    </>
                ) : error ? (
                    <>
                        <div style={{ fontSize: '50px', marginBottom: '20px' }}>⚠️</div>
                        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: '900', marginBottom: '10px', wordBreak: 'break-word' }}>Sync Interrupted</h2>
                        <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem', wordBreak: 'break-word' }}>{error}</p>
                        <p style={{ color: '#444', fontSize: '0.8rem', marginBottom: '30px', wordBreak: 'break-word' }}>Booking ID: {resolvedBookingId || 'None'}</p>
                        
                        <button onClick={() => handleManualSync(resolvedBookingId)} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '800', width: '100%', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}>
                            <RefreshCw size={18} /> SYNC PAYMENT STATUS NOW
                        </button>
                        <button onClick={() => navigate('/live-events')} style={{ background: '#000', color: '#fff', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '800', width: '100%', cursor: 'pointer', boxSizing: 'border-box' }}>
                            RETURN TO LIVE EVENTS
                        </button>
                    </>
                ) : (
                    <>
                        <div style={{ color: '#22c55e', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <CheckCircle2 size={70} />
                        </div>
                        <h2 style={{ fontSize: isMobile ? '1.7rem' : '2rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '15px' }}>Payment Confirmed!</h2>
                        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '35px', fontWeight: '500', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                            Your transaction was processed successfully. Your booking is now marked as <strong>Paid</strong>.
                        </p>
                        <button onClick={() => navigate('/live-events')} style={{ background: '#000', color: '#fff', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '800', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}>
                            RETURN TO DASHBOARD <ArrowRight size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;