import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    pageWrapper: {
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      minHeight: '100vh',
      overflowX: 'hidden',
      position: 'relative',
    },
    // 2. Hero Section
    heroSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '100px 60px',
      gap: '60px',
      maxWidth: '1440px',
      margin: '0 auto',
      minHeight: '80vh',
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
      padding: '6px 14px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: '800',
      color: '#047857',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '24px',
    },
    heroHeading: {
      fontSize: '4.2rem',
      fontWeight: '900',
      lineHeight: '1.08',
      letterSpacing: '-2.5px',
      marginBottom: '24px',
      color: '#0f172a',
    },
    heroSubheading: {
      fontSize: '1.1rem',
      color: '#64748b',
      lineHeight: '1.65',
      marginBottom: '40px',
      maxWidth: '560px',
      fontWeight: '500',
    },
    heroButtons: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      marginBottom: '45px',
    },
    primaryBtn: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      padding: '16px 36px',
      borderRadius: '14px',
      fontWeight: '900',
      fontSize: '0.95rem',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.25)',
      transition: 'all 0.2s ease',
    },
    secondaryBtn: {
      backgroundColor: 'transparent',
      color: '#0f172a',
      border: '1px solid #cbd5e1',
      padding: '16px 32px',
      borderRadius: '14px',
      fontWeight: '800',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    ratingsRow: {
      display: 'flex',
      gap: '25px',
      alignItems: 'center',
      fontSize: '0.85rem',
      color: '#475569',
      fontWeight: '700',
      borderTop: '1px solid #f1f5f9',
      paddingTop: '25px',
      flexWrap: 'wrap',
    },
    ratingItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#f8fafc',
      padding: '8px 14px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
    },
    
    // Photo Collage Right Grid
    photoGrid: {
      flex: '1 1 600px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '14px',
      height: '520px',
    },
    collageCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    },
    collageImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
    },

    // 3. Core Features Showcase Section
    featureSection: {
      padding: '100px 60px',
      maxWidth: '1300px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '30px',
    },
    featureCard: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '32px',
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)',
    },
    featureHeading: {
      fontSize: '2rem',
      fontWeight: '900',
      marginBottom: '16px',
      letterSpacing: '-1px',
      color: '#0f172a',
    },
    featureText: {
      color: '#64748b',
      fontSize: '0.95rem',
      lineHeight: '1.7',
      marginBottom: '30px',
    },

    // 4. Trusted Industries Section
    industrySection: {
      padding: '80px 60px',
      textAlign: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    industryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginTop: '45px',
    },
    industryCard: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      padding: '24px',
      borderRadius: '20px',
      fontWeight: '800',
      fontSize: '1rem',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'flex-end',
      height: '150px',
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

    // 5. Testimonials Section
    testimonialSection: {
      padding: '100px 60px',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
    },
    testimonialGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '30px',
      maxWidth: '1300px',
      margin: '50px auto 0',
    },
    testimonialCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '24px',
      padding: '40px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
    },

    // 6. Footer
    footer: {
      padding: '60px',
      maxWidth: '1300px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: '#64748b',
      fontSize: '0.85rem',
    }
  };

  return (
    <div style={styles.pageWrapper}>
      
      {/* 2. HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.pillTag}>
            <span>✦ Next-Gen Event Infrastructure</span>
          </div>
          <h1 style={styles.heroHeading}>
            Architect your next extraordinary event.
          </h1>
          <p style={styles.heroSubheading}>
            The elite platform designed for seamless event planning, custom vendor bundling, and automated live itinerary management powered by secure PayMongo checkout.
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
              onClick={() => navigate('/login')}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#0f172a'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              Explore Catalog
            </button>
          </div>

          {/* Ratings row matching your screenshot design layout */}
          <div style={styles.ratingsRow}>
            <div style={styles.ratingItem}>
              <span>⭐</span> <strong></strong> Capterra Verified
            </div>
            <div style={styles.ratingItem}>
              <span>⭐</span> <strong>5.0/5</strong> Enterprise Grade
            </div>
            <div style={styles.ratingItem}>
              <span>⭐</span> <strong>Secure</strong> PayMongo Integration
            </div>
          </div>
        </div>

        {/* Cinematic Photo Collage Grid */}
        <div style={styles.photoGrid}>
          <div style={styles.collageCol}>
            <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80" alt="Event 1" style={styles.collageImg} />
            <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80" alt="Event 2" style={{...styles.collageImg, height: '210px'}} />
          </div>
          <div style={{...styles.collageCol, marginTop: '35px'}}>
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80" alt="Event 3" style={{...styles.collageImg, height: '210px'}} />
            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80" alt="Event 4" style={styles.collageImg} />
          </div>
          <div style={styles.collageCol}>
            <img src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80" alt="Event 5" style={styles.collageImg} />
            <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80" alt="Event 6" style={{...styles.collageImg, height: '210px'}} />
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECT & SECURE PAYMENTS FEATURE SECTION */}
      <section style={styles.featureSection}>
        <div style={styles.featureCard}>
          <div>
            <div style={{ color: '#059669', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Custom Canvas</div>
            <h2 style={styles.featureHeading}>The Bundle Architect</h2>
            <p style={styles.featureText}>
              Curate independent vendor services and pre-made bundles into a unified custom blueprint. Dynamically calculate accurate costs and deploy your tailored packages instantly.
            </p>
          </div>
          <button style={{ ...styles.primaryBtn, width: 'fit-content' }} onClick={() => navigate('/login')}>
            Try Bundle Architect &rarr;
          </button>
        </div>

        <div style={styles.featureCard}>
          <div>
            <div style={{ color: '#059669', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>Seamless Billing</div>
            <h2 style={styles.featureHeading}>Live Itineraries & PayMongo</h2>
            <p style={styles.featureText}>
              Monitor vendor confirmations in real time on your live itineraries. Execute secure transactions with strict per-service pricing through integrated PayMongo gateways.
            </p>
          </div>
          <button style={{ ...styles.primaryBtn, width: 'fit-content' }} onClick={() => navigate('/login')}>
            View Live Itineraries &rarr;
          </button>
        </div>
      </section>

      {/* 4. TRUSTED INDUSTRIES SECTION */}
      <section style={styles.industrySection}>
        <h2 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-1px', color: '#0f172a' }}>Engineered for elite event categories</h2>
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

      {/* 5. TESTIMONIALS SECTION */}
      <section style={styles.testimonialSection}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-1px', color: '#0f172a' }}>Trusted by elite event organizers</h2>
          <p style={{ color: '#64748b', marginTop: '10px' }}>Maintaining top-tier reliability across all booking workflows.</p>
        </div>
        <div style={styles.testimonialGrid}>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#059669', marginBottom: '15px', fontSize: '0.9rem' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '10px', fontSize: '1.05rem', color: '#0f172a' }}>Flawless vendor coordination</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.7' }}>"The Bundle Architect completely transformed how we pitch packages to clients. Clean, fast, and remarkably structured."</p>
            <div style={{ marginTop: '25px', fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>Rory W. — Lead Event Director</div>
          </div>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#059669', marginBottom: '15px', fontSize: '0.9rem' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '10px', fontSize: '1.05rem', color: '#0f172a' }}>Secure and lightning-fast billing</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.7' }}>"Integrating PayMongo checkout with per-service pricing resolved all our budgeting discrepancies overnight. Incredible tool."</p>
            <div style={{ marginTop: '25px', fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>Nikki K. — Operations Manager</div>
          </div>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#059669', marginBottom: '15px', fontSize: '0.9rem' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '10px', fontSize: '1.05rem', color: '#0f172a' }}>Exceptional UI architecture</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.7' }}>"From automated unassigned booking cleanup to live itinerary tracking, every workflow is polished to perfection."</p>
            <div style={{ marginTop: '25px', fontWeight: '700', fontSize: '0.85rem', color: '#334155' }}>Piyush G. — Technical Lead</div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={styles.footer}>
        <div>© 2026 EventEase Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '25px', color: '#64748b', fontWeight: '600' }}>
          <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
          <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          <span style={{ cursor: 'pointer' }}>Security</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;