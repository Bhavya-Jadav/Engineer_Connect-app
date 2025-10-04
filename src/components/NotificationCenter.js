// src/components/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import './NotificationCenter.css';

const NotificationCenter = ({ 
  isOpen, 
  onClose, 
  currentUser,
  onConnectionUpdate 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'connections'

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const unreadOnly = filter === 'unread' ? 'true' : 'false';
      
      const response = await fetch(
        `${API_BASE_URL}/notifications?unreadOnly=${unreadOnly}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        let filteredNotifications = data.notifications;

        if (filter === 'connections') {
          filteredNotifications = data.notifications.filter(
            notif => notif.type.includes('connection')
          );
        }

        setNotifications(filteredNotifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId })
      });

      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markAllAsRead: true })
      });

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleConnectionAction = async (connectionId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/connections`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connectionId, action })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create notification for the requester
        const notificationType = action === 'accepted' 
          ? 'connection_accepted' 
          : 'connection_rejected';
        
        const notificationMessage = action === 'accepted'
          ? `${currentUser.name || currentUser.username} accepted your connection request`
          : `${currentUser.name || currentUser.username} declined your connection request`;

        await fetch(`${API_BASE_URL}/notifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientId: data.connection.requester._id,
            type: notificationType,
            title: action === 'accepted' ? 'Connection Accepted' : 'Connection Declined',
            message: notificationMessage,
            data: { connectionId }
          })
        });

        if (onConnectionUpdate) {
          onConnectionUpdate(action, data.connection);
        }

        // Refresh notifications
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error handling connection action:', error);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  const renderNotificationActions = (notification) => {
    if (notification.type === 'connection_request') {
      return (
        <div className="notification-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleConnectionAction(notification.data.connectionId, 'accepted')}
          >
            <i className="fas fa-check"></i>
            Accept
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => handleConnectionAction(notification.data.connectionId, 'rejected')}
          >
            <i className="fas fa-times"></i>
            Decline
          </button>
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="notification-center-overlay" onClick={onClose}>
      <div className="notification-center" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <h3>
            <i className="fas fa-bell"></i>
            Notifications
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="notification-controls">
          <div className="notification-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`filter-btn ${filter === 'connections' ? 'active' : ''}`}
              onClick={() => setFilter('connections')}
            >
              Connections
            </button>
          </div>
          
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-bell-slash"></i>
              <h4>No notifications</h4>
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className="notification-avatar">
                  {notification.sender?.profilePicture ? (
                    <img 
                      src={notification.sender.profilePicture} 
                      alt={notification.sender.name || notification.sender.username} 
                    />
                  ) : (
                    <div className="default-avatar">
                      {(notification.sender?.name || notification.sender?.username)?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="notification-content">
                  <div className="notification-header-content">
                    <h5>{notification.title}</h5>
                    <span className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </span>
                  </div>
                  
                  <p className="notification-message">
                    {notification.message}
                  </p>

                  {renderNotificationActions(notification)}
                </div>

                {!notification.read && (
                  <div className="unread-indicator"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
