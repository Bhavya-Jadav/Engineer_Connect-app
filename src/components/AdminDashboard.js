import React, { useState, useEffect } from 'react';
import Header from './Header';
import '../styles/AdminDashboard.css';
import { API_BASE_URL } from '../utils/api';

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
  
  // Problem posting state
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [problemFormData, setProblemFormData] = useState({
    company: 'Admin',
    branch: '',
    title: '',
    description: '',
    videoUrl: '',
    difficulty: 'beginner',
    tags: [],
    quiz: {
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }
  });
  const [newTag, setNewTag] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Ideas and solutions state
  const [allProblems, setAllProblems] = useState([]);
  const [allIdeas, setAllIdeas] = useState([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchUsers();
    if (activeTab === 'ideas') {
      fetchAllIdeas();
    }
  }, [currentPage, roleFilter, searchTerm, activeTab]);

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

  const fetchAllIdeas = async () => {
    setIdeasLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/ideas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('All ideas received:', data);
        setAllIdeas(data);
      } else {
        console.error('Failed to fetch ideas:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setIdeasLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !problemFormData.tags.includes(newTag.trim())) {
      setProblemFormData({
        ...problemFormData,
        tags: [...problemFormData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setProblemFormData({
      ...problemFormData,
      tags: problemFormData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...problemFormData.quiz.questions];
    if (field === 'question') {
      updatedQuestions[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('_')[1]);
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuestions[index].correctAnswer = parseInt(value);
    }
    setProblemFormData({
      ...problemFormData,
      quiz: { ...problemFormData.quiz, questions: updatedQuestions }
    });
  };

  const addQuestion = () => {
    setProblemFormData({
      ...problemFormData,
      quiz: {
        ...problemFormData.quiz,
        questions: [...problemFormData.quiz.questions, 
          { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]
      }
    });
  };

  const removeQuestion = (index) => {
    if (problemFormData.quiz.questions.length > 1) {
      const updatedQuestions = problemFormData.quiz.questions.filter((_, i) => i !== index);
      setProblemFormData({
        ...problemFormData,
        quiz: { ...problemFormData.quiz, questions: updatedQuestions }
      });
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('file', file);
      });

      const uploadUrl = `${API_BASE_URL.replace('/api', '')}/api/files/upload`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const result = await response.json();
      return result.file ? [result.file] : [];
    } catch (error) {
      console.error('File upload error:', error);
      alert('File upload failed. Please try again.');
      return [];
    }
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    
    if (!problemFormData.title.trim() || !problemFormData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const hasValidQuiz = problemFormData.quiz.questions.every(q => 
      q.question.trim() !== '' && 
      q.options.every(opt => opt.trim() !== '')
    );
    
    if (!hasValidQuiz) {
      alert('Please fill in all quiz questions and options');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload files first if any are selected
      let attachments = [];
      if (selectedFiles.length > 0) {
        attachments = await uploadFiles();
      }

      // Prepare quiz data
      const quizData = {
        enabled: true,
        questions: problemFormData.quiz.questions.map(q => ({
          question: q.question,
          type: 'multiple-choice',
          options: q.options.map((opt, index) => ({
            text: opt,
            isCorrect: index === q.correctAnswer
          }))
        })),
        title: `${problemFormData.title} Quiz`,
        description: 'Complete this quiz to submit your idea',
        timeLimit: 30,
        passingScore: 70
      };
      
      const problemData = {
        company: 'Admin',
        branch: problemFormData.branch,
        title: problemFormData.title,
        description: problemFormData.description,
        videoUrl: problemFormData.videoUrl.trim() || null,
        difficulty: problemFormData.difficulty,
        tags: problemFormData.tags,
        quiz: quizData,
        attachments: attachments
      };

      const response = await fetch(`${API_BASE_URL}/problems`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(problemData)
      });

      if (response.ok) {
        alert('Problem posted successfully!');
        // Reset form
        setProblemFormData({
          company: 'Admin',
          branch: '',
          title: '',
          description: '',
          videoUrl: '',
          difficulty: 'beginner',
          tags: [],
          quiz: {
            questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
          }
        });
        setSelectedFiles([]);
        setNewTag('');
        setShowProblemForm(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to post problem');
      }
    } catch (error) {
      console.error('Error posting problem:', error);
      alert('Error posting problem');
    } finally {
      setIsSubmitting(false);
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
          
          <div className="admin-actions">
            <button 
              className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('overview');
                setShowStatistics(false);
              }}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Overview</span>
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'problems' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('problems');
                setShowStatistics(false);
              }}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Post Problems</span>
            </button>
            <button 
              className={`admin-tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('ideas');
                setShowStatistics(false);
              }}
            >
              <i className="fas fa-lightbulb"></i>
              <span>View Ideas</span>
            </button>
            <button 
              className={`statistics-btn ${showStatistics ? 'active' : ''}`}
              onClick={() => {
                setShowStatistics(!showStatistics);
                setActiveTab('');
              }}
            >
              <i className="fas fa-chart-bar"></i>
              <span>Statistics</span>
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="overview-content">
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

            <div className="user-management-section">
              <div className="section-header">
                <h2><i className="fas fa-users-cog"></i> User Management</h2>
              </div>
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
                          <td>
                            <div className="user-info">
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

        {/* Post Problems Tab */}
        {activeTab === 'problems' && (
          <div className="problems-section">
            <div className="section-header">
              <h2><i className="fas fa-plus-circle"></i> Post Engineering Problems</h2>
              <p>Create and manage engineering problems for students to solve</p>
            </div>
            
            {!showProblemForm ? (
              <div className="action-buttons">
                <button 
                  className="action-btn primary"
                  onClick={() => setShowProblemForm(true)}
                >
                  <i className="fas fa-plus"></i>
                  <span>Create New Problem</span>
                </button>
                <button 
                  className="action-btn secondary"
                  onClick={() => setCurrentView('problemsList')}
                >
                  <i className="fas fa-list"></i>
                  <span>View All Problems</span>
                </button>
              </div>
            ) : (
              <div className="problem-form-container">
                <div className="form-header">
                  <h3>Create New Problem</h3>
                  <button 
                    className="close-form-btn"
                    onClick={() => setShowProblemForm(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <form onSubmit={handleSubmitProblem} className="problem-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Branch/Department</label>
                      <input
                        type="text"
                        value={problemFormData.branch}
                        onChange={(e) => setProblemFormData({...problemFormData, branch: e.target.value})}
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Difficulty Level</label>
                      <select
                        value={problemFormData.difficulty}
                        onChange={(e) => setProblemFormData({...problemFormData, difficulty: e.target.value})}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Problem Title</label>
                    <input
                      type="text"
                      value={problemFormData.title}
                      onChange={(e) => setProblemFormData({...problemFormData, title: e.target.value})}
                      placeholder="Enter problem title"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Problem Description</label>
                    <textarea
                      value={problemFormData.description}
                      onChange={(e) => setProblemFormData({...problemFormData, description: e.target.value})}
                      placeholder="Describe the problem in detail..."
                      rows="6"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowProblemForm(false)} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="submit-btn">
                      {isSubmitting ? (
                        <><i className="fas fa-spinner fa-spin"></i> Posting...</>
                      ) : (
                        <><i className="fas fa-plus"></i> Post Problem</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* View Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="ideas-section">
            <div className="section-header">
              <h2><i className="fas fa-lightbulb"></i> Student Ideas & Solutions</h2>
              <p>Review and manage student submissions and ideas</p>
            </div>
            
            {ideasLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading ideas...</p>
              </div>
            ) : (
              <div className="ideas-content">
                {allIdeas.length === 0 ? (
                  <div className="no-ideas">
                    <i className="fas fa-lightbulb"></i>
                    <h3>No Ideas Found</h3>
                    <p>No student ideas have been submitted yet.</p>
                  </div>
                ) : (
                  <div className="ideas-grid">
                    {allIdeas.map((idea, index) => (
                      <div key={idea._id || index} className="idea-card">
                        <div className="idea-header">
                          <h4>{idea.title || 'Untitled Idea'}</h4>
                          <span className="idea-date">
                            {idea.createdAt ? formatDate(idea.createdAt) : 'Unknown date'}
                          </span>
                        </div>
                        
                        <div className="idea-content">
                          <p className="idea-description">
                            {idea.description ? 
                              (idea.description.length > 150 ? 
                                idea.description.substring(0, 150) + '...' : 
                                idea.description
                              ) : 'No description provided'
                            }
                          </p>
                        </div>
                        
                        <div className="idea-footer">
                          <div className="student-info">
                            <i className="fas fa-user"></i>
                            <span>{idea.student?.name || idea.student?.username || 'Anonymous'}</span>
                          </div>
                          
                          <div className="problem-info">
                            <i className="fas fa-building"></i>
                            <span>{idea.problem?.company || 'Unknown Company'}</span>
                          </div>
                        </div>
                        
                        <div className="idea-actions">
                          <button 
                            className="view-btn"
                            onClick={() => {
                              alert(`Viewing idea: ${idea.title}\n\nDescription: ${idea.description}\n\nStudent: ${idea.student?.name || 'Anonymous'}`);
                            }}
                          >
                            <i className="fas fa-eye"></i> View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
