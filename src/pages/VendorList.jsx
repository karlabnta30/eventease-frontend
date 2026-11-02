import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Lock, AlertCircle, Power, Star, Check, Plus, Trash2, ShieldAlert, ChevronRight, ArrowLeft, Sparkles, Sliders, ShoppingBag, X, Info } from 'lucide-react';
import { notifyNewBooking } from '../toastUtils.jsx';
import { toast } from 'react-hot-toast';

const StarRating = ({ rating = 5.0, totalReviews = 12 }) => {
    const numericRating = Math.min(5, Math.max(1, parseFloat(rating) || 5.0));
    const roundedStars = Math.round(numericRating);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', margin: '6px 0 10px 0' }}>
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
        const parsed = parseFloat(b);
        return !isNaN(parsed) && parsed > 0 ? parsed : 0;
    }, [searchParams]);

    const guestCount = useMemo(() => {
        const g = searchParams.get('guest_count');
        const parsed = parseInt(g, 10);
        return !isNaN(parsed) && parsed > 0 ? parsed : 50; 
    }, [searchParams]);
    
    const [vendors, setVendors] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    const [selectedServices, setSelectedServices] = useState(() => {
        try {
            const savedCart = localStorage.getItem('eventease_pending_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            return [];
        }
    });

    const [loading, setLoading] = useState(true);
    const [hiringLoading, setHiringLoading] = useState(false);
    const [activeCategoryView, setActiveCategoryView] = useState(null);

    const [isAiOptimizing, setIsAiOptimizing] = useState(false);
    const [aiOptimizationSummary, setAiOptimizationSummary] = useState(null);

    const [isCartModalOpen, setIsCartModalOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            
            const rawData = res.data?.data || res.data || [];
            const uniqueData = Array.from(new Map(rawData.map(item => [item.id, item])).values());
            
            setVendors(uniqueData);
        } catch (err) { 
            console.error("Fetch Error:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchVendors();
    }, []);

    useEffect(() => {
        localStorage.setItem('eventease_pending_cart', JSON.stringify(selectedServices));
    }, [selectedServices]);

    // --- NAPAKABILIS NA TOGGLE: Instant UI Update (Optimistic Update) ---
    const handleToggleStatus = async (id) => {
        // Agarang i-update ang local state para maging instant ang pag-flip ng button sa screen
        setVendors(prevVendors => 
            prevVendors.map(vendor => 
                vendor.id === id ? { ...vendor, is_available: vendor.is_available ? 0 : 1 } : vendor
            )
        );

        try {
            // Isasagawa ang backend request sa background nang walang loading state sa UI
            await api.post(`/vendors/toggle/${id}`);
        } catch (error) { 
            console.error("Toggle failed", error);
            // Kung sakaling magka-error sa server, i-revert sa dati o i-refetch
            fetchVendors();
            toast.error("Nabigo ang pag-update ng status.");
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
        if (!vendor) return 0;
        const raw = vendor.starting_price || vendor.price || vendor.cost || 0;
        const basePrice = typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.]/g,"")) || 0 : parseFloat(raw) || 0;
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

    const handleRemoveFromCart = (vendorId) => {
        const updated = selectedServices.filter(s => s.id !== vendorId);
        setSelectedServices(updated);
        if (updated.length === 0) {
            setIsCartModalOpen(false);
        }
    };

    const handleRunAiSmartAllocation = async () => {
        if (userBudget <= 0) {
            toast.error("Walang itinakdang budget limit para sa event na ito.");
            return;
        }

        setIsAiOptimizing(true);
        try {
            const response = await api.post('/ai/optimize-budget', {
                category: activeCategoryView || 'General',
                guest_count: Number(guestCount),
                total_budget: Number(userBudget)
            });

            if (response?.data?.optimized_items && Array.isArray(response.data.optimized_items)) {
                const aiPicked = response.data.optimized_items.map(item => ({
                    id: item.id,
                    business_name: item.name || item.title || 'AI Recommended Service',
                    category: item.category || 'General',
                    price: Number(item.price || 0)
                }));

                setSelectedServices(aiPicked);
                setAiOptimizationSummary(response.data.message || `Nahanap ng AI ang mga akmang serbisyo para sa badyet mo.`);
                toast.success("AI Budget Optimizer successfully allocated optimal services!");
                setIsAiOptimizing(false);
                return;
            }
        } catch (error) {
            console.warn("API Optimization Endpoint fallback executed:", error);
        }

        let accumulatedCost = 0;
        let smartPicked = [];
        const sortedVendors = [...vendors].sort((a, b) => calculateDynamicPrice(b) - calculateDynamicPrice(a));

        for (let v of sortedVendors) {
            const p = calculateDynamicPrice(v);
            if (accumulatedCost + p <= userBudget) {
                smartPicked.push(v);
                accumulatedCost += p;
            }
        }

        setSelectedServices(smartPicked);
        setAiOptimizationSummary(`Smart Allocation: Nakapili ang AI ng ${smartPicked.length} serbisyo na nagkakahalaga ng ₱${accumulatedCost.toLocaleString()} pasok sa iyong badyet.`);
        toast.success("Smart budget allocation applied successfully!");
        setIsAiOptimizing(false);
    };

    const totalSelectedCost = useMemo(() => {
        return selectedServices.reduce((sum, item) => sum + calculateDynamicPrice(item), 0);
    }, [selectedServices]);

    const isCartOverBudget = userBudget > 0 && totalSelectedCost > userBudget;

    const handleMultiServiceCheckout = async () => {
        if (selectedServices.length === 0) {
            toast.error("Walang napiling vendor o service sa iyong cart! Mangyaring pumili muna ng kahit isang serbisyo.");
            return;
        }

        if (!eventIdFromUrl) {
            alert("No event ID detected in URL. Please start booking from your event itinerary.");
            return;
        }

        setHiringLoading(true);
        try {
            const cleanBookingId = String(eventIdFromUrl).split(':')[0].replace(/[^0-9]/g, '');
            const payload = { services: selectedServices.map(s => Number(s.id)) };

            await api.post(`/bookings/${cleanBookingId}/attach-services`, payload);
            localStorage.removeItem('eventease_pending_cart'); 
            notifyNewBooking(`Successfully added ${selectedServices.length} service(s) to cart & booking!`);
            navigate('/live-events');
        } catch (error) {
            if (selectedServices.length === 1) {
                try {
                    const cleanBookingId = String(eventIdFromUrl).split(':')[0].replace(/[^0-9]/g, '');
                    const singleVendorId = Number(selectedServices[0].id);

                    await api.patch(`/bookings/${cleanBookingId}/assign-vendor`, { vendor_id: singleVendorId });
                    localStorage.removeItem('eventease_pending_cart');
                    notifyNewBooking(`Hired ${selectedServices[0].business_name || selectedServices[0].name}!`);
                    navigate('/live-events');
                } catch (assignError) {
                    alert(assignError.response?.data?.message || "Error assigning vendor.");
                }
            } else {
                alert(error.response?.data?.message || error.response?.data?.error || "Error attaching services.");
            }
        } finally {
            setHiringLoading(false);
        }
    };

    const filteredVendors = useMemo(() => {
        const matching = vendors.filter(v => {
            if (!activeCategoryView) return true;
            const vCat = (v.category || '').toLowerCase();
            const active = activeCategoryView.toLowerCase();
            
            if (active.includes('miscellaneous') || active.includes('random')) {
                return !['catering', 'photography', 'venue', 'entertainment', 'decoration', 'hosting'].some(c => vCat.includes(c));
            }
            return vCat.includes(active);
        });

        return Array.from(new Map(matching.map(item => [item.id, item])).values());
    }, [vendors, activeCategoryView]);

    if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontWeight: '800', fontSize: '1.2rem' }}>Loading Services...</div>;

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: isMobile ? '20px 16px 160px' : '40px 60px 140px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '20px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    {activeCategoryView && (
                        <button 
                            onClick={() => setActiveCategoryView(null)}
                            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', cursor: 'pointer', color: '#64748b', marginBottom: '8px', fontSize: '0.9rem', padding: 0 }}
                        >
                            <ArrowLeft size={16} /> Back to Categories
                        </button>
                    )}
                    <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', letterSpacing: '-1.5px', color: '#000', margin: 0, wordBreak: 'break-word' }}>
                        {activeCategoryView ? `${activeCategoryView} Services` : (userRole === 'vendor' ? 'My Listed Services' : 'Browse Service Categories')}
                    </h1>
                </div>

                {userRole !== 'vendor' && !activeCategoryView && (
                    <div style={{ 
                        background: isCartOverBudget ? '#ef4444' : '#000', 
                        color: '#fff', padding: '10px 16px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '0.8rem' : '0.9rem', width: isMobile ? '100%' : 'auto', boxSizing: 'border-box'
                    }}>
                        {isCartOverBudget ? <ShieldAlert size={18} style={{ flexShrink: 0 }} /> : <AlertCircle size={18} style={{ flexShrink: 0 }} />}
                        <span style={{ fontWeight: '700', wordBreak: 'break-word' }}>
                            BUDGET LIMIT: ₱{userBudget > 0 ? userBudget.toLocaleString() : "NO LIMIT SET"} (Guests: {guestCount})
                        </span>
                    </div>
                )}
            </div>

            {!activeCategoryView ? (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '30px' }}>
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
                                    <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900' }}>{cat}</h3>
                                </div>
                            </div>
                            <div style={{ padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>View Listed Services</span>
                                <ChevronRight size={18} color="#0f172a" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', marginTop: '30px' }}>
                    {filteredVendors.length > 0 ? filteredVendors.map(vendor => {
                        const dynamicPrice = calculateDynamicPrice(vendor);
                        const isTooExpensive = userBudget > 0 && dynamicPrice > userBudget;
                        const isOffline = vendor.is_available === 0;
                        const isDisabled = (isTooExpensive || isOffline) && userRole !== 'vendor';
                        const isSelected = selectedServices.some(s => s.id === vendor.id);

                        const serviceDescription = vendor.description || vendor.details || vendor.inclusions || vendor.notes || "No additional description provided by the vendor.";

                        return (
                            <div key={vendor.id} style={{
                                background: '#fff', borderRadius: '28px', overflow: 'hidden', 
                                border: isSelected ? '2px solid #000' : '1px solid #f0f0f0', 
                                position: 'relative', opacity: isDisabled ? 0.7 : 1, 
                                boxShadow: isSelected ? '0 15px 30px rgba(0,0,0,0.08)' : '0 10px 20px rgba(0,0,0,0.02)',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                            }}>
                                <div>
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

                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ fontWeight: '900', fontSize: '1.2rem', margin: '0 0 4px 0', wordBreak: 'break-word' }}>
                                            {vendor.business_name || vendor.name}
                                        </h3>
                                        
                                        <StarRating rating={vendor.rating || 5.0} totalReviews={vendor.total_reviews || 12} />

                                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '12px', marginBottom: '14px' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Info size={13} /> Service Information & Details:
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: '1.4', wordBreak: 'break-word' }}>
                                                {serviceDescription}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.85rem', marginBottom: '16px', wordBreak: 'break-word' }}>
                                            <MapPin size={15} style={{ flexShrink: 0 }} /> {vendor.location || 'Metro Manila'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '0 20px 20px 20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>Package Price</div>
                                            <div style={{ fontWeight: '900', fontSize: '1.2rem', color: '#0f172a' }}>
                                                ₱{dynamicPrice.toLocaleString()}
                                            </div>
                                        </div>
                                        
                                        <div style={{ width: isMobile ? '100%' : '190px' }}>
                                            {userRole === 'vendor' ? (
                                                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                                    <button onClick={() => handleToggleStatus(vendor.id)} style={{
                                                        background: vendor.is_available ? '#000' : '#f0f0f0',
                                                        color: vendor.is_available ? '#fff' : '#aaa',
                                                        padding: '12px 10px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem'
                                                    }}>
                                                        <Power size={14} />
                                                        {vendor.is_available ? 'ONLINE' : 'OFFLINE'}
                                                    </button>

                                                    <button onClick={() => handleDeleteService(vendor.id)} style={{
                                                        background: '#fee2e2',
                                                        color: '#991b1b',
                                                        padding: '12px 14px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }} title="Delete Service">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    style={{ 
                                                        background: isSelected ? '#10b981' : '#000', 
                                                        color: '#fff', border: 'none', padding: '12px 16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem'
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
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b', fontWeight: '700' }}>
                            No services found in this category.
                        </div>
                    )}
                </div>
            )}

            {selectedServices.length > 0 && userRole !== 'vendor' && (
                <div style={{
                    position: 'fixed', bottom: '15px', left: '50%', transform: 'translateX(-50%)',
                    width: isMobile ? '92%' : '90%', maxWidth: '1000px', background: '#ffffff', borderRadius: '24px',
                    padding: isMobile ? '16px' : '18px 30px', boxShadow: '0 20px 50px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0',
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? '12px' : '0', zIndex: 900
                }}>
                    <div 
                        onClick={() => setIsCartModalOpen(true)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        title="Click to view cart items"
                    >
                        <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShoppingBag size={15} />
                            {selectedServices.length} Service(s) in Cart (Click to View / Edit) 🔍
                        </div>
                        <div style={{ fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: '900', color: isCartOverBudget ? '#ef4444' : '#000', wordBreak: 'break-word' }}>
                            Total: ₱{totalSelectedCost.toLocaleString()}
                            {isCartOverBudget && <span style={{ fontSize: '0.75rem', color: '#ef4444', marginLeft: '8px', display: isMobile ? 'block' : 'inline' }}>(Exceeds Budget)</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                                onClick={() => setIsCartModalOpen(true)}
                                style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', flex: isMobile ? 1 : 'unset', fontSize: '0.85rem' }}
                            >
                                View Cart
                            </button>
                            <button 
                                onClick={() => navigate('/messages')}
                                style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '10px 14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', flex: isMobile ? 1 : 'unset', fontSize: '0.85rem' }}
                            >
                                Chat Vendors
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedServices([]);
                                    localStorage.removeItem('eventease_pending_cart');
                                }}
                                style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px 14px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flex: isMobile ? 1 : 'unset', fontSize: '0.85rem' }}
                            >
                                <Trash2 size={15} /> Clear
                            </button>
                        </div>
                        
                        <button 
                            onClick={handleMultiServiceCheckout}
                            disabled={hiringLoading}
                            style={{ background: '#000', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', width: isMobile ? '100%' : 'auto', fontSize: '0.85rem' }}
                        >
                            {hiringLoading ? 'PROCESSING...' : 'BOOK CART SERVICES'}
                        </button>
                    </div>
                </div>
            )}

            {isCartModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '16px'
                }}>
                    <div style={{
                        background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '520px',
                        maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShoppingBag size={22} color="#0f172a" />
                                <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem', color: '#0f172a' }}>
                                    Your Selected Services ({selectedServices.length})
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsCartModalOpen(false)}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <X size={18} color="#64748b" />
                            </button>
                        </div>

                        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {selectedServices.map((item) => {
                                const price = calculateDynamicPrice(item);
                                return (
                                    <div 
                                        key={item.id}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '14px 16px', background: '#f8fafc', borderRadius: '16px',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <div style={{ flex: 1, paddingRight: '12px' }}>
                                            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '2px' }}>
                                                {item.business_name || item.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                                                Category: {item.category || 'General'}
                                            </div>
                                            <div style={{ fontWeight: '900', fontSize: '0.9rem', color: '#16a34a', marginTop: '4px' }}>
                                                ₱{price.toLocaleString()}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveFromCart(item.id)}
                                            style={{
                                                background: '#fee2e2', color: '#991b1b', border: 'none',
                                                padding: '8px 12px', borderRadius: '10px', fontWeight: '800',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                                                fontSize: '0.75rem', flexShrink: 0
                                            }}
                                            title="Remove item"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontWeight: '800', color: '#64748b', fontSize: '0.9rem' }}>Total Amount</span>
                                <span style={{ fontWeight: '900', color: isCartOverBudget ? '#ef4444' : '#0f172a', fontSize: '1.3rem' }}>
                                    ₱{totalSelectedCost.toLocaleString()}
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    setIsCartModalOpen(false);
                                    handleMultiServiceCheckout();
                                }}
                                style={{
                                    width: '100%', background: '#000', color: '#fff', border: 'none',
                                    padding: '14px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                CONFIRM & BOOK SERVICES
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorList;