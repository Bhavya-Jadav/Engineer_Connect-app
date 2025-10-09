// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App-new.css';
import { API_BASE_URL } from './utils/api';

// Import components
import Header from './components/Header';
import CompanyDashboard from './components/CompanyDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import QuizModal from './components/QuizModal';
import UserProfilePanel from './components/UserProfilePanel';
import ProfilePage from './components/ProfilePage';
import Home from './components/Home';
import StudentFeed from './components/StudentFeed';
import IdeaSubmissionModal from './components/IdeaSubmissionModal';

// --- Main App Component ---
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // === AUTHENTICATION STATE ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // === APPLICATION STATE ===
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [currentView, setCurrentView] = useState('home');

  // === LEADERBOARD STATE ===
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // === MODAL STATE ===
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [currentProblemId, setCurrentProblemId] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  // === FORM DATA STATE ===
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({
    username: '', email: '', password: '', userType: '', 
    university: '', branch: '', companyName: ''
  });
  const [ideaSubmission, setIdeaSubmission] = useState({
    ideaText: '', implementationApproach: ''
  });

  // === NOTIFICATION STATE ===
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // === INITIALIZATION ===
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Re-fetch problems when user role or login status changes
  useEffect(() => {
    fetchProblems();
  }, [userRole, isLoggedIn]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserRole(userData.role);
        setCurrentUser(userData);
        
        // Navigate based on role and current path
        const currentPath = location.pathname;
        if (userData.role === 'admin' || userData.role === 'company') {
          if (currentPath === '/' || currentPath === '/login') {
            navigate('/dashboard');
          }
        } else if (userData.role === 'student') {
          if (currentPath === '/' || currentPath === '/login') {
            navigate('/profile');
          }
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        handleLogout();
      }
    }
  };

  const fetchProblems = async () => {
    try {
      // Determine which problems to fetch based on user role
      let apiUrl = `${API_BASE_URL}/problems`;
      let headers = {};
      
      // Companies should only see their own problems
      if (userRole === 'company' && isLoggedIn) {
        apiUrl = `${API_BASE_URL}/problems/my-problems`;
        headers = {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };
      }
      
      console.log('Fetching problems from:', apiUrl);
      console.log('User role:', userRole);
      
      const response = await fetch(apiUrl, { headers });
      console.log('Problems response status:', response.status);
      console.log('Problems response ok:', response.ok);
      
      const data = await response.json();
      console.log('Problems data received:', data);
      console.log('Number of problems:', data.length);
      
      if (response.ok) {
        setProblems(data);
        console.log('Problems set in state:', data.length, 'problems');
      } else {
        console.error('Failed to fetch problems:', data);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  // === GOOGLE AUTHENTICATION HANDLERS ===
  const handleGoogleSuccess = async (data) => {
    try {
      setIsLoading(true);
      
      const userData = {
        _id: data._id,
        username: data.username,
        name: data.name,
        email: data.email,
        role: data.role,
        university: data.university,
        companyName: data.companyName,
        profilePicture: data.profilePicture,
        phone: data.phone,
        bio: data.bio,
        course: data.course,
        year: data.year,
        skills: data.skills || [],
        authMethod: data.authMethod
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setIsLoggedIn(true);
      setUserRole(data.role);
      setCurrentUser(userData);

      showNotification('Google authentication successful!', 'success');
      
      // Role-based routing: Companies -> Dashboard, Students -> Profile
      if (data.role === 'admin' || data.role === 'company') {
        navigate('/dashboard');
      } else {
        // Students always go to profile page first
        navigate('/profile');
      }
      
      return true;
    } catch (error) {
      console.error("Google auth error:", error);
      showNotification('Google authentication failed', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google auth error:", error);
    showNotification(error || 'Google authentication failed', 'error');
  };

  const handleLogin = async (_username, _password) => {
    const username = _username || loginData.username;
    const password = _password || loginData.password;

    try {
      setIsLoading(true);
      console.log('Login attempt with:', { username, password });
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      console.log('Login response status:', response.status);
      console.log('Login response ok:', response.ok);

      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok) {
        const userData = {
          _id: data._id,
          username: data.username,
          name: data.name,
          email: data.email,
          role: data.role,
          university: data.university,
          companyName: data.companyName,
          profilePicture: data.profilePicture?.includes('placeholder') ? null : data.profilePicture,
          phone: data.phone,
          bio: data.bio,
          course: data.course,
          year: data.year,
          skills: data.skills || [],
          authMethod: data.authMethod
        };

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoggedIn(true);
        setUserRole(data.role);
        setCurrentUser(userData);

        // Role-based routing: Companies -> Dashboard, Students -> Profile
        if (data.role === 'admin' || data.role === 'company') {
          navigate('/dashboard');
        } else {
          // Students always go to profile page first
          navigate('/profile');
        }
        
        showNotification('Login successful!', 'success');
        return true;
      } else {
        showNotification(data.message || 'Login failed', 'error');
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification('Login error occurred', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (formData) => {
    try {
      setIsLoading(true);
      console.log('🔨 SIGNUP DEBUG - Form data received:', formData);
      
      const signupPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.userType, // Use userType directly instead of mapping
        university: formData.userType === 'student' ? formData.university : undefined,
        branch: formData.userType === 'student' ? formData.branch : undefined,
        companyName: formData.userType === 'company' ? formData.companyName : undefined
      };

      console.log('🔨 SIGNUP DEBUG - Payload being sent:', signupPayload);

      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload),
      });
      
      console.log('🔨 SIGNUP DEBUG - Response status:', response.status);
      console.log('🔨 SIGNUP DEBUG - Response ok:', response.ok);
      
      const data = await response.json();
      console.log('🔨 SIGNUP DEBUG - Response data:', data);
      if (response.ok) {
        // After successful signup, redirect to profile page
        const userData = {
          _id: data._id,
          username: data.username,
          name: data.name,
          email: data.email,
          role: data.role,
          university: data.university,
          companyName: data.companyName,
          profilePicture: data.profilePicture,
          phone: data.phone,
          bio: data.bio,
          course: data.course,
          year: data.year,
          skills: data.skills || [],
          authMethod: data.authMethod
        };

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoggedIn(true);
        setUserRole(data.role);
        setCurrentUser(userData);

        showNotification('Account created successfully! Please complete your profile.', 'success');
        navigate('/profile');
        
        setSignupData({
          username: '', email: '', password: '', userType: '', 
          university: '', branch: '', companyName: ''
        });
      } else {
        showNotification(data.message || 'Signup failed', 'error');
      }
    } catch (error) {
      console.error("Signup error:", error);
      showNotification('Signup error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    setSelectedBranch('');
    navigate('/');
    // Reset form data
    setLoginData({ username: '', password: '' });
    setSignupData({
      username: '', email: '', password: '', userType: '', 
      university: '', branch: '', companyName: ''
    });
  };

  // === NAVIGATION HANDLERS ===
  const handleSelectUserType = (type) => {
    if (type === 'student') {
      if (isLoggedIn && userRole === 'student') {
        navigate('/feed');
      } else {
        navigate('/login');
      }
    } else if (type === 'company') {
      if (isLoggedIn && (userRole === 'admin' || userRole === 'company')) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
  };

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    navigate('/feed');
  };

  const handleBack = () => {
    const currentPath = location.pathname;
    if (currentPath === '/login' || currentPath === '/signup') {
      navigate('/');
    } else if (currentPath === '/feed') {
      navigate('/');
    } else if (currentPath === '/dashboard') {
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleShowLeaderboard = (tab) => {
    setActiveTab(tab);
  };

  // === PROBLEM HANDLERS ===
  const handleSubmitProblem = async (formData) => {
    if (!(isLoggedIn && (userRole === 'admin' || userRole === 'company'))) {
      console.log('❌ ACCESS DENIED - User role:', userRole, 'isLoggedIn:', isLoggedIn);
      showNotification("Access denied. Only admins and companies can post problems.", 'error');
      return;
    }

    try {
      console.log('🚀 FRONTEND: Starting problem submission');
      console.log('👤 FRONTEND: Current user:', currentUser);
      console.log('🔑 FRONTEND: User role:', userRole);
      
      const token = localStorage.getItem('token');
      const companyName = currentUser?.companyName || currentUser?.username || 'Anonymous Company';
      
      const response = await fetch(`${API_BASE_URL}/problems`, {
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
          videoUrl: formData.videoUrl, // Include video URL if provided
          difficulty: formData.difficulty,
          tags: Array.isArray(formData.tags) ? formData.tags : (formData.tags && typeof formData.tags === 'string' ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
          quiz: formData.quiz,
          attachments: formData.attachments || [] // Include attachments
        }),
      });
      
      console.log('📡 FRONTEND: Response status:', response.status);
      console.log('📡 FRONTEND: Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📡 FRONTEND: Response data:', data);
      if (response.ok) {
        setProblems(prevProblems => [data, ...prevProblems]);
        showNotification('Problem posted successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to post problem', 'error');
      }
    } catch (error) {
      console.error("Submit problem error:", error);
      showNotification('Error posting problem', 'error');
    }
  };

  const handleDeleteProblem = async (problemId, problemTitle) => {
    if (!(isLoggedIn && (userRole === 'admin' || userRole === 'company'))) {
      showNotification("Access denied", 'error');
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete "${problemTitle}"?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setProblems(prevProblems => prevProblems.filter(problem => problem._id !== problemId));
        showNotification('Problem deleted successfully!', 'success');
      } else {
        const data = await response.json();
        showNotification(data.message || 'Failed to delete problem', 'error');
      }
    } catch (error) {
      console.error("Delete problem error:", error);
      showNotification('Error deleting problem', 'error');
    }
  };

  // === IDEA SUBMISSION HANDLERS ===
  const handleSolveProblem = (problem) => {
    console.log('🚀 handleSolveProblem called with problem:', problem);
    setCurrentProblemId(problem._id);
    setCurrentProblem(problem); // Store the entire problem object
    
    // Check if problem has quiz questions
    if (problem.quiz && problem.quiz.questions && problem.quiz.questions.length > 0) {
      console.log('📝 Opening quiz modal');
      setCurrentQuiz(problem.quiz);
      setShowQuizModal(true);
    } else {
      console.log('💡 Opening idea modal');
      setShowIdeaModal(true);
    }
  };

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    
    console.log('💡 handleIdeaSubmit called');
    console.log('💡 currentProblemId:', currentProblemId);
    console.log('💡 ideaSubmission:', ideaSubmission);
    
    if (!currentProblemId) {
      showNotification('No problem selected', 'error');
      return;
    }
    
    if (!ideaSubmission.ideaText.trim()) {
      showNotification('Please enter your solution idea', 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      const submissionData = {
        problemId: currentProblemId,
        ideaText: ideaSubmission.ideaText.trim(),
        implementationApproach: ideaSubmission.implementationApproach.trim()
      };
      
      console.log('💡 Submitting idea with data:', submissionData);
      
      const response = await fetch(`${API_BASE_URL}/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });
      
      const data = await response.json();
      
      console.log('💡 Response status:', response.status);
      console.log('💡 Response data:', data);
      
      if (response.ok) {
        // Reset form
        setIdeaSubmission({
          ideaText: '',
          implementationApproach: ''
        });
        
        // Close modal
        setShowIdeaModal(false);
        setCurrentProblemId(null);
        
        console.log('✅ Idea submitted successfully!');
        showNotification('Your solution has been submitted successfully!', 'success');
      } else {
        console.error('❌ Idea submission failed:', data.message);
        showNotification(data.message || 'Failed to submit idea', 'error');
      }
      
    } catch (error) {
      console.error('❌ Error submitting idea:', error);
      showNotification('An error occurred while submitting your idea', 'error');
    }
  };

  // === USER UPDATE HANDLER ===
  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // === UTILITY FUNCTIONS ===
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // === FILTER LOGIC ===
  console.log('App.js - All problems before filtering:', problems);
  console.log('App.js - Search term:', searchTerm);
  console.log('App.js - Active filter:', activeFilter);
  
  const filteredProblems = problems.filter(problem => {
    // Safe string matching with null checks
    const matchesSearch = !searchTerm || 
      (problem.title && problem.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (problem.description && problem.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (problem.company && problem.company.toLowerCase().includes(searchTerm.toLowerCase()));

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

    return matchesSearch && filterMatch;
  });
  
  console.log('App.js - Filtered problems result:', filteredProblems);
  console.log('App.js - Number of filtered problems:', filteredProblems.length);

  // === RENDER COMPONENTS ===
  return (
    <div className="App">
      <Routes>
        {/* Home Route */}
        <Route path="/" element={
          <>
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
            <Home 
              onSelectUserType={handleSelectUserType}
              isLoggedIn={isLoggedIn}
              leaderboardData={leaderboardData}
              activeTab={activeTab}
              onShowLeaderboard={handleShowLeaderboard}
            />
          </>
        } />

        {/* Login Route */}
        <Route path="/login" element={
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
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={handleGoogleError}
              isLoading={isLoading}
            />
          </>
        } />

        {/* Signup Route */}
        <Route path="/signup" element={
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
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={handleGoogleError}
              isLoading={isLoading}
            />
          </>
        } />

        {/* Student Feed Route */}
        <Route path="/feed" element={
          <StudentFeed 
            selectedBranch={selectedBranch}
            problems={problems}
            onOpenIdeaModal={handleSolveProblem}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            userRole={userRole}
            handleLogout={handleLogout}
            setCurrentView={setCurrentView}
            handleBack={handleBack}
            onProfileClick={handleProfileClick}
          />
        } />

        {/* Company Dashboard Route */}
        <Route path="/dashboard" element={
          userRole === 'admin' ? (
            <AdminDashboard
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              userRole={userRole}
              handleLogout={handleLogout}
              setCurrentView={setCurrentView}
              onProfileClick={handleProfileClick}
            />
          ) : (
            <CompanyDashboard
              problems={problems}
              onSubmitProblem={handleSubmitProblem}
              onDeleteProblem={handleDeleteProblem}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              userRole={userRole}
              handleLogout={handleLogout}
              setCurrentView={setCurrentView}
              handleBack={handleBack}
              onProfileClick={handleProfileClick}
            />
          )
        } />

        {/* Profile Page Route */}
        <Route path="/profile" element={
          <ProfilePage
            currentUser={currentUser}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            handleLogout={handleLogout}
            setCurrentView={setCurrentView}
            onBack={handleBack}
            onProfileClick={handleProfileClick}
          />
        } />
      </Routes>

      {/* === MODALS === */}
      {showIdeaModal && (
        <>
          {console.log('💡 Rendering IdeaSubmissionModal! showIdeaModal:', showIdeaModal)}
          {console.log('💡 currentProblemId:', currentProblemId)}
          <IdeaSubmissionModal
            onClose={() => setShowIdeaModal(false)}
            onSubmit={handleIdeaSubmit}
            ideaSubmission={ideaSubmission}
            setIdeaSubmission={setIdeaSubmission}
          />
        </>
      )}

      {showQuizModal && (
        <>
          {console.log('🎯 Rendering QuizModal! showQuizModal:', showQuizModal)}
          {console.log('🎯 currentQuiz:', currentQuiz)}
          {console.log('🎯 currentProblem:', currentProblem)}
          
          {/* Force modal to display with inline styles */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <QuizModal 
              quiz={currentQuiz}
              problem={currentProblem}
              onClose={() => {
                console.log('❌ QuizModal onClose called');
                setShowQuizModal(false);
              }}
              onSubmit={() => {
                console.log('✅ QuizModal onSubmit called!');
                console.log('📊 Before state change - showQuizModal:', showQuizModal, 'showIdeaModal:', showIdeaModal);
                setShowQuizModal(false);
                setShowIdeaModal(true);
                console.log('📊 After state change called - should now show idea modal');
              }}
            />
          </div>
        </>
      )}

      {showProfilePanel && (
        <UserProfilePanel
          user={currentUser}
          isOpen={showProfilePanel}
          onClose={() => setShowProfilePanel(false)}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {/* === NOTIFICATION === */}
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
}

// === MAIN APP WRAPPER ===
function App() {
  // Clean the Google Client ID to remove any whitespace or line breaks
  const rawGoogleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const cleanGoogleClientId = rawGoogleClientId ? rawGoogleClientId.trim().replace(/[\r\n\t]/g, '') : '';
  
  console.log('🔍 App.js - Raw Google Client ID:', rawGoogleClientId);
  console.log('🔍 App.js - Clean Google Client ID:', cleanGoogleClientId);

  return (
    <Router>
      <GoogleOAuthProvider clientId={cleanGoogleClientId}>
        <AppContent />
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;
