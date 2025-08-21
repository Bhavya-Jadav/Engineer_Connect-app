import React, { useState, useEffect } from 'react';
import Header from './Header';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ 
  isLoggedIn, 
  currentUser, 
  userRole, 
  handleLogout, 
  setCurrentView, 
  onProfileClick 
}) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    companies: 0,
    admins: 0,
    recentRegistrations: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
    : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [currentPage, roleFilter, searchTerm]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin stats received:', data);
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        role: roleFilter,
        search: searchTerm
      });

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin users received:', data);
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.name || user.username}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('User deleted successfully');
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleChangeRole = async (user) => {
    const roles = ['student', 'company', 'admin'];
    const currentRole = user.role;
    const availableRoles = roles.filter(role => role !== currentRole);
    
    const roleOptions = availableRoles.map((role, index) => `${index + 1}. ${role}`).join('\n');
    const selectedOption = window.prompt(
      `Change role for "${user.name || user.username}"?\n\nCurrent role: ${currentRole}\n\nSelect new role:\n${roleOptions}\n\nEnter number (1-${availableRoles.length}) or cancel:`
    );
    
    if (!selectedOption) {
      return; // User cancelled
    }
    
    const roleIndex = parseInt(selectedOption) - 1;
    if (isNaN(roleIndex) || roleIndex < 0 || roleIndex >= availableRoles.length) {
      alert('Invalid selection. Please try again.');
      return;
    }
    
    const newRole = availableRoles[roleIndex];
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        alert(`User role changed to ${newRole} successfully`);
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to change user role');
      }
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('Error changing user role');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ff6b6b';
      case 'company': return '#4ecdc4';
      case 'student': return '#45b7d1';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Header 
          isLoggedIn={isLoggedIn} 
          currentUser={currentUser} 
          userRole={userRole} 
          handleLogout={handleLogout} 
          setCurrentView={setCurrentView}
          currentView="adminDashboard"
          onProfileClick={onProfileClick}
        />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Header 
        isLoggedIn={isLoggedIn} 
        currentUser={currentUser} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        setCurrentView={setCurrentView}
        currentView="adminDashboard"
        onProfileClick={onProfileClick}
      />

      <div className="admin-content">
        <div className="admin-header">
          <h1><i className="fas fa-shield-alt"></i> Admin Dashboard</h1>
          <p>Manage users, post problems, view ideas, and monitor platform statistics</p>
          
          {/* Admin Action Buttons */}
          <div className="admin-actions">
            <button 
              className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-tachometer-alt"></i> Overview
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'problems' ? 'active' : ''}`}
              onClick={() => setActiveTab('problems')}
            >
              <i className="fas fa-plus-circle"></i> Post Problems
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
              onClick={() => setActiveTab('ideas')}
            >
              <i className="fas fa-lightbulb"></i> View Ideas
            </button>
            <button 
              className="statistics-btn"
              onClick={() => setShowStatistics(!showStatistics)}
            >
              <i className="fas fa-chart-bar"></i> Statistics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card students">
            <div className="stat-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.students}</h3>
              <p>Students</p>
            </div>
          </div>

          <div className="stat-card companies">
            <div className="stat-icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.companies}</h3>
              <p>Companies</p>
            </div>
          </div>

          <div className="stat-card admins">
            <div className="stat-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.admins}</h3>
              <p>Admins</p>
            </div>
          </div>

          <div className="stat-card recent">
            <div className="stat-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.recentRegistrations}</h3>
              <p>New (30 days)</p>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="user-management-section">
          <div className="section-header">
            <h2><i className="fas fa-users-cog"></i> User Management</h2>
          </div>

          {/* Search and Filter Controls */}
          <div className="controls-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </form>

            <div className="filter-controls">
              <select 
                value={roleFilter} 
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="role-filter"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="company">Companies</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="users-table-container">
            {usersLoading ? (
              <div className="table-loading">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td className="user-info">
                        <div className="user-avatar">
                          {user.profilePicture ? (
                            <img 
                              src={user.profilePicture.startsWith('data:') || user.profilePicture.startsWith('http') 
                                ? user.profilePicture 
                                : `data:image/jpeg;base64,${user.profilePicture}`} 
                              alt={user.name || user.username}
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              <i className="fas fa-user"></i>
                            </div>
                          )}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name || user.username}</div>
                          <div className="user-username">@{user.username}</div>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="role-badge" 
                          style={{ backgroundColor: getRoleColor(user.role) }}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.email}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="actions">
                        <button
                          className="action-btn change-role"
                          onClick={() => handleChangeRole(user)}
                          title="Change Role"
                        >
                          <i className="fas fa-user-tag"></i>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteUser(user)}
                          title="Delete User"
                          disabled={user._id === currentUser?._id}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
          </>
        )}

        {/* Post Problems Tab */}
        {activeTab === 'problems' && (
          <div className="problems-section">
            <div className="section-header">
              <h2><i className="fas fa-plus-circle"></i> Post Engineering Problems</h2>
              <p>Create and manage engineering problems for students to solve</p>
            </div>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => setCurrentView('companyDashboard')}
              >
                <i className="fas fa-plus"></i> Create New Problem
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setCurrentView('problemsList')}
              >
                <i className="fas fa-list"></i> View All Problems
              </button>
            </div>
          </div>
        )}

        {/* View Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="ideas-section">
            <div className="section-header">
              <h2><i className="fas fa-lightbulb"></i> Student Ideas & Solutions</h2>
              <p>Review and manage student submissions and ideas</p>
            </div>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={() => setCurrentView('ideaList')}
              >
                <i className="fas fa-eye"></i> View All Ideas
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setCurrentView('solutionReview')}
              >
                <i className="fas fa-check-circle"></i> Review Solutions
              </button>
            </div>
          </div>
        )}

        {/* Statistics Panel */}
        {showStatistics && (
          <div className="statistics-panel">
            <div className="statistics-header">
              <h2><i className="fas fa-chart-bar"></i> User Statistics & Management</h2>
              <button 
                className="close-statistics"
                onClick={() => setShowStatistics(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* User Management Section */}
            <div className="user-management-section">
              <div className="section-header">
                <h3><i className="fas fa-users-cog"></i> User Management</h3>
              </div>

              {/* Search and Filter Controls */}
              <div className="controls-section">
                <form onSubmit={(e) => e.preventDefault()} className="search-form">
                  <div className="search-input-wrapper">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Search by name, email, or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="search-btn">
                    <i className="fas fa-search"></i>
                  </button>
                </form>

                <div className="filter-controls">
                  <select 
                    value={roleFilter} 
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="role-filter"
                  >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="company">Companies</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              {usersLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading users...</p>
                </div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} />
                              ) : (
                                <div className="avatar-placeholder">
                                  <i className="fas fa-user"></i>
                                </div>
                              )}
                            </div>
                            <div className="user-details">
                              <div className="user-name">{user.name || user.username}</div>
                              <div className="user-username">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="role-badge" 
                            style={{ backgroundColor: user.role === 'admin' ? '#ff6b6b' : 
                                                    user.role === 'company' ? '#4ecdc4' : '#45b7d1' }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="actions">
                          <button
                            className="action-btn change-role"
                            onClick={() => handleChangeRole(user)}
                            title="Change Role"
                          >
                            <i className="fas fa-user-tag"></i>
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                            disabled={user._id === currentUser?._id}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
