import React, { useState, useEffect } from 'react';
import Header from './Header';
import StudentProjectForm from './StudentProjectForm';
import { API_BASE_URL } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';

const ProfilePage = ({ 
  currentUser, 
  isLoggedIn, 
  userRole, 
  handleLogout, 
  setCurrentView, 
  onBack,
  onProfileClick 
}) => {
  // Critical inline styles for production deployment
  const criticalStyles = {
    profilePage: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 75%, #cbd5e1 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      paddingTop: '64px',
      overflowX: 'hidden',
      height: 'auto'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 24px 60px 24px',
      position: 'relative',
      minHeight: 'calc(100vh - 64px)'
    },
    hero: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '40px 30px',
      borderRadius: '20px',
      marginBottom: '30px',
      textAlign: 'center'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      marginBottom: '30px'
    },
    profileHeader: {
      padding: '30px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderBottom: '1px solid #e9ecef'
    },
    avatar: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: '4px solid white',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      objectFit: 'cover',
      margin: '0 auto 20px'
    },
    section: {
      padding: '30px',
      borderBottom: '1px solid #f0f0f0'
    },
    sectionTitle: {
      color: '#333',
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    btn: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e1e5e9',
      borderRadius: '10px',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '12px 16px',
      border: '2px solid #e1e5e9',
      borderRadius: '10px',
      fontSize: '16px',
      resize: 'vertical',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    label: {
      display: 'block',
      color: '#333',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px'
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    projectCard: {
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'transform 0.2s ease'
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [myProjects, setMyProjects] = useState([]);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    phone: currentUser?.phone || '',
    university: currentUser?.university || '',
    course: currentUser?.course || '',
    year: currentUser?.year || '',
    skills: currentUser?.skills || [],
    role: currentUser?.role || '',
    companyName: currentUser?.companyName || '',
    // Extended resume fields
    education: currentUser?.education || [],
    courses: currentUser?.courses || [],
    languages: currentUser?.languages || [],
    achievements: currentUser?.achievements || [],
    projects: currentUser?.projects || []
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
        skills: currentUser.skills || [],
        role: currentUser.role || '',
        companyName: currentUser.companyName || '',
        // Extended resume fields
        education: currentUser.education || [],
        courses: currentUser.courses || [],
        languages: currentUser.languages || [],
        achievements: currentUser.achievements || [],
        projects: currentUser.projects || []
      });
      
      // Fetch user's projects if they are a student
      if (currentUser.role === 'student' || userRole === 'student') {
        fetchMyProjects();
      }
    }
  }, [currentUser, userRole]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const fetchMyProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/student-projects/my-projects`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const projects = await response.json();
        setMyProjects(projects);
      }
    } catch (error) {
      console.error('Fetch my projects error:', error);
    }
  };

  const handleProjectCreated = (newProject) => {
    setMyProjects(prev => [newProject, ...prev]);
    setShowProjectForm(false);
    showMessage('success', 'Project created successfully!');
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/student-projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setMyProjects(prev => prev.filter(p => p._id !== projectId));
        showMessage('success', 'Project deleted successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to delete project');
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.');
    }
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
    if (newSkill.trim()) {
      const skillExists = profileData.skills.some(skill => 
        (typeof skill === 'string' ? skill : skill.name) === newSkill.trim()
      );
      if (!skillExists) {
        setProfileData({
          ...profileData,
          skills: [...profileData.skills, { name: newSkill.trim(), proficiency: 'Beginner' }]
        });
        setNewSkill('');
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => 
        (typeof skill === 'string' ? skill : skill.name) !== skillToRemove
      )
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: '',
      institute: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setProfileData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    
    // Smooth scroll to the new section after a brief delay
    setTimeout(() => {
      const newElement = document.querySelector(`[data-education-id="${newEducation.id}"]`);
      if (newElement) {
        newElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const removeEducation = (id) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addCourse = () => {
    const newCourse = {
      id: Date.now(),
      name: '',
      provider: '',
      completionDate: '',
      certificateLink: ''
    };
    setProfileData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
    
    // Smooth scroll to the new section
    setTimeout(() => {
      const newElement = document.querySelector(`[data-course-id="${newCourse.id}"]`);
      if (newElement) {
        newElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const removeCourse = (id) => {
    setProfileData(prev => ({
      ...prev,
      courses: prev.courses.filter(course => course.id !== id)
    }));
  };

  const updateCourse = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      courses: prev.courses.map(course => 
        course.id === id ? { ...course, [field]: value } : course
      )
    }));
  };

  const addLanguage = () => {
    setProfileData(prev => ({
      ...prev,
      languages: [...prev.languages, {
        id: Date.now(),
        name: '',
        proficiency: 'Beginner'
      }]
    }));
  };

  const removeLanguage = (id) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  const updateLanguage = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  const addAchievement = () => {
    setProfileData(prev => ({
      ...prev,
      achievements: [...prev.achievements, {
        id: Date.now(),
        title: '',
        description: '',
        date: ''
      }]
    }));
  };

  const removeAchievement = (id) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(ach => ach.id !== id)
    }));
  };

  const updateAchievement = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.map(ach => 
        ach.id === id ? { ...ach, [field]: value } : ach
      )
    }));
  };

  const addProject = () => {
    setProfileData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now(),
        title: '',
        description: '',
        technologies: '',
        link: ''
      }]
    }));
  };

  const removeProject = (id) => {
    setProfileData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const updateProject = (id, field, value) => {
    setProfileData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const updateSkillProficiency = (skillIndex, proficiency) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, index) => 
        index === skillIndex ? 
          (typeof skill === 'string' ? { name: skill, proficiency } : { ...skill, proficiency }) :
          skill
      )
    }));
  };

  const updateSkillName = (skillIndex, name) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, index) => 
        index === skillIndex ? 
          (typeof skill === 'string' ? { name, proficiency: 'Beginner' } : { ...skill, name }) :
          skill
      )
    }));
  };

  const handleContinue = () => {
    if (userRole === 'admin' || userRole === 'company') {
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
    <div className="profile-page" style={criticalStyles.profilePage}>
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
      
      <div className="profile-page-container" style={criticalStyles.container}>
        {/* Hero Section */}
        <div className="profile-hero" style={criticalStyles.hero}>
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
          <div className="profile-card" style={criticalStyles.card}>
            {/* Profile Content */}
            {isEditing ? (
              <div className="profile-edit-container-unified">
                {/* Profile Header Inside Edit Container */}
                <div className="profile-header-edit-modern" style={criticalStyles.profileHeader}>
                  <div className="profile-avatar-section">
                    <div className="profile-avatar-modern">
                      {currentUser?.profilePicture ? (
                        <img src={currentUser.profilePicture} alt="Profile" style={criticalStyles.avatar} />
                      ) : (
                        <div className="avatar-placeholder-modern" style={criticalStyles.avatar}>
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
                  </div>
                </div>

                <div className="profile-edit-modern">
                {/* Personal Information */}
                <div className="form-section-modern">
                  <div className="section-header">
                    <div className="section-header-content">
                      <div className="section-icon">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="section-title">
                        <h3>Personal Information</h3>
                        <p>Basic details about yourself</p>
                      </div>
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

                    {/* Role selection - one-time, only student/company */}
                    <div className="form-group-modern">
                      <label>User Type</label>
                      {profileData.role ? (
                        <input type="text" className="input-modern" value={profileData.role} disabled />
                      ) : (
                        <div className="radio-group-modern">
                          <div className="radio-option-modern">
                            <input 
                              type="radio" 
                              name="role" 
                              value="student" 
                              checked={profileData.role === 'student'} 
                              onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                              id="role-student"
                            />
                            <label htmlFor="role-student">Student</label>
                          </div>
                          <div className="radio-option-modern">
                            <input 
                              type="radio" 
                              name="role" 
                              value="company" 
                              checked={profileData.role === 'company'} 
                              onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                              id="role-company"
                            />
                            <label htmlFor="role-company">Company</label>
                          </div>
                        </div>
                      )}
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
                {(profileData.role === 'student' || userRole === 'student') && (
                  <div className="form-section-modern">
                    <div className="section-header">
                      <div className="section-header-content">
                        <div className="section-icon">
                          <i className="fas fa-graduation-cap"></i>
                        </div>
                        <div className="section-title">
                          <h3>Academic Information</h3>
                          <p>Your educational background</p>
                        </div>
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

                {/* Company Information for Companies/Admin */}
                {(profileData.role === 'company' || userRole === 'company' || userRole === 'admin') && (
                  <div className="form-section-modern">
                    <div className="section-header">
                      <div className="section-header-content">
                        <div className="section-icon">
                          <i className="fas fa-building"></i>
                        </div>
                        <div className="section-title">
                          <h3>Company Information</h3>
                          <p>Provide your company details</p>
                        </div>
                      </div>
                    </div>
                    <div className="form-grid-modern">
                      <div className="form-group-modern">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e)=>setProfileData({ ...profileData, companyName: e.target.value })}
                          placeholder="Enter company name"
                          className="input-modern"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* About Section */}
                <div className="form-section-modern">
                  <div className="section-header">
                    <div className="section-header-content">
                      <div className="section-icon">
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <div className="section-title">
                        <h3>About</h3>
                        <p>Tell us about yourself</p>
                      </div>
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
                    <div className="section-header-content">
                      <div className="section-icon">
                        <i className="fas fa-code"></i>
                      </div>
                      <div className="section-title">
                        <h3>Skills & Expertise</h3>
                        <p>Showcase your technical skills</p>
                      </div>
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
                    {profileData.skills.map((skill, index) => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const skillProficiency = typeof skill === 'string' ? 'Beginner' : skill.proficiency;
                      return (
                        <div key={index} className="skill-with-proficiency">
                          <input
                            type="text"
                            value={skillName}
                            onChange={(e) => updateSkillName(index, e.target.value)}
                            className="skill-name-input"
                            placeholder="Skill name"
                          />
                          <select
                            value={skillProficiency}
                            onChange={(e) => updateSkillProficiency(index, e.target.value)}
                            className="skill-proficiency-select"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                          <button onClick={() => removeSkill(skillName)} className="skill-remove-btn">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Extended Resume Sections for Students */}
                {(profileData.role === 'student' || userRole === 'student') && (
                  <>
                    {/* Education Section */}
                    <div className="form-section-modern">
                      <div className="section-header">
                        <div className="section-header-content">
                          <div className="section-icon">
                            <i className="fas fa-university"></i>
                          </div>
                          <div className="section-title">
                            <h3>Education</h3>
                            <p>Your educational background</p>
                          </div>
                        </div>
                        <button type="button" onClick={addEducation} className="add-section-btn">
                          <i className="fas fa-plus"></i> Add Education
                        </button>
                      </div>
                      {profileData.education.map((edu) => (
                        <div key={edu.id} className="dynamic-entry" data-education-id={edu.id}>
                          <div className="entry-header">
                            <h4>Education Entry</h4>
                            <button type="button" onClick={() => removeEducation(edu.id)} className="remove-entry-btn">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          <div className="form-grid-modern">
                            <div className="form-group-modern">
                              <label>Degree</label>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                placeholder="e.g., Bachelor of Computer Science"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Institute</label>
                              <input
                                type="text"
                                value={edu.institute}
                                onChange={(e) => updateEducation(edu.id, 'institute', e.target.value)}
                                placeholder="e.g., MIT"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Start Date</label>
                              <input
                                type="month"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>End Date</label>
                              <input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern full-width">
                              <label>Description</label>
                              <textarea
                                value={edu.description}
                                onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                                placeholder="Relevant coursework, achievements, GPA, etc."
                                rows="3"
                                className="input-modern"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Courses Section */}
                    <div className="form-section-modern">
                      <div className="section-header">
                        <div className="section-header-content">
                          <div className="section-icon">
                            <i className="fas fa-certificate"></i>
                          </div>
                          <div className="section-title">
                            <h3>Courses & Certifications</h3>
                            <p>Online courses and certifications</p>
                          </div>
                        </div>
                        <button type="button" onClick={addCourse} className="add-section-btn">
                          <i className="fas fa-plus"></i> Add Course
                        </button>
                      </div>
                      {profileData.courses.map((course) => (
                        <div key={course.id} className="dynamic-entry" data-course-id={course.id}>
                          <div className="entry-header">
                            <h4>Course Entry</h4>
                            <button type="button" onClick={() => removeCourse(course.id)} className="remove-entry-btn">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          <div className="form-grid-modern">
                            <div className="form-group-modern">
                              <label>Course Name</label>
                              <input
                                type="text"
                                value={course.name}
                                onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                                placeholder="e.g., Full Stack Web Development"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Provider</label>
                              <input
                                type="text"
                                value={course.provider}
                                onChange={(e) => updateCourse(course.id, 'provider', e.target.value)}
                                placeholder="e.g., Coursera, Udemy, edX"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Completion Date</label>
                              <input
                                type="month"
                                value={course.completionDate}
                                onChange={(e) => updateCourse(course.id, 'completionDate', e.target.value)}
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Certificate Link</label>
                              <input
                                type="url"
                                value={course.certificateLink}
                                onChange={(e) => updateCourse(course.id, 'certificateLink', e.target.value)}
                                placeholder="https://..."
                                className="input-modern"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Languages Section */}
                    <div className="form-section-modern">
                      <div className="section-header">
                        <div className="section-header-content">
                          <div className="section-icon">
                            <i className="fas fa-language"></i>
                          </div>
                          <div className="section-title">
                            <h3>Languages</h3>
                            <p>Languages you speak</p>
                          </div>
                        </div>
                        <button type="button" onClick={addLanguage} className="add-section-btn">
                          <i className="fas fa-plus"></i> Add Language
                        </button>
                      </div>
                      {profileData.languages.map((lang) => (
                        <div key={lang.id} className="dynamic-entry">
                          <div className="entry-header">
                            <h4>Language Entry</h4>
                            <button type="button" onClick={() => removeLanguage(lang.id)} className="remove-entry-btn">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          <div className="form-grid-modern">
                            <div className="form-group-modern">
                              <label>Language</label>
                              <input
                                type="text"
                                value={lang.name}
                                onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                                placeholder="e.g., English, Spanish, French"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Proficiency</label>
                              <select
                                value={lang.proficiency}
                                onChange={(e) => updateLanguage(lang.id, 'proficiency', e.target.value)}
                                className="input-modern"
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Native">Native</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Achievements Section */}
                    <div className="form-section-modern">
                      <div className="section-header">
                        <div className="section-header-content">
                          <div className="section-icon">
                            <i className="fas fa-trophy"></i>
                          </div>
                          <div className="section-title">
                            <h3>Achievements</h3>
                            <p>Awards, honors, and accomplishments</p>
                          </div>
                        </div>
                        <button type="button" onClick={addAchievement} className="add-section-btn">
                          <i className="fas fa-plus"></i> Add Achievement
                        </button>
                      </div>
                      {profileData.achievements.map((ach) => (
                        <div key={ach.id} className="dynamic-entry">
                          <div className="entry-header">
                            <h4>Achievement Entry</h4>
                            <button type="button" onClick={() => removeAchievement(ach.id)} className="remove-entry-btn">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          <div className="form-grid-modern">
                            <div className="form-group-modern">
                              <label>Title</label>
                              <input
                                type="text"
                                value={ach.title}
                                onChange={(e) => updateAchievement(ach.id, 'title', e.target.value)}
                                placeholder="e.g., Dean's List, Hackathon Winner"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Date</label>
                              <input
                                type="month"
                                value={ach.date}
                                onChange={(e) => updateAchievement(ach.id, 'date', e.target.value)}
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern full-width">
                              <label>Description</label>
                              <textarea
                                value={ach.description}
                                onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)}
                                placeholder="Describe your achievement and its significance"
                                rows="3"
                                className="input-modern"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Projects Section */}
                    <div className="form-section-modern">
                      <div className="section-header">
                        <div className="section-header-content">
                          <div className="section-icon">
                            <i className="fas fa-project-diagram"></i>
                          </div>
                          <div className="section-title">
                            <h3>Projects</h3>
                            <p>Personal and academic projects</p>
                          </div>
                        </div>
                        <button type="button" onClick={addProject} className="add-section-btn">
                          <i className="fas fa-plus"></i> Add Project
                        </button>
                      </div>
                      {profileData.projects.map((proj) => (
                        <div key={proj.id} className="dynamic-entry">
                          <div className="entry-header">
                            <h4>Project Entry</h4>
                            <button type="button" onClick={() => removeProject(proj.id)} className="remove-entry-btn">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                          <div className="form-grid-modern">
                            <div className="form-group-modern">
                              <label>Project Title</label>
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                                placeholder="e.g., E-commerce Website"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Technologies Used</label>
                              <input
                                type="text"
                                value={proj.technologies}
                                onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                                placeholder="e.g., React, Node.js, MongoDB"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern full-width">
                              <label>Description</label>
                              <textarea
                                value={proj.description}
                                onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                                placeholder="Describe the project, your role, and key features"
                                rows="3"
                                className="input-modern"
                              />
                            </div>
                            <div className="form-group-modern">
                              <label>Project Link/Demo</label>
                              <input
                                type="url"
                                value={proj.link}
                                onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                                placeholder="https://github.com/... or live demo link"
                                className="input-modern"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Advanced Student Projects Section */}
                    <div className="form-section-modern">
                      <div className="section-header">
                        <div className="section-header-content">
                          <div className="section-icon">
                            <i className="fas fa-rocket"></i>
                          </div>
                          <div className="section-title">
                            <h3>Showcase Projects</h3>
                            <p>Share your detailed projects with videos and files</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setShowProjectForm(true)} 
                          className="add-section-btn showcase-btn"
                        >
                          <i className="fas fa-plus"></i> Add Showcase Project
                        </button>
                      </div>
                      
                      <div className="showcase-projects-container">
                        {myProjects.length > 0 ? (
                          <div className="my-projects-grid">
                            {myProjects.slice(0, 3).map((project) => (
                              <div key={project._id} className="my-project-card">
                                <div className="project-header">
                                  <h4>{project.title}</h4>
                                  <div className="project-actions">
                                    <button 
                                      className="edit-project-btn"
                                      title="Edit Project"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button 
                                      className="delete-project-btn"
                                      onClick={() => handleDeleteProject(project._id)}
                                      title="Delete Project"
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="project-meta">
                                  <span className="project-category">{project.category}</span>
                                  <span className="project-difficulty">{project.difficulty}</span>
                                </div>
                                
                                <p className="project-description">
                                  {project.description.length > 100 
                                    ? project.description.substring(0, 100) + '...'
                                    : project.description
                                  }
                                </p>
                                
                                {project.technologies.length > 0 && (
                                  <div className="project-technologies">
                                    {project.technologies.slice(0, 3).map((tech, index) => (
                                      <span key={index} className="tech-tag">{tech}</span>
                                    ))}
                                    {project.technologies.length > 3 && (
                                      <span className="tech-more">+{project.technologies.length - 3}</span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="project-stats">
                                  <span><i className="fas fa-eye"></i> {project.views}</span>
                                  <span><i className="fas fa-heart"></i> {project.likeCount || 0}</span>
                                  <span><i className="fas fa-comment"></i> {project.commentCount || 0}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-projects-state">
                            <div className="no-projects-icon">
                              <i className="fas fa-rocket"></i>
                            </div>
                            <h4>No showcase projects yet</h4>
                            <p>Create your first project to showcase your skills with videos, files, and detailed descriptions!</p>
                            <button 
                              type="button" 
                              onClick={() => setShowProjectForm(true)} 
                              className="create-first-project-btn"
                            >
                              <i className="fas fa-plus"></i> Create Your First Project
                            </button>
                          </div>
                        )}
                        
                        {myProjects.length > 3 && (
                          <div className="view-all-projects">
                            <button className="view-all-btn">
                              View All {myProjects.length} Projects
                              <i className="fas fa-arrow-right"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              </div>
            ) : (
              <div className="profile-display-container-unified">
                {/* Profile Header */}
                <div className="profile-header-display-modern">
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
                    <button 
                      className="btn-edit-profile"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="fas fa-edit"></i>
                      <span>Edit Profile</span>
                    </button>
                  </div>
                </div>

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
                          {typeof skill === 'string' ? skill : skill.name || skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="profile-continue-section">
              <div className="continue-content">
                <div className="continue-icon">
                  <i className="fas fa-rocket"></i>
                </div>
                <h3 className="continue-title">Ready to get started?</h3>
                <p className="continue-description">
                  Your profile is {getProfileCompletionPercentage()}% complete. You can always update it later.
                </p>
                
                <div className="continue-stats">
                  <div className="stat-item">
                    <span className="stat-number">{getProfileCompletionPercentage()}%</span>
                    <span className="stat-label">Complete</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{profileData.skills.length}</span>
                    <span className="stat-label">Skills</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{profileData.education.length + profileData.courses.length}</span>
                    <span className="stat-label">Entries</span>
                  </div>
                </div>

                <button 
                  className="btn-continue-modern"
                  onClick={handleContinue}
                >
                  <span>Continue to EngineerConnect</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
                <p className="continue-note">
                  You can edit your profile anytime from your account settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Student Project Form Modal */}
      {showProjectForm && (
        <StudentProjectForm
          onProjectCreated={handleProjectCreated}
          onCancel={() => setShowProjectForm(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
