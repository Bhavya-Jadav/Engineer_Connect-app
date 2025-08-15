// src/components/IdeaSubmissionModal.js
import React, { useState } from 'react';

const IdeaSubmissionModal = ({ onClose, onSubmit, ideaSubmission, setIdeaSubmission }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIdeaSubmission({ ...ideaSubmission, [name]: value });
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <div className="modal-header">
          <h3><i className="fas fa-lightbulb"></i> Submit Your Idea</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="ideaText">Your Solution Idea</label>
            <textarea
              id="ideaText"
              name="ideaText"
              placeholder="Describe your innovative solution..."
              value={ideaSubmission.ideaText}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="implementationApproach">Implementation Approach</label>
            <textarea
              id="implementationApproach"
              name="implementationApproach"
              placeholder="How would you implement this solution?"
              value={ideaSubmission.implementationApproach}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <i className="fas fa-paper-plane"></i> Submit Idea
          </button>
        </form>
      </div>
    </div>
  );
};

export default IdeaSubmissionModal;