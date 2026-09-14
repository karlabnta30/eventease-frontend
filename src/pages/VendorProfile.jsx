import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VendorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [showHireModal, setShowHireModal] = useState(false);
    const [hiringLoading, setHiringLoading] = useState(false);
    const [bookingDetails, setBookingDetails] = useState({
        event_name: '',
        event_date: '',
        start_time: '',
        end_time: '',
        guest_count: ''
    });

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://127.0.0.1:8000/api/vendors/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVendor(res.data.data);
            } catch (err) {
                console.error("Error fetching vendor:", err);
                if (err.response?.status === 404) alert("Service not found.");
            } finally {
                setLoading(false);
            }
        };
        fetchVendor();
    }, [id]);

    const handleFinalHire = async () => {
        const token = localStorage.getItem('token');
        if (!token) return alert("Please log in first.");

        setHiringLoading(true);
        const payload = {
            ...bookingDetails,
            service_id: vendor.id,
            budget: vendor.price,
            location: vendor.location,
            category: vendor.category,
            venue_id: 0
        };

        try {
            await axios.post('http://127.0.0.1:8000/api/bookings', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Changed alert to be more descriptive for your defense
            alert("Hiring request sent! The vendor has been notified to accept your booking.");
            navigate('/live-events');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to hire vendor.");
        } finally {
            setHiringLoading(false);
        }
    };

    if (loading) return <div style={centerStyle}>Loading profile...</div>;
    if (!vendor) return <div style={centerStyle}>Vendor not found.</div>;

    return (
        <div style={{ padding: '60px 10%', backgroundColor: '#fffafb', minHeight: '100vh' }}>
            <button onClick={() => navigate(-1)} style={backBtnStyle}>← Back</button>

            <div style={profileHeaderStyle}>
                <div style={imageBoxLarge}>{vendor.category}</div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: 0 }}>{vendor.name}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#888' }}>📍 {vendor.location}</p>
                    
                    <div style={descCardStyle}>
                        <h3 style={{ margin: '0 0 10px 0' }}>Description</h3>
                        <p style={{ color: '#555', lineHeight: '1.6' }}>{vendor.description || "No description provided."}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h2 style={{ color: '#d4a5a5', fontSize: '2rem', margin: 0 }}>₱{parseFloat(vendor.price).toLocaleString()}</h2>
                        <button onClick={() => setShowHireModal(true)} style={mainHireBtn}>HIRE VENDOR</button>
                    </div>
                </div>
            </div>

            {showHireModal && (
                <div style={modalOverlay}>
                    <div style={modalContent}>
                        <div style={{ flex: 2, paddingRight: '30px', borderRight: '1px solid #eee' }}>
                            <h2 style={{ fontWeight: '900' }}>Event Details</h2>
                            <div style={formGroup}>
                                <label style={labelStyle}>Event Name</label>
                                <input style={inputStyle} type="text" onChange={(e) => setBookingDetails({...bookingDetails, event_name: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Date</label>
                                    <input style={inputStyle} type="date" onChange={(e) => setBookingDetails({...bookingDetails, event_date: e.target.value})} />
                                </div>
                                <div style={formGroup}>
                                    <label style={labelStyle}>Guests</label>
                                    <input style={inputStyle} type="number" onChange={(e) => setBookingDetails({...bookingDetails, guest_count: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={formGroup}><label style={labelStyle}>Start Time</label><input style={inputStyle} type="time" onChange={(e) => setBookingDetails({...bookingDetails, start_time: e.target.value})} /></div>
                                <div style={formGroup}><label style={labelStyle}>End Time</label><input style={inputStyle} type="time" onChange={(e) => setBookingDetails({...bookingDetails, end_time: e.target.value})} /></div>
                            </div>
                        </div>
                        <div style={{ flex: 1, paddingLeft: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '15px' }}>
                            <button onClick={handleFinalHire} disabled={hiringLoading} style={confirmBtn}>
                                {hiringLoading ? 'SAVING...' : 'CONFIRM HIRE'}
                            </button>
                            <button onClick={() => setShowHireModal(false)} style={cancelBtn}>CANCEL</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const centerStyle = { padding: '100px', textAlign: 'center' };
const backBtnStyle = { background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px' };
const profileHeaderStyle = { display: 'flex', gap: '50px', alignItems: 'flex-start', flexWrap: 'wrap' };
const imageBoxLarge = { width: '300px', height: '300px', backgroundColor: '#fdf2f4', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '25px', color: '#d4a5a5', fontWeight: 'bold', fontSize: '1.5rem' };
const descCardStyle = { margin: '20px 0', padding: '20px', backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #eee' };
const mainHireBtn = { padding: '15px 40px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContent = { background: 'white', padding: '40px', borderRadius: '25px', display: 'flex', width: '800px', maxWidth: '95%' };
const formGroup = { marginBottom: '15px' };
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px', color: '#888' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' };
const confirmBtn = { background: '#1a1a1a', color: '#fff', padding: '15px', border: 'none', borderRadius: '10px', fontWeight: 'bold' };
const cancelBtn = { background: '#eee', color: '#555', padding: '15px', border: 'none', borderRadius: '10px', fontWeight: 'bold' };

export default VendorProfile;