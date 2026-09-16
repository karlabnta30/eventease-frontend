import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { notifyNewBooking } from '../toastUtils.jsx';
import { Calendar, MapPin, Tag, Users, Wallet, CheckCircle2, Info, Sparkles, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

// --- SUCCESS MODAL ---
const SuccessModal = ({ isOpen, onClose, eventId, currentBudget }) => {
  if (!isOpen) return null;
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000,
      backdropFilter: 'blur(12px)' 
    }}>
      <div style={{
        background: '#ffffff', padding: '45px', borderRadius: '32px',
        textAlign: 'center', maxWidth: '450px', width: '90%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎊</div>
        <h2 style={{ color: '#0f172a', fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '12px' }}>Plan Initiated!</h2>
        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '30px', fontWeight: '500', fontSize: '0.95rem' }}>
          Your event is now in our system, complete with your signed vendor agreement. Next, let's find the perfect vendors and services to bring your vision to life.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => navigate(`/vendor-list?event_id=${eventId}&budget=${currentBudget}`)}
            style={{
              background: '#0f172a', color: 'white', border: 'none',
              padding: '16px', borderRadius: '14px', fontWeight: '900',
              cursor: 'pointer', width: '100%', fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)'
            }}
          >
            BROWSE VENDORS
          </button>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem' }}
          >
            View Event Summary
          </button>
        </div>
      </div>
    </div>
  );
};

// --- CONTRACT AGREEMENT MODAL ---
const ContractModal = ({ isOpen, onClose, onConfirm, vendorTerms, loading }) => {
  const [agreed, setAgreed] = useState(false);
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1900,
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        background: '#ffffff', padding: '40px', borderRadius: '28px',
        maxWidth: '480px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        border: '1px solid #e2e8f0', fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FileText size={22} color="#2563eb" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', textTransform: 'uppercase', margin: 0, color: '#0f172a' }}>
            Vendor Contract & Service Agreement
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748b', maxHeight: '150px', overflowY: 'auto', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', lineHeight: '1.6' }}>
          {vendorTerms || "Standard EventEase Service Agreement applies: 50% downpayment required upon booking confirmation. Cancellation must be requested at least 2 weeks prior to the scheduled event date to be eligible for partial refunds."}
        </p>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', color: '#334155', marginBottom: '25px', userSelect: 'none' }}>
          <input 
            type="checkbox" 
            checked={agreed} 
            onChange={(e) => setAgreed(e.target.checked)} 
            style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '1px', accentColor: '#2563eb' }}
          />
          <span>I have read, understood, and agree to the binding service agreement and cancellation policies.</span>
        </label>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ flex: 1, padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer', fontWeight: '800', color: '#475569' }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            disabled={!agreed || loading}
            onClick={onConfirm} 
            style={{ 
              flex: 2, padding: '14px', borderRadius: '14px', border: 'none', 
              background: !agreed ? '#cbd5e1' : '#0f172a', color: 'white', 
              cursor: !agreed || loading ? 'not-allowed' : 'pointer', fontWeight: '900', fontSize: '0.95rem',
              boxShadow: !agreed ? 'none' : '0 4px 14px rgba(15, 23, 42, 0.3)'
            }}
          >
            {loading ? 'PROCESSING...' : 'AGREE & INITIATE'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- BASELINE RATE ESTIMATOR HELPER ---
const categoryRates = {
  Wedding: 800,
  Birthday: 350,
  Corporate: 500,
  Workshop: 300,
  Debut: 600
};

const getRatePerPerson = (category) => categoryRates[category] || 300;

const getRecommendedBudget = (pax, category) => {
  const rate = getRatePerPerson(category);
  return pax ? Number(pax) * rate : 0;
};

// --- AI BUDGET OPTIMIZER SUB-COMPONENT ---
const BudgetOptimizerWidget = ({ category, pax, budget }) => {
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  const handleOptimize = async () => {
    if (!category || !pax || !budget) {
      alert("Please fill in Category, Guests, and Budget first.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai/optimize', {
        category,
        guest_count: pax,
        total_budget: budget
      });

      setOptimizationResult(response.data);
    } catch (error) {
      console.error("Optimization error:", error);
      alert("Failed to generate budget optimization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ margin: 0, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontSize: '0.85rem', textTransform: 'uppercase' }}>
          <Sparkles size={16} color="#3b82f6" /> AI Budget Optimizer
        </h4>
        <button 
          type="button"
          onClick={handleOptimize} 
          disabled={loading}
          style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.75rem', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)' }}
        >
          {loading ? 'ANALYZING...' : 'RUN AI OPTIMIZER'}
        </button>
      </div>

      {optimizationResult && (
        <div style={{ marginTop: '14px', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: '900', fontSize: '0.85rem', color: optimizationResult.status === 'Optimal' ? '#166534' : '#991b1b' }}>
            {optimizationResult.status === 'Optimal' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            <span>{optimizationResult.status} Status</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>{optimizationResult.message}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {optimizationResult.breakdown.map((row, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: '700', color: '#475569' }}>{row.item} ({row.percentage})</span>
                <span style={{ fontWeight: '900', color: '#0f172a' }}>₱{row.recommended_amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledServiceId = searchParams.get('service_id');

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [newEventId, setNewEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vendorTerms, setVendorTerms] = useState("");
  const [formError, setFormError] = useState("");

  const [eventData, setEventData] = useState({
    name: '',
    address: '',
    startDate: new Date(),
    endDate: new Date(new Date().setHours(new Date().getHours() + 2)),
    category: '',
    pax: '',
    budget: '',
    service_id: prefilledServiceId ? parseInt(prefilledServiceId) : null
  });

  // Fetch vendor terms if a service ID is pre-selected or attached
  useEffect(() => {
    if (prefilledServiceId) {
      const fetchServiceTerms = async () => {
        try {
          const res = await api.get(`/vendors/${prefilledServiceId}`);
          const service = res.data.data || res.data;
          if (service && service.terms_and_conditions) {
            setVendorTerms(service.terms_and_conditions);
          }
        } catch (err) {
          console.error("Failed to fetch service terms:", err);
        }
      };
      fetchServiceTerms();
    }
  }, [prefilledServiceId]);

  const handleChange = (field, value) => {
    setEventData(prev => ({ ...prev, [field]: value }));
    if (formError) setFormError("");
  };

  const handleApplyRecommended = () => {
    const recommended = getRecommendedBudget(eventData.pax, eventData.category);
    if (recommended > 0) {
      handleChange('budget', recommended);
    }
  };

  const handleInitiateClick = () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    
    if (!eventData.name || !eventData.address || !eventData.category || !eventData.pax) {
        setFormError("Please fill in all required event fields including guest count.");
        return;
    }

    if (parseInt(eventData.pax) > 150) {
        setFormError("Guest limit exceeded! Maximum allowed capacity is 150 guests.");
        return;
    }

    setFormError("");
    setIsContractOpen(true);
  };

  const handleFinalCreateEvent = async () => {
    setLoading(true);

    const formatMySQLDate = (date) => {
        if (!(date instanceof Date)) return null;
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return offsetDate.toISOString().slice(0, 19).replace('T', ' ');
    };

    const payload = {
      event_name: eventData.name,
      location: eventData.address,
      category: eventData.category,
      event_date: formatMySQLDate(eventData.startDate),
      end_time: formatMySQLDate(eventData.endDate),
      guest_count: parseInt(eventData.pax) || 0,
      budget: parseFloat(eventData.budget) || 0,
      venue_id: 0,
      service_id: eventData.service_id,
      contract_agreed: true
    };

    try {
      const res = await api.post('/bookings', payload);
      
      if (res.status === 201) {
        const createdBooking = res.data.data || res.data;
        setIsContractOpen(false);
        setNewEventId(createdBooking.id); 
        notifyNewBooking(`"${eventData.name}" has been successfully planned with signed contract!`);
      }
    } catch (error) {
      console.error("Creation Error:", error.response?.data);
      setFormError(error.response?.data?.message || error.response?.data?.error || "Error creating event.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (newEventId) { setIsSuccessOpen(true); }
  }, [newEventId]);

  const currentRate = getRatePerPerson(eventData.category);
  const recommendedBudget = getRecommendedBudget(eventData.pax, eventData.category);

  const styles = {
    container: { backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', fontFamily: "'Inter', sans-serif" },
    hero: { 
        height: '360px', 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.85)), url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80')`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white', 
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    },
    heroContent: { padding: '0 20px' },
    heroTitle: { fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '8px' },
    heroSub: { fontSize: '1rem', fontWeight: '600', opacity: 0.85, letterSpacing: '0.5px', textTransform: 'uppercase' },
    mainGrid: { maxWidth: '1200px', margin: '-70px auto 0', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '30px', position: 'relative', zIndex: 10 },
    card: { background: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)', marginBottom: '24px' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', color: '#0f172a' },
    label: { fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' },
    input: { width: '100%', padding: '14px 16px', border: '2px solid #f1f5f9', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '700', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" },
    select: { width: '100%', padding: '14px 16px', border: '2px solid #f1f5f9', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '700', outline: 'none', backgroundColor: '#f8fafc', color: '#0f172a', transition: 'all 0.2s', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif", cursor: 'pointer' },
    venueToggle: { backgroundColor: '#0f172a', color: 'white', padding: '14px', borderRadius: '14px', textAlign: 'center', fontWeight: '900', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    btnPrimary: { flex: 2, padding: '16px', borderRadius: '14px', border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer', fontWeight: '900', fontSize: '1rem', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)', transition: 'all 0.2s' },
    btnSecondary: { flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer', fontWeight: '800', color: '#475569' },
    errorBox: {
        gridColumn: 'span 2',
        backgroundColor: '#fef2f2',
        border: '1px solid #fee2e2',
        color: '#991b1b',
        padding: '14px 18px',
        borderRadius: '14px',
        fontSize: '0.9rem',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
    },
    hintBox: { 
      gridColumn: 'span 2', 
      marginTop: '-10px', 
      marginBottom: '20px', 
      padding: '16px 20px', 
      backgroundColor: '#ffffff', 
      border: '1px solid #e2e8f0', 
      borderRadius: '18px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      gap: '12px', 
      fontSize: '0.85rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
    },
    applyBtn: { 
      background: '#0f172a', 
      color: '#fff', 
      border: 'none', 
      padding: '8px 14px', 
      borderRadius: '10px', 
      fontSize: '0.75rem', 
      fontWeight: '800', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '6px',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
    }
  };

  return (
    <div style={styles.container}>
      <SuccessModal 
        isOpen={isSuccessOpen} 
        eventId={newEventId} 
        currentBudget={eventData.budget}
        onClose={() => { setIsSuccessOpen(false); setNewEventId(null); }} 
      />

      <ContractModal 
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        onConfirm={handleFinalCreateEvent}
        vendorTerms={vendorTerms}
        loading={loading}
      />

      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Plan Less. Celebrate More.</h1>
          <p style={styles.heroSub}>Craft your perfect event with EventEase Architecture Suite</p>
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div className="left-column">
          <div style={styles.card}>
            <div style={styles.sectionHeader}><Tag size={20} color="#3b82f6"/><h3 style={{fontWeight: '900', margin: 0, fontSize: '1.1rem'}}>Basic Information</h3></div>
            <label style={styles.label}>Event Title</label>
            <input type="text" placeholder="e.g. Sarah & Mark Wedding" style={styles.input} value={eventData.name} onChange={(e) => handleChange('name', e.target.value)} />
            
            <div style={{marginTop: '20px'}}>
                <label style={styles.label}>Event Category</label>
                <select style={styles.select} value={eventData.category} onChange={(e) => handleChange('category', e.target.value)}>
                    <option value="">Select Category</option>
                    <option value="Wedding">Wedding (₱800/pax)</option>
                    <option value="Birthday">Birthday (₱350/pax)</option>
                    <option value="Corporate">Corporate (₱500/pax)</option>
                    <option value="Workshop">Workshop (₱300/pax)</option>
                    <option value="Debut">Debut (₱600/pax)</option>
                </select>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.sectionHeader}><MapPin size={20} color="#3b82f6"/><h3 style={{fontWeight: '900', margin: 0, fontSize: '1.1rem'}}>Location</h3></div>
            <div style={styles.venueToggle}><CheckCircle2 size={16}/> PHYSICAL VENUE</div>
            <label style={styles.label}>Street Address / Landmark</label>
            <input type="text" placeholder="Enter full address or venue name" style={styles.input} value={eventData.address} onChange={(e) => handleChange('address', e.target.value)} />
          </div>
        </div>

        <div className="right-column">
          <div style={styles.card}>
            <div style={styles.sectionHeader}><Calendar size={20} color="#3b82f6"/><h3 style={{fontWeight: '900', margin: 0, fontSize: '1.1rem'}}>Schedule</h3></div>
            <label style={styles.label}>Starts</label>
            <DatePicker 
              selected={eventData.startDate} 
              onChange={(date) => handleChange('startDate', date)} 
              showTimeSelect 
              dateFormat="MMMM d, yyyy h:mm aa" 
              minDate={new Date()}
              customInput={<input style={styles.input} />} 
            />
            <div style={{marginTop: '16px'}}>
                <label style={styles.label}>Ends</label>
                <DatePicker 
                  selected={eventData.endDate} 
                  onChange={(date) => handleChange('endDate', date)} 
                  showTimeSelect 
                  dateFormat="MMMM d, yyyy h:mm aa" 
                  minDate={eventData.startDate || new Date()} 
                  customInput={<input style={styles.input} />} 
                />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={styles.card}>
                <div style={{display:'flex', alignItems: 'center', gap:'8px', marginBottom:'12px'}}>
                  <Users size={18} color="#3b82f6"/> 
                  <label style={styles.label}>Guests (Max 150)</label>
                </div>
                <input 
                  type="number" 
                  min="1" 
                  max="150" 
                  placeholder="0" 
                  style={styles.input} 
                  value={eventData.pax} 
                  onKeyDown={(e) => ['-', 'e', '+', '.'].includes(e.key) && e.preventDefault()}
                  onChange={(e) => handleChange('pax', e.target.value)} 
                />
            </div>
            <div style={styles.card}>
                <div style={{display:'flex', alignItems: 'center', gap:'8px', marginBottom:'12px'}}>
                  <Wallet size={18} color="#3b82f6"/> 
                  <label style={styles.label}>Budget (₱)</label>
                </div>
                <input 
                  type="number" 
                  min="0" 
                  placeholder="0.00" 
                  style={styles.input} 
                  value={eventData.budget} 
                  onKeyDown={(e) => ['-', 'e', '+'].includes(e.key) && e.preventDefault()}
                  onChange={(e) => handleChange('budget', e.target.value)} 
                />
            </div>

            {formError && (
              <div style={styles.errorBox}>
                <AlertTriangle size={18} color="#991b1b" style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            <div style={styles.hintBox}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Info size={18} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.85rem' }}>
                    Baseline Rate: ₱{currentRate.toLocaleString()}/pax
                    {eventData.category ? ` (${eventData.category})` : ''}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', fontWeight: '600' }}>
                    Est. Total for {eventData.pax || 0} pax: <strong style={{ color: '#059669' }}>₱{recommendedBudget.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {recommendedBudget > 0 && (
                <button 
                  type="button" 
                  onClick={handleApplyRecommended} 
                  style={styles.applyBtn}
                  title="Auto-fill the budget with recommended amount"
                >
                  <Sparkles size={12} /> Apply ₱{recommendedBudget.toLocaleString()}
                </button>
              )}
            </div>
          </div>

          <BudgetOptimizerWidget 
            category={eventData.category}
            pax={eventData.pax}
            budget={eventData.budget}
          />

          <div style={{ display: 'flex', gap: '15px' }}>
            <button type="button" onClick={() => navigate('/live-events')} style={styles.btnSecondary}>Cancel</button>
            <button 
                type="button"
                onClick={handleInitiateClick} 
                style={styles.btnPrimary}
            >
                INITIATE PLAN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;