import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, Search, HelpCircle, ShieldCheck, Headphones, CreditCard } from 'lucide-react';

const HelpPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0); // Naka-open ang una by default para modern look
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

  const helpItems = [
    {
      category: "Payments",
      icon: <CreditCard size={18} color="#10b981" />,
      question: "How do payments work?",
      answer: "Payments are securely processed through integrated gateways like PayMongo. You can pay for bookings or custom vendor bundles safely with instant ledger updates and automated transaction receipts."
    },
    {
      category: "Bookings",
      icon: <HelpCircle size={18} color="#10b981" />,
      question: "Cancellations & Rescheduling",
      answer: "Cancellations and rescheduling depend on the specific vendor terms and agreement periods. You can review or initiate status updates directly via your event itinerary dashboard."
    },
    {
      category: "Security",
      icon: <ShieldCheck size={18} color="#10b981" />,
      question: "Trust & Safety Infrastructure",
      answer: "EventEase ensures platform security utilizing robust Aiven cloud database encryption, token-authenticated sessions, and secure email OTP verification loops."
    },
    {
      category: "Vendors",
      icon: <Headphones size={18} color="#10b981" />,
      question: "Your Listings & Portfolio",
      answer: "Vendors have complete control over creating, updating, and toggling the availability status of their service packages right from their dedicated management portal."
    },
    {
      category: "Logistics",
      icon: <HelpCircle size={18} color="#10b981" />,
      question: "Rental & Equipment Help",
      answer: "Need assistance with venue rentals or audio-visual equipment packages? Reach out to our technical support team or message vendors directly through the built-in communication workspace."
    },
    {
      category: "Account",
      icon: <ShieldCheck size={18} color="#10b981" />,
      question: "Managing Your Account & Roles",
      answer: "Manage your credentials, update profile configurations, and monitor active booking timelines seamlessly through your account settings across Client, Vendor, or Admin roles."
    },
    {
      category: "Payouts",
      icon: <CreditCard size={18} color="#10b981" />,
      question: "How Vendors Get Paid",
      answer: "Registered vendors receive their payout settlements securely through standard administrative channels upon completing confirmed event service milestones."
    },
    {
      category: "Legal",
      icon: <ShieldCheck size={18} color="#10b981" />,
      question: "User Agreement & Guidelines",
      answer: "By utilizing EventEase, users agree to abide by our community standards, fair booking policies, and platform operational guidelines."
    },
    {
      category: "Privacy",
      icon: <ShieldCheck size={18} color="#10b981" />,
      question: "Privacy Policy & Data Protection",
      answer: "We protect your data privacy with strict confidentiality measures. Review our complete data handling practices to understand how we secure your personal information."
    }
  ];

  // Filter items batay sa search bar input
  const filteredHelpItems = helpItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styles = {
    wrapper: {
      backgroundColor: '#09090b',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: '80px',
    },
    heroSection: {
      background: 'linear-gradient(135deg, #09090b 0%, #111827 50%, #064e3b 100%)',
      padding: isMobile ? '40px 20px 50px' : '70px 60px 80px',
      borderBottom: '1px solid #1f2937',
      position: 'relative',
      overflow: 'hidden',
    },
    heroContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      zIndex: 2,
    },
    backBtn: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#cbd5e1',
      padding: '8px 16px',
      borderRadius: '10px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.85rem',
      fontWeight: '600',
      marginBottom: '24px',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.2s ease',
    },
    title: {
      fontSize: isMobile ? '2.4rem' : '3.5rem',
      fontWeight: '900',
      letterSpacing: '-1.5px',
      color: '#ffffff',
      marginBottom: '12px',
    },
    subtitle: {
      color: '#94a3b8',
      fontSize: isMobile ? '0.95rem' : '1.1rem',
      lineHeight: '1.6',
      maxWidth: '650px',
      marginBottom: '32px',
    },
    searchContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '550px',
    },
    searchInput: {
      width: '100%',
      padding: '16px 20px 16px 50px',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      border: '1px solid #334155',
      borderRadius: '16px',
      color: '#ffffff',
      fontSize: '1rem',
      outline: 'none',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      transition: 'border-color 0.2s ease',
    },
    searchIcon: {
      position: 'absolute',
      left: '18px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8',
    },
    mainContainer: {
      maxWidth: '1200px',
      margin: '50px auto 0',
      padding: isMobile ? '0 16px' : '0 40px',
      display: 'grid',
      gridTemplateCommunity: '1fr',
      gridTemplateColumns: isMobile ? '1fr' : '1.3fr 0.7fr',
      gap: '40px',
      alignItems: 'start',
    },
    accordionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    },
    card: (isOpen) => ({
      border: isOpen ? '1px solid #10b981' : '1px solid #1f2937',
      borderRadius: '16px',
      backgroundColor: '#111827',
      overflow: 'hidden',
      transition: 'all 0.25s ease',
      boxShadow: isOpen ? '0 10px 30px -10px rgba(16, 185, 129, 0.15)' : 'none',
    }),
    cardHeader: {
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      gap: '15px',
    },
    questionWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    questionText: {
      fontWeight: '700',
      fontSize: '1.05rem',
      color: '#ffffff',
    },
    badge: {
      backgroundColor: '#064e3b',
      color: '#34d399',
      fontSize: '0.7rem',
      fontWeight: '800',
      padding: '4px 10px',
      borderRadius: '999px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    cardBody: {
      padding: '0 24px 22px 24px',
      color: '#94a3b8',
      fontSize: '0.95rem',
      lineHeight: '1.7',
      borderTop: '1px solid #1f2937',
      paddingTop: '16px',
    },
    sidebarImagesCard: {
      backgroundColor: '#111827',
      border: '1px solid #1f2937',
      borderRadius: '24px',
      padding: '28px',
      position: 'sticky',
      top: '30px',
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
    },
    sidebarTitle: {
      fontSize: '1.25rem',
      fontWeight: '900',
      color: '#ffffff',
      marginBottom: '8px',
    },
    sidebarText: {
      fontSize: '0.9rem',
      color: '#94a3b8',
      lineHeight: '1.5',
      marginBottom: '20px',
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
      marginBottom: '20px',
    },
    gridImg: {
      width: '100%',
      height: '110px',
      objectFit: 'cover',
      borderRadius: '12px',
      border: '1px solid #374151',
      transition: 'transform 0.2s ease',
    },
    supportBox: {
      backgroundColor: '#064e3b',
      border: '1px solid #059669',
      borderRadius: '16px',
      padding: '20px',
      textAlign: 'center',
    },
    supportTitle: {
      fontSize: '1rem',
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: '6px',
    },
    supportText: {
      fontSize: '0.85rem',
      color: '#a7f3d0',
      marginBottom: '14px',
    },
    contactBtn: {
      backgroundColor: '#ffffff',
      color: '#064e3b',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '10px',
      fontWeight: '800',
      fontSize: '0.85rem',
      cursor: 'pointer',
      width: '100%',
      transition: 'all 0.2s ease',
    }
  };

  return (
    <div style={styles.wrapper}>
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
          {filteredHelpItems.length > 0 ? (
            filteredHelpItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} style={styles.card(isOpen)}>
                  <div style={styles.cardHeader} onClick={() => toggleAccordion(index)}>
                    <div style={styles.questionWrapper}>
                      {item.icon}
                      <span style={styles.questionText}>{item.question}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {!isMobile && <span style={styles.badge}>{item.category}</span>}
                      {isOpen ? <ChevronUp size={20} color="#10b981" /> : <ChevronDown size={20} color="#94a3b8" />}
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
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
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