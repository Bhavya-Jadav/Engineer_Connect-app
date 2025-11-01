import React from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from './GoogleLogin';
import '../styles/login.css';

const Login = ({ handleBack, onGoogleSuccess, onGoogleError, isLoading }) => {
  const navigate = useNavigate();

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
            <p className="login-subtitle">Welcome back to SKILLINK</p>
          </div>

          {/* Google Login */}
          <div className="login-google-container">
            <GoogleLoginButton 
              onGoogleSuccess={onGoogleSuccess}
              onGoogleError={onGoogleError}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
