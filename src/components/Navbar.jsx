import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  // Check if we are on the landing page
  const isIndexPage = location.pathname === '/';

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logoLink}>
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
    padding: '15px 40px', 
    background: '#ffffff', 
    borderBottom: '1px solid #e0e0e0',
    // Ensures the navbar stays on top of the sidebar during scroll
    position: 'sticky',
    top: 0,
    zIndex: 1100 
  },
  logoLink: { textDecoration: 'none', color: '#000000' },
  logo: { margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' },
  linksContainer: { display: 'flex', alignItems: 'center', gap: '20px' },
  createBtn: {
    backgroundColor: '#1a1a1a', 
    color: '#ffffff', 
    padding: '8px 18px',
    borderRadius: '6px', 
    textDecoration: 'none', 
    fontSize: '13px', 
    fontWeight: '600',
    transition: 'background 0.2s ease'
  }
};

export default Navbar;