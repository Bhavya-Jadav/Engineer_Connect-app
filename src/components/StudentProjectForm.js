import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/api';
import '../styles/StudentProjectForm.css';

const StudentProjectForm = ({ onProjectCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [],
    learningTags: [],
    videoUrl: '',
    githubLink: '',
    liveDemo: '',
    category: 'Web Development',
    difficulty: 'Beginner',
    duration: '',
    teamSize: 1,
    collaborators: [],
    status: 'Completed',
    visibility: 'Public'
  });

  const [files, setFiles] = useState({
    videoFile: null,
    attachments: []
  });

  const [newTechnology, setNewTechnology] = useState('');
  const [newLearningTag, setNewLearningTag] = useState('');
  const [newCollaborator, setNewCollaborator] = useState({ name: '', role: '', contact: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = [
    'Web Development', 'Mobile App', 'Data Science', 'Machine Learning', 
    'AI', 'IoT', 'Game Development', 'Desktop Application', 
    'API/Backend', 'DevOps', 'Cybersecurity', 'Other'
  ];

  const commonTechnologies = [
    'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular', 
    'Vue.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'MongoDB', 
    'MySQL', 'PostgreSQL', 'Firebase', 'AWS', 'Docker', 'Kubernetes', 
    'Git', 'HTML', 'CSS', 'TypeScript', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    'Flutter', 'React Native', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'
  ];

  const commonLearningTags = [
    'Frontend Development', 'Backend Development', 'Full Stack', 'Database Design',
    'API Development', 'Authentication', 'State Management', 'Responsive Design',
    'Testing', 'Deployment', 'Version Control', 'Algorithms', 'Data Structures',
    'Machine Learning', 'Data Analysis', 'Cloud Computing', 'DevOps', 'Security',
    'Performance Optimization', 'UI/UX Design', 'Mobile Development', 'Web APIs'
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === 'videoFile') {
      setFiles(prev => ({
        ...prev,
        videoFile: selectedFiles[0] || null
      }));
    } else if (name === 'attachments') {
      setFiles(prev => ({
        ...prev,
        attachments: Array.from(selectedFiles)
      }));
    }
  };

  const addTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTechnology.trim()]
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const addLearningTag = () => {
    if (newLearningTag.trim() && !formData.learningTags.includes(newLearningTag.trim())) {
      setFormData(prev => ({
        ...prev,
        learningTags: [...prev.learningTags, newLearningTag.trim()]
      }));
      setNewLearningTag('');
    }
  };

  const removeLearningTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      learningTags: prev.learningTags.filter(t => t !== tag)
    }));
  };

  const addCollaborator = () => {
    if (newCollaborator.name.trim() && newCollaborator.role.trim()) {
      setFormData(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, { ...newCollaborator }]
      }));
      setNewCollaborator({ name: '', role: '', contact: '' });
    }
  };

  const removeCollaborator = (index) => {
    setFormData(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key === 'technologies' || key === 'learningTags' || key === 'collaborators') {
          submitFormData.append(key, JSON.stringify(formData[key]));
        } else {
          submitFormData.append(key, formData[key]);
        }
      });

      // Add video file
      if (files.videoFile) {
        submitFormData.append('videoFile', files.videoFile);
      }

      // Add attachments
      files.attachments.forEach((file) => {
        submitFormData.append('attachments', file);
      });

      const response = await fetch(`${API_BASE_URL}/student-projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitFormData
      });

      if (response.ok) {
        const newProject = await response.json();
        showMessage('success', 'Project created successfully!');
        onProjectCreated(newProject);
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Create project error:', error);
      showMessage('error', 'Network error. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="student-project-form-overlay">
      <div className="student-project-form-container">
        <div className="form-header">
          <h2>
            <i className="fas fa-project-diagram"></i>
            Share Your Project
          </h2>
          <button className="close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {message.text && (
          <div className={`message-toast ${message.type}`}>
            <div className="message-content">
              <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="project-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              Basic Information
            </h3>
            
            <div className="form-group">
              <label>Project Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your project title..."
                required
                maxLength="200"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your project, what it does, and what you learned..."
                required
                rows="5"
                maxLength="2000"
              />
              <small>{formData.description.length}/2000 characters</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>

              <div className="form-group">
                <label>Team Size</label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="form-group">
                <label>Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                >
                  <option value="Public">Public</option>
                  <option value="Friends Only">Friends Only</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="form-section">
            <h3>
              <i className="fas fa-code"></i>
              Technologies Used
            </h3>
            
            <div className="form-group">
              <label>Add Technology</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="Enter technology..."
                  list="tech-suggestions"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                />
                <datalist id="tech-suggestions">
                  {commonTechnologies.map(tech => (
                    <option key={tech} value={tech} />
                  ))}
                </datalist>
                <button type="button" onClick={addTechnology} className="add-btn">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="tags-display">
              {formData.technologies.map((tech, index) => (
                <span key={index} className="tag">
                  {tech}
                  <button type="button" onClick={() => removeTechnology(tech)}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Learning Tags */}
          <div className="form-section">
            <h3>
              <i className="fas fa-lightbulb"></i>
              Learning Tags
            </h3>
            
            <div className="form-group">
              <label>Add Learning Tag</label>
              <div className="tag-input-container">
                <input
                  type="text"
                  value={newLearningTag}
                  onChange={(e) => setNewLearningTag(e.target.value)}
                  placeholder="What did you learn?"
                  list="learning-suggestions"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLearningTag())}
                />
                <datalist id="learning-suggestions">
                  {commonLearningTags.map(tag => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
                <button type="button" onClick={addLearningTag} className="add-btn">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            <div className="tags-display">
              {formData.learningTags.map((tag, index) => (
                <span key={index} className="tag learning-tag">
                  {tag}
                  <button type="button" onClick={() => removeLearningTag(tag)}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Media & Files */}
          <div className="form-section">
            <h3>
              <i className="fas fa-file-upload"></i>
              Media & Files
            </h3>

            <div className="form-group">
              <label>Video (Optional)</label>
              <div className="media-options">
                <div className="media-option">
                  <label>
                    <input
                      type="radio"
                      name="videoType"
                      value="url"
                      defaultChecked
                    />
                    Video URL
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    placeholder="YouTube, Vimeo, or other video URL..."
                  />
                </div>
                <div className="media-option">
                  <label>
                    <input
                      type="radio"
                      name="videoType"
                      value="file"
                    />
                    Upload Video File
                  </label>
                  <input
                    type="file"
                    name="videoFile"
                    onChange={handleFileChange}
                    accept="video/*"
                    className="file-input"
                  />
                  <small>Max file size: 100MB</small>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Project Files (Optional)</label>
              <input
                type="file"
                name="attachments"
                onChange={handleFileChange}
                multiple
                className="file-input"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z,.js,.html,.css,.json,.txt,.png,.jpg,.jpeg,.gif"
              />
              <small>
                Accepted: Images, Documents, Code files, Archives (Max 10 files, 100MB total)
              </small>
              {files.attachments.length > 0 && (
                <div className="selected-files">
                  <h4>Selected Files:</h4>
                  {files.attachments.map((file, index) => (
                    <div key={index} className="file-item">
                      <i className="fas fa-file"></i>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="form-section">
            <h3>
              <i className="fas fa-link"></i>
              Project Links
            </h3>

            <div className="form-group">
              <label>GitHub Repository</label>
              <input
                type="url"
                name="githubLink"
                value={formData.githubLink}
                onChange={handleInputChange}
                placeholder="https://github.com/username/project..."
              />
            </div>

            <div className="form-group">
              <label>Live Demo</label>
              <input
                type="url"
                name="liveDemo"
                value={formData.liveDemo}
                onChange={handleInputChange}
                placeholder="https://yourproject.com..."
              />
            </div>
          </div>

          {/* Collaborators */}
          <div className="form-section">
            <h3>
              <i className="fas fa-users"></i>
              Collaborators (Optional)
            </h3>

            <div className="collaborator-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    value={newCollaborator.name}
                    onChange={(e) => setNewCollaborator({...newCollaborator, name: e.target.value})}
                    placeholder="Collaborator name..."
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={newCollaborator.role}
                    onChange={(e) => setNewCollaborator({...newCollaborator, role: e.target.value})}
                    placeholder="Role (e.g., Frontend Developer)..."
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    value={newCollaborator.contact}
                    onChange={(e) => setNewCollaborator({...newCollaborator, contact: e.target.value})}
                    placeholder="Contact (optional)..."
                  />
                </div>
                <button type="button" onClick={addCollaborator} className="add-btn">
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>

            {formData.collaborators.length > 0 && (
              <div className="collaborators-list">
                {formData.collaborators.map((collab, index) => (
                  <div key={index} className="collaborator-item">
                    <div className="collab-info">
                      <strong>{collab.name}</strong> - {collab.role}
                      {collab.contact && <small>{collab.contact}</small>}
                    </div>
                    <button type="button" onClick={() => removeCollaborator(index)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Project...
                </>
              ) : (
                <>
                  <i className="fas fa-rocket"></i>
                  Share Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProjectForm;
