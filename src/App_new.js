// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// Import components
import Header from './components/Header';
import CompanyDashboard from './components/CompanyDashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import QuizModal from './components/QuizModal';
import UserProfilePanel from './components/UserProfilePanel';
import Home from './components/Home';
import BranchSelection from './components/BranchSelection';
import StudentFeed from './components/StudentFeed';
import IdeaSubmissionModal from './components/IdeaSubmissionModal';

// --- Main App Component ---
function AppContent() {
  const navigate = useNavigate();

  // === AUTHENTICATION STATE ===
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // === APPLICATION STATE ===
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [currentView, setCurrentView] = useState('home');

  // === MODAL STATE ===
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [currentProblemId, setCurrentProblemId] = useState(null);
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
    fetchProblems();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsLoggedIn(true);
        setUserRole(userData.role);
        setCurrentUser(userData);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        handleLogout();
      }
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/problems`);
      const data = await response.json();
      if (response.ok) {
        setProblems(data);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
  };

  // === AUTHENTICATION HANDLERS ===
  const handleLogin = async (username, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      if (response.ok) {
        // Clean placeholder URLs if present
        const userData = {
          _id: data._id,
          username: data.username,
          name: data.name,
          email: data.email,
          role: data.role,
          university: data.university,
          companyName: data.companyName,
          profilePicture: data.profilePicture && data.profilePicture.includes('placeholder') ? null : data.profilePicture,
          phone: data.phone,
          bio: data.bio,
          course: data.course,
          year: data.year,
          skills: data.skills || []
        };

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoggedIn(true);
        setUserRole(data.role);
        setCurrentUser(userData);

        // Redirect based on role
        if (data.role === 'admin') {
          setCurrentView('companyDashboard');
        } else {
          setCurrentView('branchSelect');
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
    }
  };

  const handleSignUp = async (formData) => {
    try {
      const signupPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.userType === 'student' ? 'student' : 'admin',
        university: formData.userType === 'student' ? formData.university : undefined,
        branch: formData.userType === 'student' ? formData.branch : undefined,
        companyName: formData.userType === 'company' ? formData.companyName : undefined
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload),
      });
      
      const data = await response.json();
      if (response.ok) {
        showNotification('Account created successfully! Please login.', 'success');
        setCurrentView('login');
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
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUser(null);
    setCurrentView('home');
    setSelectedBranch('');
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

  const handleBack = () => {
    if (currentView === 'login' || currentView === 'signup') {
      setCurrentView('home');
    } else if (currentView === 'branchSelect') {
      setCurrentView('home');
    } else if (currentView === 'studentFeed') {
      setCurrentView('branchSelect');
    } else if (currentView === 'companyDashboard') {
      setCurrentView('home');
    }
  };

  const handleProfileClick = () => {
    setShowProfilePanel(true);
  };

  // === PROBLEM HANDLERS ===
  const handleSubmitProblem = async (formData) => {
    if (!(isLoggedIn && userRole === 'admin')) {
      showNotification("Access denied", 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const companyName = currentUser?.companyName || currentUser?.username || 'Anonymous Company';
      
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
          difficulty: formData.difficulty,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          quiz: formData.quiz
        }),
      });
      
      const data = await response.json();
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
    if (!(isLoggedIn && userRole === 'admin')) {
      showNotification("Access denied", 'error');
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete "${problemTitle}"?`);
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/problems/${problemId}`, {
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
    setCurrentProblemId(problem._id);
    
    // Check if problem has quiz questions
    if (problem.quiz && problem.quiz.questions && problem.quiz.questions.length > 0) {
      setCurrentQuiz(problem.quiz);
      setShowQuizModal(true);
    } else {
      setShowIdeaModal(true);
    }
  };

  const handleIdeaSubmit = async (e) => {
    e.preventDefault();
    
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
        // Reset form
        setIdeaSubmission({
          ideaText: '',
          implementationApproach: ''
        });
        
        // Close modal
        setShowIdeaModal(false);
        setCurrentProblemId(null);
        
        showNotification('Your solution has been submitted successfully!', 'success');
      } else {
        showNotification(data.message || 'Failed to submit idea', 'error');
      }
      
    } catch (error) {
      console.error('Error submitting idea:', error);
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
  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.company.toLowerCase().includes(searchTerm.toLowerCase());

    const branchMatch = selectedBranch === 'all' || !selectedBranch || problem.branch === selectedBranch;

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

  // === RENDER COMPONENTS ===
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          currentView === 'home' ? (
            <Home 
              onSelectUserType={handleSelectUserType}
              isLoggedIn={isLoggedIn}
            />
          ) :
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
          ) :
          currentView === 'branchSelect' ? (
            <BranchSelection 
              onSelectBranch={handleSelectBranch}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              userRole={userRole}
              handleLogout={handleLogout}
              setCurrentView={setCurrentView}
              handleBack={handleBack}
              onProfileClick={handleProfileClick}
            />
          ) :
          currentView === 'studentFeed' ? (
            <StudentFeed 
              selectedBranch={selectedBranch}
              problems={filteredProblems}
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
          ) :
          currentView === 'companyDashboard' ? (
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
          ) : (
            <Home 
              onSelectUserType={handleSelectUserType}
              isLoggedIn={isLoggedIn}
            />
          )
        } />
      </Routes>

      {/* === MODALS === */}
      {showIdeaModal && (
        <IdeaSubmissionModal
          onClose={() => setShowIdeaModal(false)}
          onSubmit={handleIdeaSubmit}
          ideaSubmission={ideaSubmission}
          setIdeaSubmission={setIdeaSubmission}
        />
      )}

      {showQuizModal && (
        <QuizModal 
          quiz={currentQuiz}
          problem={problems.find(p => p._id === currentProblemId)}
          onClose={() => setShowQuizModal(false)}
          onSubmit={() => {
            setShowQuizModal(false);
            setShowIdeaModal(true);
          }}
        />
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
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
