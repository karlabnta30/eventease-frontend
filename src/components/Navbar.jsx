import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isIndexPage = location.pathname === '/';

  const [userName, setUserName] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    
    if (!currentToken) {
      setUserName(null);
      return;
    }

    const storedUser = localStorage.getItem('userName') || localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserName(parsed.name || parsed);
      } catch {
        setUserName(storedUser);
      }
    } else {
      setUserName('Account');
    }
  }, [location]);

  const handleDashboardRedirect = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') navigate('/admin-dashboard');
    else if (userRole === 'vendor') navigate('/vendor-dashboard');
    else navigate('/dashboard');
  };

  const hasToken = !!localStorage.getItem('token');

  const dynamicStyles = {
    nav: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: isMobile ? '14px 20px' : '18px 60px', 
      background: '#ffffff', 
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 1100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
      flexWrap: 'wrap',
      gap: '10px',
    },
    logo: { 
      margin: 0, 
      fontSize: isMobile ? '1.1rem' : '1.4rem', 
      fontWeight: '900', 
      letterSpacing: '-1px', 
      textTransform: 'uppercase' 
    },
    createBtn: {
      backgroundColor: '#000000', 
      color: '#ffffff', 
      padding: isMobile ? '8px 16px' : '11px 24px',
      borderRadius: '12px', 
      textDecoration: 'none', 
      fontSize: isMobile ? '0.75rem' : '0.85rem', 
      fontWeight: '900',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    },
    dashboardBtn: {
      backgroundColor: '#f1f5f9',
      color: '#0f172a',
      padding: isMobile ? '8px 14px' : '10px 20px',
      borderRadius: '12px',
      border: '1px solid #cbd5e1',
      fontSize: isMobile ? '0.75rem' : '0.85rem',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    }
  };

  return (
    <nav style={dynamicStyles.nav}>
      <Link to="/" style={styles.logoLink}>
        <div style={styles.logoBadge}></div>
        <h2 style={dynamicStyles.logo}>EventEase</h2>
      </Link>

      <div style={styles.linksContainer}>
        {isIndexPage && (
          hasToken ? (
            <button onClick={handleDashboardRedirect} style={dynamicStyles.dashboardBtn}>
              <span style={styles.userDot}></span>
              {userName ? `Hi, ${userName}` : 'Go to Dashboard'}
            </button>
          ) : (
            <Link to="/login" style={dynamicStyles.createBtn}>
              Create Event
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

const styles = {
  logoLink: { textDecoration: 'none', color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' },
  logoBadge: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
  },
  linksContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  userDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#10b981',
    borderRadius: '50%'
  }
};

export default Navbar;