import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import { API_BASE_URL } from '../utils/api';
import '../styles/Header-1.css';

const Header = ({ isLoggedIn, currentUser, userRole, handleLogout, setCurrentView, currentView, handleBack, onProfileClick }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

  // Fetch unread notifications count
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications?unreadOnly=true&limit=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationUpdate = () => {
    fetchUnreadCount();
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileProfileClick = () => {
    setShowMobileMenu(false);
    onProfileClick();
  };

  const handleMobileLogout = () => {
    setShowMobileMenu(false);
    handleLogout();
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  return (
    <header className="header has-back-btn">
      <div className="header-container">
        {/* Back Button */}
        <button className="header-back-btn" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        
        <div className="header-left">
                  <div className="logo">
          <i className="fas fa-brain"></i>
          <div className="logo-content">
            <span className="logo-text">SKILLINK</span>
          </div>
        </div>
        </div>
        
        <div className="header-right">
          {isLoggedIn ? (
            <div className="user-section">
              {/* Desktop Notification Bell */}
              {userRole === 'student' && (
                <button 
                  className="notification-bell desktop-only"
                  onClick={() => setShowNotifications(true)}
                  title="Notifications"
                >
                  <i className="fas fa-bell"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
              )}
              
              {/* Desktop User Info */}
              <div className="user-info desktop-only" onClick={onProfileClick}>
                {currentUser?.profilePicture ? (
                  <img 
                    src={currentUser.profilePicture} 
                    alt="Profile" 
                    className="profile-picture"
                  />
                ) : (
                  <div className="profile-picture-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
                <div className="user-details">
                  <span className="user-name">
                    {currentUser?.name || currentUser?.username || 'User'}
                  </span>
                  <span className="user-role">
                    ({userRole === 'company' ? 'Company' : userRole})
                  </span>
                </div>
              </div>
              
              {/* Desktop Edit Profile Button */}
              <button className="btn btn-secondary edit-profile-btn desktop-only" onClick={() => navigate('/profile')}>
                <i className="fas fa-edit"></i>
                <span className="btn-text">Edit Profile</span>
              </button>
              
              {/* Mobile Menu Button with Notification Indicator */}
              <div className="mobile-only" ref={mobileMenuRef}>
                <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                  <i className="fas fa-user-circle"></i>
                  {userRole === 'student' && unreadCount > 0 && (
                    <span className="notification-badge mobile-notification">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
                
                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                  <div className="mobile-menu-dropdown">
                    <div className="mobile-menu-header">
                      <div className="mobile-user-info">
                        {currentUser?.profilePicture ? (
                          <img 
                            src={currentUser.profilePicture} 
                            alt="Profile" 
                            className="mobile-profile-picture"
                          />
                        ) : (
                          <div className="mobile-profile-placeholder">
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                        <div className="mobile-user-details">
                          <span className="mobile-user-name">
                            {currentUser?.name || currentUser?.username || 'User'}
                          </span>
                          <span className="mobile-user-role">
                            {userRole === 'company' ? 'Company' : userRole}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mobile-menu-actions">
                      {userRole === 'student' && (
                        <button className="mobile-menu-item" onClick={() => { setShowMobileMenu(false); setShowNotifications(true); }}>
                          <i className="fas fa-bell"></i>
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="menu-notification-badge">{unreadCount}</span>
                          )}
                        </button>
                      )}
                      <button className="mobile-menu-item" onClick={handleMobileProfileClick}>
                        <i className="fas fa-user"></i>
                        <span>View Profile</span>
                      </button>
                      <button className="mobile-menu-item" onClick={() => { setShowMobileMenu(false); navigate('/profile'); }}>
                        <i className="fas fa-edit"></i>
                        <span>Edit Profile</span>
                      </button>
                      <button className="mobile-menu-item logout" onClick={handleMobileLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Desktop Logout Button */}
              <button className="btn btn-outline logout-btn desktop-only" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span className="btn-text">Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-outline" onClick={() => navigate('/login')}>
                <i className="fas fa-sign-in-alt"></i>
                <span className="btn-text">Sign In</span>
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                <i className="fas fa-user-plus"></i>
                <span className="btn-text">Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        currentUser={currentUser}
        onConnectionUpdate={handleNotificationUpdate}
      />
    </header>
  );
};

export default Header;
