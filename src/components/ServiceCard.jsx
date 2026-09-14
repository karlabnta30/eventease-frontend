import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Power, Package } from 'lucide-react';

const ServiceCard = ({ service, onToggle, onBook, budgetStatus }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = localStorage.getItem('userRole')?.toLowerCase(); 
  const isVendorPath = location.pathname.toLowerCase().includes('vendor') || location.pathname.toLowerCase().includes('dashboard');
  const isBundle = service.type === 'bundle' || service.bundle_name;

  const getCategoryPhoto = (category) => {
    const photos = {
      'Catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop',
      'Photography': 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop',
      'Venue': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop',
      'Entertainment': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
      'Decoration': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop',
      'Lights & Sounds': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop'
    };
    return photos[category] || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop';
  };

  const photoUrl = getCategoryPhoto(service.category);
  const isAvailable = service.is_available === true || service.is_available === 1 || service.is_available === "1";

  let cloudStyle = { backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' };
  let cloudText = '☁️ Set Budget';
  if (budgetStatus === 'affordable') {
    cloudStyle = { backgroundColor: '#059669', color: '#fff', boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)' };
    cloudText = '☁️ Within Budget';
  } else if (budgetStatus === 'exceeded') {
    cloudStyle = { backgroundColor: '#dc2626', color: '#fff', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.4)' };
    cloudText = '☁️ Over Budget';
  }

  const handleCardAction = () => {
    if (onBook) {
      onBook(service);
      return;
    }
    if (isBundle) {
      const cleanBundleId = service.id.toString().replace('bundle_', '');
      navigate(`/bundle-details/${cleanBundleId}`, { state: { service } });
    } else {
      navigate(`/vendors/${service.id}`);
    }
  };

  const isAffordable = budgetStatus === 'affordable' || !budgetStatus;

  return (
    <div style={{
      backgroundColor: '#fff', 
      borderRadius: '20px', 
      padding: '16px', 
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)', 
      border: '1px solid #f1f5f9', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '14px', 
      transition: 'all 0.3s ease', 
      position: 'relative'
    }}>
      <div 
        style={{ 
          height: '160px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative', 
          overflow: 'hidden',
          backgroundImage: `url('${photoUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: (isAffordable || !budgetStatus) ? 'none' : 'grayscale(100%)',
          opacity: (isAvailable || isBundle) ? (isAffordable ? 1 : 0.6) : 0.6,
          transition: 'filter 0.3s ease'
        }} 
      >
        <div style={{position:'absolute', inset:0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)'}} />

        <div style={{position:'absolute', top:'10px', left:'10px', background: isBundle ? '#059669' : '#0f172a', color:'white', padding:'5px 10px', borderRadius:'8px', fontSize:'10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', zIndex: 2, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}>
          {isBundle && <Package size={12} />}
          {isBundle ? 'BUNDLE' : (service.category || 'Service')}
        </div>

        {/* Cloud Badge stays fully colored because it's outside the filtered image container */}
        <div style={{position:'absolute', top:'10px', right:'10px', zIndex: 10}}>
          <div style={{
            fontSize: '10px', 
            fontWeight: '700', 
            padding: '5px 10px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            ...cloudStyle
          }}>
            {cloudText}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em' }}>
          {service.bundle_name || service.business_name || service.name}
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
          📍 {service.location || service.vendor?.address || 'Available Nationwide'}
        </p>
        
        <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '4px 0', minHeight: '38px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {service.description || "Premium professional package curated for your special event."}
        </p>

        {isBundle && service.services && service.services.length > 0 && (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '8px', fontSize: '11px', color: '#334155', marginBottom: '4px' }}>
            <strong style={{ color: '#0f172a' }}>Includes:</strong> {service.services.map(s => s.service_name || s.name).join(', ')}
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>
            ₱{parseFloat(service.price || service.starting_price || 0).toLocaleString()}
          </span>

          {(userRole === 'vendor' && isVendorPath) ? (
            <button 
              onClick={() => onToggle(service.id)}
              style={{
                color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                backgroundColor: isAvailable ? '#10b981' : '#f43f5e', 
                display: 'flex', alignItems: 'center', gap: '6px', minWidth: '95px', justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            >
              <Power size={13} />
              {isAvailable ? 'ACTIVE' : 'INACTIVE'}
            </button>
          ) : (
            <button 
              onClick={handleCardAction}
              disabled={budgetStatus === 'set_budget' || budgetStatus === 'exceeded'}
              style={{
                color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', cursor: (budgetStatus === 'set_budget' || budgetStatus === 'exceeded') ? 'not-allowed' : 'pointer',
                backgroundColor: (budgetStatus === 'set_budget' || budgetStatus === 'exceeded') 
                  ? '#cbd5e1' 
                  : (isBundle ? '#059669' : '#0f172a'),
                boxShadow: (budgetStatus === 'set_budget' || budgetStatus === 'exceeded') ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                transition: 'background-color 0.2s'
              }}
            >
              {isBundle ? 'Book Bundle' : 'View Details'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;