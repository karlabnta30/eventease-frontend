import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, Layout, ArrowRight, Sparkles, Users, Award } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      backgroundColor: '#09090b', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif", 
      color: '#f8fafc',
      overflowX: 'hidden'
    },
    heroSection: { 
      background: 'linear-gradient(135deg, #09090b 0%, #111827 50%, #064e3b 100%)', 
      padding: isMobile ? '50px 20px 60px' : '80px 8%', 
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '40px',
      borderBottom: '1px solid #1f2937',
      position: 'relative'
    },
    heroTextSide: { flex: '1.2', minWidth: '100%', zIndex: 2 },
    heroImageSide: { 
      flex: '0.9', 
      minWidth: '100%', 
      height: isMobile ? '240px' : '360px', 
      borderRadius: '24px', 
      backgroundImage: 'url("https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop")', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    sectionPadding: { padding: isMobile ? '50px 20px' : '90px 8%' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '40px' },
    phiCard: { 
      padding: '30px', 
      backgroundColor: '#111827', 
      borderRadius: '24px', 
      textAlign: 'left', 
      border: '1px solid #1f2937', 
      boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      transition: 'all 0.3s ease',
    },
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginTop: '40px' },
    teamCard: { 
      backgroundColor: '#111827', 
      borderRadius: '24px', 
      overflow: 'hidden', 
      border: '1px solid #1f2937', 
      boxShadow: '0 15px 35px -10px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease'
    },
    memberAvatar: { 
      height: '130px', 
      background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: '#ffffff', 
      fontSize: '2.2rem', 
      fontWeight: '900',
      letterSpacing: '2px',
      borderBottom: '1px solid #1f2937'
    },
    memberInfo: { padding: '24px', backgroundColor: '#111827', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } 
  };

  return (
    <div style={styles.container}>
      
      {/* SECTION 1: HERO BANNER */}
      <section style={styles.heroSection}>
        <div style={styles.heroTextSide}>
          <button 
            onClick={() => navigate('/')}
            style={{ 
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
              marginBottom: '20px',
              backdropFilter: 'blur(8px)'
            }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ background: '#064e3b', color: '#34d399', fontSize: '0.75rem', fontWeight: '900', padding: '6px 14px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid #059669' }}>
              Capstone Research Project
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>College of Computing & IT</span>
          </div>
          
          <h1 style={{ fontSize: isMobile ? '2.2rem' : '3.4rem', margin: '0 0 16px 0', color: '#ffffff', fontWeight: '900', letterSpacing: '-1.5px', wordBreak: 'break-word', lineHeight: '1.1' }}>
            EventEase: A Localized Booking & Bundle Solution
          </h1>
          
          <p style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', color: '#94a3b8', lineHeight: '1.7', margin: '0 0 30px 0', maxWidth: '650px' }}>
            Developed as an advanced capstone study, EventEase streamlines comprehensive event planning, real-time budgeting, and vendor coordination within Metro Manila.
          </p>
          
          <button 
            onClick={() => {
              const token = localStorage.getItem('token');
              if (token) {
                const role = localStorage.getItem('userRole');
                if (role === 'admin') navigate('/admin-dashboard');
                else if (role === 'vendor') navigate('/vendor-dashboard');
                else navigate('/main-dashboard');
              } else {
                navigate('/login');
              }
            }}
            style={{ 
              background: '#10b981', 
              color: '#ffffff', 
              border: 'none', 
              padding: '14px 30px', 
              borderRadius: '14px', 
              fontWeight: '900', 
              fontSize: '0.9rem',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', 
              width: isMobile ? '100%' : 'auto', 
              justifyContent: 'center',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Explore Dashboard <ArrowRight size={18} />
          </button>
        </div>
        <div style={styles.heroImageSide}></div>
      </section>

      {/* SECTION 2: RESEARCH FRAMEWORK / OBJECTIVES */}
      <section style={styles.sectionPadding}>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
          <span style={{ color: '#34d399', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px' }}>Architectural Pillars</span>
          <h2 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-1px', margin: '8px 0 12px 0' }}>Research Framework</h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6' }}>Core technological and architectural pillars driving the EventEase platform.</p>
        </div>

        <div style={styles.grid3}>
          <div style={styles.phiCard}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '14px', borderRadius: '16px', width: 'fit-content', marginBottom: '20px' }}>
              <Layout size={26} color="#60a5fa" />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '950', color: '#ffffff' }}>UX Optimization</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
              Analyzing user conversion efficiency through a responsive React dashboard, interactive Bundle Architect, and streamlined checkout workflows.
            </p>
          </div>

          <div style={styles.phiCard}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '14px', borderRadius: '16px', width: 'fit-content', marginBottom: '20px' }}>
              <ShieldCheck size={26} color="#34d399" />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '950', color: '#ffffff' }}>Data Integrity</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
              Verifying high-fidelity vendor data, role-based JWT authentication, and secure transactional validations across NCR regions.
            </p>
          </div>

          <div style={styles.phiCard}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '14px', borderRadius: '16px', width: 'fit-content', marginBottom: '20px' }}>
              <Database size={26} color="#fbbf24" />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '950', color: '#ffffff' }}>Scalability</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.7', margin: 0 }}>
              Testing robust backend performance under simultaneous multi-vendor booking requests and automated AI budget allocations.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: MEET THE RESEARCHERS */}
      <section style={{ ...styles.sectionPadding, backgroundColor: '#0e131f', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'flex-end', flexWrap: 'wrap', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <span style={{ color: '#34d399', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px' }}>Project Team</span>
            <h2 style={{ fontSize: isMobile ? '2rem' : '2.8rem', fontWeight: '900', color: '#ffffff', margin: '6px 0 0 0', letterSpacing: '-1px' }}>Meet the Researchers</h2>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '480px', margin: 0, lineHeight: '1.6' }}>
            Dedicated IT undergraduate students collaborating to bridge the gap between event planners and local service providers.
          </p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={styles.teamGrid}>
            {teamMembers.map((member, i) => (
              <div key={i} style={styles.teamCard}>
                <div style={styles.memberAvatar}>{member.initials}</div>
                <div style={styles.memberInfo}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: '900', color: '#ffffff' }}>{member.name}</h3>
                    <p style={{ color: '#34d399', fontWeight: '800', fontSize: '0.75rem', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{member.role}</p>
                    <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;