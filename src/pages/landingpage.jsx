import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    pageWrapper: {
      backgroundColor: '#070b19',
      color: '#ffffff',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      minHeight: '100vh',
      overflowX: 'hidden',
    },
    // 1. Sticky Top Navigation Bar (Always visible while scrolling)
    navbar: {
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '18px 50px',
      backgroundColor: '#070b19',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(10px)',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: '900',
      letterSpacing: '-0.5px',
      color: '#ffffff',
      textTransform: 'uppercase',
      cursor: 'pointer',
    },
    navLinks: {
      display: 'flex',
      gap: '30px',
      alignItems: 'center',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#94a3b8',
    },
    navItem: {
      cursor: 'pointer',
      transition: 'color 0.2s',
    },
    navActions: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
    },
    signInBtn: {
      background: 'none',
      border: 'none',
      color: '#ffffff',
      fontWeight: '700',
      cursor: 'pointer',
      fontSize: '0.9rem',
    },
    navCreateBtn: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      border: 'none',
      padding: '10px 22px',
      borderRadius: '12px',
      fontWeight: '800',
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },

    // 2. Hero Section
    heroSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '80px 60px',
      gap: '40px',
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '75vh',
    },
    heroContent: {
      flex: '1 1 600px',
    },
    heroHeading: {
      fontSize: '4rem',
      fontWeight: '900',
      lineHeight: '1.1',
      letterSpacing: '-2px',
      marginBottom: '24px',
    },
    heroSubheading: {
      fontSize: '1.1rem',
      color: '#94a3b8',
      lineHeight: '1.6',
      marginBottom: '40px',
      maxWidth: '540px',
      fontWeight: '500',
    },
    heroButtons: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      marginBottom: '40px',
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
      boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
      transition: 'transform 0.2s',
    },
    secondaryBtn: {
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '2px solid rgba(255,255,255,0.2)',
      padding: '16px 32px',
      borderRadius: '14px',
      fontWeight: '900',
      fontSize: '0.95rem',
      cursor: 'pointer',
    },
    ratingsRow: {
      display: 'flex',
      gap: '30px',
      alignItems: 'center',
      fontSize: '0.85rem',
      color: '#cbd5e1',
      fontWeight: '700',
    },
    
    // Photo Collage Right Grid
    photoGrid: {
      flex: '1 1 600px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      height: '500px',
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
      borderRadius: '16px',
      filter: 'brightness(0.9)',
    },

    // 3. App & Fast Payout Section
    featureSection: {
      padding: '100px 60px',
      maxWidth: '1300px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '40px',
    },
    featureCard: {
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '28px',
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    featureHeading: {
      fontSize: '2.2rem',
      fontWeight: '900',
      marginBottom: '16px',
      letterSpacing: '-1px',
    },
    featureText: {
      color: '#94a3b8',
      fontSize: '1rem',
      lineHeight: '1.6',
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '20px',
      marginTop: '40px',
    },
    industryCard: {
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      padding: '24px',
      borderRadius: '20px',
      fontWeight: '800',
      fontSize: '1rem',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'flex-end',
      height: '140px',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative',
      overflow: 'hidden',
    },

    // 5. Testimonials Section
    testimonialSection: {
      padding: '100px 60px',
      backgroundColor: '#090d1f',
      borderTop: '1px solid #1e293b',
      borderBottom: '1px solid #1e293b',
    },
    testimonialGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px',
      maxWidth: '1300px',
      margin: '40px auto 0',
    },
    testimonialCard: {
      backgroundColor: '#0f172a',
      border: '1px solid #1e293b',
      borderRadius: '24px',
      padding: '35px',
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
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }
  };

  return (
    <div style={styles.pageWrapper}>
      
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <nav style={styles.navbar}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          EventEase
        </div>
        <div style={styles.navLinks}>
          <span style={styles.navItem}>Features</span>
          <span style={styles.navItem}>Industry</span>
          <span style={styles.navItem}>Explore Events</span>
          <span style={styles.navItem}>Pricing</span>
          <span style={styles.navItem}>Help</span>
        </div>
        <div style={styles.navActions}>
          <button style={styles.signInBtn} onClick={() => navigate('/login')}>
            Greetings! Sign in
          </button>
          <button style={styles.navCreateBtn} onClick={() => navigate('/login')}>
            + Create Event
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroHeading}>
            Event planning & ticketing made simple
          </h1>
          <p style={styles.heroSubheading}>
            An easy-to-use event platform with fair pricing and dedicated support. All the tools you need for a fraction of the cost charged by other platforms.
          </p>
          <div style={styles.heroButtons}>
            <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
              Create Event
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate('/login')}>
              Book A Demo
            </button>
          </div>
          <div style={styles.ratingsRow}>
            <div>⭐ Capterra 4.7/5</div>
            <div>⭐ G2 5/5</div>
            <div>⭐ Google 4.7/5</div>
          </div>
        </div>

        {/* Cinematic Photo Collage Grid */}
        <div style={styles.photoGrid}>
          <div style={styles.collageCol}>
            <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80" alt="Event 1" style={styles.collageImg} />
            <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80" alt="Event 2" style={{...styles.collageImg, height: '220px'}} />
          </div>
          <div style={{...styles.collageCol, marginTop: '30px'}}>
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80" alt="Event 3" style={{...styles.collageImg, height: '220px'}} />
            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80" alt="Event 4" style={styles.collageImg} />
          </div>
          <div style={styles.collageCol}>
            <img src="https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80" alt="Event 5" style={styles.collageImg} />
            <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80" alt="Event 6" style={{...styles.collageImg, height: '220px'}} />
          </div>
        </div>
      </section>

      {/* 3. APP & FAST PAYOUT FEATURE SECTION */}
      <section style={styles.featureSection}>
        <div style={styles.featureCard}>
          <div>
            <h2 style={styles.featureHeading}>Organize on the go using our app</h2>
            <p style={styles.featureText}>
              Publish, manage and share events right from your phone with our seamless web & mobile experience.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <span style={{ backgroundColor: '#1e293b', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>Google Play</span>
            <span style={{ backgroundColor: '#1e293b', padding: '10px 20px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>App Store</span>
          </div>
        </div>

        <div style={styles.featureCard}>
          <div>
            <h2 style={styles.featureHeading}>Get paid fast with PayMongo</h2>
            <p style={styles.featureText}>
              You'll receive your funds when you need it — even before your events take place with flexible payout schedules.
            </p>
          </div>
          <button style={{ ...styles.primaryBtn, width: 'fit-content' }} onClick={() => navigate('/login')}>
            Get Started &rarr;
          </button>
        </div>
      </section>

      {/* 4. TRUSTED INDUSTRIES SECTION */}
      <section style={styles.industrySection}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>Trusted by industries like yours</h2>
        <div style={styles.industryGrid}>
          <div style={{ ...styles.industryCard, backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=300&q=80')` }}>Business</div>
          <div style={{ ...styles.industryCard, backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80')` }}>Academic</div>
          <div style={{ ...styles.industryCard, backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=300&q=80')` }}>Councils</div>
          <div style={{ ...styles.industryCard, backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=80')` }}>Entertainment</div>
          <div style={{ ...styles.industryCard, backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80')` }}>Communities</div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section style={styles.testimonialSection}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px' }}>Loved by customers</h2>
          <p style={{ color: '#94a3b8', marginTop: '10px' }}>EventEase has a 4.7 rating according to leading software review platforms.</p>
        </div>
        <div style={styles.testimonialGrid}>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#fbbf24', marginBottom: '15px' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '10px' }}>New leader in event management</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>"Sleek, user friendly experience with smooth options available to make running a large event much more simple."</p>
            <div style={{ marginTop: '20px', fontWeight: '700', fontSize: '0.85rem' }}>Rory W. — Admin & Events</div>
          </div>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#fbbf24', marginBottom: '15px' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '10px' }}>Easy to use platform</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>"EventEase allowed our club to take online bookings for events with zero hassle. The custom service is brilliant!"</p>
            <div style={{ marginTop: '20px', fontWeight: '700', fontSize: '0.85rem' }}>Nikki W. — Treasurer</div>
          </div>
          <div style={styles.testimonialCard}>
            <div style={{ color: '#fbbf24', marginBottom: '15px' }}>★★★★★</div>
            <h4 style={{ fontWeight: '800', marginBottom: '10px' }}>Exceeded expectations</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>"The software is highly flexible and has great features. It is so simple and easy to use for anyone looking for reliability."</p>
            <div style={{ marginTop: '20px', fontWeight: '700', fontSize: '0.85rem' }}>Piyush G. — Developer</div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={styles.footer}>
        <div>© 2026 EventEase Inc. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;