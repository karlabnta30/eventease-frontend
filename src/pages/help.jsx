import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const HelpPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const helpItems = [
    {
      question: "How do payments work?",
      answer: "Payments are securely processed through integrated gateways like PayMongo. You can pay for bookings or custom vendor bundles safely with instant ledger updates."
    },
    {
      question: "Cancellations",
      answer: "Cancellations and rescheduling depend on the specific vendor terms and agreement periods. You can review or initiate status updates directly via your event itinerary dashboard."
    },
    {
      question: "Trust & Safety",
      answer: "EventEase ensures platform security utilizing robust Aiven cloud database encryption, token-authenticated sessions, and secure verification loops."
    },
    {
      question: "Your Listings",
      answer: "Vendors have complete control over creating, updating, and toggling the availability status of their service packages right from their dedicated management portal."
    },
    {
      question: "Rental Help",
      answer: "Need assistance with venue rentals or equipment packages? Reach out to our technical support team or message vendors directly through the built-in communication workspace."
    },
    {
      question: "Your Account",
      answer: "Manage your credentials, update profile configurations, and monitor active booking timelines seamlessly through your account settings."
    },
    {
      question: "How to Get Paid",
      answer: "Registered vendors receive their payout settlements securely through standard administrative channels upon completing confirmed event service milestones."
    },
    {
      question: "User Agreement",
      answer: "By utilizing EventEase, users agree to abide by our community standards, fair booking policies, and platform operational guidelines."
    },
    {
      question: "Privacy Policy",
      answer: "We protect your data privacy with strict confidentiality measures. Review our complete data handling practices to understand how we secure your personal information."
    }
  ];

  const styles = {
    wrapper: {
      backgroundColor: '#000000',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      padding: isMobile ? '30px 16px' : '60px 40px',
    },
    headerContainer: {
      maxWidth: '850px',
      margin: '0 auto 40px auto',
      textAlign: 'center',
    },
    backBtn: {
      background: 'transparent',
      border: '1px solid #27272a',
      color: '#a1a1aa',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.85rem',
      fontWeight: '600',
      marginBottom: '20px',
      transition: 'all 0.2s ease',
    },
    title: {
      fontSize: isMobile ? '2.2rem' : '3rem',
      fontWeight: '900',
      letterSpacing: '-1px',
      color: '#ffffff',
      marginBottom: '12px',
    },
    subtitle: {
      color: '#a1a1aa',
      fontSize: '0.95rem',
      lineHeight: '1.5',
    },
    accordionContainer: {
      maxWidth: '850px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    card: {
      border: '1px solid #27272a',
      borderRadius: '14px',
      backgroundColor: '#09090b',
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
    },
    cardHeader: {
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      fontWeight: '800',
      fontSize: '1.05rem',
      color: '#ffffff',
    },
    cardBody: {
      padding: '0 24px 20px 24px',
      color: '#a1a1aa',
      fontSize: '0.92rem',
      lineHeight: '1.6',
      borderTop: '1px solid #18181b',
      paddingTop: '14px',
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerContainer}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <h1 style={styles.title}>How can we help?</h1>
        <p style={styles.subtitle}>
          Click the dropdowns below to learn about anything from our payment process to how cancellations work.
        </p>
      </div>

      <div style={styles.accordionContainer}>
        {helpItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} style={styles.card}>
              <div style={styles.cardHeader} onClick={() => toggleAccordion(index)}>
                <span>{item.question}</span>
                {isOpen ? <ChevronUp size={20} color="#a1a1aa" /> : <ChevronDown size={20} color="#a1a1aa" />}
              </div>
              {isOpen && (
                <div style={styles.cardBody}>
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HelpPage;