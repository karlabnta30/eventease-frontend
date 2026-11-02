import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, CalendarDays, PlusCircle, ChevronLeft, ChevronRight, 
  LogOut, MessageSquare, Mail, List, Bell, Calendar 
} from 'lucide-react';

const Sidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
      // Pinalaki ang expanded width mula 240px patungong 300px para mas maluwag ang content
      width: isMobile ? '100%' : (isCollapsed ? '80px' : '300px'),
      backgroundColor: '#ffffff',
      borderRight: isMobile ? 'none' : '1px solid #eee',
      borderBottom: isMobile ? '1px solid #eee' : 'none',
      padding: '20px 16px', // Pinalaki nang konti ang padding para mas balanse
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column', 
      justifyContent: 'space-between',
      alignItems: isMobile ? 'center' : 'stretch',
      transition: 'width 0.2s ease-in-out',
      flexShrink: 0
    },
    menuContainer: {
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      overflowX: isMobile ? 'auto' : 'hidden',
      overflowY: 'auto',
      flex: 1,
      gap: isMobile ? '10px' : '4px',
      alignItems: isMobile ? 'center' : 'stretch',
      paddingRight: '4px',
      width: '100%'
    },
    profileSection: {
      display: isMobile ? 'none' : 'flex', 
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      gap: '12px',
      padding: '12px',
      marginBottom: '15px',
      borderRadius: '12px',
      cursor: 'pointer',
      backgroundColor: location.pathname === '/profile' ? '#f4f1ea' : 'transparent',
    },
    avatar: {
      width: '38px', // Pinalaki ang avatar para maging angkop sa bagong lapad
      height: '38px',
      borderRadius: '50%',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '15px',
      flexShrink: 0
    },
    createBtn: {
      display: userRole === 'admin' ? 'none' : 'flex',
      alignItems: 'center', 
      gap: isCollapsed ? '0' : '10px',
      padding: '12px 14px', 
      borderRadius: '12px',
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      cursor: 'pointer', 
      border: 'none',
      marginBottom: isMobile ? '0' : '18px', 
      fontWeight: '700', 
      fontSize: '13px',
      justifyContent: 'center',
    },
    bottomSection: {
      display: isMobile ? 'none' : 'block', 
      borderTop: '1px solid #eee',
      paddingTop: '12px',
      marginTop: '10px'
    },
    mainContent: { 
      flex: 1, 
      backgroundColor: '#fcfcfd', 
      overflowY: 'auto', 
      minHeight: '100vh',
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box'
    },
    navItem: (isActive) => ({
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
      gap: '12px', 
      padding: '12px 14px', // Pinalaki ang padding para mas madaling i-click at lumawak tingnan
      borderRadius: '10px',
      cursor: 'pointer', 
      backgroundColor: isActive ? '#f4f1ea' : 'transparent',
      color: isActive ? '#1a1a1a' : '#555', 
      fontWeight: isActive ? '700' : '400', 
      fontSize: '14px', // Pinalaki nang konti ang font size para sa mas magandang readability
      whiteSpace: 'nowrap',
    })
  };

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        
        <div style={styles.menuContainer}>
          {/* Profile Section */}
          <div style={styles.profileSection} onClick={() => navigate('/profile')}>
            <div style={styles.avatar}>{userName.charAt(0).toUpperCase()}</div>
            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1a1a1a' }}>{userName}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#888', textTransform: 'capitalize' }}>{userRole}</p>
              </div>
            )}
          </div>

          {/* Create Button */}
          {userRole !== 'admin' && (
            <button 
              style={styles.createBtn} 
              onClick={() => navigate(userRole === 'vendor' ? '/add-service' : '/create-event')}
            >
              <PlusCircle size={18} />
              {!isCollapsed && !isMobile && <span>{userRole === 'vendor' ? 'ADD SERVICE' : 'CREATE EVENT'}</span>}
            </button>
          )}

          {/* Menu Items */}
          {menuItems.map((item) => (
            <div 
              key={item.name} 
              style={styles.navItem(location.pathname === item.path)} 
              onClick={() => navigate(item.path)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                {item.icon}
              </div>
              {(!isCollapsed || isMobile) && <span style={{ display: isMobile ? 'none' : 'inline' }}>{item.name}</span>}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div style={styles.bottomSection}>
          <div 
            style={styles.navItem(false)} 
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </div>
            {!isCollapsed && <span style={{ marginLeft: '4px' }}>Collapse</span>}
          </div>
          
          <div 
            style={{ ...styles.navItem(false), color: '#ff4d4d' }} 
            onClick={handleLogout}
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