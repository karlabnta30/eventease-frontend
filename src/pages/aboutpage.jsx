import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, Layout, ArrowLeft, Users, Target, Sparkles } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const galleryImages = [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80"
  ];

  const teamMembers = [
    { 
      name: "Laquisha Licuanan", 
      role: "Team Leader & Documentation", 
      bio: "Oversees project direction, research methodology, and leads the technical documentation and reporting for the capstone study.", 
      initials: "LL"
    },
    { 
      name: "Andria Sotelo", 
      role: "Documentation & Frontend Developer", 
      bio: "Contributes to project documentation while assisting with UI/UX styling and responsive design implementation.", 
      initials: "AS"
    },
    { 
      name: "Ynia Morales", 
      role: "Frontend Developer & Documentation", 
      bio: "Specializes in React-based frontend component architecture, user interface workflows, and technical writing.", 
      initials: "YM"
    },
    { 
      name: "Karl Abonita", 
      role: "Full-Stack Developer (Frontend & Backend)", 
      bio: "Handles comprehensive system architecture, server-side Laravel logic, API integration, and frontend development.", 
      initials: "KA"
    }
  ];

  const styles = {
    container: { 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif", 
      color: '#0f172a',
      position: 'relative',
      overflowX: 'hidden'
    },
    contentLayer: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      padding: isMobile ? '40px 16px' : '60px 40px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '40px',
      flexWrap: 'wrap',
      gap: '15px'
    },
    backBtn: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid #cbd5e1',
      color: '#0f172a',
      padding: '10px 20px',
      borderRadius: '12px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.85rem',
      fontWeight: '800',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
    },
    aboutHeroCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      padding: isMobile ? '30px 20px' : '50px',
      borderRadius: '28px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
      marginBottom: '40px',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      backgroundColor: '#ecfdf5',
      border: '1px solid #a7f3d0',
      padding: '6px 14px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: '800',
      color: '#047857',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '16px',
    },
    title: {
      fontSize: isMobile ? '2rem' : '2.8rem',
      fontWeight: '900',
      color: '#0f172a',
      letterSpacing: '-1.5px',
      margin: '0 0 16px 0',
      lineHeight: '1.15',
    },
    description: {
      fontSize: isMobile ? '0.95rem' : '1.05rem',
      color: '#64748b',
      lineHeight: '1.7',
      fontWeight: '500',
      maxWidth: '900px',
      margin: 0,
    },
    gridSection: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '24px',
      marginBottom: '50px',
    },
    infoCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      padding: '30px',
      borderRadius: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)',
    },
    teamSectionHeader: {
      textAlign: 'center',
      marginBottom: '35px',
    },
    teamGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '24px',
    },
    teamCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column',
    },
    avatarBox: {
      height: '120px',
      background: 'linear-gradient(135deg, #0f172a 0%, #10b981 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontSize: '2rem',
      fontWeight: '900',
      letterSpacing: '1px',
    },
    cardBody: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      justifyContent: 'space-between',
    }
  };

  return (
    <div style={styles.container}>
      
      {/* 🌟 SHOPIFY-STYLE DIAGONAL BACKGROUND GALLERY */}
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

      <div style={styles.contentLayer}>
        
        {/* TOP NAVIGATION / BACK BUTTON */}
        <div style={styles.headerRow}>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>

        {/* ABOUT HERO / OVERVIEW CARD */}
        <div style={styles.aboutHeroCard}>
          <div style={styles.badge}>
            <Sparkles size={14} /> <span>Capstone Research Project &bull; College of Computing</span>
          </div>
          <h1 style={styles.title}>About EventEase</h1>
          <p style={styles.description}>
            EventEase is an advanced capstone study engineered to revolutionize event planning, budgeting optimization, and vendor coordination across Metro Manila. By integrating robust Aiven cloud databases, instant OTP verification security, and secure PayMongo billing workflows, our platform seamlessly bridges the gap between event organizers and local service providers.
          </p>
        </div>

        {/* RESEARCH FRAMEWORK / OBJECTIVES GRID */}
        <div style={styles.gridSection}>
          <div style={styles.infoCard}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '16px' }}>
              <Layout size={24} color="#059669" />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>UX Optimization</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
              Analyzing user conversion efficiency through a responsive React dashboard, interactive Bundle Architect, and streamlined checkout workflows.
            </p>
          </div>

          <div style={styles.infoCard}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '16px' }}>
              <ShieldCheck size={24} color="#059669" />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>Data Integrity</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
              Verifying high-fidelity vendor data, role-based JWT authentication, and secure transactional validations across NCR regions.
            </p>
          </div>

          <div style={styles.infoCard}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '16px' }}>
              <Database size={24} color="#059669" />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '900', color: '#0f172a' }}>Scalability</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
              Testing robust backend performance under simultaneous multi-vendor booking requests and automated AI budget allocations.
            </p>
          </div>
        </div>

        {/* MEET THE RESEARCHERS SECTION */}
        <div style={{ marginTop: '60px' }}>
          <div style={styles.teamSectionHeader}>
            <span style={{ color: '#059669', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Project Team</span>
            <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.3rem', fontWeight: '900', color: '#0f172a', margin: '6px 0 0 0', letterSpacing: '-1px' }}>
              Meet the Researchers
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '6px', fontWeight: '500' }}>
              Dedicated undergraduate students collaborating to build modern event infrastructure.
            </p>
          </div>

          <div style={styles.teamGrid}>
            {teamMembers.map((member, i) => (
              <div key={i} style={styles.teamCard}>
                <div style={styles.avatarBox}>{member.initials}</div>
                <div style={styles.cardBody}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '900', color: '#0f172a' }}>{member.name}</h3>
                    <p style={{ color: '#059669', fontWeight: '800', fontSize: '0.75rem', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{member.role}</p>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;