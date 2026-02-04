// src/components/StudentFeed.js
import React, { useState } from 'react';
import Header from './HeaderWithBack';
import UserSearchTailwind from './UserSearchTailwind';
import UserProfileModal from './UserProfileModal';
import { API_BASE_URL } from '../utils/api';
import '../styles/StudentFeed.css';

const StudentFeed = ({
  selectedBranch,
  problems,
  onOpenIdeaModal,
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  isLoggedIn,
  currentUser,
  userRole,
  handleLogout,
  setCurrentView,
  handleBack,
  onProfileClick
}) => {

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [branchFilter, setBranchFilter] = useState(selectedBranch || 'all');
  const [showFilters, setShowFilters] = useState(false);
  
  // User search state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('problems'); // 'problems' or 'users'

  // Available branches - using the same values as stored in database
  const branches = [
    { value: 'mechanical', label: 'Mechanical Engineering' },
    { value: 'computer', label: 'Computer Science' },
    { value: 'electrical', label: 'Electrical Engineering' },
    { value: 'civil', label: 'Civil Engineering' },
    { value: 'chemical', label: 'Chemical Engineering' },
    { value: 'aerospace', label: 'Aerospace Engineering' },
    { value: 'biomedical', label: 'Biomedical Engineering' },
    { value: 'industrial', label: 'Industrial Engineering' },
    { value: 'electronics', label: 'Electronics and Communication' },
    { value: 'it', label: 'Information Technology' }
  ];

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleBranchChange = (selectedBranchValue) => {
    setBranchFilter(selectedBranchValue);
    
    // If you want to also reset other filters when branch changes, uncomment below:
    // setActiveFilter('all');
    // setSearchTerm('');
  };

  // User search handlers
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUser(null);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filterProblemsByBranch = (problemsArray, branchValue) => {
    if (!problemsArray || problemsArray.length === 0) {
      return [];
    }

    if (branchValue === 'all') {
      return problemsArray;
    }

    const filtered = problemsArray.filter(problem => {
      const matches = problem.branch === branchValue;
      return matches;
    });

    return filtered;
  };

  const handleVideoClick = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  // Function to get file icon based on file type
  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return 'fas fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fas fa-file-word';
      case 'ppt':
      case 'pptx':
        return 'fas fa-file-powerpoint';
      case 'xls':
      case 'xlsx':
        return 'fas fa-file-excel';
      case 'txt':
        return 'fas fa-file-alt';
      default:
        return 'fas fa-file';
    }
  };

  // Function to get file color based on file type
  const getFileColor = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return '#FF5722';
      case 'doc':
      case 'docx':
        return '#2196F3';
      case 'ppt':
      case 'pptx':
        return '#FF9800';
      case 'xls':
      case 'xlsx':
        return '#4CAF50';
      case 'txt':
        return '#9E9E9E';
      default:
        return '#607D8B';
    }
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to handle file download
  const handleFileClick = async (attachment) => {
    try {
      const baseUrl = API_BASE_URL.replace('/api', '');
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      const downloadUrl = `${cleanBaseUrl}/api/files/download/${attachment.fileName}`;
      
      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        // Handle 404 specifically for Railway ephemeral storage
        if (response.status === 404) {
          alert(`File "${attachment.originalName || attachment.fileName}" is not available.\n\nThis happens because Railway uses ephemeral storage - files are lost when the backend redeploys.\n\nSolution: Ask the company to re-upload the file, or contact support.`);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = attachment.originalName || attachment.fileName;
      
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('File download failed. Please try again or contact support if the issue persists.');
    }
  };

  // Function to convert video URLs to embed URLs
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // For other URLs, return as-is (might be direct video files or already embed URLs)
    return url;
  };

  const handleProblemClick = (problem) => {
    setSelectedProblem(problem);
    setShowProblemModal(true);
  };

  const handleCompanyClick = (companyName) => {
    if (companyName) {
      // Filter problems by company
      setSearchTerm(companyName);
      setActiveFilter('all');
    }
  };

  // Step 1: Filter by branch first
  const branchFilteredProblems = filterProblemsByBranch(problems, branchFilter);
  
  // Step 2: Apply other filters to branch-filtered problems
  const filteredProblems = branchFilteredProblems?.filter(problem => {
    const matchesSearch = !searchTerm || 
      problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (activeFilter) {
      case 'all': 
        matchesFilter = true; 
        break;
      case 'new': 
        matchesFilter = problem.createdAt && (new Date() - new Date(problem.createdAt)) < 7 * 24 * 60 * 60 * 1000; 
        break;
      case 'urgent': 
        matchesFilter = problem.difficulty === 'advanced'; 
        break;
      case 'trending': 
        matchesFilter = problem.ideas && problem.ideas.length > 0; 
        break;
      case 'video': 
        matchesFilter = problem.videoUrl && problem.videoUrl.trim() !== ''; 
        break;
      case 'text': 
        matchesFilter = !problem.videoUrl || problem.videoUrl.trim() === ''; 
        break;
      case 'beginner':
      case 'intermediate':
      case 'advanced':
        matchesFilter = problem.difficulty?.toLowerCase() === activeFilter;
        break;
      default: 
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  }) || [];

  const closeProblemModal = () => {
    setShowProblemModal(false);
    setSelectedProblem(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="student-feed">
      <Header
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        userRole={userRole}
        handleLogout={handleLogout}
        setCurrentView={setCurrentView}
        currentView="studentFeed"
        handleBack={handleBack}
        onProfileClick={onProfileClick}
      />

      <div className="feed-container">
        {/* Filter Toggle Button */}
        <div className="filter-toggle-container">
          <button 
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={toggleFilters}
            title={showFilters ? 'Hide Filters' : 'Show Filters'}
          >
            <i className="fas fa-filter"></i>
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'}`}></i>
          </button>
          <button
            className="search-icon-btn"
            onClick={() => handleTabChange('users')}
            title="Search Users"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Feed Controls - Show/Hide based on showFilters state */}
        {showFilters && (
          <div className="feed-controls">
            <div className="search-container">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="branch-filter-container">
              <i className="fas fa-code-branch"></i>
              <select
                value={branchFilter}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="branch-filter-select"
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.value} value={branch.value}>{branch.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-buttons">
              <button
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterClick('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${activeFilter === 'new' ? 'active' : ''}`}
                onClick={() => handleFilterClick('new')}
              >
                New
              </button>
              <button
                className={`filter-btn ${activeFilter === 'urgent' ? 'active' : ''}`}
                onClick={() => handleFilterClick('urgent')}
              >
                Urgent
              </button>
              <button
                className={`filter-btn ${activeFilter === 'trending' ? 'active' : ''}`}
                onClick={() => handleFilterClick('trending')}
              >
                Trending
              </button>
              <button
                className={`filter-btn ${activeFilter === 'beginner' ? 'active' : ''}`}
                onClick={() => handleFilterClick('beginner')}
              >
                Beginner
              </button>
              <button
                className={`filter-btn ${activeFilter === 'intermediate' ? 'active' : ''}`}
                onClick={() => handleFilterClick('intermediate')}
              >
                Intermediate
              </button>
              <button
                className={`filter-btn ${activeFilter === 'advanced' ? 'active' : ''}`}
                onClick={() => handleFilterClick('advanced')}
              >
                Advanced
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => handleTabChange('problems')}
          >
            <i className="fas fa-lightbulb"></i>
            Problems
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'problems' ? (
          <div className="problems-list">
            {!filteredProblems || filteredProblems.length === 0 ? (
              <div className="no-problems">
                <i className="fas fa-search"></i>
                <h3>No problems found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredProblems.map((problem) => (
              <div key={problem._id} className="problem-card professional-card">
                {/* Problem Status Badge */}
                <div className="problem-status-header">
                  <div className="status-indicators">
                    <span className="problem-status open">
                      <i className="fas fa-circle"></i>
                      Open
                    </span>
                    {problem.videoUrl && (
                      <span className="media-badge video-badge">
                        <i className="fas fa-play-circle"></i>
                        Video
                      </span>
                    )}
                    {problem.attachments && problem.attachments.length > 0 && (
                      <span className="media-badge files-badge">
                        <i className="fas fa-paperclip"></i>
                        {problem.attachments.length} Files
                      </span>
                    )}
                  </div>
                  <div className="problem-date">
                    <i className="fas fa-clock"></i>
                    {formatDate(problem.createdAt)}
                  </div>
                </div>

                {/* Company Header */}
                <div className="company-header">
                  <div className="company-info">
                    <div className="company-logo">
                      <i className="fas fa-building"></i>
                    </div>
                    <div className="company-details">
                      <h4 
                        className="company-name clickable"
                        onClick={() => handleCompanyClick(problem.company)}
                        title={`View all problems from ${problem.company || 'Unknown Company'}`}
                      >
                        {problem.company || 'Unknown Company'}
                      </h4>
                      <span className="department-info">
                        <i className="fas fa-sitemap"></i>
                        {problem.branch || 'General'}
                      </span>
                    </div>
                  </div>
                  <div className="engagement-stats">
                    <div className="stat-item">
                      <i className="fas fa-lightbulb"></i>
                      <span>{problem.ideas ? problem.ideas.length : 0}</span>
                      <small>Solutions</small>
                    </div>
                    <div className="stat-item">
                      <i className="fas fa-eye"></i>
                      <span>{problem.views || 0}</span>
                      <small>Views</small>
                    </div>
                  </div>
                </div>

                {/* Problem Content */}
                <div className="problem-main-content">
                  <h3 
                    className="problem-title clickable" 
                    onClick={() => handleProblemClick(problem)}
                    title="Click to view full details"
                  >
                    {problem.title || 'Untitled Problem'}
                  </h3>
                  <p className="problem-description">
                    {problem.description && problem.description.length > 140
                      ? `${problem.description.substring(0, 140)}...`
                      : problem.description || 'No description available'}
                  </p>
                </div>

                {/* Media Preview Section */}
                {((problem.videoUrl && problem.videoUrl.trim() !== '') || (problem.attachments && problem.attachments.length > 0)) && (
                  <div className="media-preview-section">
                    {/* Video Preview */}
                    {problem.videoUrl && problem.videoUrl.trim() !== '' && (
                      <div className="video-preview-card">
                        <div className="video-thumbnail-wrapper">
                          <iframe
                            src={getEmbedUrl(problem.videoUrl)}
                            title={`Video for ${problem.title}`}
                            frameBorder="0"
                            allowFullScreen
                            className="video-preview-iframe"
                          ></iframe>
                          <div 
                            className="video-overlay" 
                            onClick={() => handleVideoClick(problem.videoUrl)}
                            title="Click to open video in new tab"
                          >
                            <div className="play-button-large">
                              <i className="fas fa-play"></i>
                            </div>
                          </div>
                        </div>
                        <div className="video-info">
                          <span className="media-label">
                            <i className="fas fa-play-circle"></i>
                            Watch Explanation
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Files Preview */}
                    {problem.attachments && problem.attachments.length > 0 && (
                      <div className="files-preview-section">
                        <div className="files-header">
                          <i className="fas fa-folder-open"></i>
                          <span>Attachments ({problem.attachments.length})</span>
                        </div>
                        <div className="files-grid">
                          {problem.attachments.slice(0, 3).map((attachment, index) => {
                            // Skip if attachment is null or missing originalName
                            if (!attachment || !attachment.originalName) {
                              return null;
                            }
                            
                            return (
                            <div 
                              key={index} 
                              className="file-card"
                              onClick={() => handleFileClick(attachment)}
                              title={`Download ${attachment.originalName}`}
                            >
                              <div className="file-icon-wrapper">
                                <i 
                                  className={getFileIcon(attachment.fileType)}
                                  style={{ color: getFileColor(attachment.fileType) }}
                                ></i>
                              </div>
                              <div className="file-details">
                                <span className="file-name-truncated">
                                  {attachment.originalName.length > 12 
                                    ? `${attachment.originalName.substring(0, 12)}...` 
                                    : attachment.originalName
                                  }
                                </span>
                                <span className="file-size-small">
                                  {formatFileSize(attachment.fileSize)}
                                </span>
                              </div>
                            </div>
                            );
                          })}
                          {problem.attachments.length > 3 && (
                            <div className="more-files-card">
                              <i className="fas fa-ellipsis-h"></i>
                              <span>+{problem.attachments.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tags & Difficulty */}
                <div className="problem-metadata">
                  <div className="difficulty-section">
                    <span
                      className={`difficulty-badge difficulty-${problem.difficulty?.toLowerCase() || 'unknown'}`}
                    >
                      <i className="fas fa-signal"></i>
                      {problem.difficulty || 'Unknown'}
                    </span>
                  </div>
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="tags-section">
                      {problem.tags.slice(0, 4).map((tag, index) => (
                        <span key={index} className="tech-tag">{tag}</span>
                      ))}
                      {problem.tags.length > 4 && (
                        <span className="tech-tag more-indicator">+{problem.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="problem-actions-section">
                  <button
                    className="action-btn secondary-action"
                    onClick={() => handleProblemClick(problem)}
                  >
                    <i className="fas fa-info-circle"></i>
                    <span>Details</span>
                  </button>
                  <button
                    className="action-btn primary-action"
                    onClick={() => {
                      console.log('✅ Submit Solution button clicked!', problem);
                      console.log('✅ onOpenIdeaModal function:', onOpenIdeaModal);
                      if (onOpenIdeaModal) {
                        onOpenIdeaModal(problem);
                      } else {
                        console.error('❌ onOpenIdeaModal is not defined!');
                      }
                    }}
                  >
                    <i className="fas fa-rocket"></i>
                    <span>Submit Solution</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        ) : (
          <div className="users-search-section">
            <div className="search-description">
              <h3>Find Students and Companies</h3>
              <p>Search for users by name, skills, university, course, branch, or tags</p>
            </div>
            <UserSearchTailwind
              onUserSelect={handleUserSelect}
              placeholder="Search users by name, skills, university, course, branch..."
              roleFilter="all"
              showRoleFilter={true}
              currentUser={currentUser}
              className="feed-user-search"
            />
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={showUserProfile}
        onClose={handleCloseUserProfile}
        currentUser={currentUser}
        onConnectionUpdate={() => {}}
      />

      {/* Problem Details Modal */}
      {showProblemModal && selectedProblem && (
        <div className="modal-overlay" onClick={closeProblemModal}>
          <div className="modal-content problem-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProblem.title || 'Untitled Problem'}</h2>
              <button className="close-btn" onClick={closeProblemModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="problem-company-info">
                <div className="company-badge">
                  <i className="fas fa-building"></i>
                  <span>{selectedProblem.company || 'Unknown Company'}</span>
                </div>
                <div className="problem-meta-info">
                  <span className="date-info">
                    <i className="fas fa-clock"></i>
                    Posted {formatDate(selectedProblem.createdAt)}
                  </span>
                  <span
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(selectedProblem.difficulty) }}
                  >
                    {selectedProblem.difficulty || 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="problem-description-full">
                <h3>Problem Description</h3>
                <p>{selectedProblem.description || 'No description available'}</p>
              </div>

              {selectedProblem.videoUrl && (
                <div className="problem-video-section">
                  <h3>Video Explanation</h3>
                  <div className="video-container">
                    <iframe
                      src={getEmbedUrl(selectedProblem.videoUrl)}
                      title="Problem Video Explanation"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

              {selectedProblem.attachments && selectedProblem.attachments.length > 0 && (
                <div className="problem-attachments-section">
                  <h3>Attachments</h3>
                  <div className="attachments-container">
                    {selectedProblem.attachments.filter(attachment => attachment && attachment.originalName).map((attachment, index) => (
                      <div 
                        key={index} 
                        className="attachment-item"
                        onClick={() => handleFileClick(attachment)}
                        title={`Click to download ${attachment.originalName}`}
                      >
                        <div className="attachment-icon">
                          <i 
                            className={getFileIcon(attachment.fileType)}
                            style={{ color: getFileColor(attachment.fileType) }}
                          ></i>
                        </div>
                        <div className="attachment-details">
                          <span className="attachment-name">{attachment.originalName}</span>
                          <div className="attachment-meta">
                            <span className="attachment-type">{attachment.fileType.toUpperCase()}</span>
                            <span className="attachment-size">{formatFileSize(attachment.fileSize)}</span>
                          </div>
                        </div>
                        <div className="attachment-action">
                          <i className="fas fa-download"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProblem.tags && selectedProblem.tags.length > 0 && (
                <div className="problem-tags-section">
                  <h3>Tags</h3>
                  <div className="tags-container">
                    {selectedProblem.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="problem-stats-section">
                <div className="stat-item">
                  <i className="fas fa-lightbulb"></i>
                  <span>{selectedProblem.ideas ? selectedProblem.ideas.length : 0} ideas submitted</span>
                </div>
                <div className="stat-item">
                  <i className="fas fa-eye"></i>
                  <span>{selectedProblem.views || 0} views</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeProblemModal}>
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  closeProblemModal();
                  onOpenIdeaModal && onOpenIdeaModal(selectedProblem);
                }}
              >
                <i className="fas fa-rocket"></i>
                Submit Your Idea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeed;