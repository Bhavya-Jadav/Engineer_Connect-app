// src/components/StudentFeed.js
import React, { useState } from 'react';
import Header from './HeaderWithBack';

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
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      const downloadUrl = `${cleanBaseUrl}/api/files/download/${attachment.fileName}`;
      
      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = attachment.originalName; // Use original filename for download
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  // Function to convert video URLs to embed URLs
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
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

        <div className="problems-list">
          {!filteredProblems || filteredProblems.length === 0 ? (
            <div className="no-problems">
              <i className="fas fa-search"></i>
              <h3>No problems found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div key={problem._id} className="problem-card">
                <div className="problem-header">
                  <div className="problem-meta">
                    <span 
                      className="company-name clickable" 
                      onClick={() => handleCompanyClick(problem.company)}
                      title={`View all problems from ${problem.company || 'Unknown Company'}`}
                    >
                      <i className="fas fa-building"></i>
                      {problem.company || 'Unknown Company'}
                    </span>
                    <span className="problem-date">
                      <i className="fas fa-clock"></i>
                      {formatDate(problem.createdAt)}
                    </span>
                  </div>
                  <div className="problem-stats">
                    <span className="stat">
                      <i className="fas fa-lightbulb"></i>
                      {problem.ideas ? problem.ideas.length : 0} ideas
                    </span>
                    <span className="stat">
                      <i className="fas fa-eye"></i>
                      {problem.views || 0} views
                    </span>
                  </div>
                </div>

                <div className="problem-content">
                  <div className="content-layout">
                    {/* Media section - Videos and Files */}
                    {((problem.videoUrl && problem.videoUrl.trim() !== '') || (problem.attachments && problem.attachments.length > 0)) && (
                      <div className="media-container">
                        {/* Video thumbnail */}
                        {problem.videoUrl && problem.videoUrl.trim() !== '' && (
                          <div className="video-thumbnail-container">
                            <div className="video-thumbnail">
                              <iframe
                                src={getEmbedUrl(problem.videoUrl)}
                                title={`Video for ${problem.title}`}
                                frameBorder="0"
                                allowFullScreen
                              ></iframe>
                              <div 
                                className="video-play-btn" 
                                onClick={() => handleVideoClick(problem.videoUrl)}
                                title="Click to open video in new tab"
                              >
                                <i className="fas fa-play"></i>
                              </div>
                            </div>
                            <div className="video-label">
                              <i className="fas fa-play-circle"></i>
                              <span>Video</span>
                            </div>
                          </div>
                        )}
                        
                        {/* File attachments preview */}
                        {problem.attachments && problem.attachments.length > 0 && (
                          <div className="files-preview-container">
                            {problem.attachments.slice(0, 2).map((attachment, index) => (
                              <div 
                                key={index} 
                                className="file-preview-item"
                                onClick={() => handleFileClick(attachment)}
                                title={`Click to download ${attachment.originalName}`}
                              >
                                <div className="file-icon-container">
                                  <i 
                                    className={getFileIcon(attachment.fileType)}
                                    style={{ color: getFileColor(attachment.fileType) }}
                                  ></i>
                                </div>
                                <div className="file-info">
                                  <span className="file-name">
                                    {attachment.originalName.length > 15 
                                      ? `${attachment.originalName.substring(0, 15)}...` 
                                      : attachment.originalName
                                    }
                                  </span>
                                  <span className="file-size">
                                    {formatFileSize(attachment.fileSize)}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {problem.attachments.length > 2 && (
                              <div className="more-files-indicator">
                                <i className="fas fa-plus-circle"></i>
                                <span>+{problem.attachments.length - 2} more</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-content">
                      <h3 
                        className="problem-title clickable" 
                        onClick={() => handleProblemClick(problem)}
                        title="Click to view full details"
                      >
                        {problem.title || 'Untitled Problem'}
                      </h3>
                      <p className="problem-description">
                        {problem.description && problem.description.length > 150
                          ? `${problem.description.substring(0, 150)}...`
                          : problem.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="problem-footer">
                  <div className="problem-tags">
                    <span
                      className="difficulty-tag"
                      style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
                    >
                      {problem.difficulty || 'Unknown'}
                    </span>
                    {problem.tags && problem.tags.length > 0 &&
                      problem.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))
                    }
                    {problem.tags && problem.tags.length > 3 && (
                      <span className="tag more-tags">+{problem.tags.length - 3} more</span>
                    )}
                  </div>

                  <div className="problem-actions">
                    <button
                      className="action-btn view-details-btn"
                      onClick={() => handleProblemClick(problem)}
                    >
                      <i className="fas fa-info-circle"></i>
                      View Details
                    </button>
                    <button
                      className="solve-btn"
                      onClick={() => onOpenIdeaModal && onOpenIdeaModal(problem)}
                    >
                      <i className="fas fa-rocket"></i>
                      Solve Problem
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
                    {selectedProblem.attachments.map((attachment, index) => (
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