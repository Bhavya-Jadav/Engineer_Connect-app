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
      // Handle both string attachments and object attachments
      let fileName, originalName;
      
      if (typeof attachment === 'string') {
        // Attachment is just a string (filename)
        fileName = attachment;
        originalName = attachment.split('/').pop();
      } else if (attachment && typeof attachment === 'object') {
        // Attachment is an object with properties
        fileName = attachment.fileName || attachment.originalName || attachment.name;
        originalName = attachment.originalName || attachment.fileName || attachment.name;
      } else {
        console.error('Invalid attachment format:', attachment);
        alert('Unable to download file: Invalid file format');
        return;
      }

      if (!fileName) {
        console.error('No filename found in attachment:', attachment);
        alert('Unable to download file: Filename missing');
        return;
      }

      const baseUrl = API_BASE_URL.replace('/api', '');
      const cleanBaseUrl = baseUrl.replace(/\/api$/, '');
      const downloadUrl = `${cleanBaseUrl}/api/files/download/${fileName}`;
      
      console.log('📥 Downloading file:', { fileName, originalName, downloadUrl });
      
      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        // Handle 404 specifically for ephemeral storage
        if (response.status === 404) {
          alert(`File "${originalName}" is not available.\n\nThis happens because file storage is ephemeral - files are lost when the backend redeploys.\n\nSolution: Ask the company to re-upload the file, or contact support.`);
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
      a.download = originalName;
      
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
              <div key={problem._id} className="problem-card relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden mb-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                {/* Status Ribbon */}
                <div className="absolute top-0 right-0">
                  <div className="bg-emerald-500 text-white px-4 py-1 shadow-lg transform rotate-45 translate-x-[30%] translate-y-[-10%] font-semibold">
                    Open
                  </div>
                </div>
                
                {/* Card Header with Company Info */}
                <div className="flex items-start p-6 pb-4">
                  <div className="company-avatar flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <i className="fas fa-building text-xl"></i>
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 
                          className="text-lg font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                          onClick={() => handleCompanyClick(problem.company)}
                          title={`View all problems from ${problem.company || 'Unknown Company'}`}
                        >
                          {problem.company || 'Unknown Company'}
                        </h4>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <i className="fas fa-sitemap mr-2"></i>
                          <span>{problem.branch || 'General'}</span>
                          <span className="mx-2">•</span>
                          <i className="far fa-clock mr-2"></i>
                          <span>{formatDate(problem.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        {problem.videoUrl && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <i className="fas fa-play-circle mr-1"></i>
                            Video
                          </span>
                        )}
                        {problem.attachments && problem.attachments.length > 0 && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            <i className="fas fa-paperclip mr-1"></i>
                            {problem.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Problem Title & Description */}
                <div className="px-6 pb-4">
                  <h3 
                    className="text-xl font-bold text-gray-900 dark:text-white mb-3 group cursor-pointer"
                    onClick={() => handleProblemClick(problem)}
                    title="Click to view full details"
                  >
                    <span className="inline-block border-b-2 border-transparent group-hover:border-indigo-500 transition-all duration-200">
                      {problem.title || 'Untitled Problem'}
                    </span>
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {problem.description && problem.description.length > 140
                      ? `${problem.description.substring(0, 140)}...`
                      : problem.description || 'No description available'}
                  </p>
                </div>
                
                {/* Stats Bar */}
                <div className="flex justify-between items-center px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-b border-gray-100 dark:border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-500 dark:text-amber-300 mr-2">
                        <i className="fas fa-lightbulb"></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{problem.ideas ? problem.ideas.length : 0}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Solutions</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 mr-2">
                        <i className="fas fa-eye"></i>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{problem.views || 0}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    problem.difficulty === 'Hard' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {problem.difficulty || 'Medium'}
                  </div>
                </div>
                
                {/* Media Preview Section */}
                {problem.videoUrl && problem.videoUrl.trim() !== '' && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                    <div className="relative rounded-xl overflow-hidden shadow-md">
                      <iframe
                        src={getEmbedUrl(problem.videoUrl)}
                        title={`Video for ${problem.title}`}
                        frameBorder="0"
                        allowFullScreen
                        className="w-full aspect-video"
                      ></iframe>
                      <div 
                        className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-opacity-10" 
                        onClick={() => handleVideoClick(problem.videoUrl)}
                        title="Click to open video in new tab"
                      >
                        <div className="bg-white bg-opacity-90 rounded-full w-16 h-16 flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110">
                          <i className="fas fa-play text-indigo-600 text-xl"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Files Preview */}
                {problem.attachments && problem.attachments.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
                        <i className="fas fa-paperclip text-purple-500 mr-2"></i>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Attachments</span>
                      </div>
                      <div className="p-3 max-h-48 overflow-y-auto">
                        {problem.attachments.map((attachment, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                            onClick={() => handleFileClick(attachment)}
                            title="Click to download file"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300">
                                <i className={`fas ${getFileIcon(attachment)}`}></i>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">
                                {attachment && typeof attachment === 'string' ? attachment.split('/').pop() : 'Attachment'}
                              </span>
                            </div>
                            <div className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                              <i className="fas fa-download"></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tags & Actions */}
                <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-y-3 border-t border-gray-100 dark:border-gray-700">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {problem.tags && problem.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => handleTagClick(tag)}
                        title={`View all problems with tag: ${tag}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      onClick={() => handleProblemClick(problem)}
                      title="View full problem details"
                    >
                      <i className="fas fa-lightbulb mr-2"></i>
                      Solve Problem
                    </button>
                    <button 
                      className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      onClick={() => handleShareClick(problem)}
                      title="Share this problem"
                    >
                      <i className="fas fa-share-alt"></i>
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