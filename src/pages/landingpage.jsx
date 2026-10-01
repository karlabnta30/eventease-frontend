import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'terms' | 'security' | null

  const modalContent = {
    privacy: {
      title: 'Privacy Policy',
      text: 'At EventEase, we respect your privacy and are committed to protecting your personal data. This policy outlines how we collect, use, and secure your information when you interact with our platform, vendor directory, and payment gateways.'
    },
    terms: {
      title: 'Terms of Service',
      text: 'By accessing or using EventEase, you agree to be bound by these Terms of Service. Whether you are booking custom bundles or managing vendor operations, you agree to adhere to our community guidelines, scheduling policies, and secure transaction workflows.'
    },
    security: {
      title: 'Security Infrastructure',
      text: 'We protect your data using industry-standard protocols, including robust Aiven cloud database encryption, secure email OTP verification loops, and token-authenticated dashboard routing to ensure your planning workspace remains safe and protected.'
    }
  };

  const styles = {
    pageWrapper: {
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      minHeight: '100vh',
      overflowX: 'hidden',
      position: 'relative',
    },
    heroSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 40px',
      gap: '40px',
      maxWidth: '1440px',
      margin: '0 auto',
      minHeight: 'auto',
    },
    heroContent: {
      flex: '1 1 650px',
    },
    pillTag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#ecfdf5',
      border: '1px solid #a7f3d0',
      padding: '5px 12px',
      borderRadius: '999px',
      fontSize: '0.7rem',
      fontWeight: '800',
      color: '#047857',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '12px',
    },
    heroHeading: {
      fontSize: '3.6rem',
      fontWeight: '900',
      lineHeight: '1.08',
      letterSpacing: '-2px',
      marginBottom: '14px',
      color: '#0f172a',
    },
    heroSubheading: {
      fontSize: '1.05rem',
      color: '#64748b',
      lineHeight: '1.6',
      marginBottom: '24px',
      maxWidth: '560px',
      fontWeight: '500',
    },
    heroButtons: {
      display: 'flex',
      gap: '14px',
      alignItems: 'center',
      marginBottom: '24px',
    },
    primaryBtn: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      padding: '14px 30px',
      borderRadius: '14px',
      fontWeight: '900',
      fontSize: '0.90rem',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
      transition: 'all 0.2s ease',
    },
    secondaryBtn: {
      backgroundColor: 'transparent',
      color: '#0f172a',
      border: '1px solid #cbd5e1',
      padding: '14px 28px',
      borderRadius: '14px',
      fontWeight: '800',
      fontSize: '0.90rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    ratingsRow: {
      display: 'flex',
      gap: '15px',
      alignItems: 'center',
      fontSize: '0.8rem',
      color: '#475569',
      fontWeight: '700',
      borderTop: '1px solid #f1f5f9',
      paddingTop: '14px',
      flexWrap: 'wrap',
    },
    ratingItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#f8fafc',
      padding: '6px 12px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    photoGrid: {
      flex: '1 1 550px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      height: '420px',
    },
    collageCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    collageImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '18px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 15px 30px rgba(0,0,0,0.05)',
    },
    featureSection: {
      padding: '40px 40px',
      maxWidth: '1300px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px',
    },
    featureCard: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '28px',
      padding: '36px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)',
    },
    featureHeading: {
      fontSize: '1.8rem',
      fontWeight: '900',
      marginBottom: '12px',
      letterSpacing: '-1px',
      color: '#0f172a',
    },
    featureText: {
      color: '#64748b',
      fontSize: '0.90rem',
      lineHeight: '1.65',
      marginBottom: '20px',
    },
    industrySection: {
      padding: '40px 40px',
      textAlign: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    industryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '30px',
    },
    industryCard: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      padding: '20px',
      borderRadius: '18px',
      fontWeight: '800',
      fontSize: '0.95rem',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'flex-end',
      height: '130px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    industryOverlay: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(15,23,42,0.85) 10%, rgba(15,23,42,0.2) 100%)',
    },
    testimonialSection: {
      padding: '50px 40px',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
    },
    testimonialGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px',
      maxWidth: '1300px',
      margin: '30px auto 0',
    },
    testimonialCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '22px',
      padding: '30px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
    },
    footer: {
      padding: '30px 40px',
      maxWidth: '1300px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#64748b',
      fontSize: '0.80rem',
    },
    footerLink: {
      cursor: 'pointer',
      transition: 'color 0.2s ease',
    },
    // Modal Overlay styles
    modalOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '20px',
    },
    modalCard: {
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      padding: '32px',
      maxWidth: '500px',
      width: '100%',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      position: 'relative',
      border: '1px solid #e2e8f0',
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: '900',
      color: '#0f172a',
      marginBottom: '12px',
      letterSpacing: '-0.5px',
    },
    modalText: {
      color: '#64748b',
      fontSize: '0.95rem',
      lineHeight: '1.6',
      marginBottom: '24px',
    },
    modalCloseBtn: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '12px',
      fontWeight: '800',
      fontSize: '0.85rem',
      cursor: 'pointer',
      float: 'right',
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.pillTag}>
            <span>✦ Next-Gen Event Infrastructure &bull; OTP Resend Enabled</span>
          </div>
          <h1 style={styles.heroHeading}>
            Architect your next extraordinary event.
          </h1>
          <p style={styles.heroSubheading}>
            The elite platform engineered with robust Aiven database stability, instant OTP verification and resend features, custom vendor bundling, and secure PayMongo checkout.
          </p>
          <div style={styles.heroButtons}>
            <button 
              style={styles.primaryBtn} 
              onClick={() => navigate('/login')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Start Planning Now &rarr;
            </button>
            <button 
              style={styles.secondaryBtn} 
              onClick={() => navigate('/catalog')}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#0f172a'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              Explore Catalog
            </button>
          </div>

          <div style={styles.ratingsRow}>
            <div style={styles.ratingItem}>
              <span>⭐</span> <strong>Aiven Database</strong> Reliability
            </div>
            <div style={styles.ratingItem}>
              <span>🔒</span> <strong>Secure PayMongo</strong> Integration
            </div>
            <div style={styles.ratingItem}>
              <span>✉️</span> <strong>OTP Resend</strong> Security
            </div>
          </div>
        </div>

        {/* Cinematic Photo Collage Grid */}
        <div style={styles.photoGrid}>
          <div style={styles.collageCol}>
            <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80" alt="Event 1" style={styles.collageImg} />
            <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80" alt="Event 2" style={{...styles.collageImg, height: '170px'}} />
          </div>
          <div style={{...styles.collageCol, marginTop: '25px'}}>
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80" alt="Event 3" style={{...styles.collageImg, height: '170px'}} />
            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80" alt="Event 4" style={styles.collageImg} />
          </div>
          <div style={styles.collageCol}>
            <img src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80" alt="Event 5" style={styles.collageImg} />
            <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80" alt="Event 6" style={{...styles.collageImg, height: '170px'}} />
          </div>
        </div>
      </section>

      {/* CORE ARCHITECT & SECURE PAYMENTS FEATURE SECTION */}
      <section style={styles.featureSection}>
        <div style={styles.featureCard}>
          <div>
            <div style={{ color: '#059669', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Custom Canvas</div>
            <h2 style={styles.featureHeading}>The Bundle Architect</h2>
            <p style={styles.featureText}>
              Curate independent vendor services and pre-made bundles into a unified custom blueprint backed seamlessly by your Aiven cloud database infrastructure.
            </p>
          </div>
          <button style={{ ...styles.primaryBtn, width: 'fit-content' }} onClick={() => navigate('/login')}>
            Try Bundle Architect &rarr;
          </button>
        </div>

        <div style={styles.featureCard}>
          <div>
            <div style={{ color: '#059669', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Seamless Billing & Auth</div>
            <h2 style={styles.featureHeading}>OTP Resend & PayMongo</h2>
            <p style={styles.featureText}>
              Enjoy frictionless onboarding with instant email OTP verification and quick resend handling, alongside secure per-service transactions via PayMongo.
            </p>
          </div>
          <button style={{ ...styles.primaryBtn, width: 'fit-content' }} onClick={() => navigate('/login')}>
            Explore Security Features &rarr;
          </button>
        </div>
      </section>

      {/* TRUSTED INDUSTRIES SECTION */}
      <section style={styles.industrySection}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', color: '#0f172a' }}>Engineered for elite event categories</h2>
        <div style={styles.industryGrid}>
          <div style={{ ...styles.industryCard, backgroundImage: `url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=300&q=80')` }}>
            <div style={styles.industryOverlay}></div>
            <span style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>Corporate Galas</span>
          </div>
          <div style={{ ...styles.industryCard, backgroundImage: `url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80')` }}>
            <div style={styles.industryOverlay}></div>
            <span style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>Academic Seminars</span>
          </div>
          <div style={{ ...styles.industryCard, backgroundImage: `url('https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=300&q=80')` }}>
            <div style={styles.industryOverlay}></div>
            <span style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>Executive Councils</span>
          </div>
          <div style={{ ...styles.industryCard, backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80')` }}>
            <div style={styles.industryOverlay}></div>
            <span style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>Live Concerts</span>
          </div>
          <div style={{ ...styles.industryCard, backgroundImage: `url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80')` }}>
            <div style={styles.industryOverlay}></div>
            <span style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>Community Mixers</span>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section style={styles.testimonialSection}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', color: '#0f172a' }}>Trusted by elite event organizers</h2>
          <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.90rem' }}>Maintaining top-tier reliability across authentication and booking workflows.</p>
        </div>
        <div style={styles.testimonialGrid}>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#059669', marginBottom: '12px', fontSize: '0.85rem' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '8px', fontSize: '1rem', color: '#0f172a' }}>Flawless vendor coordination</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6' }}>"The Bundle Architect completely transformed how we pitch packages to clients with rock-solid Aiven database stability."</p>
            <div style={{ marginTop: '20px', fontWeight: '700', fontSize: '0.80rem', color: '#334155' }}>Rory W. — Lead Event Director</div>
          </div>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#059669', marginBottom: '12px', fontSize: '0.85rem' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '8px', fontSize: '1rem', color: '#0f172a' }}>Secure billing & OTP resend</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6' }}>"Integrating PayMongo checkout alongside seamless OTP email verification flows resolved all user signup bottlenecks overnight."</p>
            <div style={{ marginTop: '20px', fontWeight: '700', fontSize: '0.80rem', color: '#334155' }}>Nikki K. — Operations Manager</div>
          </div>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#059669', marginBottom: '12px', fontSize: '0.85rem' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '8px', fontSize: '1rem', color: '#0f172a' }}>Exceptional UI architecture</h4>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6' }}>"From instant code deployments to live itinerary tracking, every workflow is polished to absolute perfection."</p>
            <div style={{ marginTop: '20px', fontWeight: '700', fontSize: '0.80rem', color: '#334155' }}>Piyush G. — Technical Lead</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div>© 2026 EventEase Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontWeight: '600' }}>
          <span 
            style={styles.footerLink} 
            onClick={() => setActiveModal('privacy')}
            onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
          >
            Privacy Policy
          </span>
          <span 
            style={styles.footerLink} 
            onClick={() => setActiveModal('terms')}
            onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
          >
            Terms of Service
          </span>
          <span 
            style={styles.footerLink} 
            onClick={() => setActiveModal('security')}
            onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
            onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
          >
            Security
          </span>
        </div>
      </footer>

      {/* POPUP MODAL */}
      {activeModal && (
        <div style={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{modalContent[activeModal].title}</h3>
            <p style={styles.modalText}>{modalContent[activeModal].text}</p>
            <button style={styles.modalCloseBtn} onClick={() => setActiveModal(null)}>
              Close Window
            </button>
            <div style={{ clear: 'both' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;