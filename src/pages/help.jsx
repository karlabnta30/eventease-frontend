import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ArrowLeft, Search, HelpCircle, ShieldCheck, Headphones, CreditCard } from 'lucide-react';

const HelpPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const galleryImages = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=400&q=80"
  ];

  const helpItems = [
    {
      category: "Payments",
      icon: <CreditCard size={18} color="#0f172a" />,
      question: "How do payments work?",
      answer: "Payments are securely processed through integrated gateways like PayMongo. You can pay for bookings or custom vendor bundles safely with instant ledger updates and automated transaction receipts."
    },
    {
      category: "Bookings",
      icon: <HelpCircle size={18} color="#0f172a" />,
      question: "Cancellations & Rescheduling",
      answer: "Cancellations and rescheduling depend on the specific vendor terms and agreement periods. You can review or initiate status updates directly via your event itinerary dashboard."
    },
    {
      category: "Security",
      icon: <ShieldCheck size={18} color="#0f172a" />,
      question: "Trust & Safety Infrastructure",
      answer: "EventEase ensures platform security utilizing robust Aiven cloud database encryption, token-authenticated sessions, and secure email OTP verification loops."
    },
    {
      category: "Vendors",
      icon: <Headphones size={18} color="#0f172a" />,
      question: "Your Listings & Portfolio",
      answer: "Vendors have complete control over creating, updating, and toggling the availability status of their service packages right from their dedicated management portal."
    },
    {
      category: "Logistics",
      icon: <HelpCircle size={18} color="#0f172a" />,
      question: "Rental & Equipment Help",
      answer: "Need assistance with venue rentals or audio-visual equipment packages? Reach out to our technical support team or message vendors directly through the built-in communication workspace."
    },
    {
      category: "Account",
      icon: <ShieldCheck size={18} color="#0f172a" />,
      question: "Managing Your Account & Roles",
      answer: "Manage your credentials, update profile configurations, and monitor active booking timelines seamlessly through your account settings across Client, Vendor, or Admin roles."
    },
    {
      category: "Payouts",
      icon: <CreditCard size={18} color="#0f172a" />,
      question: "How Vendors Get Paid",
      answer: "Registered vendors receive their payout settlements securely through standard administrative channels upon completing confirmed event service milestones."
    },
    {
      category: "Legal",
      icon: <ShieldCheck size={18} color="#0f172a" />,
      question: "User Agreement & Guidelines",
      answer: "By utilizing EventEase, users agree to abide by our community standards, fair booking policies, and platform operational guidelines."
    },
    {
      category: "Privacy",
      icon: <ShieldCheck size={18} color="#0f172a" />,
      question: "Privacy Policy & Data Protection",
      answer: "We protect your data privacy with strict confidentiality measures. Review our complete data handling practices to understand how we secure your personal information."
    }
  ];

  const filteredHelpItems = helpItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = {
    wrapper: {
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: '80px',
      position: 'relative',
      overflowX: 'hidden',
    },
    heroSection: {
      padding: isMobile ? '40px 20px 40px' : '70px 20px 60px',
      position: 'relative',
      zIndex: 2,
    },
    heroContent: {
      maxWidth: '900px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      zIndex: 2,
    },
    backBtn: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid #cbd5e1',
      color: '#0f172a',
      padding: '8px 16px',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.85rem',
      fontWeight: '700',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
    },
    title: {
      fontSize: isMobile ? '2.2rem' : '3.2rem',
      fontWeight: '900',
      letterSpacing: '-1.5px',
      color: '#0f172a',
      marginBottom: '12px',
    },
    subtitle: {
      color: '#64748b',
      fontSize: isMobile ? '1.05rem' : '1.1rem',
      lineHeight: '1.6',
      maxWidth: '650px',
      marginBottom: '32px',
      fontWeight: '500',
    },
    searchContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '550px',
    },
    searchInput: {
      width: '100%',
      padding: '16px 20px 16px 50px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #cbd5e1',
      borderRadius: '16px',
      color: '#0f172a',
      fontSize: '1rem',
      outline: 'none',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box',
    },
    searchIcon: {
      position: 'absolute',
      left: '18px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#64748b',
      zIndex: 3,
    },
    mainContainer: {
      maxWidth: '1100px',
      margin: '20px auto 0',
      padding: isMobile ? '0 16px' : '0 40px',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
      gap: '40px',
      alignItems: 'start',
      position: 'relative',
      zIndex: 2,
    },
    accordionList: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #e2e8f0',
      borderRadius: '28px',
      padding: isMobile ? '20px' : '35px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
    },
    sectionHeading: {
      fontSize: '1.8rem',
      fontWeight: '900',
      letterSpacing: '-1px',
      color: '#0f172a',
      marginBottom: '24px',
    },
    accordionItem: {
      borderBottom: '1px solid #e2e8f0',
    },
    cardHeader: {
      padding: '22px 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      gap: '15px',
    },
    questionWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
    },
    questionText: {
      fontWeight: '800',
      fontSize: '1.05rem',
      color: '#0f172a',
    },
    iconCircle: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    cardBody: {
      padding: '0 0 24px 0',
      color: '#64748b',
      fontSize: '0.95rem',
      lineHeight: '1.7',
      fontWeight: '500',
    },
    sidebarImagesCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid #e2e8f0',
      borderRadius: '28px',
      padding: '28px',
      position: 'sticky',
      top: '30px',
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
    },
    sidebarTitle: {
      fontSize: '1.25rem',
      fontWeight: '900',
      color: '#0f172a',
      marginBottom: '8px',
      letterSpacing: '-0.5px',
    },
    sidebarText: {
      fontSize: '0.9rem',
      color: '#64748b',
      lineHeight: '1.6',
      marginBottom: '20px',
      fontWeight: '500',
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '20px',
    },
    gridImg: {
      width: '100%',
      height: '100px',
      objectFit: 'cover',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    supportBox: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      padding: '20px',
      textAlign: 'center',
    },
    supportTitle: {
      fontSize: '0.95rem',
      fontWeight: '800',
      color: '#0f172a',
      marginBottom: '6px',
    },
    supportText: {
      fontSize: '0.85rem',
      color: '#64748b',
      marginBottom: '16px',
      lineHeight: '1.5',
    },
    contactBtn: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '12px',
      fontWeight: '900',
      fontSize: '0.85rem',
      cursor: 'pointer',
      width: '100%',
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <div style={styles.wrapper}>
      
      {/* SHOPIFY-STYLE DIAGONAL BACKGROUND MARQUEE ANIMATION */}
      <div className="shopify-bg-wrapper" style={{
        position: 'fixed',
        inset: '-50px',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '30px',
        opacity: '0.18',
        transform: 'rotate(-6deg) scale(1.2)'
      }}>
        <div className="diagonal-track" style={{ display: 'flex', gap: '30px', width: 'max-content', animation: 'diagonalMarquee 35s linear infinite' }}>
          {[...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages].map((img, index) => (
            <div key={index} style={{ width: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <img src={img} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
        <div className="diagonal-track" style={{ display: 'flex', gap: '30px', width: 'max-content', animation: 'diagonalMarquee 40s linear infinite reverse' }}>
          {[...galleryImages, ...galleryImages, ...galleryImages, ...galleryImages].map((img, index) => (
            <div key={index} style={{ width: '280px', height: '180px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
              <img src={img} alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      {/* HERO BANNER SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Home
          </button>
          <h1 style={styles.title}>How can we help you today?</h1>
          <p style={styles.subtitle}>
            Explore our comprehensive knowledge base covering secure payments, vendor guidelines, and event infrastructure workflows.
          </p>

          {/* SEARCH BAR */}
          <div style={styles.searchContainer}>
            <Search size={20} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search for answers (e.g., payments, cancellations)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT WITH ACCORDION & SIDEBAR IMAGES */}
      <div style={styles.mainContainer}>
        
        {/* LEFT: FAQ ACCORDION LIST */}
        <div style={styles.accordionList}>
          <h2 style={styles.sectionHeading}>Questions?</h2>
          {filteredHelpItems.length > 0 ? (
            filteredHelpItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} style={styles.accordionItem}>
                  <div style={styles.cardHeader} onClick={() => toggleAccordion(index)}>
                    <div style={styles.questionWrapper}>
                      <span style={styles.questionText}>{item.question}</span>
                    </div>
                    <div style={styles.iconCircle}>
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </div>
                  </div>
                  {isOpen && (
                    <div style={styles.cardBody}>
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontWeight: '600' }}>
              <p>No matching questions found. Try searching for another keyword.</p>
            </div>
          )}
        </div>

        {/* RIGHT: CINEMATIC EVENT IMAGES & SUPPORT CARD */}
        {!isMobile && (
          <div>
            <div style={styles.sidebarImagesCard}>
              <h3 style={styles.sidebarTitle}>EventEase Infrastructure</h3>
              <p style={styles.sidebarText}>
                Engineered with robust Aiven cloud databases, PayMongo billing security, and automated client-vendor matching.
              </p>

              {/* IMAGE COLLAGE GRID */}
              <div style={styles.imageGrid}>
                <img 
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80" 
                  alt="Event Setup" 
                  style={styles.gridImg} 
                />
                <img 
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80" 
                  alt="Live Concert" 
                  style={styles.gridImg} 
                />
                <img 
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80" 
                  alt="Corporate Gala" 
                  style={styles.gridImg} 
                />
                <img 
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80" 
                  alt="Stage Lighting" 
                  style={styles.gridImg} 
                />
              </div>

              {/* SUPPORT PROMPT BOX */}
              <div style={styles.supportBox}>
                <h4 style={styles.supportTitle}>Still need assistance?</h4>
                <p style={styles.supportText}>Our technical team is ready to help you resolve booking or platform issues.</p>
                <button 
                  style={styles.contactBtn} 
                  onClick={() => navigate('/contact')}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  Contact Support Team &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpPage;