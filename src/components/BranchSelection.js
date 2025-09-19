// src/components/BranchSelection.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BranchSelection = ({ onSelectBranch }) => {
  const navigate = useNavigate();

  const handleBranchSelect = (branch) => {
    onSelectBranch(branch); // This will now correctly trigger navigation in App.js
    // Navigation is handled by App.js based on state change
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Choose Your Engineering Branch
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Select your area of expertise to see relevant industry problems
        </p>
      </div>
      <div className="branch-grid">
        <div className="branch-card" onClick={() => handleBranchSelect('computer')}>
          <i className="fas fa-laptop-code"></i>
          <h4>💻 Computer Science</h4>
          <p>AI, Software Development, Cybersecurity, Data Science</p>
        </div>
        <div className="branch-card" onClick={() => handleBranchSelect('mechanical')}>
          <i className="fas fa-cogs"></i>
          <h4>⚙️ Mechanical Engineering</h4>
          <p>Design, Manufacturing, Robotics, Automotive</p>
        </div>
        <div className="branch-card" onClick={() => handleBranchSelect('electrical')}>
          <i className="fas fa-bolt"></i>
          <h4>⚡ Electrical Engineering</h4>
          <p>Electronics, Power Systems, IoT, Renewable Energy</p>
        </div>
        <div className="branch-card" onClick={() => handleBranchSelect('civil')}>
          <i className="fas fa-city"></i>
          <h4>🏗️ Civil Engineering</h4>
          <p>Construction, Infrastructure, Urban Planning, Smart Cities</p>
        </div>
        <div className="branch-card" onClick={() => handleBranchSelect('chemical')}>
          <i className="fas fa-flask"></i>
          <h4>🧪 Chemical Engineering</h4>
          <p>Process Engineering, Materials, Environmental, Biotech</p>
        </div>
        <div className="branch-card" onClick={() => handleBranchSelect('aerospace')}>
          <i className="fas fa-rocket"></i>
          <h4>🚀 Aerospace Engineering</h4>
          <p>Aircraft Design, Space Technology, Propulsion, Avionics</p>
        </div>
      </div>
    </div>
  );
};

export default BranchSelection;