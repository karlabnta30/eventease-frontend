import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, CalendarDays, PlusCircle, ChevronLeft, ChevronRight, 
  LogOut, MessageSquare, Info, Mail, List, Bell 
} from 'lucide-react';

const Sidebar = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';

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
      { 
        name: 'Messages', 
        icon: <MessageSquare size={18} />, 
        path: '/messages' 
      },
      { 
        name: 'Notifications', 
        icon: <Bell size={18} />, 
        path: '/notifications' 
      },
    ];

    if (userRole !== 'vendor') {
      baseItems.push({ name: 'Live Events', icon: <CalendarDays size={18} />, path: '/live-events' });
    }

    if (userRole === 'admin') {
      return [...baseItems, { name: 'Client Feedback', icon: <MessageSquare size={18} />, path: '/admin-feedback' }];
    } 
    
    if (userRole === 'vendor') {
      return [...baseItems, { name: 'My Services', icon: <List size={18} />, path: '/vendor-services' }];
    }

    return [
      ...baseItems,
      { name: 'About', icon: <Info size={18} />, path: '/about' },
      { name: 'Contact', icon: <Mail size={18} />, path: '/contact' }
    ];
  };

  const menuItems = getMenuItems();

  const styles = {
    layout: { 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden' 
    },
    sidebar: {
      width: isCollapsed ? '70px' : '240px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #eee',
      padding: '15px 10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'width 0.2s ease-in-out',
      flexShrink: 0
    },
    menuContainer: {
      overflowY: 'auto',
      overflowX: 'hidden',
      flex: 1,
      paddingRight: '4px'
    },
    profileSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      gap: '10px',
      padding: '10px',
      marginBottom: '15px',
      borderRadius: '10px',
      cursor: 'pointer',
      backgroundColor: location.pathname === '/profile' ? '#f4f1ea' : 'transparent',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '14px',
      flexShrink: 0
    },
    createBtn: {
      display: userRole === 'admin' ? 'none' : 'flex',
      alignItems: 'center', 
      gap: isCollapsed ? '0' : '10px',
      padding: '10px', 
      borderRadius: '10px',
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      cursor: 'pointer', 
      border: 'none',
      marginBottom: '15px', 
      fontWeight: '700', 
      width: '100%', 
      fontSize: '12px',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
    },
    bottomSection: {
      borderTop: '1px solid #eee',
      paddingTop: '10px',
      marginTop: '10px'
    },
    mainContent: { 
      flex: 1, 
      backgroundColor: '#fcfcfd', 
      overflowY: 'auto', 
      height: '100vh',
      padding: '20px'
    },
    navItem: (isActive) => ({
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      gap: isCollapsed ? '0' : '10px', 
      padding: '12px',
      borderRadius: '8px',
      cursor: 'pointer', 
      marginBottom: '4px', 
      backgroundColor: isActive ? '#f4f1ea' : 'transparent',
      color: isActive ? '#1a1a1a' : '#555', 
      fontWeight: isActive ? '700' : '400', 
      fontSize: '13px',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
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
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#1a1a1a' }}>{userName}</p>
                <p style={{ margin: 0, fontSize: '10px', color: '#888' }}>{userRole}</p>
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
              {!isCollapsed && <span>{userRole === 'vendor' ? 'ADD SERVICE' : 'CREATE EVENT'}</span>}
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
              {!isCollapsed && <span style={{ marginLeft: '10px' }}>{item.name}</span>}
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
            {!isCollapsed && <span style={{ marginLeft: '10px' }}>Collapse</span>}
          </div>
          
          <div 
            style={{ ...styles.navItem(false), color: '#ff4d4d' }} 
            onClick={handleLogout}
          >
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px' }}>
                <LogOut size={18} /> 
            </div>
            {!isCollapsed && <span style={{ marginLeft: '10px' }}>Sign Out</span>}
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