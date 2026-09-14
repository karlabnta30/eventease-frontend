import React from 'react';

const AboutPage = () => {
  const teamMembers = [
    { 
      name: "Laquisha Licuanan", 
      role: "Team Leader & Frontend Developer", 
      bio: "Oversees project direction and leads the React-based development of the EventEase user interface.", 
    },
    { 
      name: "Andria Sotelo", 
      role: "Frontend Developer", 
      bio: "Focuses on the implementation of Tailwind CSS and ensuring responsive design for mobile and web views.", 
    },
    { 
      name: "Ynia Morales", 
      role: "Backend Developer", 
      bio: "Specializes in relational database architecture using MariaDB 10.4 and managing data integrity via HeidiSQL.", 
    },
    { 
      name: "Karl Abonita", 
      role: "Backend Developer", 
      bio: "Handles server-side logic and the integration of local Manila-based venue data into the system.", 
    }
  ];

  const styles = {
    container: { backgroundColor: '#fcfcfd', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#1a1a1a' },
    heroSection: { display: 'flex', backgroundColor: '#ffffff', padding: '60px 5%', alignItems: 'center', gap: '40px', flexWrap: 'wrap', borderBottom: '1px solid #eee' },
    heroTextSide: { flex: '1.2', minWidth: '300px' },
    heroImageSide: { flex: '0.8', minWidth: '300px', height: '350px', backgroundColor: '#f4f1ea', borderRadius: '24px', backgroundImage: 'url("https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2069&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 10px 30px rgba(107, 99, 130, 0.1)' },
    philosophySection: { padding: '80px 5%', textAlign: 'center' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginTop: '40px' },
    phiCard: { padding: '40px', backgroundColor: '#ffffff', borderRadius: '20px', textAlign: 'left', border: '1px solid #f0f0f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
    teamSection: { padding: '80px 5%', backgroundColor: '#fcfcfd' },
    teamGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '40px' },
    teamCard: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee', transition: 'transform 0.2s ease' },
    memberImg: { height: '280px', backgroundColor: '#6b6382', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', opacity: 0.8 },
    memberInfo: { padding: '20px', backgroundColor: '#ffffff' } 
  };

  return (
    <div style={styles.container}>
      {/* SECTION 1: HERO */}
      <section style={styles.heroSection}>
        <div style={styles.heroTextSide}>
          <span style={{ color: '#6b6382', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.9rem' }}>Capstone Research Project</span>
          <h1 style={{ fontSize: '3rem', margin: '15px 0', color: '#1a1a1a', fontWeight: '800' }}>EventEase: A Localized Booking Solution</h1>
          <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.7' }}>
            Developed as a specialized capstone study, EventEase streamlines venue selection and event logistics within Metro Manila.
          </p>
        </div>
        <div style={styles.heroImageSide}></div>
      </section>

      {/* SECTION 2: RESEARCH OBJECTIVES */}
      <section style={styles.philosophySection}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: '700' }}>Research Framework</h2>
        <div style={styles.grid3}>
          <div style={styles.phiCard}>
            <div style={{ color: '#6b6382', fontSize: '1.8rem', marginBottom: '15px' }}>●</div>
            <h3 style={{ marginBottom: '10px' }}>UX Optimization</h3>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>Analyzing user conversion through a streamlined React dashboard.</p>
          </div>
          <div style={styles.phiCard}>
            <div style={{ color: '#6b6382', fontSize: '1.8rem', marginBottom: '15px' }}>●</div>
            <h3 style={{ marginBottom: '10px' }}>Data Integrity</h3>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>Verifying high-fidelity venue data within the NCR region.</p>
          </div>
          <div style={styles.phiCard}>
            <div style={{ color: '#6b6382', fontSize: '1.8rem', marginBottom: '15px' }}>●</div>
            <h3 style={{ marginBottom: '10px' }}>Scalability</h3>
            <p style={{ color: '#666', fontSize: '0.95rem' }}>Testing MariaDB performance under event booking simulations.</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE TEAM */}
      <section style={styles.teamSection}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', borderLeft: '5px solid #6b6382', paddingLeft: '20px' }}>MEET THE RESEARCHERS</h2>
        <div style={styles.teamGrid}>
          {teamMembers.map((member, i) => (
            <div key={i} style={styles.teamCard}>
              <div style={styles.memberImg}>{member.name.charAt(0)}</div>
              <div style={styles.memberInfo}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>{member.name}</h3>
                <p style={{ color: '#6b6382', fontWeight: '700', fontSize: '0.85rem' }}>{member.role}</p>
                <p style={{ fontSize: '0.85rem', color: '#555' }}>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;