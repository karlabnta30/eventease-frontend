import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const styles = {
    // 1. Immersive Full-Screen Container using the provided Unsplash image
    container: {
      position: 'relative',
      width: '100vw',
      height: '100vh',
      // The direct link you provided, set at highest quality (q=100)
      backgroundImage: `url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1920&q=100')`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: '#ffffff',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif', // Clean modern font
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      overflow: 'hidden',
    },
    // 2. Dark Overlay for Cinematic Feel and text readability
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.45)', // Cinematic mask (matching image_11.png)
      zIndex: 1,
    },
    // 3. Main Content Wrapper (Profile, Heading, Button)
    content: {
      position: 'relative',
      zIndex: 2, // Ensures content sits above the overlay
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 24px',
    },
    // 4. Large Heavy Branding Heading (EventEase)
    heading: {
      fontSize: '6rem', 
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      margin: '0 0 15px 0',
      lineHeight: '1',
      textShadow: '0 4px 15px rgba(0,0,0,0.4)',
    },
    // 5. Sleek Minimalist Subheading
    subheading: {
      fontSize: '1.2rem',
      maxWidth: '650px',
      fontWeight: '400',
      lineHeight: '1.6',
      margin: '0 0 45px 0',
      opacity: '0.9',
      letterSpacing: '0.5px'
    },
    // 6. Pill-Shaped Outlined Button (Matching reference)
    createButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 44px',
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '2px solid #ffffff',
      borderRadius: '50px', // Perfect pill shape
      fontSize: '1rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      letterSpacing: '2px',
    },
    // 7. Styling for the optional arrow character
    arrow: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      marginLeft: '4px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Visual cinematic mask */}
      <div style={styles.overlay}></div>

      {/* Main Content Area */}
      <div style={styles.content}>
        
        {/* Large, bold, uppercase branding heading */}
        <h1 style={styles.heading}>
          EventEase
        </h1>
        
        {/* Sleek subheading with original text */}
        <p style={styles.subheading}>
          Your perfect event starts here. Where turning your moments into unforgettable events. Book Now!
        </p>

        {/* The "Create Event >" button */}
        <button 
          style={styles.createButton}
          onClick={() => navigate('/login')} // Redirects to login
          onMouseOver={(e) => {
            // Fill button with white on hover (matching image_11.png)
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.color = '#000000';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            // Revert on mouse out
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <span>Create Event</span>
          {/* Simple character arrow */}
          <span style={styles.arrow}>&rsaquo;</span> 
        </button>

      </div>
    </div>
  );
};

export default LandingPage;