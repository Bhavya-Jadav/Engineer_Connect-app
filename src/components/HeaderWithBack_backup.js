import React from 'react';
import { useNavigate } from 'react              <button className="btn btn-outline" onClick={() => navigate('/login')}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                <i className="fas fa-user-plus"></i>
                <span>Sign Up</span>
              </button>dom';

const Header = ({ isLoggedIn, currentUser, userRole, handleLogout, setCurrentView, currentView, handleBack, onProfileClick }) => {
  const navigate = useNavigate();
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center' }}>
          {currentView !== 'home' && (
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#3498db', 
                fontSize: '1.2rem', 
                cursor: 'pointer', 
                padding: '8px', 
                marginRight: '10px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onClick={handleBack}
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          )}
          <div className="logo">
            <i className="fas fa-code-branch"></i>
            <span>EngineerConnect</span>
          </div>
        </div>
        <nav className="header-nav">
          {isLoggedIn ? (
            <div className="auth-section">
              <div className="user-info" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
                <div className="user-avatar">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="user-details">
                  <span className="username">{currentUser?.name || currentUser?.username || 'User'}</span>
                  <span className="user-role">
                    {userRole === 'admin' ? 'Admin' : 
                     userRole === 'company' ? 'Company' : 
                     'Student'}
                  </span>
                </div>
              </div>
              <button className="btn btn-outline" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-outline" onClick={() => setCurrentView('login')}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentView('signup')}>
                <i className="fas fa-user-plus"></i>
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;