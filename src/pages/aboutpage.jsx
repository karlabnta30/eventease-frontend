import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Database, Layout, Users, Sparkles, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

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
    container: { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#0f172a' },
    heroSection: { 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
      padding: '70px 8%', 
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '40px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    },
    heroTextSide: { flex: '1.2', minWidth: '320px' },
    heroImageSide: { 
      flex: '0.9', 
      minWidth: '320px', 
      height: '340px', 
      borderRadius: '24px', 
      backgroundImage: 'url("https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop")', 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      border: '4px solid rgba(255,255,255,0.1)'
    },
    sectionPadding: { padding: '90px 8%' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' },
    phiCard: { 
      padding: '35px', 
      backgroundColor: '#ffffff', 
      borderRadius: '24px', 
      textAlign: 'left', 
      border: '1px solid #e2e8f0', 
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)',
      transition: 'transform 0.2s ease',
    },
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginTop: '45px' },
    teamCard: { 
      backgroundColor: '#fff', 
      borderRadius: '22px', 
      overflow: 'hidden', 
      border: '1px solid #e2e8f0', 
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.03)',
      display: 'flex',
      flexDirection: 'column'
    },
    memberAvatar: { 
      height: '140px', 
      background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)', 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: 'white', 
      fontSize: '2.5rem', 
      fontWeight: '900',
      letterSpacing: '1px'
    },
    memberInfo: { padding: '24px', backgroundColor: '#ffffff', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } 
  };

  return (
    <div style={styles.container}>
      
      {/* SECTION 1: HERO BANNER */}
      <section style={styles.heroSection}>
        <div style={styles.heroTextSide}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: '900', padding: '5px 12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Capstone Research Project
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>• College of Computing</span>
          </div>
          <h1 style={{ fontSize: '2.8rem', margin: '0 0 15px 0', color: '#fff', fontWeight: '900', letterSpacing: '-1px' }}>
            EventEase: A Localized Booking & Bundle Solution
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: '1.7', margin: '0 0 30px 0' }}>
            Developed as an advanced capstone study, EventEase streamlines comprehensive event planning, real-time budgeting, and vendor coordination within Metro Manila.
          </p>
          <button 
            onClick={() => navigate('/main-dashboard')}
            style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
          >
            Explore Dashboard <ArrowRight size={18} />
          </button>
        </div>
        <div style={styles.heroImageSide}></div>
      </section>

      {/* SECTION 2: RESEARCH FRAMEWORK / OBJECTIVES */}
      <section style={styles.sectionPadding}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px', margin: '0 0 10px 0' }}>Research Framework</h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>Core technological and architectural pillars driving the EventEase platform.</p>
        </div>

        <div style={styles.grid3}>
          <div style={styles.phiCard}>
            <div style={{ background: '#dbeafe', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '16px' }}>
              <Layout size={24} color="#2563eb" />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>UX Optimization</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Analyzing user conversion efficiency through a responsive React dashboard, interactive Bundle Architect, and streamlined checkout workflows.
            </p>
          </div>

          <div style={styles.phiCard}>
            <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '16px' }}>
              <ShieldCheck size={24} color="#059669" />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>Data Integrity</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Verifying high-fidelity vendor data, role-based JWT authentication, and secure transactional validations across NCR regions.
            </p>
          </div>

          <div style={styles.phiCard}>
            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '14px', width: 'fit-content', marginBottom: '16px' }}>
              <Database size={24} color="#d97706" />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>Scalability</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              Testing robust backend performance under simultaneous multi-vendor booking requests and automated AI budget allocations.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: MEET THE RESEARCHERS */}
      <section style={{ ...styles.sectionPadding, backgroundColor: '#f1f5f9', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ color: '#2563eb', fontWeight: '900', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Project Team</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '5px 0 0 0', letterSpacing: '-1px' }}>Meet the Researchers</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '450px', margin: 0 }}>
            Dedicated IT undergraduate students collaborating to bridge the gap between event planners and local service providers.
          </p>
        </div>

        <div style={styles.teamGrid}>
          {teamMembers.map((member, i) => (
            <div key={i} style={styles.teamCard}>
              <div style={styles.memberAvatar}>{member.initials}</div>
              <div style={styles.memberInfo}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '900', color: '#0f172a' }}>{member.name}</h3>
                  <p style={{ color: '#3b82f6', fontWeight: '800', fontSize: '0.8rem', margin: '0 0 12px 0', textTransform: 'uppercase' }}>{member.role}</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>{member.bio}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default AboutPage;