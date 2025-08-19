import React, { useState, useEffect } from 'react';
import Header from './Header';

const ProfilePage = ({ 
  currentUser, 
  isLoggedIn, 
  userRole, 
  handleLogout, 
  setCurrentView, 
  onBack,
  onProfileClick 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    phone: currentUser?.phone || '',
    university: currentUser?.university || '',
    course: currentUser?.course || '',
    year: currentUser?.year || '',
    skills: currentUser?.skills || []
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        phone: currentUser.phone || '',
        university: currentUser.university || '',
        course: currentUser.course || '',
        year: currentUser.year || '',
        skills: currentUser.skills || []
      });
    }
  }, [currentUser]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update local storage and state
        localStorage.setItem('user', JSON.stringify(updatedUser.user));
        showMessage('success', 'Profile updated successfully!');
        setIsEditing(false);
        // Trigger a page refresh to update the current user
        window.location.reload();
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to update profile');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleContinue = () => {
    // Redirect to the main app based on user role
    if (userRole === 'admin') {
      setCurrentView('companyDashboard');
    } else {
      setCurrentView('branchSelect');
    }
  };

  return (
    <div className="profile-page">
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
      
      <div className="profile-page-container">
        <div className="profile-page-header">
          <div className="profile-page-title">
            <h1>Complete Your Profile</h1>
            <p>Tell us more about yourself to get the most out of EngineerConnect</p>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message-bar ${message.type}`}>
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{message.text}</span>
          </div>
        )}

        <div className="profile-page-content">
          <div className="profile-completion-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {currentUser?.profilePicture ? (
                  <img src={currentUser.profilePicture} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              
              <div className="profile-info">
                <h2>{currentUser?.name || currentUser?.username || 'User'}</h2>
                <p className="profile-username">@{currentUser?.username}</p>
                <p className="profile-role">
                  {userRole === 'admin' ? 'Company Admin' : 'Student'}
                </p>
              </div>
              
              <div className="profile-actions">
                {!isEditing ? (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                      ) : (
                        <><i className="fas fa-save"></i> Save Changes</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="profile-edit-form">
                <div className="form-section">
                  <h3><i className="fas fa-user"></i> Personal Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                {userRole === 'student' && (
                  <div className="form-section">
                    <h3><i className="fas fa-graduation-cap"></i> Academic Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>University</label>
                        <input
                          type="text"
                          value={profileData.university}
                          onChange={(e) => setProfileData({...profileData, university: e.target.value})}
                          placeholder="Enter your university"
                        />
                      </div>

                      <div className="form-group">
                        <label>Course/Major</label>
                        <input
                          type="text"
                          value={profileData.course}
                          onChange={(e) => setProfileData({...profileData, course: e.target.value})}
                          placeholder="Enter your course"
                        />
                      </div>

                      <div className="form-group">
                        <label>Year of Study</label>
                        <select
                          value={profileData.year}
                          onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                        >
                          <option value="">Select year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Graduate">Graduate</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-section">
                  <h3><i className="fas fa-info-circle"></i> About</h3>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3><i className="fas fa-code"></i> Skills & Expertise</h3>
                  <div className="skills-input">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button onClick={handleAddSkill} className="add-skill-btn">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="skills-list">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-display">
                <div className="profile-section">
                  <h3><i className="fas fa-user"></i> Personal Information</h3>
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">{profileData.name || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{profileData.email || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{profileData.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {userRole === 'student' && (
                  <div className="profile-section">
                    <h3><i className="fas fa-graduation-cap"></i> Academic Information</h3>
                    <div className="profile-details">
                      <div className="detail-item">
                        <span className="detail-label">University:</span>
                        <span className="detail-value">{profileData.university || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Course:</span>
                        <span className="detail-value">{profileData.course || 'Not provided'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Year:</span>
                        <span className="detail-value">{profileData.year || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {profileData.bio && (
                  <div className="profile-section">
                    <h3><i className="fas fa-info-circle"></i> About</h3>
                    <div className="profile-bio">
                      {profileData.bio}
                    </div>
                  </div>
                )}

                {profileData.skills.length > 0 && (
                  <div className="profile-section">
                    <h3><i className="fas fa-code"></i> Skills & Expertise</h3>
                    <div className="skills-display">
                      {profileData.skills.map((skill, index) => (
                        <span key={index} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="profile-continue">
              <button 
                className="btn btn-primary btn-large"
                onClick={handleContinue}
              >
                <i className="fas fa-arrow-right"></i>
                Continue to EngineerConnect
              </button>
              <p className="continue-note">
                You can always edit your profile later from your account settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
