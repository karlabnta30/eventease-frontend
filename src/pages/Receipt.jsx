import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Printer, ArrowRight, ShieldCheck, Download } from 'lucide-react';

const Receipt = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const bookingId = searchParams.get('booking_id');
    const amount = searchParams.get('amount');
    const ref = searchParams.get('ref'); 
    const date = new Date().toLocaleDateString('en-PH', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div style={styles.page}>
            {/* --- PRINT PROTECTION LOGIC --- */}
            <style>
                {`
                    @media print {
                        nav, aside, .sidebar, .no-print, button {
                            display: none !important;
                        }
                        body, html {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        #receipt-content {
                            box-shadow: none !important;
                            border: 2px solid #000 !important;
                            margin: 0 auto !important;
                            width: 100% !important;
                            max-width: 600px !important;
                            padding: 50px !important;
                        }
                    }
                `}
            </style>

            <div id="receipt-content" style={styles.receiptCard}>
                {/* Top Decorative Bar */}
                <div style={styles.topBar}></div>

                <div style={styles.header}>
                    <div style={styles.logoGroup}>
                        <div style={styles.logoIcon}>EE</div>
                        <div style={styles.logoText}>EventEase</div>
                    </div>
                    <div style={styles.statusBadge}>
                        <div style={styles.statusDot}></div>
                        PAYMENT SUCCESSFUL
                    </div>
                </div>

                <div style={styles.successSection}>
                    <div style={styles.successIconWrapper}>
                        <CheckCircle size={80} color="#22c55e" strokeWidth={2.5} />
                    </div>
                    <h1 style={styles.amount}>₱{Number(amount).toLocaleString()}</h1>
                    <p style={styles.subtext}>Transaction completed on {date}</p>
                </div>

                <div style={styles.detailsContainer}>
                    <h3 style={styles.detailsTitle}>Payment Summary</h3>
                    <div style={styles.detailsTable}>
                        <div style={styles.row}>
                            <span style={styles.label}>Reference Number</span>
                            <span style={styles.value}>EE-{ref}</span>
                        </div>
                        <div style={styles.row}>
                            <span style={styles.label}>Booking ID</span>
                            <span style={styles.value}>#{bookingId}</span>
                        </div>
                        <div style={styles.row}>
                            <span style={styles.label}>Payment Method</span>
                            <span style={styles.value}>GCash E-Wallet</span>
                        </div>
                        <div style={styles.row}>
                            <span style={styles.label}>Merchant</span>
                            <span style={styles.value}>EventEase Philippines</span>
                        </div>
                    </div>
                </div>

                <div style={styles.footerInfo}>
                    <ShieldCheck size={16} />
                    <span>This is an official electronic receipt secured by SSL Encryption.</span>
                </div>
            </div>

            <div style={styles.actionArea} className="no-print">
                <button onClick={() => window.print()} style={styles.printBtn}>
                    <Printer size={20} /> Print Receipt
                </button>
                <button onClick={() => navigate('/live-events')} style={styles.doneBtn}>
                    Return to Live Events <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

const styles = {
    page: { 
        backgroundColor: '#f4f7f6', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px 20px',
        backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
        backgroundSize: '25px 25px'
    },
    receiptCard: { 
        background: '#fff', 
        width: '100%', 
        maxWidth: '550px', // Increased size
        borderRadius: '32px', 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', 
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e5e7eb'
    },
    topBar: {
        height: '8px',
        background: 'linear-gradient(90deg, #000 0%, #333 100%)',
        width: '100%'
    },
    header: { 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '40px 40px 20px 40px' 
    },
    logoGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
    logoIcon: { background: '#000', color: '#fff', padding: '5px 8px', borderRadius: '8px', fontWeight: '900', fontSize: '0.9rem' },
    logoText: { fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-1.5px', color: '#000' },
    statusBadge: { 
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.7rem', 
        fontWeight: '800', 
        color: '#16a34a', 
        background: '#f0fdf4', 
        padding: '8px 14px', 
        borderRadius: '20px',
        border: '1px solid #dcfce7'
    },
    statusDot: { width: '6px', height: '6px', background: '#22c55e', borderRadius: '50%' },
    successSection: { padding: '20px 40px 40px 40px', textAlign: 'center' },
    successIconWrapper: { marginBottom: '25px' },
    amount: { fontSize: '4rem', fontWeight: '900', margin: '0', letterSpacing: '-2px', color: '#000' },
    subtext: { color: '#6b7280', fontSize: '1rem', fontWeight: '500', marginTop: '8px' },
    detailsContainer: { padding: '0 40px 40px 40px' },
    detailsTitle: { fontSize: '0.85rem', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' },
    detailsTable: { display: 'flex', flexDirection: 'column', gap: '18px' },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: '0.95rem', color: '#6b7280', fontWeight: '500' },
    value: { fontSize: '0.95rem', fontWeight: '700', color: '#111827' },
    footerInfo: { 
        background: '#f9fafb',
        padding: '20px 40px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '8px', 
        color: '#9ca3af', 
        fontSize: '0.75rem', 
        fontWeight: '600',
        borderTop: '1px solid #f3f4f6'
    },
    actionArea: { marginTop: '40px', display: 'flex', gap: '20px' },
    printBtn: { 
        padding: '16px 32px', 
        borderRadius: '16px', 
        border: '2px solid #e5e7eb', 
        background: '#fff', 
        cursor: 'pointer', 
        fontWeight: '800', 
        fontSize: '1rem',
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        transition: 'all 0.2s ease'
    },
    doneBtn: { 
        padding: '16px 32px', 
        borderRadius: '16px', 
        border: 'none', 
        background: '#000', 
        color: '#fff', 
        cursor: 'pointer', 
        fontWeight: '800', 
        fontSize: '1rem',
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)'
    }
};

export default Receipt;