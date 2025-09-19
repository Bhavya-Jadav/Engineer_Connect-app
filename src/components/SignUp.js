import React from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from './GoogleLogin';
import '../styles/signup.css';

const SignUp = ({ signupData, setSignupData, handleSignUp, setCurrentView, handleBack, onGoogleSuccess, onGoogleError, isLoading }) => {
  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('📝 SIGNUP FORM - Submitting with data:', signupData);
    handleSignUp(signupData);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <button 
            className="signup-back-btn" 
            onClick={handleBack || (() => navigate('/'))} 
            title="Go Back"
          >
            <i className="fas fa-arrow-left"></i>
          </button>

          <div className="signup-header">
            <div className="signup-logo">
              <i className="fas fa-users-cog"></i>
            </div>
            <h1 className="signup-title">Join EngineerConnect</h1>
            <p className="signup-subtitle">Create your professional account</p>
          </div>
          
          <form className="signup-form" onSubmit={handleFormSubmit}>
            <div className="signup-form-row">
              <div className="signup-form-group">
                <label htmlFor="signup-username" className="signup-form-label">
                  <i className="fas fa-user"></i>
                  <span>Username</span>
                </label>
                <input
                  type="text"
                  id="signup-username"
                  className="signup-form-input"
                  value={signupData.username}
                  onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                  placeholder="Choose a username"
                  required
                  autoComplete="username"
                />
              </div>
              
              <div className="signup-form-group">
                <label htmlFor="signup-email" className="signup-form-label">
                  <i className="fas fa-envelope"></i>
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  id="signup-email"
                  className="signup-form-input"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="signup-form-group">
              <label htmlFor="signup-password" className="signup-form-label">
                <i className="fas fa-lock"></i>
                <span>Password</span>
              </label>
              <input
                type="password"
                id="signup-password"
                className="signup-form-input"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                placeholder="Create a password"
                required
                autoComplete="new-password"
              />
            </div>
            
            <div className="signup-form-group">
              <label htmlFor="signup-userType" className="signup-form-label">
                <i className="fas fa-users"></i>
                <span>Account Type</span>
              </label>
              <div className="signup-form-select-wrapper">
                <select
                  id="signup-userType"
                  className="signup-form-select"
                  value={signupData.userType}
                  onChange={(e) => setSignupData({...signupData, userType: e.target.value})}
                  required
                >
                  <option value="" disabled>Select account type</option>
                  <option value="student">Student</option>
                  <option value="company">Company</option>
                </select>
              </div>
            </div>
            
            {signupData.userType === 'student' && (
              <div className="signup-conditional-section">
                <div className="signup-form-row">
                  <div className="signup-form-group">
                    <label htmlFor="signup-university" className="signup-form-label">
                      <i className="fas fa-university"></i>
                      <span>University</span>
                    </label>
                    <input
                      type="text"
                      id="signup-university"
                      className="signup-form-input"
                      value={signupData.university}
                      onChange={(e) => setSignupData({...signupData, university: e.target.value})}
                      placeholder="Enter your university"
                      required
                    />
                  </div>
                  
                  <div className="signup-form-group">
                    <label htmlFor="signup-branch" className="signup-form-label">
                      <i className="fas fa-code-branch"></i>
                      <span>Branch</span>
                    </label>
                    <div className="signup-form-select-wrapper">
                      <select
                        id="signup-branch"
                        className="signup-form-select"
                        value={signupData.branch}
                        onChange={(e) => setSignupData({...signupData, branch: e.target.value})}
                        required
                      >
                        <option value="" disabled>Select branch</option>
                        <option value="mechanical">Mechanical Engineering</option>
                        <option value="computer">Computer Science</option>
                        <option value="electrical">Electrical Engineering</option>
                        <option value="civil">Civil Engineering</option>
                        <option value="chemical">Chemical Engineering</option>
                        <option value="aerospace">Aerospace Engineering</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {signupData.userType === 'company' && (
              <div className="signup-conditional-section">
                <div className="signup-form-group">
                  <label htmlFor="signup-companyName" className="signup-form-label">
                    <i className="fas fa-building"></i>
                    <span>Company Name</span>
                  </label>
                  <input
                    type="text"
                    id="signup-companyName"
                    className="signup-form-input"
                    value={signupData.companyName}
                    onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                    placeholder="Enter your company name"
                    required
                  />
                </div>
              </div>
            )}
            
            <button type="submit" className="signup-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="signup-divider">
            <span className="signup-divider-text">or</span>
          </div>

          {/* Google Sign Up */}
          <div className="signup-google-container">
            <GoogleLoginButton 
              onGoogleSuccess={onGoogleSuccess}
              onGoogleError={onGoogleError}
              isLoading={isLoading}
            />
          </div>
          
          <div className="signup-footer">
            <p className="signup-footer-text">Already have an account?</p>
            <button className="signup-login-btn" onClick={() => navigate('/login')}>
              <span>Sign In</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
