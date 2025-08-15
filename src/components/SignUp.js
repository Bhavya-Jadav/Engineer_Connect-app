import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = ({ signupData, setSignupData, handleSignUp, setCurrentView, handleBack }) => {
  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('📝 SIGNUP FORM - Submitting with data:', signupData);
    handleSignUp(signupData);
  };

  return (
  <div className="auth-container">
    <div className="auth-card">
      <div className="auth-header">
        <button 
          className="back-btn" 
          onClick={handleBack || (() => navigate('/'))} 
          style={{ 
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            color: '#3498db',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            zIndex: 10
          }}
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="auth-logo">
          <i className="fas fa-user-plus"></i>
        </div>
        <h2>Create Account</h2>
        <p>Join the EngineerConnect community</p>
      </div>
      
      <form className="auth-form" onSubmit={handleFormSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="signup-username">
              <i className="fas fa-user"></i>
              <span>Username</span>
            </label>
            <input
              type="text"
              id="signup-username"
              value={signupData.username}
              onChange={(e) => setSignupData({...signupData, username: e.target.value})}
              placeholder="Choose a username"
              required
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="signup-email">
              <i className="fas fa-envelope"></i>
              <span>Email</span>
            </label>
            <input
              type="email"
              id="signup-email"
              value={signupData.email}
              onChange={(e) => setSignupData({...signupData, email: e.target.value})}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="signup-password">
            <i className="fas fa-lock"></i>
            <span>Password</span>
          </label>
          <input
            type="password"
            id="signup-password"
            value={signupData.password}
            onChange={(e) => setSignupData({...signupData, password: e.target.value})}
            placeholder="Create a password"
            required
            autoComplete="new-password"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="signup-userType">
            <i className="fas fa-users"></i>
            <span>Account Type</span>
          </label>
          <select
            id="signup-userType"
            value={signupData.userType}
            onChange={(e) => setSignupData({...signupData, userType: e.target.value})}
            required
          >
            <option value="">Select account type</option>
            <option value="student">Student</option>
            <option value="company">Company</option>
          </select>
        </div>
        
        {signupData.userType === 'student' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="signup-university">
                <i className="fas fa-university"></i>
                <span>University</span>
              </label>
              <input
                type="text"
                id="signup-university"
                value={signupData.university}
                onChange={(e) => setSignupData({...signupData, university: e.target.value})}
                placeholder="Enter your university"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="signup-branch">
                <i className="fas fa-code-branch"></i>
                <span>Branch</span>
              </label>
              <select
                id="signup-branch"
                value={signupData.branch}
                onChange={(e) => setSignupData({...signupData, branch: e.target.value})}
                required
              >
                <option value="">Select branch</option>
                <option value="mechanical">Mechanical Engineering</option>
                <option value="computer">Computer Science</option>
                <option value="electrical">Electrical Engineering</option>
                <option value="civil">Civil Engineering</option>
                <option value="chemical">Chemical Engineering</option>
                <option value="aerospace">Aerospace Engineering</option>
              </select>
            </div>
          </div>
        )}
        
        {signupData.userType === 'company' && (
          <div className="form-group">
            <label htmlFor="signup-companyName">
              <i className="fas fa-building"></i>
              <span>Company Name</span>
            </label>
            <input
              type="text"
              id="signup-companyName"
              value={signupData.companyName}
              onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
              placeholder="Enter your company name"
              required
            />
          </div>
        )}
        
        <button type="submit" className="btn btn-primary auth-btn">
          <i className="fas fa-user-plus"></i>
          <span>Create Account</span>
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Already have an account?</p>
        <button className="link-btn" onClick={() => navigate('/login')}>
          <span>Sign In</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
  );
};

export default SignUp;
