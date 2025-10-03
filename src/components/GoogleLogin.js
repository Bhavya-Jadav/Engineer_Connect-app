import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../utils/api';
import '../styles/google-login-fix.css';

const GoogleLoginButton = ({ onGoogleSuccess, onGoogleError, isLoading }) => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      console.log('🔍 Google credential response:', credentialResponse);
      
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode the JWT token to get user info
      const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      console.log('🔍 Decoded Google token:', decoded);
      
      const googleData = {
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };

      console.log('🔍 Sending to backend:', googleData);

      // Send to backend using the correct API URL
      const response = await fetch(`${API_BASE_URL}/users/google-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleData),
      });

      console.log('🔍 Backend response status:', response.status);
      const data = await response.json();
      console.log('🔍 Backend response data:', data);

      if (response.ok) {
        onGoogleSuccess(data);
      } else {
        onGoogleError(data.message || 'Google authentication failed on server');
      }
    } catch (error) {
      console.error('🚨 Google auth error:', error);
      onGoogleError('Failed to authenticate with Google: ' + error.message);
    }
  };

  const handleGoogleError = (error) => {
    console.error('🚨 Google auth error callback:', error);
    onGoogleError('Google authentication failed. Please try again.');
  };

  // Check if Google Client ID is available
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  console.log('🔍 Google Client ID available:', !!googleClientId);
  
  if (!googleClientId) {
    return (
      <div className="google-login-container">
        <div className="google-login-error">
          <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
            Google authentication is not configured. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="google-login-container" style={{ width: '100%' }}>
      <div className="google-login-wrapper" style={{ width: '100%' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          disabled={isLoading}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          useOneTap={false}
          cancel_on_tap_outside={false}
        />
      </div>
      
      <div className="google-login-info">
        <p>
          <i className="fas fa-shield-alt"></i>
          Secure authentication with Google
        </p>
      </div>
    </div>
  );
};

export default GoogleLoginButton;
