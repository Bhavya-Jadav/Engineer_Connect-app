// src/components/CompanyDashboard.js
import React, { useState } from 'react';
import Header from './HeaderWithBack';

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
  const [editingProblem, setEditingProblem] = useState(null); // For editing existing problems
  const [formData, setFormData] = useState({
    company: '', 
    branch: '',
    title: '', 
    description: '', 
    videoUrl: '', // Optional video URL field
    difficulty: 'beginner', 
    tags: [], // Changed to array like skills
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
  const [newTag, setNewTag] = useState(''); // For adding new tags
  const [searchTerm, setSearchTerm] = useState(''); // For company search
  const [filteredProblems, setFilteredProblems] = useState([]); // For filtered results
  
  // Admin Ideas states
  const [showAllIdeas, setShowAllIdeas] = useState(false);
  const [allIdeas, setAllIdeas] = useState([]);
  const [isLoadingAllIdeas, setIsLoadingAllIdeas] = useState(false);
  const [ideasSearchTerm, setIdeasSearchTerm] = useState(''); // For searching ideas
  
  // Skills filter for individual problem ideas
  const [skillsFilter, setSkillsFilter] = useState(''); // For filtering by skills

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

  // Tags management (similar to skills in profile)
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

  // Edit problem functions
  const handleEditProblem = (problem) => {
    setEditingProblem(problem);
    
    // Populate form with existing problem data
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
    
    // Set existing attachments as uploaded
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
      tags: [], // Reset to empty array
      quiz: {
        questions: [
          { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]
      }
    });
    setSelectedFiles([]);
    setUploadedAttachments([]);
    setNewTag(''); // Reset new tag input
    setShowForm(false);
  };

  // File handling functions
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
      return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
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
        console.log('Adding file to formData:', file.name, file.type, file.size);
        formData.append('attachments', file);
      });

      const uploadUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}`.replace(/\/api$/, '') + '/api/files/upload';
      console.log('Upload URL:', uploadUrl);
      console.log('Token exists:', !!localStorage.getItem('token'));

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT token storage
        },
        body: formData
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);
      console.log('Upload response status:', response.status);
      console.log('Upload response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Upload error response:', errorText);
        throw new Error('File upload failed');
      }

      const result = await response.json();
      console.log('Upload success result:', result);
      
      // Merge with existing attachments instead of replacing
      const newAttachments = [...uploadedAttachments, ...result.files];
      setUploadedAttachments(newAttachments);
      setSelectedFiles([]);
      return newAttachments;
    } catch (error) {
      console.error('File upload error:', error);
      alert('File upload failed. Please try again.');
      return uploadedAttachments; // Return existing attachments if new upload fails
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
    
    // Validate quiz questions
    const hasValidQuiz = formData.quiz.questions.every(q => 
      q.question.trim() !== '' && 
      q.options.every(opt => opt.trim() !== '')
    );
    
    if (!hasValidQuiz) {
      alert('Please fill in all quiz questions and options');
      return;
    }

    // Upload files first if any are selected
    let attachments = [...uploadedAttachments]; // Start with existing attachments
    if (selectedFiles.length > 0) {
      console.log('Uploading new files:', selectedFiles.length);
      const newAttachments = await uploadFiles();
      attachments = newAttachments; // uploadFiles now returns merged attachments
      if (selectedFiles.length > 0 && attachments.length === uploadedAttachments.length) {
        // New file upload failed (no new files added)
        alert('File upload failed. Please try again.');
        return;
      }
    }

    console.log('Submitting problem with attachments:', attachments);

    // Prepare quiz data with proper format
    const quizData = {
      enabled: formData.quiz.questions.some(q => q.question.trim() !== ''), // Enable if any question has content
      questions: formData.quiz.questions
        .filter(q => q.question.trim() !== '') // Only include non-empty questions
        .map(q => ({
          question: q.question,
          type: 'multiple-choice', // Set the type required by backend
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
      videoUrl: formData.videoUrl.trim() || null, // Only include if provided
      difficulty: formData.difficulty,
      tags: formData.tags, // Already an array, pass as-is
      quiz: quizData,
      attachments: attachments // Include uploaded files
    };

    if (editingProblem) {
      // Update existing problem
      await handleUpdateProblem(editingProblem._id, problemData);
    } else {
      // Create new problem
      onSubmitProblem(problemData);
    }
    
    // Reset form
    setFormData({
      company: '',
      branch: '',
      title: '',
      description: '',
      videoUrl: '', // Reset video URL field
      difficulty: 'beginner',
      tags: [], // Reset to empty array
      quiz: {
        questions: [
          { question: '', options: ['', '', '', ''], correctAnswer: 0 }
        ]
      }
    });
    setSelectedFiles([]);
    setUploadedAttachments([]);
    setEditingProblem(null);
    setNewTag(''); // Reset new tag input
    setShowForm(false);
  };

  const handleUpdateProblem = async (problemId, problemData) => {
    try {
      const token = localStorage.getItem('token');
      const updateUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}`.replace(/\/api$/, '') + `/api/problems/${problemId}`;
      
      console.log('Update URL:', updateUrl);
      console.log('Problem data:', problemData);
      
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(problemData),
      });
      
      console.log('Update response status:', response.status);
      console.log('Update response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Update error response:', errorText);
        throw new Error(`Failed to update problem: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Update success:', data);
      
      alert('Problem updated successfully!');
      // Refresh the page or update local state
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
      console.log('🔑 CLIENT: Token exists?', !!token);
      console.log('🔑 CLIENT: Token preview:', token ? token.substring(0, 30) + '...' : 'NO TOKEN');
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/ideas/problem/${problemId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('📡 CLIENT: Response status:', response.status);
      console.log('📡 CLIENT: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ CLIENT: Error response:', errorText);
        throw new Error(`Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('💡 Ideas received count:', data.length);
      if (data.length > 0) {
        console.log('📊 First student data:', data[0]?.student);
        console.log('📊 First student course:', data[0]?.student?.course);
        console.log('📊 First student skills:', data[0]?.student?.skills);
        console.log('📊 Skills is array?', Array.isArray(data[0]?.student?.skills));
        console.log('📊 Skills length:', data[0]?.student?.skills?.length);
      }
      
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

  // Admin function to fetch all ideas from all companies
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
      console.log('💡 All ideas received count:', data.length);
      
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

    // Check which profile fields are missing
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
            <div className="avatar-placeholder" style={{display: student.profilePicture ? 'none' : 'flex'}}>
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
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Show individual student idea details
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
                  <div className="avatar-placeholder-large" style={{display: selectedStudentIdea.student?.profilePicture ? 'none' : 'flex'}}>
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
                      <span key={index} className="skill-badge">{skill}</span>
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

  // Show all ideas view for admin
  if (showAllIdeas) {
    // Filter ideas based on search term
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
            
            {/* Search for ideas */}
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
                          <span key={index} className="skill-tag">{skill}</span>
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

  // Show ideas for selected problem
  if (selectedProblemForIdeas) {
    return (
      <div className="company-dashboard">
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
              
              <div className="problem-stats">
                <div className="stat-item">
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
                              {idea.student?.skills && Array.isArray(idea.student.skills) && idea.student.skills.length > 0 ? (
                                <div className="student-skills">
                                  <i className="fas fa-tags"></i>
                                  <div className="skills-tags">
                                    {idea.student.skills.slice(0, 3).map((skill, skillIndex) => (
                                      <span key={skillIndex} className="skill-tag">
                                        {skill}
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
          </div>
        </div>
      </div>
    );
  }

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
        setCurrentView={setCurrentView}
        currentView="companyDashboard"
        handleBack={handleBack}
        onProfileClick={onProfileClick}
      />
      
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
            <button 
              className="btn btn-secondary" 
              onClick={handleViewAllIdeas}
              disabled={isLoadingAllIdeas}
              style={{ marginLeft: '1rem' }}
            >
              <i className="fas fa-lightbulb"></i> 
              {isLoadingAllIdeas ? 'Loading...' : 'View All Ideas'}
            </button>
          )}
        </div>

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
      </div>
    </div>
  );
};

export default CompanyDashboard;