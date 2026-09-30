import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isIndexPage = location.pathname === '/';

  const [userName, setUserName] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Check if token exists and try to read user info if stored, or fetch it
    const storedUser = localStorage.getItem('userName') || localStorage.getItem('user');
    if (token) {
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
    } else {
      setUserName(null);
    }
  }, [token, location]);

  const handleDashboardRedirect = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') navigate('/admin-dashboard');
    else if (userRole === 'vendor') navigate('/vendor-dashboard');
    else navigate('/main-dashboard');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logoLink}>
        <div style={styles.logoBadge}></div>
        <h2 style={styles.logo}>EventEase</h2>
      </Link>

      <div style={styles.linksContainer}>
        {isIndexPage && (
          token ? (
            <button onClick={handleDashboardRedirect} style={styles.dashboardBtn}>
              <span style={styles.userDot}></span>
              {userName ? `Hi, ${userName}` : 'Go to Dashboard'}
            </button>
          ) : (
            <Link to="/login" style={styles.createBtn}>
              Create Event
            </Link>
          )
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '18px 60px', 
    background: '#ffffff', 
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 1100,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
  },
  logoLink: { textDecoration: 'none', color: '#000000', display: 'flex', alignItems: 'center', gap: '8px' },
  logoBadge: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
  },
  logo: { margin: 0, fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase' },
  linksContainer: { display: 'flex', alignItems: 'center', gap: '20px' },
  createBtn: {
    backgroundColor: '#000000', 
    color: '#ffffff', 
    padding: '11px 24px',
    borderRadius: '12px', 
    textDecoration: 'none', 
    fontSize: '0.85rem', 
    fontWeight: '900',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease'
  },
  dashboardBtn: {
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    padding: '10px 20px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  },
  userDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#10b981',
    borderRadius: '50%'
  }
};

export default Navbar;