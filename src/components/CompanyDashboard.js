// src/components/CompanyDashboard.js
import React, { useState } from 'react';
import Header from './HeaderWithBack';
import UserSearchTailwind from './UserSearchTailwind';
import UserProfileModal from './UserProfileModal';
import { API_BASE_URL } from '../utils/api';
import '../styles/modals.css';
import '../styles/AdminDashboard.css';

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
  
  // User search states
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('problems'); // 'problems', 'ideas', or 'users'
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
      const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
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
      const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
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
    console.log('📤 Starting file upload...', selectedFiles.length, 'files');
    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('file', file);
        console.log('📎 Adding file to FormData:', file.name);
      });
      
      // Use API_BASE_URL to ensure correct backend URL (local or production)
      const baseUrl = API_BASE_URL.replace('/api', '');
      const uploadUrl = `${baseUrl}/api/files/upload`;
      
      console.log('🔍 Upload URL:', uploadUrl);
      console.log('🔍 Files to upload:', selectedFiles.map(f => f.name));
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      console.log('📥 Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload failed:', errorText);
        throw new Error(`File upload failed: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Upload result:', result);
      
      const newAttachments = [...uploadedAttachments, result.file];
      setUploadedAttachments(newAttachments);
      setSelectedFiles([]);
      return newAttachments;
    } catch (error) {
      console.error('❌ File upload error:', error);
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
      const updateUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}`.replace(/\/api$/, '') + `/problems/${problemId}`;
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
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/ideas?problemId=${problemId}`, {
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
      const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
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
      const API_BASE_URL = process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_BASE_URL_PROD || 'https://backend-production-2368.up.railway.app/api'
        : process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
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

  // User search handlers for tab functionality
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

  if (selectedProblemForIdeas) {
    const filteredIdeas = selectedProblemForIdeas.ideas?.filter(idea =>
      !skillsFilter || idea.student?.skills?.some(skill =>
        typeof skill === 'string'
          ? skill.toLowerCase().includes(skillsFilter.toLowerCase())
          : skill.name?.toLowerCase().includes(skillsFilter.toLowerCase())
      )
    ) || [];

    return (
      <div className="company-dashboard admin-dashboard">
        <Header
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          userRole={userRole}
          handleLogout={handleLogout}
          setCurrentView={setCurrentView}
          currentView="companyDashboard"
          handleBack={() => setSelectedProblemForIdeas(null)}
          onProfileClick={onProfileClick}
        />
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
                  <i className="fas fa-lightbulb"></i>
                  {selectedProblemForIdeas.ideas ? selectedProblemForIdeas.ideas.length : 0} Solutions
                </span>
              </div>
            </div>
          </div>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="company-dashboard admin-dashboard">
      <Header
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        userRole={userRole}
        handleLogout={handleLogout}
        setCurrentView={setCurrentView}
        currentView="companyDashboard"
        handleBack={handleBack}
        onProfileClick={onProfileClick}
      />
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
                Manage Users
              </button>
            </>
          )}
          <button
            className="search-icon-btn"
            onClick={() => handleTabChange('users')}
            title="Search Users"
          >
            <i className="fas fa-search"></i>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => handleTabChange('problems')}
          >
            <i className="fas fa-tasks"></i>
            Your Problems
          </button>
          {userRole === 'admin' && (
            <button
              className={`tab-btn ${activeTab === 'ideas' ? 'active' : ''}`}
              onClick={() => handleTabChange('ideas')}
            >
              <i className="fas fa-lightbulb"></i>
              All Ideas
            </button>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'problems' && (
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
                  </div>
                </div>
              ))
            ) : (
              <div className="no-ideas">
                <i className="fas fa-briefcase"></i>
                <h3>No Problems Posted</h3>
                <p>You haven't posted any problems yet. Click "Post New Problem" to get started.</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* All Ideas Tab for Admin */}
        {activeTab === 'ideas' && userRole === 'admin' && (
          <div className="all-ideas-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-lightbulb"></i>
                All Student Ideas
              </h2>
              <button
                className="btn btn-primary"
                onClick={handleViewAllIdeas}
                disabled={isLoadingAllIdeas}
              >
                <i className="fas fa-refresh"></i>
                {isLoadingAllIdeas ? 'Loading...' : 'Refresh Ideas'}
              </button>
            </div>
            {/* Add ideas content here if needed */}
            <div className="ideas-placeholder">
              <p>Click "Refresh Ideas" to load all student submissions</p>
            </div>
          </div>
        )}

        {/* Users Search Tab */}
        {activeTab === 'users' && (
          <div className="users-search-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-users"></i>
                Find Students and Companies
              </h2>
              <p>Search for users by name, skills, university, course, branch, or tags</p>
            </div>
            <UserSearchTailwind
              onUserSelect={handleUserSelect}
              placeholder="Search users by name, skills, university, course, branch..."
              roleFilter="student"
              showRoleFilter={true}
              currentUser={currentUser}
              className="dashboard-user-search"
            />
          </div>
        )}

        {/* User Profile Modal */}
        <UserProfileModal
          user={selectedUser}
          isOpen={showUserProfile}
          onClose={handleCloseUserProfile}
          currentUser={currentUser}
          onConnectionUpdate={() => {}}
        />

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
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Branch</option>
                      <option value="mechanical">Mechanical Engineering</option>
                      <option value="computer">Computer Science</option>
                      <option value="electrical">Electrical Engineering</option>
                      <option value="civil">Civil Engineering</option>
                      <option value="chemical">Chemical Engineering</option>
                      <option value="aerospace">Aerospace Engineering</option>
                      <option value="biomedical">Biomedical Engineering</option>
                      <option value="industrial">Industrial Engineering</option>
                      <option value="electronics">Electronics and Communication</option>
                      <option value="it">Information Technology</option>
                    </select>
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
                      {uploadedAttachments.map((file, index) => {
                        // Skip if file is null or missing required properties
                        if (!file || !file.fileType || !file.originalName) {
                          return null;
                        }
                        
                        return (
                          <div key={index} className="file-item uploaded">
                            <i className={getFileIcon(file.fileType)} style={{ color: getFileColor(file.fileType) }}></i>
                            <span>{file.originalName} ({formatFileSize(file.size)})</span>
                            <button type="button" onClick={() => removeUploadedFile(index)}>×</button>
                          </div>
                        );
                      })}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
