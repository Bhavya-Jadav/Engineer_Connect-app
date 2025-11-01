// ImpactSummary.js - Resume-like view of user profile
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import './ImpactSummary.css';

const ImpactSummary = ({ profileData, currentUser, onBack }) => {
  const summaryRef = useRef(null);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleDownloadPDF = () => {
    const element = summaryRef.current;
    const options = {
      margin: 0.5,
      filename: `${profileData.name || 'Profile'}_Impact_Summary.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(options).from(element).save();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="impact-summary-page">
      {/* Header with controls */}
      <div className="impact-summary-controls">
        <button className="btn-back-summary" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Profile
        </button>
        <h1 className="impact-summary-page-title">Impact Summary</h1>
        <button className="btn-download-pdf" onClick={handleDownloadPDF}>
          <i className="fas fa-download"></i>
          Download PDF
        </button>
      </div>

      {/* Resume Content */}
      <div className="impact-summary-container" ref={summaryRef}>
        {/* Header Section */}
        <div className="summary-header">
          <div className="summary-header-content">
            <div className="summary-header-text">
              <h1 className="summary-name">{profileData.name || 'Name Not Provided'}</h1>
              <h2 className="summary-title">
                {profileData.role || 'Professional'}
              </h2>
              <div className="summary-contact">
                {profileData.email && (
                  <span className="contact-item">
                    <i className="fas fa-envelope"></i>
                    {profileData.email}
                  </span>
                )}
                {profileData.phone && (
                  <span className="contact-item">
                    <i className="fas fa-phone"></i>
                    {profileData.phone}
                  </span>
                )}
                {profileData.university && (
                  <span className="contact-item">
                    <i className="fas fa-university"></i>
                    {profileData.university}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {profileData.bio && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-user"></i>
              About
            </h3>
            <p className="summary-about">{profileData.bio}</p>
          </div>
        )}

        {/* Skills Section */}
        {profileData.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-code"></i>
              Skills
            </h3>
            <div className="summary-skills">
              {profileData.skills.map((skill, index) => (
                <span key={index} className="summary-skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Education Section */}
        {profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-graduation-cap"></i>
              Education
            </h3>
            {profileData.education.map((edu, index) => (
              <div key={index} className="summary-entry">
                <div className="entry-header">
                  <div className="entry-main">
                    <h4 className="entry-title">{edu.degree || 'Degree'}</h4>
                    <p className="entry-subtitle">{edu.institution || 'Institution'}</p>
                  </div>
                  <div className="entry-date">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </div>
                </div>
                {edu.description && (
                  <p className="entry-description">{edu.description}</p>
                )}
                {edu.gpa && (
                  <p className="entry-meta"><strong>GPA:</strong> {edu.gpa}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Academic Information */}
        {(profileData.university || profileData.course || profileData.year) && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-school"></i>
              Academic Information
            </h3>
            <div className="summary-academic-grid">
              {profileData.university && (
                <div className="academic-item">
                  <strong>University:</strong> {profileData.university}
                </div>
              )}
              {profileData.course && (
                <div className="academic-item">
                  <strong>Course:</strong> {profileData.course}
                </div>
              )}
              {profileData.year && (
                <div className="academic-item">
                  <strong>Year:</strong> {profileData.year}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {profileData.projects && Array.isArray(profileData.projects) && profileData.projects.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-project-diagram"></i>
              Projects
            </h3>
            {profileData.projects.map((project, index) => (
              <div key={index} className="summary-entry">
                <div className="entry-header">
                  <div className="entry-main">
                    <h4 className="entry-title">{project.title || 'Project Title'}</h4>
                    {project.role && <p className="entry-role">{project.role}</p>}
                  </div>
                  <div className="entry-date">
                    {formatDate(project.startDate)} - {formatDate(project.endDate)}
                  </div>
                </div>
                {project.description && (
                  <p className="entry-description">{project.description}</p>
                )}
                {project.technologies && (
                  <p className="entry-description">
                    <strong>Technologies:</strong> {project.technologies}
                  </p>
                )}
                {project.link && (
                  <p className="entry-link">
                    <i className="fas fa-link"></i>
                    <a href={formatUrl(project.link)} target="_blank" rel="noopener noreferrer" className="clickable-link">
                      {project.link}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Courses Section */}
        {profileData.courses && Array.isArray(profileData.courses) && profileData.courses.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-certificate"></i>
              Courses & Certifications
            </h3>
            {profileData.courses.map((course, index) => (
              <div key={index} className="summary-entry">
                <div className="entry-header">
                  <div className="entry-main">
                    <h4 className="entry-title">{course.name || 'Course Name'}</h4>
                    {course.provider && <p className="entry-subtitle">{course.provider}</p>}
                  </div>
                  <div className="entry-date">
                    {formatDate(course.completionDate)}
                  </div>
                </div>
                {course.description && (
                  <p className="entry-description">{course.description}</p>
                )}
                {course.certificateLink && (
                  <p className="entry-link">
                    <i className="fas fa-certificate"></i>
                    <a href={formatUrl(course.certificateLink)} target="_blank" rel="noopener noreferrer" className="clickable-link download-link">
                      View/Download Certificate
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Languages Section */}
        {profileData.languages && Array.isArray(profileData.languages) && profileData.languages.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-language"></i>
              Languages
            </h3>
            <div className="summary-languages">
              {profileData.languages.map((lang, index) => (
                <div key={index} className="language-item">
                  <span className="language-name">{lang.language || lang.name}</span>
                  {lang.proficiency && (
                    <span className="language-level">{lang.proficiency}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {profileData.achievements && Array.isArray(profileData.achievements) && profileData.achievements.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-trophy"></i>
              Achievements
            </h3>
            <ul className="summary-achievements">
              {profileData.achievements.map((achievement, index) => (
                <li key={index} className="achievement-item">
                  <strong>{achievement.title || achievement.name}:</strong> {achievement.description}
                  {achievement.date && <span className="achievement-date"> ({formatDate(achievement.date)})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Internships Section */}
        {profileData.internships && Array.isArray(profileData.internships) && profileData.internships.length > 0 && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-briefcase"></i>
              Internships
            </h3>
            {profileData.internships.map((internship, index) => (
              <div key={index} className="summary-entry">
                <div className="entry-header">
                  <div className="entry-main">
                    <h4 className="entry-title">{internship.role || 'Internship Role'}</h4>
                    <p className="entry-subtitle">{internship.company || 'Company Name'}</p>
                  </div>
                  <div className="entry-date">
                    {internship.startDate ? formatDate(internship.startDate + '-01') : 'Start'} - {internship.endDate ? formatDate(internship.endDate + '-01') : 'Present'}
                  </div>
                </div>
                {internship.description && (
                  <p className="entry-description">{internship.description}</p>
                )}
                {internship.reportLink && (
                  <p className="entry-link">
                    <i className="fas fa-external-link-alt"></i>
                    <a 
                      href={formatUrl(internship.reportLink)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="clickable-link"
                    >
                      View Internship Report/Certificate
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Company Information */}
        {profileData.companyName && (
          <div className="summary-section">
            <h3 className="summary-section-title">
              <i className="fas fa-building"></i>
              Company Information
            </h3>
            <div className="summary-company-grid">
              <div className="company-item">
                <strong>Company:</strong> {profileData.companyName}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="summary-footer">
          <p>Generated on {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p className="summary-watermark">SKILLINK - Engineer Connect</p>
        </div>
      </div>
    </div>
  );
};

export default ImpactSummary;
