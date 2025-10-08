import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../utils/api';

console.log('🌐 API_BASE_URL in UserSearch:', API_BASE_URL);

const UserSearchTailwind = ({ 
  onUserSelect, 
  placeholder = "Search users by name, skills, university, course, branch...", 
  roleFilter = 'all',
  showRoleFilter = true,
  className = '',
  currentUser = null 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedRole, setSelectedRole] = useState(roleFilter);
  const [error, setError] = useState('');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [sendingConnection, setSendingConnection] = useState(false);

  // Debounced search function
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const performSearch = useCallback(async (query, role) => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        query: query.trim(),
        role: role,
        limit: 10,
        page: 1
      });

      console.log('🔍 Searching users with query:', query, 'role:', role);

      const response = await fetch(`${API_BASE_URL}/users/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      console.log('🔍 Search results:', data);

      // Filter out current user from results
      const filteredResults = data.users.filter(user => 
        currentUser ? user._id !== currentUser._id : true
      );

      setSearchResults(filteredResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  useEffect(() => {
    debouncedSearch(searchQuery, selectedRole);
  }, [searchQuery, selectedRole, debouncedSearch]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleInputFocus = () => {
    // Show results if there are any and query is not empty
    if (searchResults.length > 0 && searchQuery.trim().length >= 2) {
      setShowResults(true);
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleUserClick = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/profile/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const fullProfile = await response.json();
        onUserSelect(fullProfile);
      } else {
        onUserSelect(user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      onUserSelect(user);
    }
    
    // Don't clear search results - allow users to go back and see results
    // setShowResults(false);
    // setSearchQuery('');
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-search-tailwind')) {
      setShowResults(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const formatUserInfo = (user) => {
    const info = [];
    if (user.name) info.push(user.name);
    if (user.university) info.push(user.university);
    if (user.course) info.push(user.course);
    if (user.branch) info.push(user.branch);
    if (user.companyName) info.push(user.companyName);
    return info.join(' • ');
  };

  const handleSendConnectionRequest = (user) => {
    if (!currentUser) {
      alert('Please log in to send connection requests');
      return;
    }
    
    if (user._id === currentUser._id) {
      alert('Cannot send connection request to yourself');
      return;
    }

    setSelectedUser(user);
    setConnectionMessage(`Hi ${user.name || user.username}, I'd like to connect with you!`);
    setShowConnectionModal(true);
  };

  const handleConfirmConnectionRequest = async () => {
    if (!selectedUser || !currentUser) return;

    setSendingConnection(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔗 Sending connection request to:', API_BASE_URL + '/connections');
      console.log('📤 Request payload:', {
        recipientId: selectedUser._id,
        message: connectionMessage
      });
      console.log('👤 Current user:', currentUser);

      const response = await fetch(`${API_BASE_URL}/connections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedUser._id,
          message: connectionMessage
        })
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connection request successful:', data);
        
        // Create notification
        await fetch(`${API_BASE_URL}/notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientId: selectedUser._id,
            type: 'connection_request',
            title: 'New Connection Request',
            message: `${currentUser.name || currentUser.username} wants to connect with you`,
            data: { connectionId: data.connection?._id }
          })
        });

        alert('Connection request sent successfully!');
        setShowConnectionModal(false);
        setSelectedUser(null);
        setConnectionMessage('');
      } else {
        const errorText = await response.text();
        console.error('❌ Error response text:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Error data:', errorData);
          alert(errorData.error || errorData.message || 'Failed to send connection request');
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          alert(`Failed to send connection request: ${errorText}`);
        }
      }
    } catch (error) {
      console.error('❌ Error sending connection request:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      alert('Error sending connection request. Please try again.');
    } finally {
      setSendingConnection(false);
    }
  };

  const formatSkills = (user) => {
    if (!user.skills || user.skills.length === 0) return '';
    const skillStrings = user.skills.map(skill => 
      typeof skill === 'string' ? skill : skill.name || skill.skill || skill
    );
    return skillStrings.slice(0, 3).join(', ');
  };

  return (
    <div className={`user-search-tailwind relative w-full max-w-lg ${className}`}>
      {/* Search Input Wrapper */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3">
        {/* Search Input Container */}
        <div className="relative flex-1 flex items-center">
          <i className="fas fa-search absolute left-4 text-gray-500 text-sm pointer-events-none"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full py-3 px-10 border-2 border-gray-200 rounded-full text-sm bg-white 
                     transition-all duration-300 outline-none
                     focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                     text-base md:text-sm"
          />
          {isLoading && (
            <i className="fas fa-spinner fa-spin absolute right-4 text-primary-500 text-sm"></i>
          )}
        </div>
        
        {/* Role Filter */}
        {showRoleFilter && (
          <select 
            value={selectedRole} 
            onChange={handleRoleChange}
            className="w-full md:w-auto py-3 px-4 border-2 border-gray-200 rounded-full text-sm bg-white 
                     cursor-pointer transition-all duration-300 outline-none min-w-[120px]
                     focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
          >
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="company">Companies</option>
          </select>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 py-2.5 px-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mt-2">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 md:left-0 md:right-0 bg-white border border-gray-200 
                      rounded-xl shadow-2xl max-h-96 overflow-y-auto z-[1000] mt-2
                      scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {searchResults.length === 0 && !isLoading ? (
            <div className="text-center py-8 px-4 text-gray-500">
              <i className="fas fa-search text-2xl mb-2.5 text-gray-300"></i>
              <p className="text-sm m-0">No users found matching your search</p>
            </div>
          ) : (
            searchResults.map((user, index) => (
              <div 
                key={user._id} 
                className={`p-3 md:p-4 cursor-pointer transition-all duration-200 
                          ${index !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}
                          hover:bg-gray-50 hover:shadow-sm
                          ${index === 0 ? 'rounded-t-xl' : ''} 
                          ${index === searchResults.length - 1 ? 'rounded-b-xl' : ''}`}
              >
                {/* Mobile: Single Column Layout (< 768px) */}
                <div className="flex flex-col gap-3 md:hidden">
                  {/* Avatar and Name Row */}
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="relative w-12 h-12 flex-shrink-0">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt={user.username}
                          className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                                 flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-200"
                        style={{ display: user.profilePicture ? 'none' : 'flex' }}
                      >
                        {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    </div>
                    
                    {/* Name and Role */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-base truncate">
                        {user.name || user.username}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-xl text-xs font-medium mt-1
                                     ${user.role === 'student' ? 'bg-green-500' : 
                                       user.role === 'company' ? 'bg-orange-500' : 'bg-primary-500'}
                                     text-white capitalize`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  
                  {/* User Details */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="text-gray-600 text-sm mb-1.5">
                      {formatUserInfo(user)}
                    </div>
                    {formatSkills(user) && (
                      <div className="flex items-center gap-1.5 text-primary-500 text-sm font-medium">
                        <i className="fas fa-tags text-xs"></i>
                        <span className="truncate">{formatSkills(user)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-4 py-2.5 border-none rounded-lg text-sm font-semibold
                               cursor-pointer transition-all duration-200 flex items-center justify-center gap-2
                               bg-gradient-to-r from-primary-500 to-primary-600 text-white
                               hover:from-primary-600 hover:to-primary-700 hover:-translate-y-0.5 
                               hover:shadow-lg active:translate-y-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendConnectionRequest(user);
                      }}
                      title="Send Connection Request"
                    >
                      <i className="fas fa-user-plus text-sm"></i>
                      <span>CONNECT</span>
                    </button>
                    <button
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold
                               cursor-pointer transition-all duration-200 flex items-center justify-center gap-2
                               bg-white text-gray-700
                               hover:bg-gray-50 hover:text-gray-900 hover:-translate-y-0.5 
                               hover:shadow-lg active:translate-y-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(user);
                      }}
                      title="View Profile"
                    >
                      <i className="fas fa-user text-sm"></i>
                      <span>VIEW</span>
                    </button>
                  </div>
                </div>
                
                {/* Desktop: Horizontal Layout (>= 768px) */}
                <div className="hidden md:flex items-center justify-between">
                  {/* User Avatar */}
                  <div className="relative w-12 h-12 mr-3 flex-shrink-0">
                    {user.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                               flex items-center justify-center text-white font-semibold text-base border-2 border-gray-200"
                      style={{ display: user.profilePicture ? 'none' : 'flex' }}
                    >
                      {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  
                  {/* User Info - Clickable */}
                  <div 
                    className="flex-1 min-w-0 cursor-pointer overflow-hidden"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center flex-wrap gap-2 font-semibold text-gray-800 text-base mb-1">
                      <span className="truncate">{user.name || user.username}</span>
                      <span className={`px-2 py-0.5 rounded-xl text-xs font-medium
                                     ${user.role === 'student' ? 'bg-green-500' : 
                                       user.role === 'company' ? 'bg-orange-500' : 'bg-primary-500'}
                                     text-white capitalize flex-shrink-0`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm mb-1 truncate">
                      {formatUserInfo(user)}
                    </div>
                    {formatSkills(user) && (
                      <div className="flex items-center gap-1.5 text-primary-500 text-sm font-medium truncate">
                        <i className="fas fa-tags text-xs"></i>
                        <span className="truncate">{formatSkills(user)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-1.5 ml-3 flex-shrink-0">
                    <button
                      className="px-4 py-2 border-none rounded-md text-xs font-medium
                               cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5
                               uppercase tracking-wide min-w-[90px]
                               bg-gradient-to-r from-primary-500 to-primary-600 text-white
                               hover:from-primary-600 hover:to-primary-700 hover:-translate-y-0.5 
                               hover:shadow-md active:translate-y-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendConnectionRequest(user);
                      }}
                      title="Send Connection Request"
                    >
                      <i className="fas fa-user-plus text-xs"></i>
                      <span>Connect</span>
                    </button>
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-md text-xs font-medium
                               cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5
                               uppercase tracking-wide min-w-[90px]
                               bg-gray-50 text-gray-700
                               hover:bg-gray-100 hover:text-gray-900 hover:-translate-y-0.5 
                               hover:shadow-md active:translate-y-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserClick(user);
                      }}
                      title="View Profile"
                    >
                      <i className="fas fa-user text-xs"></i>
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Connection Request Modal */}
      {showConnectionModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-5"
          onClick={() => setShowConnectionModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-[90%] max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto 
                     shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="m-0 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <i className="fas fa-user-plus text-primary-500"></i>
                Connect with {selectedUser.name || selectedUser.username}
              </h3>
              <button 
                className="bg-none border-none text-xl text-gray-500 cursor-pointer p-1.5 
                         rounded-md transition-all duration-200 w-8 h-8 flex items-center justify-center
                         hover:bg-gray-100 hover:text-gray-700"
                onClick={() => setShowConnectionModal(false)}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5">
              {/* User Info */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-5 
                            p-4 bg-gray-50 rounded-xl">
                <div className="relative w-15 h-15 flex-shrink-0">
                  {selectedUser.profilePicture ? (
                    <img 
                      src={selectedUser.profilePicture} 
                      alt={selectedUser.name || selectedUser.username}
                      className="w-full h-full rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600
                                  flex items-center justify-center text-white font-semibold text-xl 
                                  border-2 border-gray-200">
                      {(selectedUser.name || selectedUser.username)?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="m-0 mb-1 text-base font-semibold text-gray-900">
                    {selectedUser.name || selectedUser.username}
                  </h4>
                  <span className={`inline-block px-2 py-0.5 rounded-xl text-xs font-medium mb-2
                                 ${selectedUser.role === 'student' ? 'bg-green-500' : 
                                   selectedUser.role === 'company' ? 'bg-orange-500' : 'bg-primary-500'}
                                 text-white capitalize`}>
                    {selectedUser.role}
                  </span>
                  {selectedUser.university && (
                    <p className="m-0.5 text-sm text-gray-600 flex items-center justify-center md:justify-start gap-1.5">
                      <i className="fas fa-university text-primary-500 w-3"></i>
                      {selectedUser.university}
                    </p>
                  )}
                  {selectedUser.course && (
                    <p className="m-0.5 text-sm text-gray-600 flex items-center justify-center md:justify-start gap-1.5">
                      <i className="fas fa-graduation-cap text-primary-500 w-3"></i>
                      {selectedUser.course}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Message Section */}
              <div className="mb-5">
                <label 
                  htmlFor="connectionMessage"
                  className="block mb-2 font-medium text-gray-700 text-sm"
                >
                  Add a personal message
                </label>
                <textarea
                  id="connectionMessage"
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  placeholder={`Hi ${selectedUser.name || selectedUser.username}, I'd like to connect with you!`}
                  maxLength={300}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm font-sans
                           resize-vertical min-h-[80px] transition-all duration-300 outline-none
                           focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10
                           text-base md:text-sm"
                />
                <small className="text-gray-500 text-xs mt-1 block">
                  {connectionMessage.length}/300 characters
                </small>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col md:flex-row gap-3 justify-end">
                <button 
                  className="px-5 py-2.5 md:py-2 border border-gray-300 rounded-lg text-sm font-medium
                           cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5
                           bg-gray-50 text-gray-700
                           hover:bg-gray-100 hover:text-gray-900 order-2 md:order-1"
                  onClick={() => setShowConnectionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-5 py-2.5 md:py-2 border-none rounded-lg text-sm font-medium
                           cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5
                           bg-gradient-to-r from-primary-500 to-primary-600 text-white
                           hover:from-primary-600 hover:to-primary-700 hover:-translate-y-0.5 hover:shadow-lg
                           disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none 
                           disabled:shadow-none order-1 md:order-2"
                  onClick={handleConfirmConnectionRequest}
                  disabled={sendingConnection}
                >
                  <i className="fas fa-paper-plane"></i>
                  {sendingConnection ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchTailwind;
