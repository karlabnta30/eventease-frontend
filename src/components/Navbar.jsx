import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  // Check if we are on the landing page
  const isIndexPage = location.pathname === '/';

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logoLink}>
        <div style={styles.logoBadge}></div>
        <h2 style={styles.logo}>EventEase</h2>
      </Link>

      <div style={styles.linksContainer}>
        {/* Only show the CTA on the landing page. 
            Once logged in, the Sidebar handles all navigation. */}
        {isIndexPage && (
          <Link to="/login" style={styles.createBtn}>
            Create Event
          </Link>
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
  }
};

export default Navbar;