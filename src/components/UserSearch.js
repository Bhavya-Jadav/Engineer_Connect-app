import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../utils/api';
import './UserSearch.css';

const UserSearch = ({ 
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

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleUserClick = async (user) => {
    try {
      // Fetch full profile data
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
    
    setShowResults(false);
    setSearchQuery('');
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-search-container')) {
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

      if (response.ok) {
        const data = await response.json();
        
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
            data: { connectionId: data.connection._id }
          })
        });

        alert('Connection request sent successfully!');
        setShowConnectionModal(false);
        setSelectedUser(null);
        setConnectionMessage('');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Error sending connection request');
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
    <div className={`user-search-container ${className}`}>
      <div className="search-input-wrapper">
        <div className="search-input-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="search-input"
          />
          {isLoading && <i className="fas fa-spinner fa-spin loading-icon"></i>}
        </div>
        
        {showRoleFilter && (
          <select 
            value={selectedRole} 
            onChange={handleRoleChange}
            className="role-filter"
          >
            <option value="all">All Users</option>
            <option value="student">Students</option>
            <option value="company">Companies</option>
          </select>
        )}
      </div>

      {error && (
        <div className="search-error">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {showResults && (
        <div className="search-results">
          {searchResults.length === 0 && !isLoading ? (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>No users found matching your search</p>
            </div>
          ) : (
            searchResults.map(user => (
              <div 
                key={user._id} 
                className="search-result-item"
              >
                <div className="user-avatar">
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
                
                <div className="user-info" onClick={() => handleUserClick(user)}>
                  <div className="user-name">
                    {user.name || user.username}
                    <span className="user-role">{user.role}</span>
                  </div>
                  <div className="user-details">
                    {formatUserInfo(user)}
                  </div>
                  {formatSkills(user) && (
                    <div className="user-skills">
                      <i className="fas fa-tags"></i>
                      {formatSkills(user)}
                    </div>
                  )}
                </div>
                
                <div className="user-actions">
                  <button
                    className="action-btn connect-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendConnectionRequest(user);
                    }}
                    title="Send Connection Request"
                  >
                    <i className="fas fa-user-plus"></i>
                    Connect
                  </button>
                  <button
                    className="action-btn profile-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUserClick(user);
                    }}
                    title="View Profile"
                  >
                    <i className="fas fa-user"></i>
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Connection Request Modal */}
      {showConnectionModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowConnectionModal(false)}>
          <div className="modal connection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-plus"></i>
                Connect with {selectedUser.name || selectedUser.username}
              </h3>
              <button 
                className="close-btn" 
                onClick={() => setShowConnectionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="user-info">
                <div className="user-avatar">
                  {selectedUser.profilePicture ? (
                    <img 
                      src={selectedUser.profilePicture} 
                      alt={selectedUser.name || selectedUser.username} 
                    />
                  ) : (
                    <div className="default-avatar">
                      {(selectedUser.name || selectedUser.username)?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <h4>{selectedUser.name || selectedUser.username}</h4>
                  <span className="user-role-badge">{selectedUser.role}</span>
                  {selectedUser.university && (
                    <p><i className="fas fa-university"></i> {selectedUser.university}</p>
                  )}
                  {selectedUser.course && (
                    <p><i className="fas fa-graduation-cap"></i> {selectedUser.course}</p>
                  )}
                </div>
              </div>
              
              <div className="message-section">
                <label htmlFor="connectionMessage">
                  Add a personal message
                </label>
                <textarea
                  id="connectionMessage"
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  placeholder={`Hi ${selectedUser.name || selectedUser.username}, I'd like to connect with you!`}
                  maxLength={300}
                  rows={4}
                />
                <small>{connectionMessage.length}/300 characters</small>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowConnectionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
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

export default UserSearch;
