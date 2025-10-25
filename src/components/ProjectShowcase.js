import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProjectShowcase.css';
import './ProjectDetailModal.css';

const ProjectShowcase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Get user data from location state (passed from UserProfileModal)
    if (location.state) {
      console.log('ProjectShowcase received state:', location.state);
      console.log('Projects array:', location.state.projects);
      console.log('Projects count:', location.state.projects?.length || 0);
      
      setUserInfo(location.state.user);
      setProjects(location.state.projects || []);
    } else {
      // If no state, redirect back
      console.log('No state found, redirecting back');
      navigate(-1);
    }
  }, [location, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
  };

  const closeProjectDetail = () => {
    setSelectedProject(null);
  };

  if (!userInfo) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="project-showcase-page">
      {/* Header */}
      <div className="showcase-header">
        <button className="back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        <div className="header-content">
          <div className="user-info-header">
            <div className="user-avatar-small">
              {userInfo.profilePicture ? (
                <img src={userInfo.profilePicture} alt={userInfo.username} />
              ) : (
                <div className="avatar-fallback-small">
                  {(userInfo.name || userInfo.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1>{userInfo.name || userInfo.username}'s Project Showcase</h1>
              <p className="subtitle">Explore all the amazing projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="showcase-container">
        {projects.length === 0 ? (
          <div className="no-projects">
            <i className="fas fa-folder-open"></i>
            <h3>No Showcase Projects Yet</h3>
            <p>This user hasn't shared any showcase projects.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={project._id || project.id || index} className="showcase-project-card">
                {/* Project Header */}
                <div className="project-card-header">
                  <h2>{project.title}</h2>
                  {project.category && (
                    <span className="project-category">{project.category}</span>
                  )}
                </div>

                {/* Project Description */}
                <div className="project-card-body">
                  <p className="project-description">{project.description}</p>

                  {/* Video Section */}
                  {(project.videoUrl || project.videoFileId || project.videoFile) && (
                    <div className="video-section">
                      <h4><i className="fas fa-video"></i> Project Video</h4>
                      <div className="video-container">
                        {project.videoUrl ? (
                          <iframe
                            src={project.videoUrl}
                            title={project.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : project.videoFileId ? (
                          // NEW: MongoDB File reference
                          <video controls key={project.videoFileId._id}>
                            <source 
                              src={`${API_BASE_URL}/files/view/${project.videoFileId._id}`} 
                              type={project.videoFileId.mimeType || 'video/mp4'} 
                            />
                            Your browser does not support the video tag.
                          </video>
                        ) : project.videoFile && project.videoFile.filename && (
                          // OLD: Backward compatibility for local files
                          <video controls key={project.videoFile.filename}>
                            <source 
                              src={`http://localhost:5000/uploads/projects/videos/${project.videoFile.filename}`} 
                              type={project.videoFile.mimetype || 'video/mp4'} 
                            />
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                      {project.videoFileId && (
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                          Video: {project.videoFileId.originalName} ({(project.videoFileId.fileSize / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                      {!project.videoFileId && project.videoFile && project.videoFile.filename && (
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                          Video: {project.videoFile.originalName || project.videoFile.filename}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Attachments Section */}
                  {((project.attachmentIds && project.attachmentIds.length > 0) || 
                    (project.attachments && project.attachments.length > 0)) && (
                    <div className="attachments-section">
                      <h4>
                        <i className="fas fa-paperclip"></i> Attachments ({
                          project.attachmentIds?.length || project.attachments?.length || 0
                        })
                      </h4>
                      <div className="attachments-list">
                        {/* NEW: MongoDB File references */}
                        {project.attachmentIds && project.attachmentIds.map((file) => (
                          <a 
                            key={file._id}
                            href={`${API_BASE_URL}/files/download/${file._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-item"
                            download={file.originalName}
                          >
                            <i className="fas fa-file"></i>
                            <div className="file-info">
                              <span className="file-name">{file.originalName}</span>
                              <span className="file-size">
                                {(file.fileSize / 1024).toFixed(2)} KB
                              </span>
                            </div>
                            <i className="fas fa-download"></i>
                          </a>
                        ))}
                        
                        {/* OLD: Backward compatibility for local files */}
                        {!project.attachmentIds && project.attachments && project.attachments.map((file, idx) => (
                          <a 
                            key={idx}
                            href={`http://localhost:5000/uploads/projects/files/${file.filename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="attachment-item"
                            download={file.originalName}
                          >
                            <i className="fas fa-file"></i>
                            <div className="file-info">
                              <span className="file-name">{file.originalName || file.filename}</span>
                              <span className="file-size">
                                {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                              </span>
                            </div>
                            <i className="fas fa-download"></i>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="tech-section">
                      <h4><i className="fas fa-code"></i> Technologies</h4>
                      <div className="tech-tags">
                        {(Array.isArray(project.technologies) 
                          ? project.technologies 
                          : project.technologies.split(',')
                        ).map((tech, idx) => (
                          <span key={idx} className="tech-tag-showcase">
                            {typeof tech === 'string' ? tech.trim() : tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Tags */}
                  {project.learningTags && project.learningTags.length > 0 && (
                    <div className="learning-section">
                      <h4><i className="fas fa-lightbulb"></i> Learning Areas</h4>
                      <div className="learning-tags">
                        {project.learningTags.map((tag, idx) => (
                          <span key={idx} className="learning-tag-showcase">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Details */}
                  <div className="project-details-grid">
                    {project.difficulty && (
                      <div className="detail-item">
                        <i className="fas fa-chart-line"></i>
                        <div>
                          <span className="detail-label">Difficulty</span>
                          <span className={`difficulty-badge ${project.difficulty.toLowerCase()}`}>
                            {project.difficulty}
                          </span>
                        </div>
                      </div>
                    )}

                    {project.duration && (
                      <div className="detail-item">
                        <i className="fas fa-clock"></i>
                        <div>
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">{project.duration}</span>
                        </div>
                      </div>
                    )}

                    {project.teamSize && (
                      <div className="detail-item">
                        <i className="fas fa-users"></i>
                        <div>
                          <span className="detail-label">Team Size</span>
                          <span className="detail-value">{project.teamSize} {project.teamSize === 1 ? 'person' : 'people'}</span>
                        </div>
                      </div>
                    )}

                    {project.status && (
                      <div className="detail-item">
                        <i className="fas fa-flag"></i>
                        <div>
                          <span className="detail-label">Status</span>
                          <span className={`status-badge ${project.status.toLowerCase()}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Collaborators */}
                  {project.collaborators && project.collaborators.length > 0 && (
                    <div className="collaborators-section">
                      <h4><i className="fas fa-user-friends"></i> Collaborators</h4>
                      <div className="collaborators-list">
                        {project.collaborators.map((collab, idx) => (
                          <div key={idx} className="collaborator-item">
                            <span className="collab-name">{collab.name}</span>
                            {collab.role && <span className="collab-role">{collab.role}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="project-links">
                    <button 
                      onClick={() => handleViewProject(project)}
                      className="project-link-btn view-details"
                    >
                      <i className="fas fa-info-circle"></i>
                      View Details
                    </button>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link-btn">
                        <i className="fas fa-external-link-alt"></i>
                        View Project
                      </a>
                    )}
                    {project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="project-link-btn github">
                        <i className="fab fa-github"></i>
                        GitHub
                      </a>
                    )}
                    {project.liveDemo && (
                      <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="project-link-btn demo">
                        <i className="fas fa-play-circle"></i>
                        Live Demo
                      </a>
                    )}
                  </div>

                  {/* Engagement Stats */}
                  <div className="project-stats">
                    {project.views !== undefined && (
                      <div className="stat-item">
                        <i className="fas fa-eye"></i>
                        <span>{project.views} views</span>
                      </div>
                    )}
                    {project.likes && (
                      <div className="stat-item">
                        <i className="fas fa-heart"></i>
                        <span>{Array.isArray(project.likes) ? project.likes.length : project.likes} likes</span>
                      </div>
                    )}
                    {project.comments && (
                      <div className="stat-item">
                        <i className="fas fa-comment"></i>
                        <span>{Array.isArray(project.comments) ? project.comments.length : project.comments} comments</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="project-detail-overlay" onClick={closeProjectDetail}>
          <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="project-detail-header">
              <div className="header-top">
                <h2>{selectedProject.title}</h2>
                <button className="close-detail-btn" onClick={closeProjectDetail}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="project-detail-content">
              {/* Description */}
              <div className="detail-section">
                <h3>
                  <i className="fas fa-info-circle"></i>
                  Description
                </h3>
                <p className="project-description-full">{selectedProject.description}</p>
              </div>

              {/* Video Section in Modal */}
              {(selectedProject.videoUrl || selectedProject.videoFileId || selectedProject.videoFile) && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-video"></i>
                    Project Video
                  </h3>
                  <div className="video-container-modal">
                    {selectedProject.videoUrl ? (
                      <iframe
                        src={selectedProject.videoUrl}
                        title={selectedProject.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : selectedProject.videoFileId ? (
                      // NEW: MongoDB File reference
                      <video controls key={selectedProject.videoFileId._id}>
                        <source 
                          src={`${API_BASE_URL}/files/view/${selectedProject.videoFileId._id}`} 
                          type={selectedProject.videoFileId.mimeType || 'video/mp4'} 
                        />
                        Your browser does not support the video tag.
                      </video>
                    ) : selectedProject.videoFile && selectedProject.videoFile.filename && (
                      // OLD: Backward compatibility
                      <video controls key={selectedProject.videoFile.filename}>
                        <source 
                          src={`http://localhost:5000/uploads/projects/videos/${selectedProject.videoFile.filename}`} 
                          type={selectedProject.videoFile.mimetype || 'video/mp4'} 
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* Attachments Section in Modal */}
              {((selectedProject.attachmentIds && selectedProject.attachmentIds.length > 0) ||
                (selectedProject.attachments && selectedProject.attachments.length > 0)) && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-paperclip"></i>
                    Attachments ({selectedProject.attachmentIds?.length || selectedProject.attachments?.length || 0})
                  </h3>
                  <div className="attachments-grid-modal">
                    {/* NEW: MongoDB File references */}
                    {selectedProject.attachmentIds && selectedProject.attachmentIds.map((file) => (
                      <a 
                        key={file._id}
                        href={`${API_BASE_URL}/files/download/${file._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-card"
                        download={file.originalName}
                      >
                        <div className="attachment-icon">
                          <i className="fas fa-file-alt"></i>
                        </div>
                        <div className="attachment-details">
                          <span className="attachment-name">{file.originalName}</span>
                          <span className="attachment-size">
                            {(file.fileSize / 1024).toFixed(2)} KB
                          </span>
                        </div>
                        <i className="fas fa-download download-icon"></i>
                      </a>
                    ))}
                    
                    {/* OLD: Backward compatibility */}
                    {!selectedProject.attachmentIds && selectedProject.attachments && selectedProject.attachments.map((file, idx) => (
                      <a 
                        key={idx}
                        href={`http://localhost:5000/uploads/projects/files/${file.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-card"
                        download={file.originalName}
                      >
                        <div className="attachment-icon">
                          <i className="fas fa-file-alt"></i>
                        </div>
                        <div className="attachment-details">
                          <span className="attachment-name">{file.originalName || file.filename}</span>
                          <span className="attachment-size">
                            {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                          </span>
                        </div>
                        <i className="fas fa-download download-icon"></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {selectedProject.technologies && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-code"></i>
                    Technologies Used
                  </h3>
                  <div className="technologies-grid">
                    {(Array.isArray(selectedProject.technologies) 
                      ? selectedProject.technologies 
                      : selectedProject.technologies.split(',')
                    ).map((tech, index) => (
                      <span key={index} className="tech-badge">
                        {typeof tech === 'string' ? tech.trim() : tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Tags */}
              {selectedProject.learningTags && selectedProject.learningTags.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-lightbulb"></i>
                    Learning Areas
                  </h3>
                  <div className="technologies-grid">
                    {selectedProject.learningTags.map((tag, index) => (
                      <span key={index} className="tech-badge learning">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Details Grid */}
              {(selectedProject.difficulty || selectedProject.duration || selectedProject.teamSize || selectedProject.status) && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-chart-bar"></i>
                    Project Details
                  </h3>
                  <div className="project-info-grid">
                    {selectedProject.difficulty && (
                      <div className="info-card">
                        <i className="fas fa-chart-line"></i>
                        <div>
                          <span className="info-label">Difficulty</span>
                          <span className="info-value">{selectedProject.difficulty}</span>
                        </div>
                      </div>
                    )}
                    {selectedProject.duration && (
                      <div className="info-card">
                        <i className="fas fa-clock"></i>
                        <div>
                          <span className="info-label">Duration</span>
                          <span className="info-value">{selectedProject.duration}</span>
                        </div>
                      </div>
                    )}
                    {selectedProject.teamSize && (
                      <div className="info-card">
                        <i className="fas fa-users"></i>
                        <div>
                          <span className="info-label">Team Size</span>
                          <span className="info-value">{selectedProject.teamSize} {selectedProject.teamSize === 1 ? 'person' : 'people'}</span>
                        </div>
                      </div>
                    )}
                    {selectedProject.status && (
                      <div className="info-card">
                        <i className="fas fa-flag"></i>
                        <div>
                          <span className="info-label">Status</span>
                          <span className="info-value">{selectedProject.status}</span>
                        </div>
                      </div>
                    )}
                    {selectedProject.category && (
                      <div className="info-card">
                        <i className="fas fa-folder"></i>
                        <div>
                          <span className="info-label">Category</span>
                          <span className="info-value">{selectedProject.category}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Collaborators */}
              {selectedProject.collaborators && selectedProject.collaborators.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-user-friends"></i>
                    Collaborators
                  </h3>
                  <div className="collaborators-grid">
                    {selectedProject.collaborators.map((collab, index) => (
                      <div key={index} className="collaborator-card">
                        <div className="collab-avatar">
                          {collab.name ? collab.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="collab-info">
                          <span className="collab-name">{collab.name}</span>
                          {collab.role && <span className="collab-role">{collab.role}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Links */}
              {(selectedProject.link || selectedProject.githubLink || selectedProject.liveDemo) && (
                <div className="detail-section links-section">
                  <h3>
                    <i className="fas fa-link"></i>
                    Project Links
                  </h3>
                  <div className="project-links-grid">
                    {selectedProject.link && (
                      <a 
                        href={selectedProject.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-link-card"
                      >
                        <i className="fas fa-external-link-alt"></i>
                        <div className="link-info">
                          <span className="link-title">View Project</span>
                          <span className="link-url">{selectedProject.link}</span>
                        </div>
                        <i className="fas fa-arrow-right"></i>
                      </a>
                    )}
                    {selectedProject.githubLink && (
                      <a 
                        href={selectedProject.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-link-card github"
                      >
                        <i className="fab fa-github"></i>
                        <div className="link-info">
                          <span className="link-title">GitHub Repository</span>
                          <span className="link-url">{selectedProject.githubLink}</span>
                        </div>
                        <i className="fas fa-arrow-right"></i>
                      </a>
                    )}
                    {selectedProject.liveDemo && (
                      <a 
                        href={selectedProject.liveDemo} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-link-card demo"
                      >
                        <i className="fas fa-play-circle"></i>
                        <div className="link-info">
                          <span className="link-title">Live Demo</span>
                          <span className="link-url">{selectedProject.liveDemo}</span>
                        </div>
                        <i className="fas fa-arrow-right"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Engagement Stats */}
              {(selectedProject.views !== undefined || selectedProject.likes || selectedProject.comments) && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-chart-pie"></i>
                    Engagement Stats
                  </h3>
                  <div className="stats-grid">
                    {selectedProject.views !== undefined && (
                      <div className="stat-card">
                        <i className="fas fa-eye"></i>
                        <div>
                          <span className="stat-value">{selectedProject.views}</span>
                          <span className="stat-label">Views</span>
                        </div>
                      </div>
                    )}
                    {selectedProject.likes && (
                      <div className="stat-card">
                        <i className="fas fa-heart"></i>
                        <div>
                          <span className="stat-value">
                            {Array.isArray(selectedProject.likes) ? selectedProject.likes.length : selectedProject.likes}
                          </span>
                          <span className="stat-label">Likes</span>
                        </div>
                      </div>
                    )}
                    {selectedProject.comments && (
                      <div className="stat-card">
                        <i className="fas fa-comment"></i>
                        <div>
                          <span className="stat-value">
                            {Array.isArray(selectedProject.comments) ? selectedProject.comments.length : selectedProject.comments}
                          </span>
                          <span className="stat-label">Comments</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectShowcase;
