import React from 'react';
import ConnectionButton from './ConnectionButton';
import './UserProfileModal.css';

const UserProfileModal = ({ user, isOpen, onClose, currentUser, onConnectionUpdate }) => {
  if (!isOpen || !user) return null;

  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return 'No skills listed';
    return skills.map(skill => 
      typeof skill === 'string' ? skill : skill.name || skill.skill || skill
    ).join(', ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderSection = (title, icon, content) => {
    if (!content) return null;
    
    return (
      <div className="profile-section">
        <div className="section-header">
          <i className={`fas ${icon}`}></i>
          <h3>{title}</h3>
        </div>
        <div className="section-content">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="user-profile-modal-overlay" onClick={onClose}>
      <div className="user-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.username}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="avatar-fallback" style={{ display: user.profilePicture ? 'none' : 'flex' }}>
                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-info">
              <h2>{user.name || user.username}</h2>
              <div className="user-role-badge">
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              {user.email && (
                <div className="contact-info">
                  <i className="fas fa-envelope"></i>
                  <span>{user.email}</span>
                </div>
              )}
              {user.phone && (
                <div className="contact-info">
                  <i className="fas fa-phone"></i>
                  <span>{user.phone}</span>
                </div>
              )}
              
              {/* Connection and Actions Section */}
              {currentUser && user._id !== currentUser._id && (
                <div className="connection-section">
                  <div className="profile-actions">
                    <ConnectionButton
                      targetUser={user}
                      currentUser={currentUser}
                      onConnectionUpdate={onConnectionUpdate}
                      size="large"
                    />
                    <button className="btn btn-secondary profile-action-btn">
                      <i className="fas fa-envelope"></i>
                      Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {user.bio && renderSection('About', 'fa-user', (
            <p className="bio-text">{user.bio}</p>
          ))}

          {/* Academic/Company Info */}
          {user.role === 'student' && (
            <>
              {(user.university || user.course || user.branch || user.year) && renderSection('Academic Information', 'fa-graduation-cap', (
                <div className="academic-info">
                  {user.university && <div className="info-item"><span>University:</span> {user.university}</div>}
                  {user.course && <div className="info-item"><span>Course:</span> {user.course}</div>}
                  {user.branch && <div className="info-item"><span>Branch:</span> {user.branch}</div>}
                  {user.year && <div className="info-item"><span>Year:</span> {user.year}</div>}
                </div>
              ))}
            </>
          )}

          {user.role === 'company' && user.companyName && renderSection('Company Information', 'fa-building', (
            <div className="company-info">
              <div className="info-item"><span>Company:</span> {user.companyName}</div>
            </div>
          ))}

          {/* Skills Section */}
          {user.skills && user.skills.length > 0 && renderSection('Skills', 'fa-tags', (
            <div className="skills-container">
              {user.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {typeof skill === 'string' ? skill : skill.name || skill.skill || skill}
                </span>
              ))}
            </div>
          ))}

          {/* Projects Section */}
          {user.projects && user.projects.length > 0 && renderSection('Projects', 'fa-code', (
            <div className="projects-list">
              {user.projects.map((project) => (
                <div key={project.id || project._id} className="project-item">
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                  {project.technologies && <div className="project-tech">Technologies: {project.technologies}</div>}
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                      <i className="fas fa-external-link-alt"></i> View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Education Section */}
          {user.education && user.education.length > 0 && renderSection('Education', 'fa-school', (
            <div className="education-list">
              {user.education.map((edu) => (
                <div key={edu.id || edu._id} className="education-item">
                  <h4>{edu.degree}</h4>
                  <div className="education-institute">{edu.institute}</div>
                  <div className="education-dates">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </div>
                  {edu.description && <p>{edu.description}</p>}
                </div>
              ))}
            </div>
          ))}

          {/* Courses Section */}
          {user.courses && user.courses.length > 0 && renderSection('Courses', 'fa-certificate', (
            <div className="courses-list">
              {user.courses.map((course) => (
                <div key={course.id || course._id} className="course-item">
                  <h4>{course.name}</h4>
                  <div className="course-provider">{course.provider}</div>
                  <div className="course-date">Completed: {formatDate(course.completionDate)}</div>
                  {course.certificateLink && (
                    <a href={course.certificateLink} target="_blank" rel="noopener noreferrer" className="certificate-link">
                      <i className="fas fa-certificate"></i> View Certificate
                    </a>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Languages Section */}
          {user.languages && user.languages.length > 0 && renderSection('Languages', 'fa-language', (
            <div className="languages-list">
              {user.languages.map((lang) => (
                <div key={lang.id || lang._id} className="language-item">
                  <span className="language-name">{lang.name}</span>
                  <span className="language-proficiency">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          ))}

          {/* Achievements Section */}
          {user.achievements && user.achievements.length > 0 && renderSection('Achievements', 'fa-trophy', (
            <div className="achievements-list">
              {user.achievements.map((achievement) => (
                <div key={achievement.id || achievement._id} className="achievement-item">
                  <h4>{achievement.title}</h4>
                  <div className="achievement-date">{formatDate(achievement.date)}</div>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </div>
          ))}

          {/* Tags Section */}
          {user.tags && user.tags.length > 0 && renderSection('Tags', 'fa-hashtag', (
            <div className="tags-container">
              {user.tags.map((tag, index) => (
                <span key={index} className="tag-item">#{tag}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
