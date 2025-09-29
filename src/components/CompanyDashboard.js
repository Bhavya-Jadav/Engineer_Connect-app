// src/components/CompanyDashboard.js
import React, { useState } from 'react';
import Header from './HeaderWithBack';
import '../styles/modals.css';
import { API_BASE_URL } from '../utils/api';

const CompanyDashboard = ({
  problems,
  onSubmitProblem,
  onDeleteProblem,
  onViewIdeas,
  isLoggedIn,
  currentUser,
  userRole,
  handleLogout,
  setCurrentView,
  handleBack,
  onProfileClick
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProblemForIdeas, setSelectedProblemForIdeas] = useState(null);
  const [selectedStudentIdea, setSelectedStudentIdea] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    branch: '',
    title: '',
    description: '',
    videoUrl: '',
    difficulty: 'beginner',
    tags: [],
    quiz: {
      questions: [
        { question: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]
    }
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedAttachments, setUploadedAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [showAllIdeas, setShowAllIdeas] = useState(false);
  const [allIdeas, setAllIdeas] = useState([]);
  const [isLoadingAllIdeas, setIsLoadingAllIdeas] = useState(false);
  const [ideasSearchTerm, setIdeasSearchTerm] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    students: 0,
    companies: 0,
    admins: 0,
    recentRegistrations: 0
  });
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [skillsFilter, setSkillsFilter] = useState('');

  // User management functions
  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete user "${user.name || user.username}"?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
<<<<<<< Updated upstream
      
=======
      const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
>>>>>>> Stashed changes
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setUsers(users.filter(u => u._id !== user._id));
        alert('User deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete user'}`);
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
      return;
    }
    const roleIndex = parseInt(selectedOption) - 1;
    if (isNaN(roleIndex) || roleIndex < 0 || roleIndex >= availableRoles.length) {
      alert('Invalid selection. Please try again.');
      return;
    }
    const newRole = availableRoles[roleIndex];
    try {
      const token = localStorage.getItem('token');
<<<<<<< Updated upstream
      
=======
      const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
>>>>>>> Stashed changes
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        setUsers(users.map(u =>
          u._id === user._id
            ? { ...u, role: newRole }
            : u
        ));
        alert(`User role changed to ${newRole} successfully`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to change user role'}`);
      }
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('Error changing user role');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQuizChange = (questionIndex, field, value, optionIndex = null) => {
    const updatedQuiz = { ...formData.quiz };
    if (field === 'question') {
      updatedQuiz.questions[questionIndex].question = value;
    } else if (field === 'option') {
      updatedQuiz.questions[questionIndex].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      updatedQuiz.questions[questionIndex].correctAnswer = parseInt(value);
    }
    setFormData({ ...formData, quiz: updatedQuiz });
  };

  const addQuestion = () => {
    const updatedQuiz = { ...formData.quiz };
    updatedQuiz.questions.push({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setFormData({ ...formData, quiz: updatedQuiz });
  };

  const removeQuestion = (questionIndex) => {
    const updatedQuiz = { ...formData.quiz };
    updatedQuiz.questions.splice(questionIndex, 1);
    setFormData({ ...formData, quiz: updatedQuiz });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleEditProblem = (problem) => {
    setEditingProblem(problem);
    setFormData({
      company: problem.company || '',
      branch: problem.branch || '',
      title: problem.title || '',
      description: problem.description || '',
      videoUrl: problem.videoUrl || '',
      difficulty: problem.difficulty || 'beginner',
      tags: Array.isArray(problem.tags) ? problem.tags : (problem.tags ? problem.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
      quiz: {
        questions: problem.quiz?.questions?.map(q => ({
          question: q.question || '',
          options: q.options?.map(opt => opt.text || opt) || ['', '', '', ''],
          correctAnswer: q.options?.findIndex(opt => opt.isCorrect) || 0
        })) || [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
      }
    });
    if (problem.attachments && problem.attachments.length > 0) {
      setUploadedAttachments(problem.attachments);
    } else {
      setUploadedAttachments([]);
    }
    setSelectedFiles([]);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingProblem(null);
    setFormData({
      company: '',
      branch: '',
      title: '',
      description: '',
      videoUrl: '',
      difficulty: 'beginner',
      tags: [],
      quiz: {
        questions: [
          { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]
      }
    });
    setSelectedFiles([]);
    setUploadedAttachments([]);
    setNewTag('');
    setShowForm(false);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ];
      return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
    });
    if (validFiles.length !== files.length) {
      alert('Some files were invalid. Only PDF, Word, PowerPoint, Excel, and Text files under 10MB are allowed.');
    }
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (index) => {
    setUploadedAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];
    console.log('Starting file upload...', selectedFiles.length, 'files');
    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('file', file);
      });
<<<<<<< Updated upstream

      const uploadUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}`.replace(/\/api$/, '') + '/api/files/upload';
      console.log('Upload URL:', uploadUrl);
      console.log('Token exists:', !!localStorage.getItem('token'));

=======
      const uploadUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}`.replace(/\/api$/, '') + '/files/upload';
>>>>>>> Stashed changes
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('File upload failed');
      }
      const result = await response.json();
      const newAttachments = [...uploadedAttachments, result.file];
      setUploadedAttachments(newAttachments);
      setSelectedFiles([]);
      return newAttachments;
    } catch (error) {
      console.error('File upload error:', error);
      alert('File upload failed. Please try again.');
      return uploadedAttachments;
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return 'fas fa-file-pdf';
      case 'doc':
      case 'docx': return 'fas fa-file-word';
      case 'ppt':
      case 'pptx': return 'fas fa-file-powerpoint';
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel';
      case 'txt': return 'fas fa-file-alt';
      default: return 'fas fa-file';
    }
  };

  const getFileColor = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf': return '#FF5722';
      case 'doc':
      case 'docx': return '#2196F3';
      case 'ppt':
      case 'pptx': return '#FF9800';
      case 'xls':
      case 'xlsx': return '#4CAF50';
      case 'txt': return '#9E9E9E';
      default: return '#607D8B';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasValidQuiz = formData.quiz.questions.every(q =>
      q.question.trim() !== '' &&
      q.options.every(opt => opt.trim() !== '')
    );
    if (!hasValidQuiz) {
      alert('Please fill in all quiz questions and options');
      return;
    }
    let attachments = [...uploadedAttachments];
    if (selectedFiles.length > 0) {
      const newAttachments = await uploadFiles();
      attachments = newAttachments;
      if (selectedFiles.length > 0 && attachments.length === uploadedAttachments.length) {
        alert('File upload failed. Please try again.');
        return;
      }
    }
    const quizData = {
      enabled: formData.quiz.questions.some(q => q.question.trim() !== ''),
      questions: formData.quiz.questions
        .filter(q => q.question.trim() !== '')
        .map(q => ({
          question: q.question,
          type: 'multiple-choice',
          options: q.options.map((opt, index) => ({
            text: opt,
            isCorrect: index === q.correctAnswer
          }))
        })),
      title: `${formData.title} Quiz`,
      description: 'Complete this quiz to submit your idea',
      timeLimit: 30,
      passingScore: 70
    };
    const problemData = {
      company: formData.company,
      branch: formData.branch,
      title: formData.title,
      description: formData.description,
      videoUrl: formData.videoUrl.trim() || null,
      difficulty: formData.difficulty,
      tags: formData.tags,
      quiz: quizData,
      attachments: attachments
    };
    if (editingProblem) {
      await handleUpdateProblem(editingProblem._id, problemData);
    } else {
      onSubmitProblem(problemData);
    }
    setFormData({
      company: '',
      branch: '',
      title: '',
      description: '',
      videoUrl: '',
      difficulty: 'beginner',
      tags: [],
      quiz: {
        questions: [
          { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]
      }
    });
    setSelectedFiles([]);
    setUploadedAttachments([]);
    setEditingProblem(null);
    setNewTag('');
    setShowForm(false);
  };

  const handleUpdateProblem = async (problemId, problemData) => {
    try {
      const token = localStorage.getItem('token');
<<<<<<< Updated upstream
      const updateUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}`.replace(/\/api$/, '') + `/api/problems/${problemId}`;
      
      console.log('Update URL:', updateUrl);
      console.log('Problem data:', problemData);
      
=======
      const updateUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}`.replace(/\/api$/, '') + `/problems/${problemId}`;
>>>>>>> Stashed changes
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(problemData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update problem: ${response.status} ${response.statusText}`);
      }
      alert('Problem updated successfully!');
      window.location.reload();
    } catch (error) {
      console.error("Update problem error:", error);
      alert(`Error updating problem: ${error.message}`);
    }
  };

  const handleViewIdeas = async (problemId) => {
    setIsLoadingIdeas(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/ideas/problem/${problemId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      const problem = problems.find(p => p._id === problemId);
      if (problem) {
        setSelectedProblemForIdeas({ ...problem, ideas: data });
        setSelectedStudentIdea(null);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
<<<<<<< Updated upstream
      
=======
      const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
>>>>>>> Stashed changes
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
<<<<<<< Updated upstream
=======
      const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
>>>>>>> Stashed changes
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        role: roleFilter,
        search: userSearchTerm
      });
      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleViewUserManagement = () => {
    setShowUserManagement(true);
    fetchUserStats();
    fetchUsers();
  };

  const handleViewAllIdeas = async () => {
    setIsLoadingAllIdeas(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/ideas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      setAllIdeas(data);
      setShowAllIdeas(true);
    } catch (error) {
      alert(`Error fetching all ideas: ${error.message}`);
    } finally {
      setIsLoadingAllIdeas(false);
    }
  };

  const renderStudentProfile = (student) => {
    if (!student) {
      return (
        <div className="student-profile-missing">
          <div className="profile-avatar-placeholder">
            <i className="fas fa-user"></i>
          </div>
          <div className="profile-info">
            <div className="profile-name">Unknown Student</div>
            <div className="profile-status missing">Profile information not available</div>
          </div>
        </div>
      );
    }
    const missingFields = [];
    if (!student.name || student.name.trim() === '') missingFields.push('name');
    if (!student.email || student.email.trim() === '') missingFields.push('email');
    if (!student.phone || student.phone.trim() === '') missingFields.push('phone');
    if (!student.university || student.university.trim() === '') missingFields.push('university');
    if (!student.course || student.course.trim() === '') missingFields.push('course');
    if (!student.year || student.year.toString().trim() === '') missingFields.push('year');
    if (!student.bio || student.bio.trim() === '') missingFields.push('bio');
    if (!student.skills || student.skills.length === 0) missingFields.push('skills');
    const isProfileComplete = missingFields.length === 0;
    return (
      <div className="student-profile">
        <div className="profile-header">
          <div className="profile-avatar">
            {student.profilePicture ? (
              <img
                src={student.profilePicture.startsWith('data:') || student.profilePicture.startsWith('http') ? student.profilePicture : `data:image/jpeg;base64,${student.profilePicture}`}
                alt={student.name || student.username}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentNode.querySelector('.avatar-placeholder');
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className="avatar-placeholder" style={{ display: student.profilePicture ? 'none' : 'flex' }}>
              <i className="fas fa-user"></i>
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-name">
              {student.name || student.username || 'Unknown Student'}
            </div>
            <div className="profile-username">@{student.username}</div>
            {!isProfileComplete && (
              <div className="profile-status incomplete" title={`Missing: ${missingFields.join(', ')}`}>
                <i className="fas fa-exclamation-triangle"></i>
                Profile incomplete ({missingFields.length} missing fields)
              </div>
            )}
            {isProfileComplete && (
              <div className="profile-status complete">
                <i className="fas fa-check-circle"></i>
                Profile complete
              </div>
            )}
          </div>
        </div>
        <div className="profile-details">
          {student.email && (
            <div className="profile-field">
              <i className="fas fa-envelope"></i>
              <span>{student.email}</span>
            </div>
          )}
          {student.phone && (
            <div className="profile-field">
              <i className="fas fa-phone"></i>
              <span>{student.phone}</span>
            </div>
          )}
          {student.university && (
            <div className="profile-field">
              <i className="fas fa-university"></i>
              <span>{student.university}</span>
            </div>
          )}
          {student.course && (
            <div className="profile-field">
              <i className="fas fa-graduation-cap"></i>
              <span>{student.course}</span>
            </div>
          )}
          {student.year && (
            <div className="profile-field">
              <i className="fas fa-calendar"></i>
              <span>Year {student.year}</span>
            </div>
          )}
          {student.bio && (
            <div className="profile-field">
              <i className="fas fa-info-circle"></i>
              <span>{student.bio}</span>
            </div>
          )}
          {student.skills && student.skills.length > 0 && (
            <div className="profile-field">
              <i className="fas fa-cogs"></i>
              <div className="skills-list">
                {student.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{typeof skill === 'string' ? skill : skill.name || skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (selectedStudentIdea) {
    return (
      <div className="company-dashboard">
        <Header
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          userRole={userRole}
          handleLogout={handleLogout}
          setCurrentView={setCurrentView}
          currentView="companyDashboard"
          handleBack={() => setSelectedStudentIdea(null)}
          onProfileClick={onProfileClick}
        />
        <div className="student-detail-container">
          <div className="detail-header-section">
            <div className="breadcrumb">
              <span onClick={() => setSelectedStudentIdea(null)} className="breadcrumb-link">
                <i className="fas fa-arrow-left"></i> Back to Solutions
              </span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Student Profile & Solution</span>
            </div>
          </div>
          <div className="student-profile-section">
            <div className="profile-card-detailed">
              <div className="profile-header-detailed">
                <div className="profile-avatar-large">
                  {selectedStudentIdea.student?.profilePicture ? (
                    <img
                      src={selectedStudentIdea.student.profilePicture.startsWith('data:') || selectedStudentIdea.student.profilePicture.startsWith('http') ? selectedStudentIdea.student.profilePicture : `data:image/jpeg;base64,${selectedStudentIdea.student.profilePicture}`}
                      alt={selectedStudentIdea.student.name || selectedStudentIdea.student.username}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentNode.querySelector('.avatar-placeholder-large');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className="avatar-placeholder-large" style={{ display: selectedStudentIdea.student?.profilePicture ? 'none' : 'flex' }}>
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                <div className="profile-info-detailed">
                  <h1 className="student-name-large">
                    {selectedStudentIdea.student?.name || selectedStudentIdea.student?.username || 'Unknown Student'}
                  </h1>
                  <div className="student-username-large">@{selectedStudentIdea.student?.username}</div>
                  <div className="contact-info">
                    {selectedStudentIdea.student?.email && (
                      <div className="contact-item">
                        <i className="fas fa-envelope"></i>
                        <span>{selectedStudentIdea.student.email}</span>
                      </div>
                    )}
                    {selectedStudentIdea.student?.phone && (
                      <div className="contact-item">
                        <i className="fas fa-phone"></i>
                        <span>{selectedStudentIdea.student.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="profile-details-grid">
                {selectedStudentIdea.student?.university && (
                  <div className="detail-card">
                    <div className="detail-icon">
                      <i className="fas fa-university"></i>
                    </div>
                    <div className="detail-content">
                      <div className="detail-label">University</div>
                      <div className="detail-value">{selectedStudentIdea.student.university}</div>
                    </div>
                  </div>
                )}
                {selectedStudentIdea.student?.course && (
                  <div className="detail-card">
                    <div className="detail-icon">
                      <i className="fas fa-graduation-cap"></i>
                    </div>
                    <div className="detail-content">
                      <div className="detail-label">Course</div>
                      <div className="detail-value">{selectedStudentIdea.student.course}</div>
                    </div>
                  </div>
                )}
                {selectedStudentIdea.student?.year && (
                  <div className="detail-card">
                    <div className="detail-icon">
                      <i className="fas fa-calendar"></i>
                    </div>
                    <div className="detail-content">
                      <div className="detail-label">Academic Year</div>
                      <div className="detail-value">Year {selectedStudentIdea.student.year}</div>
                    </div>
                  </div>
                )}
              </div>
              {selectedStudentIdea.student?.bio && (
                <div className="bio-section">
                  <h3><i className="fas fa-info-circle"></i> About</h3>
                  <p className="bio-text">{selectedStudentIdea.student.bio}</p>
                </div>
              )}
              {selectedStudentIdea.student?.skills && selectedStudentIdea.student.skills.length > 0 && (
                <div className="skills-section">
                  <h3><i className="fas fa-cogs"></i> Skills & Expertise</h3>
                  <div className="skills-grid">
                    {selectedStudentIdea.student.skills.map((skill, index) => (
                      <span key={index} className="skill-badge">{typeof skill === 'string' ? skill : skill.name || skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="solution-detail-section">
            <div className="solution-card-detailed">
              <div className="solution-header-detailed">
                <h2><i className="fas fa-lightbulb"></i> Proposed Solution</h2>
                <div className="submission-date-detailed">
                  <i className="fas fa-clock"></i>
                  Submitted on {new Date(selectedStudentIdea.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="solution-content-detailed">
                <div className="idea-section">
                  <h3>💡 Solution Overview</h3>
                  <div className="idea-text-detailed">
                    {selectedStudentIdea.ideaText}
                  </div>
                </div>
                {selectedStudentIdea.implementationApproach && (
                  <div className="implementation-section">
                    <h3>🔧 Implementation Strategy</h3>
                    <div className="implementation-text-detailed">
                      {selectedStudentIdea.implementationApproach}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAllIdeas) {
    const filteredIdeas = allIdeas.filter(idea =>
      idea.problem?.company?.toLowerCase().includes(ideasSearchTerm.toLowerCase()) ||
      idea.problem?.title?.toLowerCase().includes(ideasSearchTerm.toLowerCase()) ||
      idea.student?.name?.toLowerCase().includes(ideasSearchTerm.toLowerCase()) ||
      idea.student?.university?.toLowerCase().includes(ideasSearchTerm.toLowerCase()) ||
      idea.ideaText?.toLowerCase().includes(ideasSearchTerm.toLowerCase())
    );
    return (
      <div className="company-dashboard">
        <Header
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          userRole={userRole}
          handleLogout={handleLogout}
          setCurrentView={setCurrentView}
          currentView="companyDashboard"
          handleBack={() => setShowAllIdeas(false)}
          onProfileClick={onProfileClick}
        />
        <div className="all-ideas-view-container">
          <div className="ideas-header-section">
            <div className="breadcrumb">
              <span onClick={() => setShowAllIdeas(false)} className="breadcrumb-link">
                <i className="fas fa-arrow-left"></i> Back to Dashboard
              </span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">All Ideas from All Companies</span>
            </div>
            <div className="search-section">
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="fas fa-search search-icon"></i>
                  <input
                    type="text"
                    placeholder="Search ideas by company, problem, student, or content..."
                    value={ideasSearchTerm}
                    onChange={(e) => setIdeasSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {ideasSearchTerm && (
                    <button
                      onClick={() => setIdeasSearchTerm('')}
                      className="search-clear-btn"
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
                {ideasSearchTerm && (
                  <div className="search-results-info">
                    <i className="fas fa-info-circle"></i>
                    Found {filteredIdeas.length} idea(s) matching "{ideasSearchTerm}"
                  </div>
                )}
              </div>
            </div>
            <div className="ideas-overview-stats">
              <h2>
                <i className="fas fa-lightbulb"></i>
                All Student Ideas ({filteredIdeas.length})
              </h2>
              <p>Ideas submitted by students across all companies</p>
            </div>
          </div>
          <div className="ideas-list-container">
            {filteredIdeas.length > 0 ? (
              filteredIdeas.map((idea) => (
                <div key={idea._id} className="idea-card admin-idea-card">
                  <div className="idea-card-header">
                    <div className="problem-info">
                      <h3 className="problem-title-link">
                        <i className="fas fa-briefcase"></i>
                        {idea.problem?.company} - {idea.problem?.title}
                      </h3>
                      <span className="branch-badge">{idea.problem?.branch}</span>
                    </div>
                    <div className="submission-date">
                      <i className="fas fa-calendar"></i>
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="student-info-compact">
                    <div className="student-avatar">
                      {idea.student?.profilePicture ? (
                        <img src={idea.student.profilePicture} alt="Student" />
                      ) : (
                        <div className="default-avatar">
                          {idea.student?.name?.charAt(0) || 'S'}
                        </div>
                      )}
                    </div>
                    <div className="student-details">
                      <strong>{idea.student?.name || 'Unknown Student'}</strong>
                      <div className="student-meta">
                        {idea.student?.university && (
                          <span><i className="fas fa-university"></i> {idea.student.university}</span>
                        )}
                        {idea.student?.course && (
                          <span><i className="fas fa-graduation-cap"></i> {idea.student.course}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="idea-content-preview">
                    <h4><i className="fas fa-lightbulb"></i> Solution</h4>
                    <p className="idea-text-preview">
                      {idea.ideaText?.length > 200
                        ? `${idea.ideaText.substring(0, 200)}...`
                        : idea.ideaText
                      }
                    </p>
                    {idea.implementationApproach && (
                      <div className="implementation-preview">
                        <h5><i className="fas fa-cogs"></i> Implementation</h5>
                        <p>
                          {idea.implementationApproach?.length > 150
                            ? `${idea.implementationApproach.substring(0, 150)}...`
                            : idea.implementationApproach
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  {idea.student?.skills?.length > 0 && (
                    <div className="student-skills-compact">
                      <strong>Skills:</strong>
                      <div className="skills-tags">
                        {idea.student.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-tag">{typeof skill === 'string' ? skill : skill.name || skill}</span>
                        ))}
                        {idea.student.skills.length > 3 && (
                          <span className="skill-tag more">+{idea.student.skills.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-ideas-found">
                <i className="fas fa-search"></i>
                <h3>No Ideas Found</h3>
                <p>
                  {ideasSearchTerm
                    ? `No ideas match your search "${ideasSearchTerm}"`
                    : 'No ideas have been submitted yet across any company.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

<<<<<<< Updated upstream
  // Show ideas for selected problem
=======
>>>>>>> Stashed changes
  if (selectedProblemForIdeas) {
    const filteredIdeas = selectedProblemForIdeas.ideas?.filter(idea =>
      !skillsFilter || idea.student?.skills?.some(skill =>
        typeof skill === 'string'
          ? skill.toLowerCase().includes(skillsFilter.toLowerCase())
          : skill.name?.toLowerCase().includes(skillsFilter.toLowerCase())
      )
    ) || [];

    return (
<<<<<<< Updated upstream
      <div className="company-dashboard">
        <Header 
          isLoggedIn={isLoggedIn} 
          currentUser={currentUser} 
          userRole={userRole} 
          handleLogout={handleLogout} 
=======
      <div className="company-dashboard admin-dashboard">
        <Header
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          userRole={userRole}
          handleLogout={handleLogout}
>>>>>>> Stashed changes
          setCurrentView={setCurrentView}
          currentView="companyDashboard"
          handleBack={() => setSelectedProblemForIdeas(null)}
          onProfileClick={onProfileClick}
        />
<<<<<<< Updated upstream
        
        <div className="ideas-view-container">
          <div className="ideas-header-section">
            <div className="breadcrumb">
              <span onClick={() => setSelectedProblemForIdeas(null)} className="breadcrumb-link">
                <i className="fas fa-arrow-left"></i> Back to Dashboard
              </span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Student Solutions</span>
            </div>
            
            <div className="problem-overview-card">
              <div className="problem-title-section">
                <h1 className="problem-title">
=======
        <div className="admin-content">
          <div className="admin-header">
            <h1>
              <i className="fas fa-lightbulb"></i>
              Ideas for: {selectedProblemForIdeas.title}
            </h1>
            <p>Review student solutions submitted for this problem</p>
          </div>
          <div className="problem-summary-card">
            <div className="problem-info">
              <h3>{selectedProblemForIdeas.title}</h3>
              <p>{selectedProblemForIdeas.description}</p>
              <div className="problem-meta">
                <span className={`difficulty-badge difficulty-${selectedProblemForIdeas.difficulty}`}>
                  {selectedProblemForIdeas.difficulty}
                </span>
                <span className="branch-badge">{selectedProblemForIdeas.branch}</span>
                <span className="ideas-count">
>>>>>>> Stashed changes
                  <i className="fas fa-lightbulb"></i>
                  {selectedProblemForIdeas.title}
                </h1>
                <div className="problem-badges">
                  <span className={`difficulty-badge difficulty-${selectedProblemForIdeas.difficulty}`}>
                    {selectedProblemForIdeas.difficulty}
                  </span>
                  <span className="branch-badge">
                    {selectedProblemForIdeas.branch}
                  </span>
                </div>
              </div>
              
              <div className="problem-description-section">
                <h3>Problem Description</h3>
                <p className="problem-description">{selectedProblemForIdeas.description}</p>
              </div>
              
              <div className="modal-body">
                <div className="user-stats-section">
                  <i className="fas fa-users"></i>
                  <span className="stat-number">{selectedProblemForIdeas.ideas ? selectedProblemForIdeas.ideas.length : 0}</span>
                  <span className="stat-label">Solutions Submitted</span>
                </div>
                <div className="stat-item">
                  <i className="fas fa-calendar"></i>
                  <span className="stat-number">{new Date(selectedProblemForIdeas.createdAt).toLocaleDateString()}</span>
                  <span className="stat-label">Posted On</span>
                </div>
              </div>
            </div>
          </div>
<<<<<<< Updated upstream
          
          <div className="solutions-section">
            <div className="solutions-header">
              <h2>
                <i className="fas fa-brain"></i>
                Student Solutions
                <span className="solutions-count">
                  ({selectedProblemForIdeas.ideas ? selectedProblemForIdeas.ideas.length : 0})
                </span>
              </h2>
            </div>

            {/* Skills Filter Search Bar */}
            <div className="skills-filter-section">
              <div className="skills-search-container">
                <div className="skills-search-input-wrapper">
                  <i className="fas fa-tags skills-search-icon"></i>
                  <input
                    type="text"
                    placeholder="Filter students by skills (e.g., React, Python, Machine Learning)..."
                    value={skillsFilter}
                    onChange={(e) => setSkillsFilter(e.target.value)}
                    className="skills-search-input"
                  />
=======
          <div className="ideas-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-brain"></i>
                Student Solutions ({filteredIdeas.length})
              </h2>
            </div>
            <div className="solutions-section">
              <div className="solutions-header">
                <h2>
                  <i className="fas fa-brain"></i>
                  Student Solutions
                  <span className="solutions-count">
                    ({filteredIdeas.length})
                  </span>
                </h2>
              </div>
              <div className="skills-filter-section">
                <div className="skills-search-container">
                  <div className="skills-search-input-wrapper">
                    <i className="fas fa-tags skills-search-icon"></i>
                    <input
                      type="text"
                      placeholder="Filter students by skills (e.g., React, Python, Machine Learning)..."
                      value={skillsFilter}
                      onChange={(e) => setSkillsFilter(e.target.value)}
                      className="skills-search-input"
                    />
                    {skillsFilter && (
                      <button
                        onClick={() => setSkillsFilter('')}
                        className="skills-search-clear-btn"
                        title="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
>>>>>>> Stashed changes
                  {skillsFilter && (
                    <div className="skills-filter-info">
                      <i className="fas fa-filter"></i>
                      Filtering by skills containing "{skillsFilter}"
                    </div>
                  )}
                </div>
              </div>
              <div className="ideas-grid">
                {filteredIdeas.length > 0 ? (
                  filteredIdeas.map((idea, index) => (
                    <div key={idea._id || index} className="idea-card enhanced">
                      <div className="student-profile-section">
                        <div className="student-avatar">
                          {idea.student?.profilePicture ? (
                            <img
                              src={idea.student.profilePicture.startsWith('data:') || idea.student.profilePicture.startsWith('http') ? idea.student.profilePicture : `data:image/jpeg;base64,${idea.student.profilePicture}`}
                              alt={idea.student.name || idea.student.username}
                              className="profile-photo"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const placeholder = e.target.parentNode.querySelector('.default-avatar');
                                if (placeholder) {
                                  placeholder.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className="default-avatar" style={{ display: idea.student?.profilePicture ? 'none' : 'flex' }}>
                            {idea.student?.name?.charAt(0) || 'S'}
                          </div>
                        </div>
                        <div className="student-details">
                          <h3 className="student-name">
                            {idea.student?.name || idea.student?.username || 'Unknown Student'}
                          </h3>
                          <div className="student-info">
                            {idea.student?.university && (
                              <div className="info-item">
                                <i className="fas fa-university"></i>
                                <span>{idea.student.university}</span>
                              </div>
                            )}
                            {idea.student?.course && (
                              <div className="info-item">
                                <i className="fas fa-graduation-cap"></i>
                                <span>{idea.student.course}</span>
                              </div>
                            )}
                            {idea.student?.year && (
                              <div className="info-item">
                                <i className="fas fa-calendar"></i>
                                <span>Year {idea.student.year}</span>
                              </div>
                            )}
                          </div>
                          {idea.student?.skills && idea.student.skills.length > 0 && (
                            <div className="student-skills">
                              <div className="skills-list">
                                {idea.student.skills.slice(0, 3).map((skill, skillIndex) => (
                                  <span key={skillIndex} className="skill-badge">
                                    {typeof skill === 'string' ? skill : skill.name || skill}
                                  </span>
                                ))}
                                {idea.student.skills.length > 3 && (
                                  <span className="skill-badge more">
                                    +{idea.student.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="idea-content">
                        <div className="idea-header">
                          <h4><i className="fas fa-lightbulb"></i> Solution</h4>
                          <span className="submission-date">
                            <i className="fas fa-clock"></i>
                            {new Date(idea.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="idea-description">
                          <p><strong>Idea:</strong> {idea.ideaText}</p>
                          {idea.implementationApproach && (
                            <p><strong>Implementation:</strong> {idea.implementationApproach}</p>
                          )}
                        </div>
                      </div>
                      <div className="idea-actions">
                        <button
                          className="view-details-btn"
                          onClick={() => setSelectedStudentIdea(idea)}
                        >
                          <i className="fas fa-user"></i>
                          View Student Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-ideas">
                    <i className="fas fa-lightbulb"></i>
                    <h3>No Solutions Yet</h3>
                    <p>No students have submitted solutions for this problem yet.</p>
                  </div>
                )}
              </div>
            </div>
<<<<<<< Updated upstream
            
            <div className="solutions-grid">
              {selectedProblemForIdeas.ideas && selectedProblemForIdeas.ideas.length > 0 ? (() => {
                // Filter ideas based on skills
                const filteredIdeas = selectedProblemForIdeas.ideas.filter(idea => {
                  if (!skillsFilter.trim()) return true; // Show all if no filter
                  
                  const studentSkills = idea.student?.skills || [];
                  const filterTerm = skillsFilter.toLowerCase().trim();
                  
                  // Check if any skill contains the filter term
                  return studentSkills.some(skill => 
                    skill.toLowerCase().includes(filterTerm)
                  );
                });

                return filteredIdeas.length > 0 ? (
                  filteredIdeas.map((idea, index) => {
                  return (
                    <div key={idea._id || index} className="solution-card">
                      <div className="solution-header">
                        <div className="student-info-compact">
                          <div className="student-avatar">
                            {idea.student?.profilePicture ? (
                              <img 
                                src={idea.student.profilePicture.startsWith('data:') || idea.student.profilePicture.startsWith('http') ? idea.student.profilePicture : `data:image/jpeg;base64,${idea.student.profilePicture}`} 
                                alt={idea.student.name || idea.student.username}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  const placeholder = e.target.parentNode.querySelector('.avatar-placeholder');
                                  if (placeholder) {
                                    placeholder.style.display = 'flex';
                                  }
                                }}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : null}
                            <div className="avatar-placeholder" style={{display: idea.student?.profilePicture ? 'none' : 'flex'}}>
                              <i className="fas fa-user"></i>
                            </div>
                          </div>
                          <div className="student-details">
                            <div className="student-name">
                              {idea.student?.name || idea.student?.username || 'Unknown Student'}
                            </div>
                            <div className="student-meta">
                              {idea.student?.university && (
                                <span className="university">
                                  <i className="fas fa-university"></i>
                                  {idea.student.university}
                                </span>
                              )}
                              {idea.student?.course ? (
                                <span className="course">
                                  <i className="fas fa-graduation-cap"></i>
                                  {idea.student.course}
                                </span>
                              ) : (
                                <span className="course" style={{color: '#6b7280', fontStyle: 'italic'}}>
                                  <i className="fas fa-graduation-cap"></i>
                                  Course not specified
                                </span>
                              )}
                              {idea.student?.year && (
                                <span className="year">
                                  <i className="fas fa-calendar-alt"></i>
                                  {idea.student.year}
                                </span>
                              )}
                              {idea.student?.phone && (
                                <span className="phone">
                                  <i className="fas fa-phone"></i>
                                  {idea.student.phone}
                                </span>
                              )}
                              {idea.student?.email && (
                                <span className="email">
                                  <i className="fas fa-envelope"></i>
                                  {idea.student.email}
                                </span>
                              )}
                              {idea.student?.skills && Array.isArray(idea.student.skills) && idea.student.skills.length > 0 ? (
                                <div className="student-skills">
                                  <i className="fas fa-tags"></i>
                                  <div className="skills-tags">
                                    {idea.student.skills.slice(0, 3).map((skill, skillIndex) => (
                                      <span key={skillIndex} className="skill-tag">
                                        {typeof skill === 'string' ? skill : skill.name || skill}
                                      </span>
                                    ))}
                                    {idea.student.skills.length > 3 && (
                                      <span className="skill-tag more-skills">
                                        +{idea.student.skills.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="student-skills">
                                  <i className="fas fa-tags"></i>
                                  <span style={{color: '#6b7280', fontStyle: 'italic', fontSize: '0.875rem'}}>
                                    No skills listed
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="solution-date">
                          <i className="fas fa-clock"></i>
                          {new Date(idea.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="solution-content">
                        <div className="solution-text">
                          <h4 className="solution-title">
                            <i className="fas fa-lightbulb"></i>
                            Proposed Solution
                          </h4>
                          <p className="idea-text">{idea.ideaText}</p>
                        </div>
                        
                        {idea.implementationApproach && (
                          <div className="implementation-section">
                            <h4 className="implementation-title">
                              <i className="fas fa-cogs"></i>
                              Implementation Approach
                            </h4>
                            <p className="implementation-text">{idea.implementationApproach}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="solution-footer">
                        <button 
                          className="btn btn-primary view-full-profile-btn"
                          onClick={() => setSelectedStudentIdea(idea)}
                        >
                          <i className="fas fa-user-circle"></i>
                          View Full Profile & Details
                        </button>
                      </div>
                    </div>
                  );
                }) 
                ) : (
                  <div className="no-solutions-container">
                    <div className="no-solutions-illustration">
                      <i className="fas fa-search"></i>
                    </div>
                    <div className="no-solutions-content">
                      <h3>No Matching Solutions</h3>
                      <p>No students found with skills matching "{skillsFilter}".</p>
                      <p>Try adjusting your search or clear the filter to see all solutions.</p>
                    </div>
                  </div>
                );
              })() : (
                <div className="no-solutions-container">
                  <div className="no-solutions-illustration">
                    <i className="fas fa-search"></i>
                  </div>
                  <div className="no-solutions-content">
                    <h3>No Solutions Yet</h3>
                    <p>This problem hasn't received any student solutions yet.</p>
                    <p>Students will be able to submit their innovative ideas and solutions here.</p>
                  </div>
                </div>
              )}
            </div>
=======
>>>>>>> Stashed changes
          </div>
        </div>
      </div>
    );
  }

<<<<<<< Updated upstream
  // Filter problems based on user role
  const companyName = currentUser?.companyName || currentUser?.username || 'Company User';
  
  console.log('CompanyDashboard - Raw problems received:', problems);
  console.log('CompanyDashboard - Number of raw problems:', problems?.length || 0);
  console.log('CompanyDashboard - Current user:', currentUser);
  console.log('CompanyDashboard - Current user ID:', currentUser?._id);
  console.log('CompanyDashboard - User role:', userRole);
  
  // Admin users can see ALL problems, company users can only see problems they posted
  let companyProblems = userRole === 'admin' 
    ? problems // Admins see all problems
    : problems.filter(problem => {
        const isOwnedByUser = problem.postedBy === currentUser?._id;
        console.log('CompanyDashboard - Checking problem:', problem.title, 'postedBy:', problem.postedBy, 'currentUserId:', currentUser?._id, 'matches:', isOwnedByUser);
        return isOwnedByUser;
      });

  // Apply search filter for admins
  if (userRole === 'admin' && searchTerm.trim() !== '') {
    companyProblems = companyProblems.filter(problem => 
      problem.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.branch?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  console.log('CompanyDashboard - Filtered problems for', userRole + ':', companyProblems);
  console.log('CompanyDashboard - Number of company problems:', companyProblems.length);
  console.log('CompanyDashboard - Search term:', searchTerm);

  // Main dashboard view
  return (
    <div className="company-dashboard">
      <Header 
        isLoggedIn={isLoggedIn} 
        currentUser={currentUser} 
        userRole={userRole} 
        handleLogout={handleLogout} 
=======
  return (
    <div className="company-dashboard admin-dashboard">
      <Header
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        userRole={userRole}
        handleLogout={handleLogout}
>>>>>>> Stashed changes
        setCurrentView={setCurrentView}
        currentView="companyDashboard"
        handleBack={handleBack}
        onProfileClick={onProfileClick}
      />
<<<<<<< Updated upstream
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>
            <i className="fas fa-tachometer-alt"></i> 
            {userRole === 'admin' ? 'Admin Dashboard' : 'Company Dashboard'}
          </h2>
          <p className="dashboard-subtitle">
            {userRole === 'admin' 
              ? `Logged in as Admin: ${companyName} - Viewing all problems from all companies` 
              : `Logged in as: ${companyName}`
            }
          </p>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <i className="fas fa-plus-circle"></i> {showForm ? 'Cancel' : 'Post New Problem'}
          </button>
          
          {/* Admin Ideas Button */}
          {userRole === 'admin' && (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleViewAllIdeas}
                disabled={isLoadingAllIdeas}
                style={{ marginLeft: '1rem' }}
              >
                <i className="fas fa-lightbulb"></i> 
                {isLoadingAllIdeas ? 'Loading...' : 'View All Ideas'}
              </button>
              
              {/* Admin Statistics Button */}
              <button 
                className="btn btn-success" 
                onClick={() => setShowStatistics(true)}
                style={{ marginLeft: '1rem' }}
              >
                <i className="fas fa-chart-bar"></i> 
                Statistics
              </button>

              {/* Admin User Management Button */}
              <button 
                className="btn btn-info" 
                onClick={handleViewUserManagement}
                style={{ marginLeft: '1rem' }}
              >
                <i className="fas fa-users-cog"></i> 
=======
      <div className="admin-content">
        <div className="admin-header">
          <h1>
            <i className="fas fa-building"></i>
            Company Dashboard
          </h1>
          <p>Manage your problems and review student solutions</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <i className="fas fa-plus"></i>
            Post New Problem
          </button>
          {userRole === 'admin' && (
            <>
              <button
                className="btn btn-primary"
                onClick={handleViewAllIdeas}
                disabled={isLoadingAllIdeas}
              >
                <i className="fas fa-lightbulb"></i>
                {isLoadingAllIdeas ? 'Loading...' : 'View All Ideas'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleViewUserManagement}
              >
                <i className="fas fa-users"></i>
>>>>>>> Stashed changes
                Manage Users
              </button>
            </>
          )}
        </div>
<<<<<<< Updated upstream

        {/* Search Bar - Only show for admins */}
        {userRole === 'admin' && (
          <div className="search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search by company name, problem title, or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              {searchTerm && (
                <div className="search-results-info">
                  <i className="fas fa-info-circle"></i>
                  Found {companyProblems.length} problem(s) matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}

        {showForm && (
          <div className="post-form">
            <h3>
              <i className={editingProblem ? "fas fa-edit" : "fas fa-plus"}></i> 
              {editingProblem ? 'Edit Engineering Problem' : 'Post a New Engineering Problem'}
            </h3>
            {editingProblem && (
              <div className="edit-notice">
                <i className="fas fa-info-circle"></i>
                You are editing: <strong>{editingProblem.title}</strong>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="company">Company Name</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Enter your company name"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Problem Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Brief title for the problem"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="branch">Engineering Branch</label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="computer">Computer Science</option>
                  <option value="mechanical">Mechanical Engineering</option>
                  <option value="electrical">Electrical Engineering</option>
                  <option value="civil">Civil Engineering</option>
                  <option value="chemical">Chemical Engineering</option>
                  <option value="aerospace">Aerospace Engineering</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="description">Problem Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the problem in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="videoUrl">Video URL (Optional)</label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  placeholder="YouTube, Google Drive, or any video link (optional)"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                />
                <small className="field-hint">
                  <i className="fas fa-info-circle"></i>
                  Paste a YouTube, Google Drive, or any video URL to provide additional context
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="difficulty">Difficulty Level</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <div className="tags-input">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <button 
                    type="button"
                    onClick={handleAddTag} 
                    className="add-tag-btn"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                      <button 
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="quiz-section">
                <h4><i className="fas fa-question-circle"></i> Quiz Questions</h4>
                <p className="quiz-description">
                  Add quiz questions that students must answer before submitting their solutions.
                </p>
                
                {formData.quiz.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="quiz-question-card">
                    <div className="question-header">
                      <h5>Question {questionIndex + 1}</h5>
                      {formData.quiz.questions.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeQuestion(questionIndex)}
                        >
                          <i className="fas fa-trash"></i> Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>Question</label>
                      <input
                        type="text"
                        placeholder="Enter your question"
                        value={question.question}
                        onChange={(e) => handleQuizChange(questionIndex, 'question', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="options-section">
                      <label>Answer Options</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option-input">
                          <div className="option-radio">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => handleQuizChange(questionIndex, 'correctAnswer', optionIndex)}
                            />
                            <label>Correct</label>
                          </div>
                          <input
                            type="text"
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => handleQuizChange(questionIndex, 'option', e.target.value, optionIndex)}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="btn btn-secondary add-question-btn"
                  onClick={addQuestion}
                >
                  <i className="fas fa-plus"></i> Add Another Question
                </button>
              </div>

              {/* File Upload Section */}
              <div className="form-group file-upload-section">
                <label htmlFor="attachments">Attachments (Optional)</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="attachments"
                    name="attachments"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div 
                    className="file-drop-zone"
                    onClick={() => document.getElementById('attachments').click()}
                  >
                    <div className="file-drop-icon">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div className="file-drop-text">
                      <strong>Click to choose files</strong> or drag and drop
                    </div>
                    <div className="file-drop-hint">
                      PDF, Word, PowerPoint, Excel, Text files (Max 10MB each)
                    </div>
                  </div>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="selected-files">
                    <h4>Selected Files:</h4>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-icon">
                          <i className={getFileIcon(file.type)}></i>
                        </div>
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => removeFile(index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Uploaded Files Preview */}
                {uploadedAttachments.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Uploaded Files:</h4>
                    {uploadedAttachments.map((file, index) => (
                      <div key={index} className="file-item uploaded">
                        <div className="file-icon">
                          <i className={getFileIcon(file.fileType)}></i>
                        </div>
                        <div className="file-info">
                          <span className="file-name">{file.originalName}</span>
                          <span className="file-size">{formatFileSize(file.fileSize)}</span>
                        </div>
                        <div className="file-actions">
                          <div className="file-status">
                            <i className="fas fa-check-circle"></i>
                          </div>
                          {editingProblem && (
                            <button
                              type="button"
                              className="remove-file-btn"
                              onClick={() => removeUploadedFile(index)}
                              title="Remove this file"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual Upload Button */}
                {selectedFiles.length > 0 && uploadedAttachments.length === 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary upload-btn"
                    onClick={uploadFiles}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Uploading...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload"></i> Upload Files
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <i className={editingProblem ? "fas fa-save" : "fas fa-paper-plane"}></i> 
                  {editingProblem ? 'Update Problem' : 'Post Problem'}
                </button>
                {editingProblem && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCancelEdit}
                    style={{ marginLeft: '10px' }}
                  >
                    <i className="fas fa-times"></i> Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="posted-problems">
          <h3>
            <i className="fas fa-tasks"></i> 
            {userRole === 'admin' ? 'All Company Problems' : 'Your Posted Problems'}
          </h3>
          <div className="problems-list">
            {companyProblems && companyProblems.length > 0 ? (
              companyProblems.map(problem => (
                <div key={problem._id} className="problem-card">
                  <div className="problem-content">
                    <div className="problem-info">
                      <h4>{problem.title}</h4>
                      {userRole === 'admin' && (
                        <div className="company-info" style={{
                          color: '#2563eb', 
                          fontSize: '0.9rem', 
                          fontWeight: '600', 
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <i className="fas fa-building"></i>
                          <span>Posted by: {problem.company}</span>
                        </div>
                      )}
                      <p>{problem.description}</p>
                      <div className="problem-meta">
                        <span className="branch-badge">{problem.branch}</span>
                        <span className={`difficulty-badge difficulty-${problem.difficulty}`}>{problem.difficulty}</span>
                        <span className="date-info">
                          {new Date(problem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="problem-actions">
                      {/* Admins can edit all problems, companies can only edit their own */}
                      {(userRole === 'admin' || problem.postedBy === currentUser?._id) && (
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleEditProblem(problem)}
                        >
                          <i className="fas fa-edit"></i> 
                          Edit
                        </button>
                      )}
                      
                      {/* Everyone can view ideas */}
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleViewIdeas(problem._id)}
                        disabled={isLoadingIdeas}
                      >
                        {isLoadingIdeas ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> 
                            Loading...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-eye"></i> 
                            View Ideas
                          </>
                        )}
                      </button>
                      
                      {/* Admins can delete all problems, companies can only delete their own */}
                      {onDeleteProblem && (userRole === 'admin' || problem.postedBy === currentUser?._id) && (
                        <button 
                          className="btn btn-danger" 
                          onClick={() => onDeleteProblem(problem._id, problem.title)}
                        >
                          <i className="fas fa-trash"></i> 
                          Delete
                        </button>
                      )}
                    </div>
=======
        <div className="problems-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-tasks"></i>
              Your Problems ({problems.length})
            </h2>
          </div>
          <div className="ideas-grid">
            {problems.length > 0 ? (
              problems.map((problem) => (
                <div key={problem._id} className="idea-card enhanced problem-card">
                  <div className="problem-header">
                    <h3 className="problem-title">
                      <i className="fas fa-briefcase"></i>
                      {problem.title}
                    </h3>
                    <div className="problem-meta">
                      <span className={`difficulty-badge difficulty-${problem.difficulty}`}>
                        {problem.difficulty}
                      </span>
                      <span className="branch-badge">{problem.branch}</span>
                    </div>
                  </div>
                  <div className="problem-content">
                    <div className="problem-description">
                      <p>{problem.description}</p>
                    </div>
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="problem-tags">
                        <div className="skills-list">
                          {problem.tags.map((tag, index) => (
                            <span key={index} className="skill-badge tag-badge">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="problem-stats">
                      <div className="stat-item">
                        <i className="fas fa-lightbulb"></i>
                        <span>Solutions: {problem.ideas?.length || 0}</span>
                      </div>
                      <div className="stat-item">
                        <i className="fas fa-calendar"></i>
                        <span>Posted: {new Date(problem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="problem-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => handleViewIdeas(problem._id)}
                      disabled={isLoadingIdeas}
                    >
                      <i className="fas fa-eye"></i>
                      {isLoadingIdeas ? 'Loading...' : 'View Solutions'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditProblem(problem)}
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDeleteProblem(problem._id)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
>>>>>>> Stashed changes
                  </div>
                </div>
              ))
            ) : (
              <div className="no-problems">
                <div className="no-problems-icon">
                  {userRole === 'admin' && searchTerm ? '�' : '�📝'}
                </div>
                <h4>
                  {userRole === 'admin' && searchTerm
                    ? `No problems found matching "${searchTerm}"`
                    : userRole === 'admin' 
                      ? 'No problems found in the database' 
                      : 'No problems posted yet'
                  }
                </h4>
                <p>
                  {userRole === 'admin' && searchTerm
                    ? 'Try adjusting your search terms or search for a different company name, problem title, or branch.'
                    : userRole === 'admin'
                      ? 'No companies have posted any engineering challenges yet. Check back later or encourage companies to post their problems!'
                      : 'Create your first engineering challenge above to get started!'
                  }
                </p>
                {userRole === 'admin' && searchTerm && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setSearchTerm('')}
                    style={{ marginTop: '1rem' }}
                  >
                    <i className="fas fa-times"></i> Clear Search
                  </button>
                )}
                {userRole !== 'admin' && problems.length > 0 && (
                  <p style={{ color: '#ff6b6b', marginTop: '10px' }}>
                    <strong>Note:</strong> There are {problems.length} problems in the database, but none were posted by you.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
<<<<<<< Updated upstream

        {/* Statistics Modal */}
        {showStatistics && userRole === 'admin' && (
          <div className="modal-overlay">
            <div className="modal statistics-modal">
              <div className="modal-header">
                <h3><i className="fas fa-chart-bar"></i> Platform Statistics</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setShowStatistics(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="modal-body">
                <div className="stats-overview">
                  <div className="stats-grid">
                    <div className="stat-card total">
                      <div className="stat-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{userStats.totalUsers}</h3>
                        <p>Total Users</p>
                      </div>
                    </div>
                    <div className="stat-card students">
                      <div className="stat-icon">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{userStats.students}</h3>
                        <p>Students</p>
                      </div>
                    </div>
                    <div className="stat-card companies">
                      <div className="stat-icon">
                        <i className="fas fa-building"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{userStats.companies}</h3>
                        <p>Companies</p>
                      </div>
                    </div>
                    <div className="stat-card admins">
                      <div className="stat-icon">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{userStats.admins}</h3>
                        <p>Admins</p>
                      </div>
                    </div>
                    <div className="stat-card recent">
                      <div className="stat-icon">
                        <i className="fas fa-user-plus"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{userStats.recentRegistrations}</h3>
                        <p>New (30 days)</p>
                      </div>
                    </div>
                    <div className="stat-card problems">
                      <div className="stat-icon">
                        <i className="fas fa-tasks"></i>
                      </div>
                      <div className="stat-info">
                        <h3>{problems?.length || 0}</h3>
                        <p>Total Problems</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="live-stats-section">
                  <h4><i className="fas fa-pulse"></i> Live Statistics</h4>
                  <div className="live-stats-info">
                    <p><i className="fas fa-info-circle"></i> Statistics are updated in real-time when users register or when roles are changed.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        // Trigger stats refresh
                        if (typeof fetchUserStats === 'function') {
                          fetchUserStats();
                        }
                      }}
                    >
                      <i className="fas fa-sync-alt"></i> Refresh Stats
                    </button>
                  </div>
                </div>
=======
        {showForm && (
          <div className="modal-overlay">
            <div className="modal problem-form-modal">
              <div className="modal-header">
                <h2>
                  <i className="fas fa-plus"></i>
                  {editingProblem ? 'Edit Problem' : 'Post New Problem'}
                </h2>
                <button className="close-btn" onClick={handleCancelEdit}>×</button>
              </div>
              <div className="modal-content">
                <form onSubmit={handleSubmit} className="problem-form">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Branch/Department</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Problem Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Problem Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Video URL (Optional)</label>
                    <input
                      type="text"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Difficulty Level</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tags</label>
                    <div className="tags-input">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                      />
                      <button type="button" onClick={handleAddTag}>Add</button>
                    </div>
                    <div className="tags-list">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Quiz Questions</label>
                    {formData.quiz.questions.map((q, qIndex) => (
                      <div key={qIndex} className="quiz-question">
                        <div className="form-group">
                          <label>Question {qIndex + 1}</label>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => handleQuizChange(qIndex, 'question', e.target.value)}
                            required
                          />
                        </div>
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="form-group">
                            <label>Option {oIndex + 1}</label>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleQuizChange(qIndex, 'option', e.target.value, oIndex)}
                              required
                            />
                          </div>
                        ))}
                        <div className="form-group">
                          <label>Correct Answer</label>
                          <select
                            value={q.correctAnswer}
                            onChange={(e) => handleQuizChange(qIndex, 'correctAnswer', e.target.value)}
                          >
                            {q.options.map((_, oIndex) => (
                              <option key={oIndex} value={oIndex}>Option {oIndex + 1}</option>
                            ))}
                          </select>
                        </div>
                        {formData.quiz.questions.length > 1 && (
                          <button type="button" onClick={() => removeQuestion(qIndex)}>
                            Remove Question
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addQuestion}>Add Question</button>
                  </div>
                  <div className="form-group">
                    <label>Attachments</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    />
                    <div className="file-list">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="file-item">
                          <span>{file.name} ({formatFileSize(file.size)})</span>
                          <button type="button" onClick={() => removeFile(index)}>×</button>
                        </div>
                      ))}
                      {uploadedAttachments.map((file, index) => (
                        <div key={index} className="file-item uploaded">
                          <i className={getFileIcon(file.fileType)} style={{ color: getFileColor(file.fileType) }}></i>
                          <span>{file.originalName} ({formatFileSize(file.size)})</span>
                          <button type="button" onClick={() => removeUploadedFile(index)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isUploading}>
                      {isUploading ? 'Uploading...' : editingProblem ? 'Update Problem' : 'Post Problem'}
                    </button>
                  </div>
                </form>
>>>>>>> Stashed changes
              </div>
            </div>
          </div>
        )}
<<<<<<< Updated upstream

        {/* User Management Modal */}
        {showUserManagement && userRole === 'admin' && (
          <div className="modal-overlay">
            <div className="modal user-management-modal">
              <div className="modal-header">
                <h3><i className="fas fa-users-cog"></i> User Management</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setShowUserManagement(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
        
        <div className="modal-body">
          {/* User Statistics */}
          <div className="user-stats-section">
            <h4><i className="fas fa-chart-bar"></i> Platform Statistics</h4>
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>{userStats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card students">
                <div className="stat-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="stat-info">
                  <h3>{userStats.students}</h3>
                  <p>Students</p>
                </div>
              </div>
              <div className="stat-card companies">
                <div className="stat-icon">
                  <i className="fas fa-building"></i>
                </div>
                <div className="stat-info">
                  <h3>{userStats.companies}</h3>
                  <p>Companies</p>
                </div>
              </div>
              <div className="stat-card admins">
                <div className="stat-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="stat-info">
                  <h3>{userStats.admins}</h3>
                  <p>Admins</p>
                </div>
              </div>
              <div className="stat-card recent">
                <div className="stat-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="stat-info">
                  <h3>{userStats.recentRegistrations}</h3>
                  <p>New (30 days)</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Search and Filter */}
          <div className="user-controls-section">
            <form onSubmit={handleUserSearch} className="user-search-form">
              <div className="search-input-wrapper">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
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
                  fetchUsers();
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
                          style={{ 
                            backgroundColor: user.role === 'admin' ? '#ff6b6b' : 
                                            user.role === 'company' ? '#4ecdc4' : '#45b7d1'
                          }}
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
                          className="btn btn-sm btn-danger" 
                          onClick={() => handleDeleteUser(user)}
                          title="Delete User"
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
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  fetchUsers();
                }}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  fetchUsers();
                }}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )}


=======
>>>>>>> Stashed changes
      </div>
    </div>
  );
};

export default CompanyDashboard;
