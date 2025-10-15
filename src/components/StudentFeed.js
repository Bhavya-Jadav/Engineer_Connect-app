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
  const [selectedTag, setSelectedTag] = useState(null);

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
  const getFileIcon = (filePath) => {
    if (!filePath || typeof filePath !== 'string') {
      return 'fas fa-file'; // Default icon for non-string values
    }
    
    // Extract file extension from the path
    const fileExt = filePath.split('.').pop()?.toLowerCase();
    
    switch (fileExt) {
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
      // Handle different attachment formats
      let fileName, displayName;
      
      if (!attachment) {
        console.error('Attachment is null or undefined');
        alert('File information is missing. Please try again.');
        return;
      }
      
      // Check if attachment is a string (just file path) or object
      if (typeof attachment === 'string') {
        // Extract filename from path
        fileName = attachment.split('/').pop();
        displayName = fileName;
      } else if (typeof attachment === 'object') {
        // Object with fileName, originalName properties
        fileName = attachment.fileName || attachment.filePath || attachment.path;
        displayName = attachment.originalName || fileName;
      } else {
        console.error('Unknown attachment format:', attachment);
        alert('Unable to process file. Invalid format.');
        return;
      }
      
      if (!fileName) {
        console.error('Could not determine filename from:', attachment);
        alert('File name is missing. Please try again.');
        return;
      }
      
      const baseUrl = API_BASE_URL.replace('/api', '');
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      const downloadUrl = `${cleanBaseUrl}/api/files/download/${fileName}`;
      
      console.log('📥 Downloading file:', fileName, 'from:', downloadUrl);
      
      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        // Handle 404 specifically for Railway/Render ephemeral storage
        if (response.status === 404) {
          alert(`File "${displayName}" is not available.\n\nThis happens because the backend uses ephemeral storage - files are lost when the backend redeploys.\n\nSolution: Ask the company to re-upload the file, or contact support.`);
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
      a.download = displayName;
      
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the temporary URL
      window.URL.revokeObjectURL(url);
      
      console.log('✅ File downloaded successfully:', displayName);
      
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
  
  const handleTagClick = (tag) => {
    console.log(`Tag clicked: ${tag}`);
    // Set the tag filter
    setSelectedTag(tag);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareClick = (problem) => {
    // Create a shareable URL for this problem
    const shareUrl = `${window.location.origin}/problem/${problem._id}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: problem.title || 'Engineering Problem',
        text: `Check out this engineering problem: ${problem.title}`,
        url: shareUrl,
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          // Show a toast or alert that the link was copied
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy link: ', err);
        });
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
              <div 
                key={problem._id} 
                className="problem-card bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 mb-4 overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-lg sm:text-xl font-extrabold text-black dark:text-white mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 line-clamp-2 leading-tight px-1 py-0.5 -mx-1 rounded"
                        onClick={() => handleProblemClick(problem)}
                        title="Click to view full details"
                      >
                        {problem.title || 'Untitled Problem'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span 
                          className="inline-flex items-center gap-1 font-extrabold text-sm sm:text-base text-black dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer transition-all duration-200 px-2 py-1 rounded-md border-2 border-transparent hover:border-black dark:hover:border-white"
                          onClick={() => handleCompanyClick(problem.company)}
                          title={`View all problems from ${problem.company || 'Unknown Company'}`}
                        >
                          <i className="fas fa-building text-xs"></i>
                          {problem.company || 'Unknown Company'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-code-branch text-xs"></i>
                          {problem.branch || 'General'}
                        </span>
                        <span>•</span>
                        <span>{formatDate(problem.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Difficulty Badge */}
                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border ${
                      problem.difficulty === 'beginner' ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600' :
                      problem.difficulty === 'advanced' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-gray-200' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}>
                      {problem.difficulty || 'intermediate'}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                    {problem.description || 'No description available'}
                  </p>
                </div>

                {/* Media Section - Only show if exists */}
                {problem.videoUrl && problem.videoUrl.trim() !== '' && (
                  <div className="px-4 pt-3">
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <iframe
                        src={getEmbedUrl(problem.videoUrl)}
                        title={`Video for ${problem.title}`}
                        frameBorder="0"
                        allowFullScreen
                        className="w-full aspect-video"
                      ></iframe>
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center cursor-pointer transition-all duration-200" 
                        onClick={() => handleVideoClick(problem.videoUrl)}
                        title="Click to open in new tab"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <i className="fas fa-external-link-alt text-gray-900 dark:text-white text-sm sm:text-base"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachments - Compact view */}
                {problem.attachments && problem.attachments.length > 0 && (
                  <div className="px-4 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {problem.attachments.map((attachment, index) => {
                        const fileName = typeof attachment === 'string' 
                          ? attachment.split('/').pop() 
                          : (attachment?.originalName || attachment?.fileName || 'Attachment');
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleFileClick(attachment)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title={`Download ${fileName}`}
                          >
                            <i className={`${getFileIcon(attachment)} text-sm`}></i>
                            <span className="max-w-[120px] sm:max-w-[150px] truncate">{fileName}</span>
                            <i className="fas fa-download text-xs"></i>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tags - Compact */}
                {problem.tags && problem.tags.length > 0 && (
                  <div className="px-4 pt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          onClick={() => handleTagClick(tag)}
                          className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                          title={`View all problems with tag: ${tag}`}
                        >
                          #{tag}
                        </span>
                      ))}
                      {problem.tags.length > 3 && (
                        <span className="inline-block px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
                          +{problem.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer - Stats & Actions */}
                <div className="px-4 py-3 flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                  {/* Stats */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1" title="Solutions submitted">
                      <i className="fas fa-lightbulb"></i>
                      <span className="font-medium">{problem.ideas ? problem.ideas.length : 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Views">
                      <i className="fas fa-eye"></i>
                      <span className="font-medium">{problem.views || 0}</span>
                    </div>
                    {problem.videoUrl && (
                      <div className="flex items-center gap-1" title="Has video">
                        <i className="fas fa-play-circle"></i>
                      </div>
                    )}
                    {problem.attachments && problem.attachments.length > 0 && (
                      <div className="flex items-center gap-1" title={`${problem.attachments.length} attachment(s)`}>
                        <i className="fas fa-paperclip"></i>
                        <span className="font-medium">{problem.attachments.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleProblemClick(problem)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                      title="View and solve this problem"
                    >
                      <i className="fas fa-arrow-right"></i>
                      <span className="hidden sm:inline">Solve</span>
                    </button>
                    <button 
                      onClick={() => handleShareClick(problem)}
                      className="p-1.5 sm:p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                      title="Share this problem"
                    >
                      <i className="fas fa-share-alt text-sm"></i>
                    </button>
                  </div>
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
                    {selectedProblem.attachments.map((attachment, index) => {
                      // Handle both string and object formats
                      let fileName, fileType, fileSize;
                      
                      if (typeof attachment === 'string') {
                        fileName = attachment.split('/').pop();
                        fileType = fileName.split('.').pop() || 'file';
                        fileSize = 0; // Unknown size for string attachments
                      } else if (attachment && typeof attachment === 'object') {
                        fileName = attachment.originalName || attachment.fileName || 'Attachment';
                        fileType = attachment.fileType || fileName.split('.').pop() || 'file';
                        fileSize = attachment.fileSize || 0;
                      } else {
                        return null; // Skip invalid attachments
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className="attachment-item"
                          onClick={() => handleFileClick(attachment)}
                          title={`Click to download ${fileName}`}
                        >
                          <div className="attachment-icon">
                            <i 
                              className={getFileIcon(fileType)}
                              style={{ color: getFileColor(fileType) }}
                            ></i>
                          </div>
                          <div className="attachment-details">
                            <span className="attachment-name">{fileName}</span>
                            <div className="attachment-meta">
                              <span className="attachment-type">{fileType.toUpperCase()}</span>
                              {fileSize > 0 && <span className="attachment-size">{formatFileSize(fileSize)}</span>}
                            </div>
                          </div>
                          <div className="attachment-action">
                            <i className="fas fa-download"></i>
                          </div>
                        </div>
                      );
                    })}
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