import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ loginData, setLoginData, handleLogin, setCurrentView, handleBack }) => {
  const navigate = useNavigate();

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
          <i className="fas fa-code-branch"></i>
        </div>
        <h2>Sign In</h2>
        <p>Welcome back to EngineerConnect</p>
      </div>
      
      <form className="auth-form" onSubmit={(e) => {
        e.preventDefault();
        handleLogin(loginData.username, loginData.password);
      }}>
        <div className="form-group">
          <label htmlFor="login-username">
            <i className="fas fa-user"></i>
            <span>Username</span>
          </label>
          <input
            type="text"
            id="login-username"
            value={loginData.username}
            onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            placeholder="Enter your username"
            required
            autoComplete="username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="login-password">
            <i className="fas fa-lock"></i>
            <span>Password</span>
          </label>
          <input
            type="password"
            id="login-password"
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </div>
        
        <button type="submit" className="btn btn-primary auth-btn">
          <i className="fas fa-sign-in-alt"></i>
          <span>Sign In</span>
        </button>
      </form>
      
      <div className="auth-footer">
        <p>Don't have an account?</p>
        <button className="link-btn" onClick={() => navigate('/signup')}>
          <span>Create Account</span>
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
  );
};

export default Login;
