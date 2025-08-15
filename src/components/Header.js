import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ isLoggedIn, currentUser, userRole, handleLogout, setCurrentView, currentView, handleBack, onProfileClick }) => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

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
  <header className={`header ${handleBack ? 'has-back-btn' : ''}`}>
    <div className="header-container">
      {/* Back Button for Mobile - Only show when handleBack is provided */}
      {handleBack && (
        <button className="header-back-btn" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
      )}
      
      <div className="header-left">
        <div className="logo">
          <i className="fas fa-brain"></i>
          <span className="logo-text">EngineerConnect</span>
        </div>
      </div>
      
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-section">
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
            
            {/* Mobile Menu Button */}
            <div className="mobile-only" ref={mobileMenuRef}>
              <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                <i className="fas fa-user-circle"></i>
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
                    <button className="mobile-menu-item" onClick={handleMobileProfileClick}>
                      <i className="fas fa-user"></i>
                      <span>View Profile</span>
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
  </header>
  );
};

export default Header;
