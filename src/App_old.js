// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';

// Import components from separate files
import Header from './components/Header';
import CompanyDashboard from './components/CompanyDashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import QuizModal from './components/QuizModal';
import UserProfilePanel from './components/UserProfilePanel';
import UserProfileView from './components/UserProfileView';

const Logo = () => (
  <div className="logo">
    <i className="fas fa-code-branch"></i>
    <span>EngineerConnect</span>
  </div>
);

const ProblemFormModal = ({ problemForm, setProblemForm, handleProblemSubmit, setShowProblemForm }) => (
  <div className="modal-overlay" onClick={() => setShowProblemForm(false)}>
    <div className="modal-content problem-form-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Post Engineering Challenge</h2>
        <button className="close-btn" onClick={() => setShowProblemForm(false)}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <form className="modal-form" onSubmit={handleProblemSubmit}>
        <div className="form-group">
          <label htmlFor="problemTitle">Problem Title *</label>
          <input 
            type="text" 
            id="problemTitle"
            placeholder="Enter a compelling problem title"
            value={problemForm.title}
            onChange={(e) => setProblemForm({...problemForm, title: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="problemBranch">Engineering Branch *</label>
          <select 
            id="problemBranch"
            value={problemForm.branch}
            onChange={(e) => setProblemForm({...problemForm, branch: e.target.value})}
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
          <label htmlFor="problemDescription">Problem Description *</label>
          <textarea 
            id="problemDescription"
            placeholder="Describe the engineering challenge in detail"
            value={problemForm.description}
            onChange={(e) => setProblemForm({...problemForm, description: e.target.value})}
            rows={6}
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="problemDifficulty">Difficulty Level *</label>
          <select 
            id="problemDifficulty"
            value={problemForm.difficulty}
            onChange={(e) => setProblemForm({...problemForm, difficulty: e.target.value})}
            required
          >
            <option value="">Select Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="problemTags">Tags (comma-separated)</label>
          <input 
            type="text" 
            id="problemTags"
            placeholder="e.g., innovation, sustainability, AI, robotics"
            value={problemForm.tags}
            onChange={(e) => setProblemForm({...problemForm, tags: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="videoUrl">Video URL (optional)</label>
          <input 
            type="url" 
            id="videoUrl"
            placeholder="YouTube, Vimeo, or other video URL"
            value={problemForm.videoUrl}
            onChange={(e) => setProblemForm({...problemForm, videoUrl: e.target.value})}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setShowProblemForm(false)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-plus"></i>
            <span>Post Problem</span>
          </button>
        </div>
      </form>
    </div>
  </div>
);

const IdeaSubmissionModal = ({ ideaSubmission, setIdeaSubmission, handleIdeaSubmit, setShowIdeaModal }) => (
  <div className="modal-overlay" onClick={() => setShowIdeaModal(false)}>
    <div className="modal-content idea-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>Submit Your Innovative Solution</h2>
        <button className="close-btn" onClick={() => setShowIdeaModal(false)}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <form className="modal-form" onSubmit={handleIdeaSubmit}>
        <div className="form-group">
          <label htmlFor="ideaText">Your Solution Idea *</label>
          <textarea 
            id="ideaText"
            placeholder="Describe your innovative solution to this engineering challenge..."
            value={ideaSubmission.ideaText}
            onChange={(e) => setIdeaSubmission({...ideaSubmission, ideaText: e.target.value})}
            rows={6}
            required
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="implementationApproach">Implementation Approach (optional)</label>
          <textarea 
            id="implementationApproach"
            placeholder="How would you implement this solution? Include technical details, resources needed, timeline, etc."
            value={ideaSubmission.implementationApproach}
            onChange={(e) => setIdeaSubmission({...ideaSubmission, implementationApproach: e.target.value})}
            rows={4}
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setShowIdeaModal(false)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-rocket"></i>
            <span>Submit Idea</span>
          </button>
        </div>
      </form>
    </div>
  </div>
);

// --- Main App Component ---
function AppContent() {
  const navigate = useNavigate();

  // --- Authentication State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'student'
  const [currentUser, setCurrentUser] = useState(null); // Store full user object

  // --- Application State ---
  const [problems, setProblems] = useState([]); // Fetched from backend
  const [leaderboardData, setLeaderboardData] = useState([]); // Fetched/updated from backend
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [activeView, setActiveView] = useState('home'); // home, student-feed, company-dashboard
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('all');
  const [navigationHistory, setNavigationHistory] = useState(['home']); // Track navigation history

  // --- Modal & Quiz State ---
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [currentProblemId, setCurrentProblemId] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showProblemForm, setShowProblemForm] = useState(false); // For company dashboard

  // --- New State for Company Idea Viewing ---
  const [selectedProblemForIdeas, setSelectedProblemForIdeas] = useState(null);
  const [selectedStudentIdea, setSelectedStudentIdea] = useState(null);
  
  // --- Profile Panel State ---
  const [showProfileView, setShowProfileView] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  
  // --- Add function to track navigation history ---
  const handleChangeView = (newView) => {
    // Update navigation history
    setNavigationHistory(prevHistory => [...prevHistory, newView]);
    // Update both view states to stay in sync
    setActiveView(newView);
    setCurrentView(newView);
  };

  // --- Missing State Variables ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // Sync with activeView
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({
    username: '', email: '', password: '', userType: '', 
    university: '', branch: '', companyName: ''
  });
  const [ideaSubmission, setIdeaSubmission] = useState({
    ideaText: '', implementationApproach: ''
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [problemForm, setProblemForm] = useState({
    title: '', 
    branch: '', 
    description: '', 
    difficulty: '', 
    tags: '', 
    videoUrl: '',
    quiz: {
      enabled: false,
      title: '',
      description: '',
      questions: [],
      timeLimit: 30,
      passingScore: 70
    }
  });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // --- Initialize Data & Check Login Status ---
  useEffect(() => {
    // --- Fetch problems from backend ---
    const fetchInitialProblems = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/problems`);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setProblems(data);
          }
        }
      } catch (error) {
        console.error("Error fetching problems:", error);
      }
    };

    // --- Fetch leaderboard from backend ---
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/leaderboard`);
        const data = await response.json();
        
        if (response.ok) {
          setLeaderboardData(data);
        } else {
          console.error("Failed to fetch leaderboard:", data.message);
          // Fallback to dummy data if backend fails
          setLeaderboardData(initialLeaderboardData);
        }
      } catch (error) {
        console.error("Network error fetching leaderboard:", error);
        // Fallback to dummy data on network error
        setLeaderboardData(initialLeaderboardData);
      }
    };

    // --- Check login status and fetch fresh user data ---
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch fresh user data from the server
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            console.log('App.js: Fetched fresh user data:', userData);
            
            // Only clean placeholder URLs that are invalid/broken, not intentional placeholder images
            if (userData.profilePicture && userData.profilePicture.includes('broken-placeholder') || userData.profilePicture === 'placeholder') {
              console.warn('App.js: Cleaning invalid placeholder URL from server:', userData.profilePicture);
              userData.profilePicture = null;
            }
            
            setIsLoggedIn(true);
            setUserRole(userData.role);
            setCurrentUser(userData);
            // Update localStorage with clean data
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('App.js: Set currentUser to cleaned data');
          } else {
            // Token is invalid, clear storage
            console.log('Invalid token, clearing storage');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUserRole(null);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Fallback to stored data if network fails
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              console.log('App.js: Using stored user data fallback:', userData);
              
              // Only clean placeholder URLs that are invalid/broken, not intentional placeholder images
              if (userData.profilePicture && (userData.profilePicture.includes('broken-placeholder') || userData.profilePicture === 'placeholder')) {
                localStorage.setItem('user', JSON.stringify(userData));
              }
              
              setIsLoggedIn(true);
              setUserRole(userData.role);
              setCurrentUser(userData);
            } catch (e) {
              console.error("Error parsing stored user data:", e);
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          }
        }
      }
    };

    // --- Initialize Leaderboard (Fallback Data) ---
    const initialLeaderboardData = [
      { name: "Alex Johnson", university: "MIT", branch: "computer", score: 95, problemsSolved: 12 },
      { name: "Sarah Chen", university: "Stanford", branch: "electrical", score: 92, problemsSolved: 8 },
      { name: "Mike Rodriguez", university: "UC Berkeley", branch: "mechanical", score: 88, problemsSolved: 15 },
      { name: "Emily Davis", university: "Carnegie Mellon", branch: "computer", score: 87, problemsSolved: 9 },
      { name: "David Kim", university: "Caltech", branch: "civil", score: 85, problemsSolved: 6 },
      { name: "Priya Sharma", university: "IIT Bombay", branch: "chemical", score: 90, problemsSolved: 7 },
      { name: "James Wilson", university: "Georgia Tech", branch: "aerospace", score: 89, problemsSolved: 11 }
    ];

    fetchInitialProblems();
    fetchLeaderboard(); // Try to fetch from backend
    checkLoginStatus(); // Now async, but we don't need to await it
  }, []);

  // Monitor currentView changes to refresh user data when needed
  useEffect(() => {
    if (currentView === 'studentFeed' && isLoggedIn) {
      console.log('🔄 Student feed loaded, refreshing user data...');
      refreshUserData();
    }
  }, [currentView, isLoggedIn]);

  // --- Handlers for Authentication ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Login successful, data received:', data);
        
        // Store complete user data from login response
        const userData = {
          _id: data._id,
          username: data.username,
          name: data.name,
          email: data.email,
          bio: data.bio,
          phone: data.phone,
          university: data.university,
          course: data.course,
          year: data.year,
          skills: data.skills,
          role: data.role,
          profilePicture: (data.profilePicture && (data.profilePicture.includes('broken-placeholder') || data.profilePicture === 'placeholder')) ? null : data.profilePicture
        };
        
        if (data.profilePicture && (data.profilePicture.includes('broken-placeholder') || data.profilePicture === 'placeholder')) {
          console.warn('Login: Cleaned invalid placeholder URL:', data.profilePicture);
        }
        
        console.log('Login: Storing complete user data:', userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUserType(data.role);
        setIsLoggedIn(true);
        setUserRole(data.role);
        setCurrentUser(userData);
        // Redirect based on user role
        if (data.role === 'admin') {
          setCurrentView('companyDashboard'); // Company admin goes to problem posting page
        } else {
          setCurrentView('branchSelect'); // Student goes to branch selection page
        }
        showNotification(data.message || 'Login successful', 'success');
        return true;
      } else {
        showNotification(data.message || 'Login failed', 'error');
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification('An error occurred during login.', 'error');
      return false;
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Map frontend fields to backend expected fields
      const signupPayload = {
        username: signupData.username,
        password: signupData.password,
        role: signupData.userType, // Map userType to role
        university: signupData.userType === 'student' ? signupData.university : undefined
      };

      console.log('Signup payload:', signupPayload);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload),
      });
      
      const data = await response.json();
      console.log('Signup response:', data);
      
      if (response.ok) {
        alert('Account created successfully! Please login.');
        setCurrentView('login');
        setSignupData({
          username: '', email: '', password: '', userType: '', 
          university: '', branch: '', companyName: ''
        });
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert('An error occurred during signup. Please check your connection and try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserType(null);
    // Reset view state on logout
    setActiveView('home');
    setCurrentView('home');
    setSelectedBranch('');
    setSelectedProblemForIdeas(null);
    setSelectedStudentIdea(null);
    // Reset form data
    setLoginData({ username: '', password: '' });
    setSignupData({
      username: '', email: '', password: '', userType: '', 
      university: '', branch: '', companyName: ''
    });
  };

  // --- Notification System ---
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 2000);
  };

  // --- Handlers for Navigation/View Changes ---
  const handleSelectUserType = (type) => {
    if (type === 'student') {
      if (isLoggedIn && userRole === 'student') {
        setCurrentView('branchSelect');
      } else {
        setCurrentView('login');
      }
    } else if (type === 'company') {
      if (isLoggedIn && userRole === 'admin') {
        setCurrentView('companyDashboard');
      } else {
        setCurrentView('login');
      }
    }
  };

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    setCurrentView('studentFeed');
  };

  const handleProfileClick = () => {
    console.log('🔄 Profile clicked, refreshing user data...');
    refreshUserData();
    setCurrentView('profile');
  };

  const handleEditProfile = () => {
    setShowProfileView(false);
    setShowProfilePanel(true);
  };

  const handleUserUpdate = (updatedUser) => {
    console.log('App.js handleUserUpdate called with:', updatedUser);
    
    // Only clean placeholder URLs that are invalid/broken, not intentional placeholder images
    if (updatedUser.profilePicture && (updatedUser.profilePicture.includes('broken-placeholder') || updatedUser.profilePicture === 'placeholder')) {
      console.warn('App.js: Cleaning invalid placeholder URL from user update:', updatedUser.profilePicture);
      updatedUser = { ...updatedUser, profilePicture: null };
    }
    
    setCurrentUser(updatedUser);
    // Update localStorage with the cleaned user data
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('App.js: Updated currentUser and localStorage');
    
    // Add a small delay before refreshing to ensure database update is complete
    setTimeout(() => {
      console.log('🔄 App.js: Delayed refresh of user data after profile update');
      refreshUserData();
    }, 1000);
  };

  const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('🔄 Refreshing user data from server...');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Refreshed user data:', userData);
          
          // Only clean placeholder URLs that are invalid/broken, not intentional placeholder images
          if (userData.profilePicture && (userData.profilePicture.includes('broken-placeholder') || userData.profilePicture === 'placeholder')) {
            console.warn('App.js: Cleaning invalid placeholder URL from server refresh:', userData.profilePicture);
            userData.profilePicture = null;
          }
          
          setCurrentUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Updated currentUser with refreshed data');
        } else {
          console.error('❌ Failed to refresh user data:', response.status);
        }
      } catch (error) {
        console.error('❌ Error refreshing user data:', error);
      }
    }
  };

  const handleBack = () => {
    if (selectedStudentIdea) {
      setSelectedStudentIdea(null);
    } else if (selectedProblemForIdeas) {
      setSelectedProblemForIdeas(null);
    } else if (activeView !== 'home' && navigationHistory.length > 1) {
      // Create a copy of history, remove the current view
      const newHistory = [...navigationHistory];
      newHistory.pop();
      
      // Get the previous view from history
      const previousView = newHistory[newHistory.length - 1];
      
      // Update both state variables
      setNavigationHistory(newHistory);
      setActiveView(previousView);
      setCurrentView(previousView);
    } else {
      // Default to home as fallback
      setActiveView('home');
      setCurrentView('home');
      setNavigationHistory(['home']);
    }
  };

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentProblemId) {
      alert('No problem selected');
      return;
    }
    
    if (!ideaSubmission.ideaText.trim()) {
      alert('Please enter your solution idea');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const submissionData = {
        problemId: currentProblemId,
        ideaText: ideaSubmission.ideaText.trim(),
        implementationApproach: ideaSubmission.implementationApproach.trim()
      };
      
      console.log('💡 Submitting idea:', submissionData);
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Idea submitted successfully:', data);
        
        // Reset form
        setIdeaSubmission({
          ideaText: '',
          implementationApproach: ''
        });
        
        // Close modal
        setShowIdeaModal(false);
        setCurrentProblemId(null);
        
        // Show success notification
        setNotification({
          show: true,
          message: 'Your solution has been submitted successfully!',
          type: 'success'
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
        
      } else {
        console.error('❌ Failed to submit idea:', data.message);
        alert(data.message || 'Failed to submit idea');
      }
      
    } catch (error) {
      console.error('❌ Error submitting idea:', error);
      alert('An error occurred while submitting your idea');
    }
  };

  const handleSolveProblem = (problem) => {
    console.log('🚀 Starting to solve problem:', problem.title);
    setCurrentProblemId(problem._id);
    
    // Check if problem has quiz questions
    if (problem.quiz && problem.quiz.questions && problem.quiz.questions.length > 0) {
      console.log('📝 Problem has quiz questions, showing quiz modal');
      setCurrentQuiz(problem.quiz);
      setShowQuizModal(true);
    } else {
      console.log('💡 Problem has no quiz, showing idea submission modal directly');
      setShowIdeaModal(true);
    }
  };

  // --- Handlers for Problem Submission (Company) ---
  const handleSubmitProblem = async (formData) => {
    if (isLoggedIn && userRole === 'admin') {
      try {
        const token = localStorage.getItem('token');
        
        // Get company name from current user or use a default
        const companyName = currentUser?.companyName || currentUser?.username || 'Anonymous Company';
        
        console.log('📤 Submitting problem with quiz data:', formData.quiz);
        console.log('📤 Full form data being sent:', {
          company: companyName,
          branch: formData.branch,
          title: formData.title,
          description: formData.description,
          videoUrl: formData.videoUrl || '',
          difficulty: formData.difficulty,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          quiz: formData.quiz
        });
        
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/problems`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            company: companyName,
            branch: formData.branch,
            title: formData.title,
            description: formData.description,
            videoUrl: formData.videoUrl || '',
            difficulty: formData.difficulty,
            tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            quiz: formData.quiz // Add quiz data to the submission
          }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log('✅ Problem posted successfully with quiz:', data.quiz);
          setProblems(prevProblems => [data, ...prevProblems]);
          showNotification('Problem posted successfully!', 'success');
          setShowProblemForm(false);
          // Reset form
          setProblemForm({ 
            title: '', 
            branch: '', 
            description: '', 
            difficulty: '', 
            tags: '', 
            videoUrl: '',
            quiz: {
              enabled: false,
              title: '',
              description: '',
              questions: [],
              timeLimit: 30,
              passingScore: 70
            }
          });
        } else {
          showNotification(data.message || 'Failed to post problem', 'error');
          if (response.status === 401 || response.status === 403) {
            handleLogout();
          }
        }
      } catch (error) {
        console.error("Submit problem error:", error);
        showNotification('An error occurred while posting the problem.', 'error');
      }
    } else {
      showNotification("Access denied. You must be logged in as an admin.", 'error');
      if (!isLoggedIn) setCurrentView('login');
    }
  };

  // --- Handler for Problem Deletion (Company) ---
  const handleDeleteProblem = async (problemId, problemTitle) => {
    if (isLoggedIn && userRole === 'admin') {
      // Show confirmation dialog
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the problem "${problemTitle}"?\n\nThis action cannot be undone and will also remove all student ideas submitted for this problem.`
      );
      
      if (!confirmDelete) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        console.log('=== DELETE PROBLEM DEBUG ===');
        console.log('Problem ID:', problemId);
        console.log('Problem Title:', problemTitle);
        console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
        console.log('Full API URL:', `${process.env.REACT_APP_API_BASE_URL}/problems/${problemId}`);
        console.log('Token exists:', !!token);
        console.log('User Role:', userRole);
        console.log('Is Logged In:', isLoggedIn);
        
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/problems/${problemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
          // Remove the problem from the local state
          setProblems(prevProblems => prevProblems.filter(problem => problem._id !== problemId));
          showNotification('Problem deleted successfully!', 'success');
        } else {
          // Try to get error message from response
          let errorMessage = 'Failed to delete problem';
          try {
            const data = await response.json();
            errorMessage = data.message || `Delete failed with status ${response.status}`;
          } catch (parseError) {
            // If response is not JSON, use status text
            errorMessage = `Delete failed: ${response.status} ${response.statusText}`;
          }
          
          console.error('Delete failed:', errorMessage);
          showNotification(errorMessage, 'error');
          
          if (response.status === 401 || response.status === 403) {
            handleLogout();
          } else if (response.status === 404) {
            showNotification('Problem not found. It may have already been deleted.', 'error');
            // Remove from local state anyway since it doesn't exist
            setProblems(prevProblems => prevProblems.filter(problem => problem._id !== problemId));
          } else if (response.status === 500) {
            showNotification('Server error occurred while deleting the problem. Please try again later.', 'error');
          }
        }
      } catch (error) {
        console.error("Delete problem error:", error);
        
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          showNotification('Network error: Unable to connect to the server. Please check your internet connection and try again.', 'error');
        } else if (error.message.includes('REACT_APP_API_BASE_URL')) {
          showNotification('Configuration error: API URL is not set. Please check your environment configuration.', 'error');
        } else {
          showNotification(`An error occurred while deleting the problem: ${error.message}`, 'error');
        }
      }
    } else {
      showNotification("Access denied. You must be logged in as an admin.", 'error');
      if (!isLoggedIn) setCurrentView('login');
    }
  };

  const handleViewIdeas = async (problemId) => {
    if (isLoggedIn && userRole === 'admin') {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/ideas/problem/${problemId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          const problem = problems.find(p => p._id === problemId);
          if (problem) {
            setSelectedProblemForIdeas({ ...problem, ideas: data });
            setSelectedStudentIdea(null);
          }
        } else {
          alert(data.message || 'Failed to fetch ideas');
          if (response.status === 401 || response.status === 403) {
            handleLogout();
          }
        }
      } catch (error) {
        console.error("Fetch ideas for problem error:", error);
        alert('An error occurred while fetching ideas.');
      }
    } else {
      alert("Access denied. You must be logged in as an admin.");
      if (!isLoggedIn) setCurrentView('login');
    }
  };

  // --- Other component definitions ---
  const getEmbedVideoUrl = (url) => {
    if (!url) return null;
    
    // YouTube URL handling
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // YouTube short URL handling
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    
    // Vimeo URL handling
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    
    // If it's already an embed URL, return as is
    if (url.includes('embed')) {
      return url;
    }
    
    return null;
  };

  // --- Component Definitions ---
  const FloatingParticles = () => (
    <div className="floating-particles">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i} 
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );

  const UserSelection = () => (
    <div className="main-content page-transition">
      <Header 
        isLoggedIn={isLoggedIn} 
        currentUser={currentUser} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        setCurrentView={setCurrentView}
        currentView="home"
        handleBack={handleBack}
        onProfileClick={handleProfileClick}
      />
      <FloatingParticles />
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title gradient-text">Welcome to EngineerConnect</h1>
          <p className="hero-subtitle">
            Connect with peers, solve real-world engineering problems, and showcase your innovation
          </p>
          <div className="hero-stats">
            <div className="stat-item interactive-element">
              <i className="fas fa-users"></i>
              <div>
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Students</span>
              </div>
            </div>
            <div className="stat-item interactive-element">
              <i className="fas fa-building"></i>
              <div>
                <span className="stat-number">500+</span>
                <span className="stat-label">Companies</span>
              </div>
            </div>
            <div className="stat-item interactive-element">
              <i className="fas fa-lightbulb"></i>
              <div>
                <span className="stat-number">5,000+</span>
                <span className="stat-label">Solutions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="user-selection-section">
        <h2 className="section-title gradient-text">Choose Your Role</h2>
        <div className="user-cards">
          <div className="auth-card user-card student-card" onClick={() => handleSelectUserType('student')}>
            <div className="auth-header">
              <div className="auth-logo">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h3>I'm a Student</h3>
              <p>Explore engineering challenges, submit innovative solutions, and climb the leaderboard</p>
            </div>
            <div className="card-content">
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Access real-world problems</li>
                <li><i className="fas fa-check"></i> Submit creative solutions</li>
                <li><i className="fas fa-check"></i> Compete with peers</li>
                <li><i className="fas fa-check"></i> Build your portfolio</li>
              </ul>
            </div>
          </div>
          
          <div className="auth-card user-card company-card" onClick={() => handleSelectUserType('company')}>
            <div className="auth-header">
              <div className="auth-logo">
                <i className="fas fa-industry"></i>
              </div>
              <h3>I'm a Company</h3>
              <p>Post engineering challenges and discover talented student solutions from top universities</p>
            </div>
            <div className="card-content">
              <ul className="feature-list">
                <li><i className="fas fa-check"></i> Post real challenges</li>
                <li><i className="fas fa-check"></i> Review student solutions</li>
                <li><i className="fas fa-check"></i> Find talented engineers</li>
                <li><i className="fas fa-check"></i> Access innovation pipeline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BranchSelection = () => (
    <div className="main-content">
      <Header 
        isLoggedIn={isLoggedIn} 
        currentUser={currentUser} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        setCurrentView={setCurrentView}
        currentView="branchSelect"
        handleBack={handleBack}
        onProfileClick={handleProfileClick}
      />
    
      
      <div className="branch-selection-section">
        <div className="section-header">
          <h1 className="section-title">Select Your Engineering Branch</h1>
          <p className="section-subtitle">Choose your engineering discipline to see relevant problems and challenges</p>
        </div>
        
        <div className="branch-grid">
          {[
            { key: 'computer', title: 'Computer Science', icon: 'laptop-code', description: 'Software, AI, and computing solutions', color: '#4F46E5' },
            { key: 'mechanical', title: 'Mechanical Engineering', icon: 'cogs', description: 'Manufacturing, robotics, and machinery', color: '#059669' },
            { key: 'electrical', title: 'Electrical Engineering', icon: 'bolt', description: 'Electronics, power systems, and circuits', color: '#DC2626' },
            { key: 'civil', title: 'Civil Engineering', icon: 'drafting-compass', description: 'Infrastructure, construction, and urban planning', color: '#D97706' },
            { key: 'chemical', title: 'Chemical Engineering', icon: 'flask', description: 'Process design, materials, and biochemistry', color: '#7C3AED' },
            { key: 'aerospace', title: 'Aerospace Engineering', icon: 'plane', description: 'Aircraft, spacecraft, and propulsion systems', color: '#0891B2' }
          ].map(branch => (
            <div key={branch.key} className="branch-card" onClick={() => handleSelectBranch(branch.key)}>
              <div className="branch-icon" style={{ backgroundColor: branch.color }}>
                <i className={`fas fa-${branch.icon}`}></i>
              </div>
              <div className="branch-content">
                <h3>{branch.title}</h3>
                <p>{branch.description}</p>
              </div>
              <div className="branch-action">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const StudentFeed = () => {
    // --- Filter Logic ---
    const filteredProblems = problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            problem.company.toLowerCase().includes(searchTerm.toLowerCase());

      const branchMatch = selectedBranch ? problem.branch === selectedBranch : true;

      let filterMatch = true;
      switch (activeFilter) {
        case 'all': filterMatch = true; break;
        case 'new': filterMatch = problem.createdAt && (new Date() - new Date(problem.createdAt)) < 7 * 24 * 60 * 60 * 1000; break;
        case 'urgent': filterMatch = problem.difficulty === 'advanced'; break;
        case 'trending': filterMatch = problem.ideas && problem.ideas.length > 0; break;
        case 'beginner':
        case 'intermediate':
        case 'advanced':
          filterMatch = problem.difficulty === activeFilter;
          break;
        default: filterMatch = true;
      }

      return matchesSearch && branchMatch && filterMatch;
    });

    return (
      <div className="main-content">
        <Header 
          isLoggedIn={isLoggedIn} 
          currentUser={currentUser} 
          userRole={userRole} 
          handleLogout={handleLogout} 
          setCurrentView={setCurrentView}
          currentView="studentFeed"
          handleBack={handleBack}
          onProfileClick={handleProfileClick}
        />
        
        <div className="feed-layout">
          <aside className="sidebar">
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <i className="fas fa-filter"></i>
                Filters
              </h3>
              
              <div className="search-container">
                <div className="search-input-wrapper">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              
              <div className="filter-section">
                <h4 className="filter-group-title">Categories</h4>
                <div className="filter-buttons">
                  {[
                    { key: 'all', label: 'All Problems', icon: 'list' },
                    { key: 'new', label: 'New', icon: 'clock' },
                    { key: 'urgent', label: 'Urgent', icon: 'exclamation-triangle' },
                    { key: 'trending', label: 'Trending', icon: 'fire' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                      onClick={() => setActiveFilter(filter.key)}
                    >
                      <i className={`fas fa-${filter.icon}`}></i>
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
                
                <h4 className="filter-group-title">Difficulty</h4>
                <div className="filter-buttons">
                  {[
                    { key: 'beginner', label: 'Beginner', icon: 'star' },
                    { key: 'intermediate', label: 'Intermediate', icon: 'star-half-alt' },
                    { key: 'advanced', label: 'Advanced', icon: 'certificate' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                      onClick={() => setActiveFilter(filter.key)}
                    >
                      <i className={`fas fa-${filter.icon}`}></i>
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          
          <main className="feed-main">
            <div className="feed-header">
              <h2 className="feed-title">
                {selectedBranch ? `${selectedBranch.charAt(0).toUpperCase() + selectedBranch.slice(1)} Engineering Problems` : 'All Engineering Problems'}
              </h2>
              <div className="feed-stats">
                <span className="problem-count">{filteredProblems.length} problems available</span>
              </div>
            </div>
            
            <div className="problems-grid">
              {filteredProblems.length > 0 ? (
                filteredProblems.map(problem => (
                  <div key={problem._id} className="problem-card">
                    <div className="problem-header">
                      <div className="company-info">
                        <div className="company-avatar">
                          {problem.company.charAt(0).toUpperCase()}
                        </div>
                        <div className="company-details">
                          <h4 className="company-name">{problem.company}</h4>
                          <div className="problem-meta">
                            <span className="branch-tag">
                              <i className="fas fa-code-branch"></i>
                              {problem.branch.charAt(0).toUpperCase() + problem.branch.slice(1)}
                            </span>
                            <span className="date-tag">
                              <i className="fas fa-clock"></i>
                              {new Date(problem.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`difficulty-badge difficulty-${problem.difficulty}`}>
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </span>
                    </div>
                    
                    <div className="problem-content">
                      <h3 className="problem-title">{problem.title}</h3>
                      <p className="problem-description">{problem.description}</p>
                      
                      {problem.tags && problem.tags.length > 0 && (
                        <div className="tags-container">
                          {problem.tags.map((tag, idx) => (
                            <span key={idx} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      {problem.videoUrl && getEmbedVideoUrl(problem.videoUrl) && (
                        <div className="video-container">
                          <iframe 
                            className="problem-video-embed" 
                            src={getEmbedVideoUrl(problem.videoUrl)}
                            title="Problem Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                    </div>
                    
                    <div className="problem-footer">
                      <div className="problem-stats">
                        <div className="stat-item">
                          <i className="far fa-lightbulb"></i>
                          <span>{problem.ideas ? problem.ideas.length : 0} Ideas</span>
                        </div>
                        <div className="stat-item">
                          <i className="far fa-eye"></i>
                          <span>{problem.views || 0} Views</span>
                        </div>
                      </div>
                      
                      <div className="problem-actions">
                        <button className="action-btn share-btn" onClick={() => alert('Share functionality not implemented yet')}>
                          <i className="fas fa-share"></i>
                          <span>Share</span>
                        </button>
                        <button className="action-btn solve-btn" onClick={() => handleSolveProblem(problem)}>
                          <i className="fas fa-rocket"></i>
                          <span>Solve It</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-problems">
                  <i className="fas fa-search"></i>
                  <h3>No problems found</h3>
                  <p>Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  };

  // --- Home Component ---
  const Home = () => <UserSelection />;

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          !isAuthenticated ? (
            currentView === 'home' ? <Home /> :
            currentView === 'login' ? (
              <>
                <Header 
                  isLoggedIn={isLoggedIn} 
                  currentUser={currentUser} 
                  userRole={userRole} 
                  handleLogout={handleLogout} 
                  setCurrentView={setCurrentView}
                  currentView="login"
                  handleBack={handleBack}
                  onProfileClick={handleProfileClick}
                />
                <Login 
                  loginData={loginData} 
                  setLoginData={setLoginData} 
                  handleLogin={handleLogin} 
                  setCurrentView={setCurrentView}
                  handleBack={handleBack}
                />
              </>
            ) :
            currentView === 'signup' ? (
              <>
                <Header 
                  isLoggedIn={isLoggedIn} 
                  currentUser={currentUser} 
                  userRole={userRole} 
                  handleLogout={handleLogout} 
                  setCurrentView={setCurrentView}
                  currentView="signup"
                  handleBack={handleBack}
                  onProfileClick={handleProfileClick}
                />
                <SignUp 
                  signupData={signupData} 
                  setSignupData={setSignupData} 
                  handleSignUp={handleSignUp} 
                  setCurrentView={setCurrentView}
                  handleBack={handleBack}
                />
              </>
            ) : <Home />
          ) : (
            currentView === 'userSelect' ? <UserSelection /> :
            currentView === 'branchSelect' ? <BranchSelection /> :
            currentView === 'studentFeed' ? <StudentFeed /> :
            currentView === 'profile' ? (
              <UserProfileView
                currentUser={currentUser}
                isLoggedIn={isLoggedIn}
                userRole={userRole}
                handleLogout={handleLogout}
                setCurrentView={setCurrentView}
                onBack={() => {
                  console.log('🔄 Going back from profile, refreshing user data...');
                  refreshUserData();
                  // Go back to the appropriate dashboard based on user role
                  if (userRole === 'admin') {
                    setCurrentView('companyDashboard');
                  } else {
                    setCurrentView('studentFeed');
                  }
                }}
                onEditProfile={handleEditProfile}
                onProfileClick={handleProfileClick}
              />
            ) :
            currentView === 'companyDashboard' ? (
              <CompanyDashboard 
                problems={problems} 
                onSubmitProblem={handleSubmitProblem}
                onDeleteProblem={handleDeleteProblem}
                onViewIdeas={handleViewIdeas}
                isLoggedIn={isLoggedIn}
                currentUser={currentUser}
                userRole={userRole}
                handleLogout={handleLogout}
                setCurrentView={setCurrentView}
                handleBack={handleBack}
                onProfileClick={handleProfileClick}
              />
            ) :
            <UserSelection />
          )
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showIdeaModal && <IdeaSubmissionModal 
        ideaSubmission={ideaSubmission}
        setIdeaSubmission={setIdeaSubmission}
        handleIdeaSubmit={handleIdeaSubmit}
        setShowIdeaModal={setShowIdeaModal}
      />}
      {showQuizModal && <QuizModal 
        quiz={currentQuiz}
        problem={problems.find(p => p._id === currentProblemId)}
        onClose={() => setShowQuizModal(false)}
        onSubmit={() => {
          setShowQuizModal(false);
          setShowIdeaModal(true);
        }}
      />}
      {showProblemForm && <ProblemFormModal 
        problemForm={problemForm}
        setProblemForm={setProblemForm}
        handleProblemSubmit={handleSubmitProblem}
        setShowProblemForm={setShowProblemForm}
      />}
      
      {/* User Profile Panel */}
      {showProfilePanel && (
        <UserProfilePanel
          user={currentUser}
          isOpen={showProfilePanel}
          onClose={() => {
            setShowProfilePanel(false);
            console.log('🔄 Profile panel closed, refreshing user data...');
            refreshUserData();
          }}
          onUserUpdate={handleUserUpdate}
        />
      )}
      
      {/* Toast Notification */}
      {notification.show && (
        <div className={`toast-notification ${notification.type}`}>
          <div className="toast-content">
            <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Wrapper Component ---
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
