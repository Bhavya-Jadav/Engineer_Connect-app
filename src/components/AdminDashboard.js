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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');

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

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser._id}`, {
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
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleChangeRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser._id}/role`, {
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
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
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
          <p>Manage users and monitor platform statistics</p>
        </div>

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
                          onClick={() => {
                            setSelectedUser(user);
                            setNewRole(user.role);
                            setShowRoleModal(true);
                          }}
                          title="Change Role"
                        >
                          <i className="fas fa-user-tag"></i>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h3><i className="fas fa-exclamation-triangle"></i> Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete user <strong>{selectedUser?.name || selectedUser?.username}</strong>?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal role-modal">
            <div className="modal-header">
              <h3><i className="fas fa-user-tag"></i> Change User Role</h3>
            </div>
            <div className="modal-body">
              <p>Change role for <strong>{selectedUser?.name || selectedUser?.username}</strong></p>
              <div className="role-selection">
                <label>
                  <input
                    type="radio"
                    value="student"
                    checked={newRole === 'student'}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <span className="role-option student">
                    <i className="fas fa-graduation-cap"></i>
                    Student
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="company"
                    checked={newRole === 'company'}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <span className="role-option company">
                    <i className="fas fa-building"></i>
                    Company
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                  <span className="role-option admin">
                    <i className="fas fa-shield-alt"></i>
                    Admin
                  </span>
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleChangeRole}
                disabled={newRole === selectedUser?.role}
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
