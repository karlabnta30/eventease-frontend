import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, CalendarDays, PlusCircle, ChevronLeft, ChevronRight, 
  LogOut, MessageSquare, Mail, List, Bell, Calendar 
} from 'lucide-react';

const Sidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getMenuItems = () => {
    const baseItems = [
      { 
        name: 'Home', 
        icon: <Home size={18} />, 
        path: userRole === 'admin' ? '/admin-dashboard' : (userRole === 'vendor' ? '/vendor-dashboard' : '/main-dashboard') 
      },
      { name: 'Messages', icon: <MessageSquare size={18} />, path: '/messages' },
      { name: 'Notifications', icon: <Bell size={18} />, path: '/notifications' },
    ];

    if (userRole !== 'vendor') {
      baseItems.push({ name: 'Live Events', icon: <CalendarDays size={18} />, path: '/live-events' });
    }

    if (userRole === 'admin') {
      return [...baseItems, { name: 'Client Feedback', icon: <MessageSquare size={18} />, path: '/admin-feedback' }];
    } 
    
    if (userRole === 'vendor') {
      return [
        ...baseItems, 
        { name: 'My Services', icon: <List size={18} />, path: '/vendor-services' },
        { name: 'Vendor Events', icon: <Calendar size={18} />, path: '/vendor-events' }
      ];
    }

    return [
      ...baseItems,
      { name: 'Contact', icon: <Mail size={18} />, path: '/contact' }
    ];
  };

  const menuItems = getMenuItems();

  const styles = {
    layout: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      height: isMobile ? 'auto' : '100vh', 
      width: '100vw', 
      overflowX: 'hidden' 
    },
    sidebar: {
      width: isMobile ? '100%' : (isCollapsed ? '80px' : '280px'),
      backgroundColor: '#ffffff',
      borderRight: isMobile ? 'none' : '1px solid #f1f5f9',
      borderBottom: isMobile ? '1px solid #f1f5f9' : 'none',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column', 
      justifyContent: 'space-between',
      alignItems: isMobile ? 'center' : 'stretch',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      flexShrink: 0,
      boxShadow: isMobile ? '0 4px 6px -1px rgba(0,0,0,0.02)' : '4px 0 25px rgba(0,0,0,0.01)',
      zIndex: 100
    },
    menuContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      overflowX: isMobile ? 'auto' : 'hidden',
      overflowY: 'auto',
      flex: 1,
      gap: isMobile ? '10px' : '6px',
      alignItems: isMobile ? 'center' : 'stretch',
      width: '100%'
    },
    profileSection: {
      display: isMobile ? 'none' : 'flex', 
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      gap: '12px',
      padding: '12px',
      marginBottom: '18px',
      borderRadius: '16px',
      cursor: 'pointer',
      backgroundColor: location.pathname === '/profile' ? '#f8fafc' : 'transparent',
      transition: 'background-color 0.2s ease',
      border: location.pathname === '/profile' ? '1px solid #e2e8f0' : '1px solid transparent'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '800',
      fontSize: '15px',
      flexShrink: 0,
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
    },
    createBtn: {
      display: userRole === 'admin' ? 'none' : 'flex',
      alignItems: 'center', 
      gap: isCollapsed ? '0' : '10px',
      padding: '14px 16px', 
      borderRadius: '14px',
      backgroundColor: '#0f172a', 
      color: 'white', 
      cursor: 'pointer', 
      border: 'none',
      marginBottom: isMobile ? '0' : '20px', 
      fontWeight: '800', 
      fontSize: '0.82rem',
      letterSpacing: '0.5px',
      justifyContent: 'center',
      boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
      transition: 'all 0.2s ease',
    },
    bottomSection: {
      display: isMobile ? 'none' : 'block', 
      borderTop: '1px solid #f1f5f9',
      paddingTop: '16px',
      marginTop: '10px'
    },
    mainContent: { 
      flex: 1, 
      backgroundColor: '#f8fafc', 
      overflowY: 'auto', 
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box'
    },
    navItem: (isActive, isHovered) => ({
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
      gap: '12px', 
      padding: '12px 14px', 
      borderRadius: '12px',
      cursor: 'pointer', 
      backgroundColor: isActive ? '#f1f5f9' : (isHovered ? '#f8fafc' : 'transparent'),
      color: isActive ? '#0f172a' : (isHovered ? '#1e293b' : '#64748b'), 
      fontWeight: isActive ? '800' : '600', 
      fontSize: '0.9rem', 
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
      position: 'relative',
      transform: isHovered && !isActive ? 'translateX(4px)' : 'none'
    })
  };

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        
        <div style={styles.menuContainer}>
          {/* Profile Section */}
          <div 
            style={styles.profileSection} 
            onClick={() => navigate('/profile')}
            title={isCollapsed ? userName : ''}
          >
            <div style={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{userName}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize', fontWeight: '600' }}>{userRole}</p>
              </div>
            )}
          </div>

          {/* Create Button */}
          {userRole !== 'admin' && (
            <button 
              style={styles.createBtn} 
              onClick={() => navigate(userRole === 'vendor' ? '/add-service' : '/create-event')}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <PlusCircle size={18} />
              {!isCollapsed && !isMobile && <span>{userRole === 'vendor' ? 'ADD SERVICE' : 'CREATE EVENT'}</span>}
            </button>
          )}

          {/* Menu Items */}
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === item.name;

            return (
              <div 
                key={item.name} 
                style={styles.navItem(isActive, isHovered)} 
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                title={isCollapsed ? item.name : ''}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', color: isActive ? '#0f172a' : 'inherit' }}>
                  {item.icon}
                </div>
                {(!isCollapsed || isMobile) && <span style={{ display: isMobile ? 'none' : 'inline' }}>{item.name}</span>}
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div style={styles.bottomSection}>
          <div 
            style={styles.navItem(false, hoveredItem === 'Collapse')} 
            onClick={() => setIsCollapsed(!isCollapsed)}
            onMouseEnter={() => setHoveredItem('Collapse')}
            onMouseLeave={() => setHoveredItem(null)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </div>
            {!isCollapsed && <span style={{ marginLeft: '4px' }}>Collapse</span>}
          </div>
          
          <div 
            style={{ ...styles.navItem(false, hoveredItem === 'Sign Out'), color: '#dc2626' }} 
            onClick={handleLogout}
            onMouseEnter={() => setHoveredItem('Sign Out')}
            onMouseLeave={() => setHoveredItem(null)}
            title="Sign Out"
          >
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                <LogOut size={18} /> 
            </div>
            {!isCollapsed && <span style={{ marginLeft: '4px' }}>Sign Out</span>}
          </div>
        </div>

      </div>
      
      <div style={styles.mainContent}>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;