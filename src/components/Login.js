import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from './GoogleLogin';
import ForgotPasswordModal from './ForgotPasswordModal';
import '../styles/login.css';

const Login = ({ loginData, setLoginData, handleLogin, setCurrentView, handleBack, onGoogleSuccess, onGoogleError, isLoading }) => {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Back Button */}
          <button 
            className="login-back-btn" 
            onClick={handleBack || (() => navigate('/'))} 
            title="Go back"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          
          {/* Login Header */}
          <div className="login-header">
            <div className="login-logo">
              <i className="fas fa-code-branch"></i>
            </div>
            <h2 className="login-title">Sign In</h2>
            <p className="login-subtitle">Welcome back to EngineerConnect</p>
          </div>
          
          {/* Login Form */}
          <form 
            className="login-form" 
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(loginData.username, loginData.password);
            }}
          >
            {/* Username Field */}
            <div className="login-form-group">
              <label htmlFor="login-username" className="login-form-label">
                <i className="fas fa-user"></i>
                <span>Username</span>
              </label>
              <input
                type="text"
                id="login-username"
                className="login-form-input"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>
            
            {/* Password Field */}
            <div className="login-form-group">
              <label htmlFor="login-password" className="login-form-label">
                <i className="fas fa-lock"></i>
                <span>Password</span>
              </label>
              <input
                type="password"
                id="login-password"
                className="login-form-input"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
            
            {/* Forgot Password Link */}
            <div className="login-forgot-password">
              <button 
                type="button" 
                className="login-forgot-link"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot your password?
              </button>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              className={`login-submit-btn ${isLoading ? 'login-loading' : ''}`} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span className="login-divider-text">OR CONTINUE WITH</span>
          </div>

          {/* Google Login */}
          <div className="login-google-container">
            <GoogleLoginButton 
              onGoogleSuccess={onGoogleSuccess}
              onGoogleError={onGoogleError}
              isLoading={isLoading}
            />
          </div>
          
          {/* Footer */}
          <div className="login-footer">
            <p className="login-footer-text">Don't have an account?</p>
            <button 
              className="login-signup-btn" 
              onClick={() => navigate('/signup')}
              type="button"
            >
              <span>Create Account</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          
          {/* Forgot Password Modal */}
          <ForgotPasswordModal 
            isOpen={showForgotPassword}
            onClose={() => setShowForgotPassword(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
