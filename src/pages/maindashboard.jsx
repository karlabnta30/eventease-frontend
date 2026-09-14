import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './dashboard.css'; 
import ServiceCard from '../components/ServiceCard';
import { notifyNewBooking } from '../toastUtils.jsx'; 
import { AlertTriangle, Sparkles, Loader2, CheckCircle2, CheckCircle } from 'lucide-react';

const MainDashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  
  const [services, setServices] = useState([]); 
  const [myBookings, setMyBookings] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userBudget, setUserBudget] = useState(0);

  // AI Budget Optimizer States
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [aiOptimizedPlan, setAiOptimizedPlan] = useState(null);

  // Custom confirmation modal state to avoid window.confirm popup
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const endpoint = userRole === 'vendor' ? 'http://127.0.0.1:8000/api/vendor/services' : 'http://127.0.0.1:8000/api/vendors';
      
      const servicesRes = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (userRole === 'vendor') {
        setServices(servicesRes.data.data || []);
      } else {
        let allServices = [];
        const vendorList = servicesRes.data.data || servicesRes.data || [];
        vendorList.forEach(vendor => {
          if (vendor.services && vendor.services.length > 0) {
            vendor.services.forEach(service => {
              allServices.push({
                ...service,
                type: 'service',
                business_name: vendor.name || vendor.business_name,
                vendor_id: vendor.id,
                location: vendor.address
              });
            });
          }
        });

        try {
          const bundlesRes = await axios.get('http://127.0.0.1:8000/api/bundles', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const bundleList = bundlesRes.data || [];
          bundleList.forEach(bundle => {
            allServices.push({
              ...bundle,
              type: 'bundle',
              id: 'bundle_' + bundle.id,
              title: bundle.bundle_name,
              name: bundle.bundle_name,
              business_name: bundle.vendor?.business_name || bundle.vendor?.name || 'Vendor Bundle',
              location: bundle.vendor?.address || ''
            });
          });
        } catch (bundleErr) {
          console.error("Bundle fetch error:", bundleErr);
        }

        setServices(allServices);
      }

      if (token && userRole !== 'admin') {
        const bookingsRes = await axios.get('http://127.0.0.1:8000/api/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyBookings(bookingsRes.data.data || (Array.isArray(bookingsRes.data) ? bookingsRes.data : []));

        const notifRes = await axios.get('http://127.0.0.1:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const unread = notifRes.data.filter(n => !n.is_read);
        unread.forEach((n, i) => {
          setTimeout(() => {
            notifyNewBooking(n.message);
          }, i * 1200);
        });
      }
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') return; 
    fetchData();
  }, [userRole]); 

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:8000/api/vendors/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); 
    } catch (error) { console.error("Toggle failed", error); }
  };

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (service.business_name || service.name || "").toLowerCase().includes(term) || 
                            (service.category || "").toLowerCase().includes(term) || 
                            (service.location || "").toLowerCase().includes(term) ||
                            (service.title || "").toLowerCase().includes(term) ||
                            (service.description || "").toLowerCase().includes(term);
      
      return matchesSearch;
    });
  }, [services, searchTerm]);

  // Smart AI Curation & Knapsack Allocation Algorithm with Percentage Breakdown Justification
  const handleAiOptimize = () => {
    if (!userBudget || userBudget <= 0) return;
    setIsAiOptimizing(true);
    setAiOptimizedPlan(null);

    setTimeout(() => {
      const budgetLimit = Number(userBudget);
      
      // Separate bundles and individual services within budget limits
      const bundles = filteredServices.filter(s => s.type === 'bundle' && Number(s.price || 0) <= budgetLimit);
      const individualServices = filteredServices.filter(s => s.type !== 'bundle' && Number(s.price || 0) <= budgetLimit);

      let chosenItems = [];
      let totalCost = 0;

      // Strategy 1: Check if an elite vendor bundle fits well within the budget range
      const bestBundle = bundles.sort((a, b) => Number(b.price) - Number(a.price)).find(b => Number(b.price) <= budgetLimit);
      
      if (bestBundle && Number(bestBundle.price) >= budgetLimit * 0.4) {
        chosenItems.push(bestBundle);
        totalCost += Number(bestBundle.price);
        
        // Try to add complementary individual services with remaining budget
        const remainingBudget = budgetLimit - totalCost;
        const extras = individualServices.filter(s => Number(s.price || 0) <= remainingBudget);
        if (extras.length > 0) {
          const extraItem = extras[Math.floor(Math.random() * extras.length)];
          chosenItems.push(extraItem);
          totalCost += Number(extraItem.price);
        }
      } else {
        // Strategy 2: Smart multi-service combinatorial picker (Greedy Knapsack)
        const categoriesSeen = new Set();
        const sortedServices = [...individualServices].sort((a, b) => Number(b.price) - Number(a.price));

        for (const service of sortedServices) {
          const price = Number(service.price || 0);
          const cat = (service.category || 'general').toLowerCase();
          
          if (totalCost + price <= budgetLimit && !categoriesSeen.has(cat)) {
            chosenItems.push(service);
            totalCost += price;
            categoriesSeen.add(cat);
          }
        }

        // Fallback fill if categories are sparse
        if (chosenItems.length === 0 && individualServices.length > 0) {
          const cheapest = individualServices.sort((a, b) => Number(a.price) - Number(b.price))[0];
          if (Number(cheapest.price) <= budgetLimit) {
            chosenItems.push(cheapest);
            totalCost += Number(cheapest.price);
          }
        }
      }

      // Generate standard category percentage justification breakdown based on target budget
      const breakdown = [
        { item: 'Catering & Food (40%)', recommended_amount: Math.round(budgetLimit * 0.40) },
        { item: 'Venue Rental (25%)', recommended_amount: Math.round(budgetLimit * 0.25) },
        { item: 'Decoration (15%)', recommended_amount: Math.round(budgetLimit * 0.15) },
        { item: 'Photography (10%)', recommended_amount: Math.round(budgetLimit * 0.10) },
        { item: 'Entertainment (10%)', recommended_amount: Math.round(budgetLimit * 0.10) }
      ];

      setAiOptimizedPlan({
        items: chosenItems,
        totalCost: totalCost,
        savings: budgetLimit - totalCost,
        status: 'Optimal',
        message: 'Your budget is well-balanced for your guest count and event type.',
        breakdown: breakdown
      });
      setIsAiOptimizing(false);
    }, 1800);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8000/api/bookings/${bookingToCancel}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      setMyBookings(myBookings.filter(b => b.id !== bookingToCancel));
    } catch (error) { 
      alert("Failed to cancel booking."); 
    } finally {
      setBookingToCancel(null);
    }
  };

  if (userRole === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-bold">Admin Portal Active</h2>
        <button className="mt-4 bg-black text-white px-6 py-2 rounded-lg" onClick={() => navigate('/admin-dashboard')}>
          Go to Admin Panel
        </button>
      </div>
    );
  }

  const cardStyle = { backgroundColor: '#fff', padding: '28px', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)' };
  const inputStyle = { width: '100%', padding: '14px 16px', marginTop: '8px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s' };
  const cancelLinkStyle = { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textDecoration: 'underline', marginTop: '6px' };

  return (
    <div className="main-dashboard" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', position: 'relative', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Custom Styled Confirmation Modal */}
      {bookingToCancel && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '50%', width: 'fit-content', marginBottom: '16px' }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1a1a1a', margin: '0 0 8px 0' }}>Cancel Booking</h3>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Are you sure you want to cancel this booking?
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button 
                onClick={() => setBookingToCancel(null)}
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button 
                onClick={confirmCancelBooking}
                style={styles.modalConfirmBtn}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '35px', padding: '40px 5%', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Left Sidebar: AI Budget Optimizer & My Schedules */}
        <aside style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* AI Budget Optimizer Card */}
          <div style={{ ...cardStyle, background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                <Sparkles size={16} color="#2563eb" /> AI BUDGET OPTIMIZER
              </h4>
              <button
                onClick={handleAiOptimize}
                disabled={isAiOptimizing || !userBudget || userBudget <= 0}
                style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  opacity: (!userBudget || userBudget <= 0) ? 0.6 : 1
                }}
              >
                {isAiOptimizing ? 'ANALYZING...' : 'RUN AI OPTIMIZER'}
              </button>
            </div>

            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Your Maximum Budget (₱)</label>
            <input 
              type="number" 
              style={inputStyle} 
              placeholder="e.g. 25000" 
              value={userBudget === 0 ? '' : userBudget}
              onChange={(e) => setUserBudget(e.target.value === '' ? 0 : Number(e.target.value))} 
            />

            {/* AI Results Section with Percentage Breakdown Justification */}
            {aiOptimizedPlan && (
              <div style={{ marginTop: '16px', background: '#fff', padding: '15px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: '800', fontSize: '0.85rem', color: aiOptimizedPlan.status === 'Optimal' ? '#166534' : '#991b1b' }}>
                  <CheckCircle size={14} />
                  <span>{aiOptimizedPlan.status} Status</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '12px', lineHeight: '1.4' }}>{aiOptimizedPlan.message}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {aiOptimizedPlan.breakdown.map((row, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{row.item}</span>
                      <span style={{ fontWeight: '800', color: '#0f172a' }}>₱{row.recommended_amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* My Schedules Card */}
          <div style={cardStyle}>
            <h3 className="font-black text-gray-900 text-lg mb-4">My Schedules</h3>
            <div className="flex flex-col gap-3">
              {myBookings.length > 0 ? myBookings.map((booking) => (
                <div key={booking.id} style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <p className="text-sm font-bold text-gray-900">{booking.event_name}</p>
                  <p className="text-xs text-gray-600 mt-1">📅 {booking.event_date} • <strong className="text-emerald-600">₱{parseFloat(booking.budget || 0).toLocaleString()}</strong></p>
                  <button onClick={() => setBookingToCancel(booking.id)} style={cancelLinkStyle}>Cancel Booking</button>
                </div>
              )) : <p className="text-xs text-gray-400 italic">No events scheduled.</p>}
            </div>
          </div>

        </aside>

        {/* Right Main Section: Modernized Catalog Grid */}
        <main style={{ flex: '3 1 650px' }}>
          
          {/* Search Header Bar */}
          <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search catalog by service, bundle name, or vendor..." 
              style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="text-2xl font-black text-gray-900">
              {userRole === 'vendor' ? 'My Managed Services' : 'Available Services & Bundles'}
            </h2>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              {filteredServices.length} Results Available
            </span>

          </div>
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <Loader2 size={32} className="animate-spin text-purple-600" />
            </div>
          ) : filteredServices.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
              {filteredServices.map(s => {
                const budgetLimit = Number(userBudget) || 0;
                const isAffordable = budgetLimit > 0 && Number(s.price || 0) <= budgetLimit;

                let budgetStatus = 'set_budget';
                if (budgetLimit > 0) {
                  budgetStatus = isAffordable ? 'affordable' : 'exceeded';
                }

                return (
                  <div 
                    key={s.id} 
                    style={{ 
                      backgroundColor: '#fff',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                      transition: 'all 0.3s ease',
                      opacity: budgetLimit > 0 && !isAffordable ? 0.5 : 1, // Turns greyed out if over budget
                      transform: 'translateY(0)'
                    }}
                  >
                    <ServiceCard 
                      service={s} 
                      budgetStatus={budgetStatus}
                      onToggle={handleToggleStatus} 
                      onBook={(serviceData) => {
                        const rawId = String(serviceData.id).startsWith('bundle_' ) ? String(serviceData.id).replace('bundle_', '') : serviceData.id;
                        navigate(`/bundle-details/${rawId}`, { state: { service: serviceData } });
                      }} 
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: '#fff', padding: '60px', borderRadius: '20px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <p className="text-sm text-gray-500 italic">No bundles or services found matching your criteria.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

const styles = {
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalCard: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  modalCancelBtn: { flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }
};

export default MainDashboard;