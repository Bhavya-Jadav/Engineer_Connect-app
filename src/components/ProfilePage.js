import React, { useState, useEffect } from 'react';
import Header from './Header';
import { API_BASE_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

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
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedUser.user));
        showMessage('success', 'Profile updated successfully!');
        setIsEditing(false);
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
    if (userRole === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/feed');
    }
  };

  const getProfileCompletionPercentage = () => {
    const fields = ['name', 'email', 'bio', 'phone', 'university', 'course', 'year'];
    const completedFields = fields.filter(field => profileData[field] && profileData[field].trim() !== '');
    return Math.round((completedFields.length / fields.length) * 100);
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
        {/* Hero Section */}
        <div className="profile-hero">
          <div className="profile-hero-content">
            <div className="profile-hero-text">
              <h1>Complete Your Profile</h1>
              <p>Build your professional presence and connect with the engineering community</p>
            </div>
            <div className="profile-completion-indicator">
              <div className="completion-circle">
                <svg viewBox="0 0 36 36" className="completion-ring">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3498db"
                    strokeWidth="2"
                    strokeDasharray={`${getProfileCompletionPercentage()}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="completion-text">
                  <span className="completion-percentage">{getProfileCompletionPercentage()}%</span>
                  <span className="completion-label">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message-toast ${message.type}`}>
            <div className="message-content">
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{message.text}</span>
            </div>
            <button className="message-close" onClick={() => setMessage({ type: '', text: '' })}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <div className="profile-content">
          <div className="profile-card">
            {/* Profile Header */}
            <div className="profile-header-modern">
              <div className="profile-avatar-section">
                <div className="profile-avatar-modern">
                  {currentUser?.profilePicture ? (
                    <img src={currentUser.profilePicture} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder-modern">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                  <div className="avatar-badge">
                    <i className="fas fa-camera"></i>
                  </div>
                </div>
                <div className="profile-info-modern">
                  <h2>{currentUser?.name || currentUser?.username || 'User'}</h2>
                  <p className="profile-username-modern">@{currentUser?.username}</p>
                  <div className="profile-role-badge">
                    <i className={`fas ${userRole === 'admin' ? 'fa-building' : 'fa-graduation-cap'}`}></i>
                    {userRole === 'admin' ? 'Company Admin' : 'Student'}
                  </div>
                </div>
              </div>
              
              <div className="profile-actions-modern">
                {!isEditing ? (
                  <button 
                    className="btn-edit-profile"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-edit"></i>
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="edit-actions-modern">
                    <button 
                      className="btn-cancel"
                      onClick={() => setIsEditing(false)}
                    >
                      <i className="fas fa-times"></i>
                      <span>Cancel</span>
                    </button>
                    <button 
                      className="btn-save"
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Content */}
            {isEditing ? (
              <div className="profile-edit-modern">
                {/* Personal Information */}
                <div className="form-section-modern">
                  <div className="section-header">
                    <div className="section-icon">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="section-title">
                      <h3>Personal Information</h3>
                      <p>Basic details about yourself</p>
                    </div>
                  </div>
                  <div className="form-grid-modern">
                    <div className="form-group-modern">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        placeholder="Enter your full name"
                        className="input-modern"
                      />
                    </div>

                    <div className="form-group-modern">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        placeholder="Enter your email"
                        className="input-modern"
                      />
                    </div>

                    <div className="form-group-modern">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="Enter your phone number"
                        className="input-modern"
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information for Students */}
                {userRole === 'student' && (
                  <div className="form-section-modern">
                    <div className="section-header">
                      <div className="section-icon">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                      <div className="section-title">
                        <h3>Academic Information</h3>
                        <p>Your educational background</p>
                      </div>
                    </div>
                    <div className="form-grid-modern">
                      <div className="form-group-modern">
                        <label>University</label>
                        <input
                          type="text"
                          value={profileData.university}
                          onChange={(e) => setProfileData({...profileData, university: e.target.value})}
                          placeholder="Enter your university"
                          className="input-modern"
                        />
                      </div>

                      <div className="form-group-modern">
                        <label>Course/Major</label>
                        <input
                          type="text"
                          value={profileData.course}
                          onChange={(e) => setProfileData({...profileData, course: e.target.value})}
                          placeholder="Enter your course"
                          className="input-modern"
                        />
                      </div>

                      <div className="form-group-modern">
                        <label>Year of Study</label>
                        <select
                          value={profileData.year}
                          onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                          className="input-modern"
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

                {/* About Section */}
                <div className="form-section-modern">
                  <div className="section-header">
                    <div className="section-icon">
                      <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="section-title">
                      <h3>About</h3>
                      <p>Tell us about yourself</p>
                    </div>
                  </div>
                  <div className="form-group-modern full-width">
                    <label>Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Share your story, interests, and what drives you..."
                      rows="4"
                      className="input-modern"
                    />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="form-section-modern">
                  <div className="section-header">
                    <div className="section-icon">
                      <i className="fas fa-code"></i>
                    </div>
                    <div className="section-title">
                      <h3>Skills & Expertise</h3>
                      <p>Showcase your technical skills</p>
                    </div>
                  </div>
                  <div className="skills-input-modern">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g., JavaScript, Python, React)"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                      className="input-modern"
                    />
                    <button onClick={handleAddSkill} className="add-skill-btn-modern">
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="skills-list-modern">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag-modern">
                        <span className="skill-text">{skill}</span>
                        <button onClick={() => handleRemoveSkill(skill)} className="skill-remove">
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-display-modern">
                {/* Personal Information Display */}
                <div className="profile-section-modern">
                  <div className="section-header">
                    <div className="section-icon">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="section-title">
                      <h3>Personal Information</h3>
                    </div>
                  </div>
                  <div className="profile-details-modern">
                    <div className="detail-item-modern">
                      <span className="detail-label-modern">Full Name</span>
                      <span className="detail-value-modern">{profileData.name || 'Not provided'}</span>
                    </div>
                    <div className="detail-item-modern">
                      <span className="detail-label-modern">Email Address</span>
                      <span className="detail-value-modern">{profileData.email || 'Not provided'}</span>
                    </div>
                    <div className="detail-item-modern">
                      <span className="detail-label-modern">Phone Number</span>
                      <span className="detail-value-modern">{profileData.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Information Display for Students */}
                {userRole === 'student' && (
                  <div className="profile-section-modern">
                    <div className="section-header">
                      <div className="section-icon">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                      <div className="section-title">
                        <h3>Academic Information</h3>
                      </div>
                    </div>
                    <div className="profile-details-modern">
                      <div className="detail-item-modern">
                        <span className="detail-label-modern">University</span>
                        <span className="detail-value-modern">{profileData.university || 'Not provided'}</span>
                      </div>
                      <div className="detail-item-modern">
                        <span className="detail-label-modern">Course/Major</span>
                        <span className="detail-value-modern">{profileData.course || 'Not provided'}</span>
                      </div>
                      <div className="detail-item-modern">
                        <span className="detail-label-modern">Year of Study</span>
                        <span className="detail-value-modern">{profileData.year || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* About Display */}
                {profileData.bio && (
                  <div className="profile-section-modern">
                    <div className="section-header">
                      <div className="section-icon">
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <div className="section-title">
                        <h3>About</h3>
                      </div>
                    </div>
                    <div className="profile-bio-modern">
                      {profileData.bio}
                    </div>
                  </div>
                )}

                {/* Skills Display */}
                {profileData.skills.length > 0 && (
                  <div className="profile-section-modern">
                    <div className="section-header">
                      <div className="section-icon">
                        <i className="fas fa-code"></i>
                      </div>
                      <div className="section-title">
                        <h3>Skills & Expertise</h3>
                      </div>
                    </div>
                    <div className="skills-display-modern">
                      {profileData.skills.map((skill, index) => (
                        <span key={index} className="skill-badge-modern">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            <div className="profile-continue-modern">
              <button 
                className="btn-continue"
                onClick={handleContinue}
              >
                <span>Continue to EngineerConnect</span>
                <i className="fas fa-arrow-right"></i>
              </button>
              <p className="continue-note-modern">
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
