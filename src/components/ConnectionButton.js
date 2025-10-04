// src/components/ConnectionButton.js
import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/api';
import './ConnectionButton.css';

const ConnectionButton = ({ 
  targetUser, 
  currentUser, 
  onConnectionUpdate,
  size = 'medium' 
}) => {
  const [connectionStatus, setConnectionStatus] = useState(null); // 'pending', 'accepted', 'sent'
  const [loading, setLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  // Don't show connection button for same user
  if (!targetUser || !currentUser || targetUser._id === currentUser._id) {
    return null;
  }

  const handleSendConnectionRequest = async () => {
    if (connectionMessage.trim().length === 0) {
      setShowMessageModal(true);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/connections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: targetUser._id,
          message: connectionMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('sent');
        setShowMessageModal(false);
        setConnectionMessage('');
        
        // Create notification
        await fetch(`${API_BASE_URL}/notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientId: targetUser._id,
            type: 'connection_request',
            title: 'New Connection Request',
            message: `${currentUser.name || currentUser.username} wants to connect with you`,
            data: { connectionId: data.connection._id }
          })
        });

        if (onConnectionUpdate) {
          onConnectionUpdate('sent', data.connection);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Error sending connection request');
    } finally {
      setLoading(false);
    }
  };

  const buttonClass = `connection-btn ${size} ${connectionStatus || ''}`;

  if (connectionStatus === 'sent') {
    return (
      <button className={`${buttonClass} sent`} disabled>
        <i className="fas fa-clock"></i>
        Request Sent
      </button>
    );
  }

  if (connectionStatus === 'accepted') {
    return (
      <button className={`${buttonClass} connected`} disabled>
        <i className="fas fa-check"></i>
        Connected
      </button>
    );
  }

  return (
    <>
      <button 
        className={buttonClass}
        onClick={() => setShowMessageModal(true)}
        disabled={loading}
      >
        <i className="fas fa-user-plus"></i>
        {loading ? 'Sending...' : 'Connect'}
      </button>

      {/* Connection Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay">
          <div className="modal connection-modal">
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-plus"></i>
                Connect with {targetUser.name || targetUser.username}
              </h3>
              <button 
                className="close-btn" 
                onClick={() => setShowMessageModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="user-info">
                <div className="user-avatar">
                  {targetUser.profilePicture ? (
                    <img 
                      src={targetUser.profilePicture} 
                      alt={targetUser.name || targetUser.username} 
                    />
                  ) : (
                    <div className="default-avatar">
                      {(targetUser.name || targetUser.username)?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <h4>{targetUser.name || targetUser.username}</h4>
                  {targetUser.university && (
                    <p><i className="fas fa-university"></i> {targetUser.university}</p>
                  )}
                  {targetUser.course && (
                    <p><i className="fas fa-graduation-cap"></i> {targetUser.course}</p>
                  )}
                </div>
              </div>
              
              <div className="message-section">
                <label htmlFor="connectionMessage">
                  Add a personal message (optional)
                </label>
                <textarea
                  id="connectionMessage"
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  placeholder={`Hi ${targetUser.name || targetUser.username}, I'd like to connect with you!`}
                  maxLength={300}
                  rows={4}
                />
                <small>{connectionMessage.length}/300 characters</small>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSendConnectionRequest}
                  disabled={loading}
                >
                  <i className="fas fa-paper-plane"></i>
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectionButton;
