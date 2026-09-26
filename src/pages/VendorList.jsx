import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Lock, AlertCircle, Power, Star, Check, Plus, Trash2, ShieldAlert, ChevronRight, ArrowLeft } from 'lucide-react';
import { notifyNewBooking } from '../toastUtils.jsx';
import { toast } from 'react-hot-toast';

const StarRating = ({ rating = 5.0, totalReviews = 12 }) => {
    const numericRating = Math.min(5, Math.max(1, parseFloat(rating) || 5.0));
    const roundedStars = Math.round(numericRating);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', margin: '8px 0 14px 0' }}>
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={15}
                    fill={i < roundedStars ? '#f59e0b' : 'none'}
                    color={i < roundedStars ? '#f59e0b' : '#cbd5e1'}
                />
            ))}
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b', marginLeft: '5px' }}>
                {numericRating.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', marginLeft: '3px' }}>
                ({totalReviews})
            </span>
        </div>
    );
};

const VendorList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userRole = localStorage.getItem('userRole');
    
    const eventIdFromUrl = searchParams.get('event_id');
    const userBudget = useMemo(() => {
        const b = searchParams.get('budget');
        return b ? parseFloat(b) : 0;
    }, [searchParams]);

    const guestCount = useMemo(() => {
        const g = searchParams.get('guest_count');
        return g ? parseInt(g, 10) : 50; 
    }, [searchParams]);
    
    const [vendors, setVendors] = useState([]);
    
    // PERSIST CART: Load initial cart state from localStorage if available
    const [selectedServices, setSelectedServices] = useState(() => {
        const savedCart = localStorage.getItem('eventease_pending_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [loading, setLoading] = useState(true);
    const [hiringLoading, setHiringLoading] = useState(false);
    const [activeCategoryView, setActiveCategoryView] = useState(null);

    const categories = ['Catering', 'Photography', 'Venue', 'Entertainment', 'Decoration', 'Hosting', 'Random Stuff / Miscellaneous'];

    const getCategoryPhoto = (category) => {
        const photos = {
            'Catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop',
            'Photography': 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop',
            'Venue': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
            'Entertainment': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
            'Decoration': 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop',
            'Hosting': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop',
            'Random Stuff / Miscellaneous': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
        };
        return photos[category] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop';
    };

    const fetchVendors = async () => {
        try {
            const endpoint = userRole === 'vendor' ? '/vendor/services' : '/vendors';
            const res = await api.get(endpoint);
            setVendors(res.data.data || []);
        } catch (err) { 
            console.error("Fetch Error:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    // Save cart changes to localStorage automatically so user never loses selections
    useEffect(() => {
        localStorage.setItem('eventease_pending_cart', JSON.stringify(selectedServices));
    }, [selectedServices]);

    const handleToggleStatus = async (id) => {
        try {
            await api.post(`/vendors/toggle/${id}`);
            fetchVendors();
        } catch (error) { 
            console.error("Toggle failed", error); 
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this service?")) return;

        try {
            await api.delete(`/vendors/${id}`);
            toast.success("Service deleted successfully.");
            fetchVendors();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error(error.response?.data?.message || "Failed to delete service.");
        }
    };

    const calculateDynamicPrice = (vendor) => {
        const raw = vendor.starting_price || vendor.price || 0;
        const basePrice = typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.]/g,"")) : parseFloat(raw);
        
        const cat = (vendor.category || '').toLowerCase();
        const name = (vendor.business_name || vendor.name || '').toLowerCase();

        if (cat.includes('catering') || name.includes('catering')) {
            return basePrice * guestCount; 
        }
        return basePrice;
    };

    const toggleSelectService = (vendor) => {
        const exists = selectedServices.some(s => s.id === vendor.id);
        if (exists) {
            setSelectedServices(selectedServices.filter(s => s.id !== vendor.id));
        } else {
            setSelectedServices([...selectedServices, vendor]);
        }
    };

    const totalSelectedCost = useMemo(() => {
        return selectedServices.reduce((sum, item) => sum + calculateDynamicPrice(item), 0);
    }, [selectedServices, guestCount]);

    const isCartOverBudget = userBudget > 0 && totalSelectedCost > userBudget;

    const handleMultiServiceCheckout = async () => {
        if (selectedServices.length === 0) return;

        if (!eventIdFromUrl) {
            alert("No event ID detected in URL. Please start booking from your event itinerary.");
            return;
        }

        setHiringLoading(true);
        try {
            const cleanBookingId = String(eventIdFromUrl).split(':')[0].replace(/[^0-9]/g, '');
            const payload = { services: selectedServices.map(s => Number(s.id)) };

            await api.post(`/bookings/${cleanBookingId}/attach-services`, payload);
            localStorage.removeItem('eventease_pending_cart'); // Clear cart upon successful checkout
            notifyNewBooking(`Successfully added ${selectedServices.length} service(s) to cart & booking!`);
            navigate('/live-events');
        } catch (error) {
            if (selectedServices.length === 1) {
                const cleanBookingId = String(eventIdFromUrl).split(':')[0].replace(/[^0-9]/g, '');
                const singleVendorId = Number(selectedServices[0].id);

                await api.patch(`/bookings/${cleanBookingId}/assign-vendor`, { vendor_id: singleVendorId });
                localStorage.removeItem('eventease_pending_cart');
                notifyNewBooking(`Hired ${selectedServices[0].business_name || selectedServices[0].name}!`);
                navigate('/live-events');
            } else {
                alert(error.response?.data?.message || error.response?.data?.error || "Error attaching services.");
            }
        } finally {
            setHiringLoading(false);
        }
    };

    const filteredVendors = vendors.filter(v => {
        if (!activeCategoryView) return true;
        const vCat = (v.category || '').toLowerCase();
        const active = activeCategoryView.toLowerCase();
        
        if (active.includes('miscellaneous') || active.includes('random')) {
            return !['catering', 'photography', 'venue', 'entertainment', 'decoration', 'hosting'].some(c => vCat.includes(c));
        }
        return vCat.includes(active);
    });

    if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontWeight: '800', fontSize: '1.2rem' }}>Loading Services...</div>;

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '40px 60px 140px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    {activeCategoryView && (
                        <button 
                            onClick={() => setActiveCategoryView(null)}
                            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', cursor: 'pointer', color: '#64748b', marginBottom: '10px', fontSize: '0.9rem' }}
                        >
                            <ArrowLeft size={16} /> Back to Categories
                        </button>
                    )}
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', color: '#000', margin: 0 }}>
                        {activeCategoryView ? `${activeCategoryView} Services` : (userRole === 'vendor' ? 'My Listed Services' : 'Browse Service Categories')}
                    </h1>
                </div>

                {userRole !== 'vendor' && !activeCategoryView && (
                    <div style={{ 
                        background: isCartOverBudget ? '#ef4444' : '#000', 
                        color: '#fff', padding: '10px 20px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' 
                    }}>
                        {isCartOverBudget ? <ShieldAlert size={18} /> : <AlertCircle size={18} />}
                        <span style={{ fontWeight: '700' }}>
                            BUDGET LIMIT: ₱{userBudget > 0 ? userBudget.toLocaleString() : "NO LIMIT SET"} (Guests: {guestCount})
                        </span>
                    </div>
                )}
            </div>

            {!activeCategoryView ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginTop: '35px' }}>
                    {categories.map(cat => (
                        <div 
                            key={cat} 
                            onClick={() => setActiveCategoryView(cat)}
                            style={{
                                background: '#fff', borderRadius: '28px', overflow: 'hidden', border: '1px solid #f0f0f0',
                                cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.03)', transition: 'all 0.2s ease',
                                display: 'flex', flexDirection: 'column'
                            }}
                        >
                            <div style={{ height: '160px', backgroundImage: `url(${getCategoryPhoto(cat)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: '0', background: 'rgba(0,0,0,0.3)' }} />
                                <div style={{ position: 'absolute', bottom: '15px', left: '20px', color: '#fff' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900' }}>{cat}</h3>
                                </div>
                            </div>
                            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>View Listed Services</span>
                                <ChevronRight size={18} color="#0f172a" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginTop: '35px' }}>
                    {filteredVendors.length > 0 ? filteredVendors.map(vendor => {
                        const dynamicPrice = calculateDynamicPrice(vendor);
                        const isTooExpensive = userBudget > 0 && dynamicPrice > userBudget;
                        const isOffline = vendor.is_available === 0;
                        const isDisabled = (isTooExpensive || isOffline) && userRole !== 'vendor';
                        const isSelected = selectedServices.some(s => s.id === vendor.id);

                        return (
                            <div key={vendor.id} style={{
                                background: '#fff', borderRadius: '28px', overflow: 'hidden', 
                                border: isSelected ? '2px solid #000' : '1px solid #f0f0f0', 
                                position: 'relative', opacity: isDisabled ? 0.7 : 1, 
                                boxShadow: isSelected ? '0 15px 30px rgba(0,0,0,0.08)' : '0 10px 20px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ height: '180px', backgroundImage: `url(${getCategoryPhoto(vendor.category)})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800' }}>
                                        {vendor.category || 'General'}
                                    </div>
                                    
                                    {isDisabled && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                                            <div style={{ background: '#fff', padding: '8px 16px', borderRadius: '20px', fontWeight: '900', fontSize: '0.75rem', color: isOffline ? '#888' : '#ff4d4d', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Lock size={12} /> {isOffline ? 'OFFLINE' : 'OVER BUDGET'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ padding: '25px' }}>
                                    <h3 style={{ fontWeight: '900', fontSize: '1.3rem', margin: '0 0 4px 0' }}>
                                        {vendor.business_name || vendor.name}
                                    </h3>
                                    
                                    <StarRating rating={vendor.rating || 5.0} totalReviews={vendor.total_reviews || 12} />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                                        <MapPin size={16}/> {vendor.location || 'Metro Manila'}
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                                        <div>
                                            <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>
                                                ₱{dynamicPrice.toLocaleString()}
                                            </div>
                                        </div>
                                        
                                        <div style={{ width: '190px' }}>
                                            {userRole === 'vendor' ? (
                                                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                                    <button onClick={() => handleToggleStatus(vendor.id)} style={{
                                                        background: vendor.is_available ? '#000' : '#f0f0f0',
                                                        color: vendor.is_available ? '#fff' : '#aaa',
                                                        padding: '14px 12px', borderRadius: '14px', border: 'none', fontWeight: '800', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem'
                                                    }}>
                                                        <Power size={14} />
                                                        {vendor.is_available ? 'ONLINE' : 'OFFLINE'}
                                                    </button>

                                                    <button onClick={() => handleDeleteService(vendor.id)} style={{
                                                        background: '#fee2e2',
                                                        color: '#991b1b',
                                                        padding: '14px 14px', borderRadius: '14px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }} title="Delete Service">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    style={{ 
                                                        background: isSelected ? '#10b981' : '#000', 
                                                        color: '#fff', border: 'none', padding: '14px 18px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                                    }} 
                                                    onClick={() => toggleSelectService(vendor)}
                                                >
                                                    {isSelected ? <><Check size={16} /> IN CART</> : <><Plus size={16} /> ADD TO CART</>}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b', fontWeight: '700' }}>
                            No services found in this category.
                        </div>
                    )}
                </div>
            )}

            {/* FLOATING CLIENT CART & CHECKOUT BAR (Persists across navigation tabs) */}
            {selectedServices.length > 0 && userRole !== 'vendor' && (
                <div style={{
                    position: 'fixed', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
                    width: '90%', maxWidth: '1000px', background: '#ffffff', borderRadius: '24px',
                    padding: '18px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 900
                }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>
                            {selectedServices.length} Service(s) in Cart (Draft Saved)
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: isCartOverBudget ? '#ef4444' : '#000' }}>
                            Total: ₱{totalSelectedCost.toLocaleString()}
                            {isCartOverBudget && <span style={{ fontSize: '0.8rem', color: '#ef4444', marginLeft: '10px' }}>(Exceeds Budget)</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            onClick={() => navigate('/messages')}
                            style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '12px 18px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' }}
                        >
                            Chat Vendors
                        </button>
                        <button 
                            onClick={() => {
                                setSelectedServices([]);
                                localStorage.removeItem('eventease_pending_cart');
                            }}
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '12px 18px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Trash2 size={16} /> Clear Cart
                        </button>
                        
                        <button 
                            onClick={handleMultiServiceCheckout}
                            disabled={hiringLoading}
                            style={{ background: '#000', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}
                        >
                            {hiringLoading ? 'PROCESSING...' : 'BOOK CART SERVICES'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorList;