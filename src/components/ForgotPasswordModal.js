import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/api';
import '../styles/ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [step, setStep] = useState('email'); // 'email' or 'success'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('success');
        setMessage({ type: 'success', text: data.message || 'Password reset instructions sent to your email' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to send reset instructions' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage({ type: '', text: '' });
    setStep('email');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-content">
          {step === 'email' ? (
            <>
              <div className="modal-icon">
                <i className="fas fa-key"></i>
              </div>
              
              <h2>Forgot Password?</h2>
              <p className="modal-description">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="reset-email">
                    <i className="fas fa-envelope"></i>
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    autoComplete="email"
                    className="input-modern"
                  />
                </div>

                {message.text && (
                  <div className={`message-alert ${message.type}`}>
                    <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                    <span>{message.text}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn-reset-password"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      <span>Send Reset Instructions</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="modal-icon success">
                <i className="fas fa-check-circle"></i>
              </div>
              
              <h2>Check Your Email</h2>
              <p className="modal-description">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              
              <div className="success-actions">
                <button className="btn-back-to-login" onClick={handleClose}>
                  <i className="fas fa-arrow-left"></i>
                  <span>Back to Login</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
