import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import { API_BASE_URL } from '../utils/api';

const Header = ({ isLoggedIn, currentUser, userRole, handleLogout, setCurrentView, currentView, handleBack, onProfileClick }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <header className="header has-back-btn">
      <div className="header-container">
        {/* Back Button - Now using consistent styling */}
        <button className="header-back-btn" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        
        <div className="header-left">
          <div className="logo">
            <i className="fas fa-brain"></i>
            <span className="logo-text">EngineerConnect</span>
          </div>
        </div>
        
        <div className="header-right">
          {isLoggedIn ? (
            <div className="user-section">
              {/* Notification Bell - Only show for students */}
              {userRole === 'student' && (
                <button 
                  className="notification-bell"
                  onClick={() => setShowNotifications(true)}
                  title="Notifications"
                >
                  <i className="fas fa-bell"></i>
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
              )}
              
              <div className="user-info" onClick={onProfileClick}>
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
                <span className="user-name">
                  {currentUser?.name || currentUser?.username || 'User'}
                </span>
                <span className="user-role">
                  ({userRole === 'company' ? 'Company' : userRole})
                </span>
              </div>
              <button className="btn btn-outline logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-outline" onClick={() => navigate('/login')}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                <i className="fas fa-user-plus"></i>
                <span>Sign Up</span>
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
