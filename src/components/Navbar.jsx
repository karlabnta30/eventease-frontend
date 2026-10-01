import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isIndexPage = location.pathname === '/';

  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
      setUserRole(null);
      return;
    }

    const storedUser = localStorage.getItem('userName') || localStorage.getItem('user');
    const role = localStorage.getItem('userRole');
    setUserRole(role);

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
    if (userRole === 'admin') navigate('/admin-dashboard');
    else if (userRole === 'vendor') navigate('/vendor-dashboard');
    else navigate('/main-dashboard');
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    setDropdownOpen(false);
    navigate('/login');
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
    },
    logo: { 
      margin: 0, 
      fontSize: isMobile ? '1.1rem' : '1.4rem', 
      fontWeight: '900', 
      letterSpacing: '-1px', 
      textTransform: 'uppercase',
      color: '#000000'
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
      whiteSpace: 'nowrap'
    },
    profileContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    profileBtn: {
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      padding: '8px 14px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      fontSize: '0.85rem',
      fontWeight: '700',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
    },
    avatarCircle: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: '#10b981',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    dropdownMenu: {
      position: 'absolute',
      right: 0,
      top: 'calc(100% + 8px)',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      width: '180px',
      overflow: 'hidden',
      zIndex: 1200,
      display: 'flex',
      flexDirection: 'column'
    },
    dropdownItem: {
      padding: '12px 16px',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#334155',
      background: 'transparent',
      border: 'none',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
      borderBottom: '1px solid #f1f5f9'
    }
  };

  return (
    <nav style={dynamicStyles.nav}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
        <h2 style={dynamicStyles.logo}>EventEase</h2>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {hasToken ? (
          <div style={dynamicStyles.profileContainer}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              style={dynamicStyles.profileBtn}
            >
              <div style={dynamicStyles.avatarCircle}>
                {userName ? userName.charAt(0).toUpperCase() : <User size={14} />}
              </div>
              <span>{userName ? `Hi, ${userName}` : 'Account'}</span>
              <ChevronDown size={14} />
            </button>

            {dropdownOpen && (
              <div style={dynamicStyles.dropdownMenu}>
                <button 
                  onClick={handleDashboardRedirect} 
                  style={dynamicStyles.dropdownItem}
                >
                  Dashboard
                </button>
                <Link 
                  to="/profile" 
                  onClick={() => setDropdownOpen(false)} 
                  style={dynamicStyles.dropdownItem}
                >
                  Profile Settings
                </Link>
                <button 
                  onClick={handleLogout} 
                  style={{ ...dynamicStyles.dropdownItem, color: '#ef4444', borderBottom: 'none' }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={dynamicStyles.createBtn}>
            Sign In / Register
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;