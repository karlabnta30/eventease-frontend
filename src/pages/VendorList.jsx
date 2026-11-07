import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Lock, AlertCircle, Power, Star, Check, Plus, Trash2, ShieldAlert, ChevronRight, ArrowLeft, Sparkles, Sliders, ShoppingBag, X, Info, Users, CheckCircle2, AlertTriangle, XCircle, MessageSquare } from 'lucide-react';
import { notifyNewBooking } from '../toastUtils.jsx';
import { toast } from 'react-hot-toast';

const StarRating = React.memo(({ rating = 5.0, totalReviews = 12 }) => {
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
});

const VendorList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userRole = localStorage.getItem('userRole');
    
    const eventIdFromUrl = searchParams.get('event_id');
    const eventLocation = searchParams.get('location') || 'Metro Manila';
    const eventType = searchParams.get('type') || searchParams.get('category') || 'Birthday';
    
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

    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // Default full allocations
    const defaultAllocations = useMemo(() => {
        const lowerType = eventType.toLowerCase();
        if (lowerType.includes('birthday')) {
            return { 'Catering & Food': 50, 'Venue Rental': 20, 'Decoration': 15, 'Entertainment': 10, 'Photography': 5 };
        } else if (lowerType.includes('corporate') || lowerType.includes('workshop')) {
            return { 'Venue Rental': 40, 'Catering & Food': 30, 'Entertainment': 15, 'Decoration': 10, 'Photography': 5 };
        } else if (lowerType.includes('wedding') || lowerType.includes('debut')) {
            return { 'Catering & Food': 35, 'Venue Rental': 30, 'Decoration': 15, 'Photography': 10, 'Entertainment': 10 };
        }
        return { 'Catering & Food': 40, 'Venue Rental': 25, 'Decoration': 15, 'Photography': 10, 'Entertainment': 10 };
    }, [eventType]);

    const [customAllocations, setCustomAllocations] = useState(defaultAllocations);

    const handleSliderChange = (itemKey, newVal) => {
        const val = parseInt(newVal, 10) || 0;
        setCustomAllocations(prev => ({
            ...prev,
            [itemKey]: val
        }));
    };

    const handleRemoveSliderCategory = (itemKey) => {
        setCustomAllocations(prev => {
            const copy = { ...prev };
            delete copy[itemKey];
            return copy;
        });
    };

    const handleAddSliderCategory = (itemKey) => {
        setCustomAllocations(prev => ({
            ...prev,
            [itemKey]: 10
        }));
    };

    const totalPercentage = useMemo(() => {
        return Object.values(customAllocations).reduce((sum, val) => sum + val, 0);
    }, [customAllocations]);

    const aiOptimizerAnalysis = useMemo(() => {
        const categoryRates = { 'Wedding': 800, 'Birthday': 350, 'Corporate': 500, 'Workshop': 300, 'Debut': 600 };
        const minPerPax = categoryRates[eventType] || 350;
        const recommendedMinTotal = guestCount * minPerPax;

        let status = 'Optimal';
        let message = 'Your budget and custom scale are well-balanced for your guest count and event type.';
        let statusColor = '#16a34a';
        let statusBg = '#f0fdf4';
        let StatusIcon = CheckCircle2;

        if (userBudget > 0 && userBudget < recommendedMinTotal) {
            status = 'Not Optimal';
            message = `Your budget is lower than recommended baseline (₱${recommendedMinTotal.toLocaleString()}) for ${guestCount} guests.`;
            statusColor = '#dc2626';
            statusBg = '#fef2f2';
            StatusIcon = XCircle;
        } else if (totalPercentage !== 100) {
            status = 'Not Optimal';
            message = `Total scale is at ${totalPercentage}%. It must equal exactly 100% to be optimal.`;
            statusColor = '#d97706';
            statusBg = '#fffbeb';
            StatusIcon = AlertTriangle;
        }

        const breakdown = Object.entries(customAllocations).map(([item, pct]) => ({
            item,
            percentage: pct,
            amount: Math.round(userBudget * (pct / 100))
        }));

        return { status, message, statusColor, statusBg, StatusIcon, breakdown, recommendedMinTotal };
    }, [userBudget, guestCount, eventType, customAllocations, totalPercentage]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const categories = useMemo(() => ['Catering', 'Photography', 'Venue', 'Entertainment', 'Decoration', 'Hosting', 'Random Stuff / Miscellaneous'], []);

    const getCategoryPhoto = useCallback((category) => {
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
    }, []);

    const fetchVendors = useCallback(async () => {
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
    }, [userRole]);

    useEffect(() => {
        fetchVendors();
    }, [fetchVendors]);

    useEffect(() => {
        localStorage.setItem('eventease_pending_cart', JSON.stringify(selectedServices));
    }, [selectedServices]);

    const handleToggleStatus = useCallback(async (id) => {
        setVendors(prevVendors => 
            prevVendors.map(vendor => 
                vendor.id === id ? { ...vendor, is_available: vendor.is_available ? 0 : 1 } : vendor
            )
        );

        try {
            await api.post(`/vendors/toggle/${id}`);
        } catch (error) { 
            console.error("Toggle failed", error);
            fetchVendors();
            toast.error("Failed to update status.");
        }
    }, [fetchVendors]);

    const confirmDeleteService = useCallback(async () => {
        if (!serviceToDelete) return;

        try {
            await api.delete(`/vendors/${serviceToDelete.id}`);
            toast.success("Service deleted successfully.");
            setServiceToDelete(null);
            fetchVendors();
        } catch (error) {
            console.error("Delete failed:", error);
            toast.error(error.response?.data?.message || "Failed to delete service.");
        }
    }, [serviceToDelete, fetchVendors]);

    const calculateDynamicPrice = useCallback((vendor) => {
        if (!vendor) return 0;
        const raw = vendor.starting_price || vendor.price || vendor.cost || 0;
        return typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.]/g,"")) || 0 : parseFloat(raw) || 0;
    }, []);

    const toggleSelectService = useCallback((vendor) => {
        setSelectedServices(prev => {
            const exists = prev.some(s => s.id === vendor.id);
            if (exists) {
                return prev.filter(s => s.id !== vendor.id);
            } else {
                const categoryExists = prev.some(s => (s.category || '').toLowerCase() === (vendor.category || '').toLowerCase());
                if (categoryExists) {
                    toast.error(`You already have a service in the "${vendor.category}" category in your cart!`);
                    return prev;
                }
                return [...prev, vendor];
            }
        });
    }, []);

    const handleRemoveFromCart = useCallback((vendorId) => {
        setSelectedServices(prev => {
            const updated = prev.filter(s => s.id !== vendorId);
            if (updated.length === 0) {
                setIsCartModalOpen(false);
            }
            return updated;
        });
    }, []);

    const handleRunAiSmartAllocation = async () => {
        if (userBudget <= 0) {
            toast.error("No budget limit has been set for this event.");
            return;
        }

        try {
            const response = await api.post('/ai/optimize-budget', {
                category: activeCategoryView || 'General',
                guest_count: Number(guestCount),
                total_budget: Number(userBudget),
                location: eventLocation
            });

            if (response?.data?.optimized_items && Array.isArray(response.data.optimized_items)) {
                const aiPicked = response.data.optimized_items.map(item => ({
                    id: item.id,
                    business_name: item.name || item.title || 'AI Recommended Service',
                    category: item.category || 'General',
                    price: Number(item.price || 0),
                    min_pax: item.min_pax || null,
                    max_pax: item.max_pax || null
                }));

                setSelectedServices(aiPicked);
                toast.success("AI Budget Optimizer successfully allocated optimal services!");
                return;
            }
        } catch (error) {
            console.warn("API Optimization Endpoint fallback executed:", error);
        }

        let accumulatedCost = 0;
        let smartPicked = [];
        
        const suitableVendors = vendors.filter(v => {
            const min = v.min_pax ? Number(v.min_pax) : 0;
            const max = v.max_pax ? Number(v.max_pax) : 99999;
            const matchesLocation = !eventLocation || (v.location && v.location.toLowerCase().includes(eventLocation.toLowerCase()));
            return guestCount >= min && guestCount <= max && matchesLocation;
        });

        const poolToProcess = suitableVendors.length > 0 ? suitableVendors : vendors;
        const sortedVendors = [...poolToProcess].sort((a, b) => calculateDynamicPrice(a) - calculateDynamicPrice(b));

        for (let v of sortedVendors) {
            const p = calculateDynamicPrice(v);
            if (accumulatedCost + p <= userBudget) {
                smartPicked.push(v);
                accumulatedCost += p;
            }
        }

        setSelectedServices(smartPicked);
        toast.success("Smart budget allocation applied successfully!");
    };

    const totalSelectedCost = useMemo(() => {
        return selectedServices.reduce((sum, item) => sum + calculateDynamicPrice(item), 0);
    }, [selectedServices, calculateDynamicPrice]);

    const isCartOverBudget = userBudget > 0 && totalSelectedCost > userBudget;
    const overBudgetAmount = totalSelectedCost - userBudget;

    const handleMultiServiceCheckout = async () => {
        if (selectedServices.length === 0) {
            toast.error("No services selected in your cart! Please choose at least one service.");
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

    const StatusIconComp = aiOptimizerAnalysis.StatusIcon;
    const availableCategoriesToRestore = Object.keys(defaultAllocations).filter(k => !(k in customAllocations));

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: isMobile ? '20px 16px 140px' : '40px 60px 140px', fontFamily: "'Inter', sans-serif" }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ 
                            background: isCartOverBudget ? '#ef4444' : '#000', 
                            color: '#fff', padding: '10px 16px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: isMobile ? '0.8rem' : '0.9rem', boxSizing: 'border-box'
                        }}>
                            {isCartOverBudget ? <ShieldAlert size={18} style={{ flexShrink: 0 }} /> : <AlertCircle size={18} style={{ flexShrink: 0 }} />}
                            <span style={{ fontWeight: '700', wordBreak: 'break-word' }}>
                                BUDGET: ₱{userBudget > 0 ? userBudget.toLocaleString() : "NO LIMIT"} | GUESTS: {guestCount} PAX
                            </span>
                        </div>
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
                        
                        const minP = vendor.min_pax ? Number(vendor.min_pax) : 15;
                        const maxP = vendor.max_pax ? Number(vendor.max_pax) : 100;
                        const isPaxUnsuitable = guestCount < minP || guestCount > maxP;

                        const isDisabled = (isTooExpensive || isOffline || isPaxUnsuitable) && userRole !== 'vendor';
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
                                                    <Lock size={12} /> {isOffline ? 'OFFLINE' : isPaxUnsuitable ? 'UNSUITABLE PAX' : 'OVER BUDGET'}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ fontWeight: '900', fontSize: '1.2rem', margin: '0 0 4px 0', wordBreak: 'break-word' }}>
                                            {vendor.business_name || vendor.name}
                                        </h3>
                                        
                                        <StarRating rating={vendor.rating || 5.0} totalReviews={vendor.total_reviews || 12} />

                                        <div style={{ 
                                            background: isPaxUnsuitable ? '#fef2f2' : '#f0fdf4', 
                                            border: `1px solid ${isPaxUnsuitable ? '#fecaca' : '#bbf7d0'}`, 
                                            color: isPaxUnsuitable ? '#991b1b' : '#166534', 
                                            padding: '8px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700', 
                                            marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' 
                                        }}>
                                            <Users size={14} />
                                            <span>Capacity: {minP} - {maxP} Pax (Event: {guestCount} Guests)</span>
                                        </div>

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

                                                    <button onClick={() => setServiceToDelete(vendor)} style={{
                                                        background: '#fee2e2', color: '#991b1b', padding: '12px 14px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
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

            {/* Exact Original Floating Bottom Bar Design */}
            {selectedServices.length > 0 && userRole !== 'vendor' && (
                <div style={{
                    position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                    width: isMobile ? '92%' : '82%', maxWidth: '850px', background: '#334155', borderRadius: '30px',
                    padding: '12px 24px', boxShadow: '0 15px 35px rgba(0,0,0,0.3)', border: '1px solid #475569',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 900, color: '#fff', flexWrap: 'wrap', gap: '12px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div 
                            onClick={() => setIsCartModalOpen(true)}
                            style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <ShoppingBag size={14} /> {selectedServices.length} Service(s) in Cart (Click to View / Edit) <Search size={12} />
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: isCartOverBudget ? '#f87171' : '#fff' }}>
                            Total: ₱{totalSelectedCost.toLocaleString()} {isCartOverBudget && '(Over Budget)'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => setIsCartModalOpen(true)}
                            style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            View Cart
                        </button>

                        <button 
                            onClick={() => navigate('/chat')}
                            style={{ background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <MessageSquare size={14} /> Chat Vendors
                        </button>

                        <button 
                            onClick={() => {
                                setSelectedServices([]);
                                localStorage.removeItem('eventease_pending_cart');
                                toast.success("Cart cleared.");
                            }}
                            style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '10px 14px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                            Clear
                        </button>

                        <button 
                            onClick={handleMultiServiceCheckout}
                            disabled={hiringLoading}
                            style={{ background: '#000000', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.82rem', letterSpacing: '0.5px' }}
                        >
                            {hiringLoading ? 'PROCESSING...' : 'BOOK CART SERVICES'}
                        </button>
                    </div>
                </div>
            )}

            {/* Cart Modal - Two Column Layout (Left: AI Sliders, Right: Selected Services) */}
            {isCartModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '16px'
                }}>
                    <div style={{
                        background: '#ffffff', borderRadius: '28px', width: '100%', maxWidth: '1000px',
                        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShoppingBag size={22} color="#0f172a" />
                                <h3 style={{ margin: 0, fontWeight: '900', fontSize: '1.2rem', color: '#0f172a' }}>
                                    Cart & AI Budget Optimizer ({selectedServices.length})
                                </h3>
                            </div>
                            <button 
                                onClick={() => setIsCartModalOpen(false)}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <X size={18} color="#64748b" />
                            </button>
                        </div>

                        {/* Modal Body: Two Column Layout */}
                        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', alignItems: 'start' }}>
                            
                            {/* LEFT COLUMN: AI Budget Optimizer & Sliders */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Sparkles size={18} color="#2563eb" />
                                        <span style={{ fontWeight: '900', fontSize: '0.85rem', color: '#0f172a' }}>AI BUDGET OPTIMIZER ({eventType.toUpperCase()})</span>
                                    </div>
                                    <button
                                        onClick={handleRunAiSmartAllocation}
                                        style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                                    >
                                        RUN AI OPTIMIZER
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                    <div style={{ background: aiOptimizerAnalysis.statusBg, color: aiOptimizerAnalysis.statusColor, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <StatusIconComp size={13} /> {aiOptimizerAnalysis.status} Status
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: totalPercentage === 100 ? '#16a34a' : '#dc2626' }}>
                                        Scale: {totalPercentage}% {totalPercentage !== 100 && '(Must be 100%)'}
                                    </span>
                                </div>

                                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px 0', fontWeight: '600', lineHeight: '1.4' }}>
                                    {aiOptimizerAnalysis.message}
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {aiOptimizerAnalysis.breakdown.map((b) => (
                                        <div key={b.item} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>{b.item} ({b.percentage}%)</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a' }}>₱{b.amount.toLocaleString()}</span>
                                                    <button 
                                                        onClick={() => handleRemoveSliderCategory(b.item)}
                                                        style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', padding: '2px 6px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer' }}
                                                        title="Remove category slider"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="100" 
                                                value={b.percentage} 
                                                onChange={(e) => handleSliderChange(b.item, e.target.value)}
                                                style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer', marginTop: '4px' }}
                                            />
                                        </div>
                                    ))}

                                    {availableCategoriesToRestore.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>Add category:</span>
                                            {availableCategoriesToRestore.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleAddSliderCategory(cat)}
                                                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Plus size={12} /> {cat}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Selected Services List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <h4 style={{ margin: 0, fontWeight: '900', fontSize: '1rem', color: '#0f172a' }}>Selected Services ({selectedServices.length})</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                                    {selectedServices.length > 0 ? selectedServices.map((item) => {
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
                                    }) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.85rem' }}>
                                            No services selected yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', bottom: 0, zIndex: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', color: '#64748b', fontSize: '0.9rem' }}>Total Amount</span>
                                <span style={{ fontWeight: '900', color: isCartOverBudget ? '#ef4444' : '#0f172a', fontSize: '1.3rem' }}>
                                    ₱{totalSelectedCost.toLocaleString()}
                                </span>
                            </div>

                            {isCartOverBudget && (
                                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontSize: '0.8rem', fontWeight: '700' }}>
                                    <ShieldAlert size={16} />
                                    <span>Exceeds budget by ₱{overBudgetAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => {
                                        setSelectedServices([]);
                                        localStorage.removeItem('eventease_pending_cart');
                                    }}
                                    style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '14px', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    Clear Cart
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCartModalOpen(false);
                                        handleMultiServiceCheckout();
                                    }}
                                    style={{
                                        flex: 1, background: '#000', color: '#fff', border: 'none',
                                        padding: '14px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    CONFIRM & BOOK SERVICES
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {serviceToDelete && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '16px'
                }}>
                    <div style={{
                        background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '400px',
                        padding: '24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{ width: '50px', height: '50px', background: '#fee2e2', color: '#991b1b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                            <Trash2 size={24} />
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontWeight: '900', fontSize: '1.2rem', color: '#0f172a' }}>Delete Service?</h3>
                        <p style={{ margin: '0 0 24px 0', fontSize: '0.88rem', color: '#64748b', fontWeight: '600' }}>
                            Are you sure you want to delete <strong style={{ color: '#0f172a' }}>{serviceToDelete.business_name || serviceToDelete.name}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setServiceToDelete(null)} style={{ flex: 1, background: '#f1f5f9', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
                            <button onClick={confirmDeleteService} style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorList;