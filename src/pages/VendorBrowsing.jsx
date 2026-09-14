import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VendorBrowsing = () => {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hiringLoading, setHiringLoading] = useState(false);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({
        event_name: '',
        event_date: '',
        start_time: '',
        end_time: '',
        guest_count: ''
    });

    // Fetch all available vendor services
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/vendors');
                setVendors(response.data.data);
            } catch (error) {
                console.error("Error fetching vendors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const handleOpenModal = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    const handleFinalHire = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in first.");
            return;
        }

        setHiringLoading(true);

        const payload = {
            event_name: bookingDetails.event_name,
            event_date: bookingDetails.event_date,
            start_time: bookingDetails.start_time || "09:00",
            end_time: bookingDetails.end_time || "17:00",
            location: selectedVendor.location,
            budget: selectedVendor.price,
            service_id: selectedVendor.id,
            category: selectedVendor.category,
            guest_count: bookingDetails.guest_count || 0,
            venue_id: 0 // Default
        };

        try {
            await axios.post('http://127.0.0.1:8000/api/bookings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Hiring request sent successfully!");
            setShowModal(false);
            navigate('/live-events');
        } catch (error) {
            console.error("Booking Error:", error.response?.data);
            alert(error.response?.data?.message || "Failed to hire vendor.");
        } finally {
            setHiringLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Services...</div>;

    return (
        <div style={{ padding: '40px', backgroundColor: '#fffafb', minHeight: '100vh' }}>
            <h1 style={{ fontWeight: '900', color: '#1a1a1a', marginBottom: '30px' }}>Available Services</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {vendors.map(vendor => (
                    <div key={vendor.id} style={cardStyle}>
                        <div style={imagePlaceholder}>Shop Logo/Photo</div>
                        <div style={{ padding: '20px' }}>
                            <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '800' }}>{vendor.name}</h3>
                            <p style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>{vendor.category}</p>
                            <p style={{ fontSize: '14px' }}>📍 {vendor.location}</p>
                            <p style={{ fontWeight: 'bold', color: '#d4a5a5' }}>₱{vendor.price}</p>
                            <button 
                                onClick={() => handleOpenModal(vendor)}
                                style={hireButtonStyle}
                            >
                                HIRE VENDOR
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- HIRE VENDOR MODAL --- */}
            {showModal && selectedVendor && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        {/* Left Side: Form Details */}
                        <div style={{ flex: 2, paddingRight: '30px', borderRight: '1px solid #eee' }}>
                            <h2 style={{ fontWeight: '900', marginBottom: '10px' }}>Confirm Hiring</h2>
                            <p style={{ color: '#888', marginBottom: '20px' }}>Please provide event details for <strong>{selectedVendor.name}</strong></p>
                            
                            <div style={formGroup}>
                                <label style={labelStyle}>Event Name</label>
                                <input 
                                    style={inputStyle} type="text" placeholder="e.g. 21st Birthday Party"
                                    onChange={(e) => setBookingDetails({...bookingDetails, event_name: e.target.value})}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Date</label>
                                    <input style={inputStyle} type="date" onChange={(e) => setBookingDetails({...bookingDetails, event_date: e.target.value})} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Guests</label>
                                    <input style={inputStyle} type="number" placeholder="0" onChange={(e) => setBookingDetails({...bookingDetails, guest_count: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Start Time</label>
                                    <input style={inputStyle} type="time" onChange={(e) => setBookingDetails({...bookingDetails, start_time: e.target.value})} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>End Time</label>
                                    <input style={inputStyle} type="time" onChange={(e) => setBookingDetails({...bookingDetails, end_time: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Summary & Actions */}
                        <div style={{ flex: 1, paddingLeft: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>Total Service Price</p>
                                <h1 style={{ margin: 0, color: '#d4a5a5' }}>₱{selectedVendor.price}</h1>
                            </div>
                            
                            <button 
                                onClick={handleFinalHire}
                                disabled={hiringLoading}
                                style={continueButtonStyle}
                            >
                                {hiringLoading ? 'SAVING...' : 'CONTINUE TO HIRE'}
                            </button>
                            
                            <button 
                                onClick={() => setShowModal(false)}
                                style={cancelButtonStyle}
                            >
                                CANCEL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- STYLES ---

const cardStyle = {
    background: 'white', borderRadius: '15px', overflow: 'hidden',
    boxShadow: '0 10px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0'
};

const imagePlaceholder = {
    height: '180px', background: '#f9f9f9', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '14px'
};

const hireButtonStyle = {
    width: '100%', padding: '12px', marginTop: '15px', background: '#1a1a1a',
    color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
};

const modalOverlay = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalContent = {
    background: 'white', padding: '40px', borderRadius: '20px', display: 'flex',
    width: '850px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
};

const formGroup = { marginBottom: '15px', flex: 1 };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#666' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };

const continueButtonStyle = {
    background: '#1a1a1a', color: 'white', padding: '15px', border: 'none',
    borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
};

const cancelButtonStyle = {
    background: '#f5f5f5', color: '#555', padding: '15px', border: 'none',
    borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
};

export default VendorBrowsing;