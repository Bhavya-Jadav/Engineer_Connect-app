import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ isLoggedIn, currentUser, userRole, handleLogout, setCurrentView, currentView, handleBack, onProfileClick }) => {
  const navigate = useNavigate();

  return (
  <header className="header">
    <div className="header-container">
      <div className="header-left">
        <div className="logo">
          <i className="fas fa-brain"></i>
          <span>EngineerConnect</span>
        </div>
      </div>
      
      <div className="header-right">
        {isLoggedIn ? (
          <div className="user-section">
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
  </header>
  );
};

export default Header;
