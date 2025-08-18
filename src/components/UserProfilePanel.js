// src/components/UserProfilePanel.js
// Comprehensive user profile management panel

import React, { useState, useEffect, useRef } from 'react';

const UserProfilePanel = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    university: user?.university || '',
    course: user?.course || '',
    year: user?.year || '',
    skills: user?.skills || []
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profilePicture || null);

  // Skills management
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        university: user.university || '',
        course: user.course || '',
        year: user.year || '',
        skills: user.skills || []
      });
      // Update preview only if we don't have a preview already (to prevent overriding during upload)
      if (!profilePicturePreview || profilePicturePreview !== user.profilePicture) {
        setProfilePicturePreview(user.profilePicture || null);
      }
    }
  }, [user]);

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
        onUserUpdate(updatedUser.user);
        showMessage('success', 'Profile updated successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to update profile');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        showMessage('success', 'Password changed successfully! Please login again.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        
        // Auto logout after password change
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.reload();
        }, 2000);
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to change password');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    }
    setIsLoading(false);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showMessage('error', 'Image size should be less than 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showMessage('error', 'Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) {
      showMessage('error', 'Please select an image first');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('profilePicture', profilePicture);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/users/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the preview immediately with the new profile picture
        setProfilePicturePreview(result.profilePicture);
        
        // Update the user data
        onUserUpdate({ ...user, profilePicture: result.profilePicture });
        showMessage('success', 'Profile picture updated successfully!');
        setProfilePicture(null);
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to upload image');
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

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmDelete) return;

    const finalConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );

    if (finalConfirm !== 'DELETE') {
      showMessage('error', 'Account deletion cancelled');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/users/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showMessage('success', 'Account deleted successfully');
        localStorage.removeItem('token');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to delete account');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="profile-panel-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-panel-header">
          <div className="header-left">
            <div className="user-avatar-large">
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile" />
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div className="user-info">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message-bar ${message.type}`}>
            <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{message.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i> Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'picture' ? 'active' : ''}`}
            onClick={() => setActiveTab('picture')}
          >
            <i className="fas fa-image"></i> Picture
          </button>
          <button 
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <i className="fas fa-lock"></i> Security
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i> Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h4><i className="fas fa-user-edit"></i> Edit Profile Information</h4>
              
              <div className="form-grid">
                <div className="form-group">
                  <label><i className="fas fa-user"></i> Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-envelope"></i> Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-phone"></i> Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-university"></i> University</label>
                  <input
                    type="text"
                    value={profileData.university}
                    onChange={(e) => setProfileData({...profileData, university: e.target.value})}
                    placeholder="Enter your university"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-book"></i> Course/Major</label>
                  <input
                    type="text"
                    value={profileData.course}
                    onChange={(e) => setProfileData({...profileData, course: e.target.value})}
                    placeholder="Enter your course"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-calendar"></i> Year of Study</label>
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

              <div className="form-group full-width">
                <label><i className="fas fa-info-circle"></i> Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>

              {/* Skills Section */}
              <div className="skills-section">
                <label><i className="fas fa-code"></i> Skills</label>
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

              <div className="form-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleProfileUpdate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Updating...</>
                  ) : (
                    <><i className="fas fa-save"></i> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Profile Picture Tab */}
          {activeTab === 'picture' && (
            <div className="tab-content">
              <h4><i className="fas fa-camera"></i> Profile Picture</h4>
              
              <div className="picture-section">
                <div className="current-picture">
                  <div className="picture-preview">
                    {profilePicturePreview ? (
                      <img src={profilePicturePreview} alt="Profile Preview" />
                    ) : (
                      <div className="no-picture">
                        <i className="fas fa-user"></i>
                        <p>No profile picture</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="picture-upload">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  
                  <button 
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fas fa-upload"></i> Choose Image
                  </button>

                  {profilePicture && (
                    <button 
                      className="btn btn-primary"
                      onClick={handleProfilePictureUpload}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Uploading...</>
                      ) : (
                        <><i className="fas fa-check"></i> Upload Picture</>
                      )}
                    </button>
                  )}
                </div>

                <div className="picture-guidelines">
                  <h5>Guidelines:</h5>
                  <ul>
                    <li>Maximum file size: 5MB</li>
                    <li>Supported formats: JPEG, PNG, GIF, WebP</li>
                    <li>Recommended size: 400x400 pixels</li>
                    <li>Use a clear, professional photo</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="tab-content">
              <h4><i className="fas fa-shield-alt"></i> Change Password</h4>
              
              <div className="password-section">
                <div className="form-group">
                  <label><i className="fas fa-lock"></i> Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-key"></i> New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label><i className="fas fa-check-circle"></i> Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="password-requirements">
                  <h5>Password Requirements:</h5>
                  <ul>
                    <li>At least 6 characters long</li>
                    <li>Mix of letters and numbers recommended</li>
                    <li>Avoid common passwords</li>
                    <li>Don't reuse old passwords</li>
                  </ul>
                </div>

                <div className="form-actions">
                  <button 
                    className="btn btn-warning"
                    onClick={handlePasswordChange}
                    disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  >
                    {isLoading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Changing...</>
                    ) : (
                      <><i className="fas fa-key"></i> Change Password</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="tab-content">
              <h4><i className="fas fa-cog"></i> Account Settings</h4>
              
              <div className="settings-section">
                <div className="setting-item">
                  <div className="setting-info">
                    <h5><i className="fas fa-bell"></i> Email Notifications</h5>
                    <p>Receive emails about new problems and updates</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h5><i className="fas fa-eye"></i> Profile Visibility</h5>
                    <p>Make your profile visible to other students</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h5><i className="fas fa-moon"></i> Dark Mode</h5>
                    <p>Switch to dark theme</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="danger-zone">
                  <h5><i className="fas fa-exclamation-triangle"></i> Danger Zone</h5>
                  <div className="danger-item">
                    <div className="danger-info">
                      <h6>Delete Account</h6>
                      <p>Permanently delete your account and all data. This action cannot be undone.</p>
                    </div>
                    <button 
                      className="btn btn-danger"
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                    >
                      <i className="fas fa-trash"></i> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePanel;
