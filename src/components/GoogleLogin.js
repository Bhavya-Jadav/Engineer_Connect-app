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
      console.log('🔍 API URL:', `${API_BASE_URL}/users/google-auth`);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        // Send to backend using the correct API URL
        const response = await fetch(`${API_BASE_URL}/users/google-auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('🔍 Backend response status:', response.status);
        console.log('🔍 Backend response ok:', response.ok);
        
        const data = await response.json();
        console.log('🔍 Backend response data:', data);

        if (response.ok) {
          console.log('✅ Google auth successful');
          onGoogleSuccess(data);
        } else {
          console.error('❌ Google auth failed:', data.message);
          onGoogleError(data.message || 'Google authentication failed on server');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('⏱️ Request timeout - server took too long to respond');
          onGoogleError('Request timeout. The server is taking too long to respond. Please try again.');
        } else {
          console.error('🌐 Network error:', fetchError);
          onGoogleError('Network error: ' + fetchError.message);
        }
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

  // Clean the Google Client ID to remove any line breaks or whitespace
  const rawClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const googleClientId = rawClientId ? rawClientId.trim().replace(/[\r\n\t]/g, '') : null;
  
  console.log('🔍 Raw Google Client ID:', rawClientId);
  console.log('🔍 Cleaned Google Client ID:', googleClientId);
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
          auto_select={false}
          ux_mode="popup"
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
