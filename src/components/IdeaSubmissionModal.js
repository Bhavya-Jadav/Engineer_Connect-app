// src/components/IdeaSubmissionModal.js
import React, { useState } from 'react';

const IdeaSubmissionModal = ({ onClose, onSubmit, ideaSubmission, setIdeaSubmission }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIdeaSubmission({ ...ideaSubmission, [name]: value });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="modal active">
        <div className="modal-content" style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#ffffff'
        }}>
          <div className="modal-header" style={{
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#ffffff' }}>
              <i className="fas fa-lightbulb" style={{ color: '#ffd700', marginRight: '0.5rem' }}></i> 
              Submit Your Idea
            </h3>
            <button className="close-btn" onClick={onClose} style={{
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              color: '#adb5bd',
              cursor: 'pointer',
              padding: '0',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#adb5bd';
            }}>×</button>
          </div>
                    <form onSubmit={onSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="ideaText" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '1rem'
              }}>Your Solution Idea</label>
              <textarea
                id="ideaText"
                name="ideaText"
                placeholder="Describe your innovative solution..."
                value={ideaSubmission.ideaText}
                onChange={handleInputChange}
                required
                rows={5}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '120px',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              ></textarea>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="implementationApproach" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '1rem'
              }}>Implementation Approach</label>
              <textarea
                id="implementationApproach"
                name="implementationApproach"
                placeholder="How would you implement this solution?"
                value={ideaSubmission.implementationApproach}
                onChange={handleInputChange}
                rows={5}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  minHeight: '120px',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              ></textarea>
            </div>
          <button type="submit" className="btn btn-primary" style={{ 
            width: '100%',
            padding: '1rem',
            fontSize: '1.1rem',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: '700',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #0056b3, #004085)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 123, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.4)';
          }}>
            <i className="fas fa-paper-plane"></i> Submit Idea
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default IdeaSubmissionModal;