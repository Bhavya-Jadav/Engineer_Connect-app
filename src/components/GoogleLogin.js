import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../utils/api';

const GoogleLoginButton = ({ onGoogleSuccess, onGoogleError, isLoading }) => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      const googleData = {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };

      // Send to backend using the correct API URL
      const response = await fetch(`${API_BASE_URL}/users/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData),
      });

      const data = await response.json();

      if (response.ok) {
        onGoogleSuccess(data);
      } else {
        onGoogleError(data.message || 'Google authentication failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      onGoogleError('Failed to authenticate with Google');
    }
  };

  const handleGoogleError = () => {
    onGoogleError('Google authentication failed. Please try again.');
  };

  return (
    <div className="google-login-container">
      <div className="google-login-divider">
        <span>or</span>
      </div>
      
      <div className="google-login-button">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          disabled={isLoading}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width={400}
          useOneTap={false}
        />
      </div>
      
      <div className="google-login-info">
        <p>
          <i className="fas fa-shield-alt"></i>
          Secure login with Google
        </p>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
