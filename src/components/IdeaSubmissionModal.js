// src/components/IdeaSubmissionModal.js
import React, { useState } from 'react';
import '../styles/IdeaSubmissionModal.css';

const IdeaSubmissionModal = ({ onClose, onSubmit, ideaSubmission, setIdeaSubmission }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIdeaSubmission({ ...ideaSubmission, [name]: value });
  };

  return (
    <div className="idea-modal-overlay" onClick={onClose}>
      <div className="idea-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="idea-modal-content">
          <div className="idea-modal-header">
            <h3 className="idea-modal-title">
              <i className="fas fa-lightbulb"></i> 
              Submit Your Idea
            </h3>
            <button className="idea-modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
                    
          <form onSubmit={onSubmit} className="idea-submission-form">
            <div className="idea-form-group">
              <label htmlFor="ideaText" className="idea-form-label">
                Your Solution Idea
              </label>
              <textarea
                id="ideaText"
                name="ideaText"
                placeholder="Describe your innovative solution..."
                value={ideaSubmission.ideaText}
                onChange={handleInputChange}
                required
                rows={5}
                className="idea-form-textarea"
              ></textarea>
            </div>

            <div className="idea-form-group">
              <label htmlFor="implementationApproach" className="idea-form-label">
                Implementation Approach
              </label>
              <textarea
                id="implementationApproach"
                name="implementationApproach"
                placeholder="How would you implement this solution?"
                value={ideaSubmission.implementationApproach}
                onChange={handleInputChange}
                rows={5}
                className="idea-form-textarea"
              ></textarea>
            </div>

            <button type="submit" className="idea-submit-btn">
              <i className="fas fa-paper-plane"></i> 
              Submit Idea
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdeaSubmissionModal;