// src/components/UserProfileView.js
import React from 'react';
import Header from './Header';

const UserProfileView = ({ 
  currentUser, 
  isLoggedIn, 
  userRole, 
  handleLogout, 
  setCurrentView, 
  onBack, 
  onEditProfile,
  onProfileClick 
}) => {
  return (
    <div className="user-profile-view">
      <Header 
        isLoggedIn={isLoggedIn} 
        currentUser={currentUser} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        setCurrentView={setCurrentView}
        currentView="profile"
        handleBack={onBack}
        onProfileClick={onProfileClick}
      />
      
      <div className="profile-view-container">
        <div className="profile-view-header">
          <div className="profile-breadcrumb">
            <span onClick={onBack} className="breadcrumb-link">
              <i className="fas fa-arrow-left"></i> Back
            </span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">My Profile</span>
          </div>
        </div>
        
        <div className="profile-view-content">
          <div className="profile-display-card">
            <div className="profile-display-header">
              <div className="profile-display-avatar">
                {currentUser?.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder-display">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              
              <div className="profile-display-info">
                <h1 className="profile-display-name">
                  {currentUser?.name || currentUser?.username || 'User'}
                </h1>
                <div className="profile-display-username">
                  @{currentUser?.username}
                </div>
                <div className="profile-display-role">
                  {userRole === 'admin' ? 'Company Admin' : 'Student'}
                </div>
              </div>
              
              <button 
                className="btn btn-primary edit-profile-btn"
                onClick={onEditProfile}
              >
                <i className="fas fa-edit"></i>
                Edit Profile
              </button>
            </div>
            
            <div className="profile-display-details">
              <div className="profile-detail-section">
                <h3><i className="fas fa-info-circle"></i> Personal Information</h3>
                <div className="profile-detail-grid">
                  <div className="profile-detail-item">
                    <div className="detail-label">
                      <i className="fas fa-envelope"></i>
                      Email
                    </div>
                    <div className="detail-value">
                      {currentUser?.email || 'Not provided'}
                    </div>
                  </div>
                  
                  <div className="profile-detail-item">
                    <div className="detail-label">
                      <i className="fas fa-phone"></i>
                      Phone
                    </div>
                    <div className="detail-value">
                      {currentUser?.phone || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
              
              {userRole === 'student' && (
                <div className="profile-detail-section">
                  <h3><i className="fas fa-graduation-cap"></i> Academic Information</h3>
                  <div className="profile-detail-grid">
                    <div className="profile-detail-item">
                      <div className="detail-label">
                        <i className="fas fa-university"></i>
                        University
                      </div>
                      <div className="detail-value">
                        {currentUser?.university || 'Not provided'}
                      </div>
                    </div>
                    
                    <div className="profile-detail-item">
                      <div className="detail-label">
                        <i className="fas fa-book"></i>
                        Course
                      </div>
                      <div className="detail-value">
                        {currentUser?.course || 'Not provided'}
                      </div>
                    </div>
                    
                    <div className="profile-detail-item">
                      <div className="detail-label">
                        <i className="fas fa-calendar"></i>
                        Academic Year
                      </div>
                      <div className="detail-value">
                        {currentUser?.year ? `Year ${currentUser.year}` : 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {userRole === 'admin' && (
                <div className="profile-detail-section">
                  <h3><i className="fas fa-building"></i> Company Information</h3>
                  <div className="profile-detail-grid">
                    <div className="profile-detail-item">
                      <div className="detail-label">
                        <i className="fas fa-industry"></i>
                        Company Name
                      </div>
                      <div className="detail-value">
                        {currentUser?.companyName || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentUser?.bio && (
                <div className="profile-detail-section">
                  <h3><i className="fas fa-user-circle"></i> About</h3>
                  <div className="profile-bio">
                    {currentUser.bio}
                  </div>
                </div>
              )}
              
              {currentUser?.skills && currentUser.skills.length > 0 && (
                <div className="profile-detail-section">
                  <h3><i className="fas fa-cogs"></i> Skills & Expertise</h3>
                  <div className="profile-skills-display">
                    {currentUser.skills.map((skill, index) => (
                      <span key={index} className="skill-badge-display">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;
