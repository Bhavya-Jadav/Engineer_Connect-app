import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import '../styles/StudentProjects.css';
import './ProjectDetailModal.css';

const StudentProjects = ({ currentUser, userRole }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null); // For project detail view
  const [filters, setFilters] = useState({
    category: 'All',
    difficulty: 'All',
    search: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProjects: 0
  });

  const categories = [
    'All', 'Web Development', 'Mobile App', 'Data Science', 'Machine Learning', 
    'AI', 'IoT', 'Game Development', 'Desktop Application', 
    'API/Backend', 'DevOps', 'Cybersecurity', 'Other'
  ];

  useEffect(() => {
    fetchProjects();
  }, [filters, pagination.currentPage]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.difficulty !== 'All' && { difficulty: filters.difficulty }),
        ...(filters.search && { search: filters.search }),
        sort: filters.sort
      });

      const response = await fetch(`${API_BASE_URL}/student-projects?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Fetch projects error:', error);
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleLike = async (projectId) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/student-projects/${projectId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const { liked, likeCount } = await response.json();
        setProjects(prev => prev.map(project => 
          project._id === projectId 
            ? { ...project, likeCount, userHasLiked: liked }
            : project
        ));
      }
    } catch (error) {
      console.error('Like project error:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    // Increment view count
    fetch(`${API_BASE_URL}/student-projects/${project._id}/view`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).catch(err => console.error('Error incrementing view:', err));
  };

  const closeProjectDetail = () => {
    setSelectedProject(null);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="student-projects">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-projects">
      <div className="projects-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-rocket"></i>
            Student Projects
          </h1>
          <p>Discover inspiring projects created by talented students</p>
        </div>
        
        <div className="projects-stats">
          <div className="stat-item">
            <span className="stat-number">{pagination.totalProjects}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{categories.length - 1}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <div className="filters-row">
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map(project => (
          <div key={project._id} className="project-card">
            {/* Project Thumbnail */}
            <div className="project-thumbnail">
              {project.videoUrl || project.videoFile ? (
                <div className="video-indicator">
                  <i className="fas fa-play-circle"></i>
                  <span>Video Available</span>
                </div>
              ) : (
                <div className="project-icon">
                  <i className="fas fa-project-diagram"></i>
                </div>
              )}
              
              <div className="project-badges">
                <span className={`difficulty-badge ${project.difficulty.toLowerCase()}`}>
                  {project.difficulty}
                </span>
                <span className="category-badge">
                  {project.category}
                </span>
              </div>
            </div>

            {/* Project Content */}
            <div className="project-content">
              <h3 className="project-title">{project.title}</h3>
              
              <p className="project-description">
                {truncateText(project.description, 120)}
              </p>

              {/* Technologies */}
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

              {/* Learning Tags */}
              {project.learningTags.length > 0 && (
                <div className="project-learning-tags">
                  <i className="fas fa-lightbulb"></i>
                  {project.learningTags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="learning-tag">{tag}</span>
                  ))}
                  {project.learningTags.length > 2 && (
                    <span className="learning-more">+{project.learningTags.length - 2}</span>
                  )}
                </div>
              )}

              {/* Project Meta */}
              <div className="project-meta">
                <div className="project-author">
                  <div className="author-avatar">
                    {project.postedBy.profilePicture ? (
                      <img src={project.postedBy.profilePicture} alt={project.postedBy.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {project.postedBy.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{project.postedBy.name}</span>
                    <span className="author-details">
                      {project.postedBy.university} • {formatDate(project.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Actions */}
              <div className="project-actions">
                <div className="project-stats">
                  <span className="stat-item">
                    <i className="fas fa-eye"></i>
                    {project.views}
                  </span>
                  <span className="stat-item">
                    <i className="fas fa-comment"></i>
                    {project.commentCount || 0}
                  </span>
                </div>

                <div className="action-buttons">
                  {currentUser && (
                    <button
                      className={`like-btn ${project.userHasLiked ? 'liked' : ''}`}
                      onClick={() => handleLike(project._id)}
                    >
                      <i className={`fas fa-heart ${project.userHasLiked ? 'filled' : ''}`}></i>
                      <span>{project.likeCount || 0}</span>
                    </button>
                  )}
                  
                  <button 
                    className="view-btn"
                    onClick={() => handleViewProject(project)}
                  >
                    <i className="fas fa-external-link-alt"></i>
                    View Project
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="project-links">
                {project.githubLink && (
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="project-link">
                    <i className="fab fa-github"></i>
                    Code
                  </a>
                )}
                {project.liveDemo && (
                  <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="project-link">
                    <i className="fas fa-external-link-alt"></i>
                    Demo
                  </a>
                )}
                {project.attachments.length > 0 && (
                  <span className="project-link">
                    <i className="fas fa-paperclip"></i>
                    {project.attachments.length} Files
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={!pagination.hasPrev}
            className="pagination-btn"
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          
          <div className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={!pagination.hasNext}
            className="pagination-btn"
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-search"></i>
          </div>
          <h3>No projects found</h3>
          <p>Try adjusting your filters or search terms</p>
        </div>
      )}

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
              <div className="header-meta">
                <span className={`difficulty-badge ${selectedProject.difficulty.toLowerCase()}`}>
                  {selectedProject.difficulty}
                </span>
                <span className="category-badge">{selectedProject.category}</span>
                {selectedProject.status && (
                  <span className="status-badge">{selectedProject.status}</span>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="project-detail-content">
              {/* Author Info */}
              <div className="detail-section author-section">
                <div className="author-card">
                  <div className="author-avatar-large">
                    {selectedProject.postedBy.profilePicture ? (
                      <img src={selectedProject.postedBy.profilePicture} alt={selectedProject.postedBy.name} />
                    ) : (
                      <div className="avatar-placeholder-large">
                        {selectedProject.postedBy.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="author-info-detailed">
                    <h4>{selectedProject.postedBy.name}</h4>
                    <p>{selectedProject.postedBy.university}</p>
                    <p className="posted-date">
                      <i className="fas fa-calendar"></i>
                      Posted on {formatDate(selectedProject.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="project-stats-detailed">
                  <div className="stat-item-detailed">
                    <i className="fas fa-eye"></i>
                    <span>{selectedProject.views} views</span>
                  </div>
                  <div className="stat-item-detailed">
                    <i className="fas fa-heart"></i>
                    <span>{selectedProject.likeCount || 0} likes</span>
                  </div>
                  <div className="stat-item-detailed">
                    <i className="fas fa-comment"></i>
                    <span>{selectedProject.commentCount || 0} comments</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="detail-section">
                <h3>
                  <i className="fas fa-info-circle"></i>
                  Description
                </h3>
                <p className="project-description-full">{selectedProject.description}</p>
              </div>

              {/* Technologies */}
              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-code"></i>
                    Technologies Used
                  </h3>
                  <div className="technologies-grid">
                    {selectedProject.technologies.map((tech, index) => (
                      <span key={index} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Tags */}
              {selectedProject.learningTags && selectedProject.learningTags.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-lightbulb"></i>
                    What I Learned
                  </h3>
                  <div className="learning-tags-grid">
                    {selectedProject.learningTags.map((tag, index) => (
                      <span key={index} className="learning-badge">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Links Section - Only show if there are links */}
              {(selectedProject.githubLink || selectedProject.liveDemo || selectedProject.videoUrl) && (
                <div className="detail-section links-section">
                  <h3>
                    <i className="fas fa-link"></i>
                    Project Links
                  </h3>
                  <div className="project-links-grid">
                    {selectedProject.githubLink && (
                      <a 
                        href={selectedProject.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-link-card"
                      >
                        <i className="fab fa-github"></i>
                        <div className="link-info">
                          <span className="link-title">GitHub Repository</span>
                          <span className="link-url">{selectedProject.githubLink}</span>
                        </div>
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                    {selectedProject.liveDemo && (
                      <a 
                        href={selectedProject.liveDemo} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-link-card"
                      >
                        <i className="fas fa-globe"></i>
                        <div className="link-info">
                          <span className="link-title">Live Demo</span>
                          <span className="link-url">{selectedProject.liveDemo}</span>
                        </div>
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                    {selectedProject.videoUrl && (
                      <a 
                        href={selectedProject.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-link-card"
                      >
                        <i className="fas fa-video"></i>
                        <div className="link-info">
                          <span className="link-title">Project Video</span>
                          <span className="link-url">{selectedProject.videoUrl}</span>
                        </div>
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Video File - Only show if uploaded */}
              {selectedProject.videoFile && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-play-circle"></i>
                    Project Video
                  </h3>
                  <div className="video-container">
                    <video controls className="project-video">
                      <source src={selectedProject.videoFile} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Attachments - Only show if there are attachments */}
              {selectedProject.attachments && selectedProject.attachments.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-paperclip"></i>
                    Attachments ({selectedProject.attachments.length})
                  </h3>
                  <div className="attachments-grid">
                    {selectedProject.attachments.map((attachment, index) => (
                      <a 
                        key={index}
                        href={attachment.url || attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-card"
                      >
                        <i className="fas fa-file"></i>
                        <span className="attachment-name">
                          {attachment.name || `Attachment ${index + 1}`}
                        </span>
                        <i className="fas fa-download"></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Project Details - Only show if data exists */}
              <div className="detail-section additional-info">
                <h3>
                  <i className="fas fa-info"></i>
                  Additional Information
                </h3>
                <div className="info-grid">
                  {selectedProject.duration && (
                    <div className="info-item">
                      <span className="info-label">
                        <i className="fas fa-clock"></i>
                        Duration
                      </span>
                      <span className="info-value">{selectedProject.duration}</span>
                    </div>
                  )}
                  {selectedProject.teamSize && (
                    <div className="info-item">
                      <span className="info-label">
                        <i className="fas fa-users"></i>
                        Team Size
                      </span>
                      <span className="info-value">{selectedProject.teamSize} {selectedProject.teamSize === 1 ? 'person' : 'people'}</span>
                    </div>
                  )}
                  {selectedProject.visibility && (
                    <div className="info-item">
                      <span className="info-label">
                        <i className="fas fa-eye"></i>
                        Visibility
                      </span>
                      <span className="info-value">{selectedProject.visibility}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Collaborators - Only show if there are collaborators */}
              {selectedProject.collaborators && selectedProject.collaborators.length > 0 && (
                <div className="detail-section">
                  <h3>
                    <i className="fas fa-user-friends"></i>
                    Collaborators
                  </h3>
                  <div className="collaborators-list">
                    {selectedProject.collaborators.map((collaborator, index) => (
                      <div key={index} className="collaborator-card">
                        <div className="collaborator-info">
                          <h4>{collaborator.name}</h4>
                          <p className="collaborator-role">{collaborator.role}</p>
                          {collaborator.contact && (
                            <p className="collaborator-contact">
                              <i className="fas fa-envelope"></i>
                              {collaborator.contact}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="detail-actions">
                {currentUser && (
                  <button
                    className={`like-btn-large ${selectedProject.userHasLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(selectedProject._id)}
                  >
                    <i className={`fas fa-heart ${selectedProject.userHasLiked ? 'filled' : ''}`}></i>
                    <span>{selectedProject.userHasLiked ? 'Liked' : 'Like'} ({selectedProject.likeCount || 0})</span>
                  </button>
                )}
                <button className="share-btn" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}>
                  <i className="fas fa-share"></i>
                  <span>Share Project</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProjects;
