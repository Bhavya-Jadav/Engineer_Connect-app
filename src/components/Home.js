// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/feed');
    } else {
      navigate('/signup');
    }
  };

  const handlePostProblems = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {  
      navigate('/signup');
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span>🚀 Connecting Innovation</span>
          </div>
          <h1 className="hero-title">
            Bridge Engineering Talent with Industry Challenges
          </h1>
          <p className="hero-description">
            EngineerConnect is the premier platform where engineering students showcase their problem-solving skills 
            and companies discover the next generation of innovative talent. Join thousands of engineers solving 
            real-world challenges.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-btn" onClick={handleGetStarted}>
              <i className="fas fa-rocket"></i>
              Explore Challenges
            </button>
            <button className="btn btn-outline hero-btn" onClick={handlePostProblems}>
              <i className="fas fa-plus-circle"></i>
              Post Problems
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Engineering Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Industry Partners</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2K+</div>
              <div className="stat-label">Problems Solved</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>Why Choose EngineerConnect?</h2>
          <p>Empowering the future of engineering through collaboration</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-brain"></i>
            </div>
            <h3>Real Industry Problems</h3>
            <p>Work on authentic challenges posted by leading companies across various engineering domains</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-users"></i>
            </div>
            <h3>Talent Discovery</h3>
            <p>Companies discover and recruit top engineering talent based on proven problem-solving abilities</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <h3>Skill Recognition</h3>
            <p>Earn recognition for your technical skills through our comprehensive scoring and ranking system</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-network-wired"></i>
            </div>
            <h3>Professional Network</h3>
            <p>Build connections with industry professionals and fellow engineers in your field</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="how-it-works-header">
          <h2>How EngineerConnect Works</h2>
          <p>A seamless process connecting talent with opportunity</p>
        </div>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Sign Up & Create Profile</h3>
              <p>Create your professional profile highlighting your engineering expertise and interests</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Explore Real Challenges</h3>
              <p>Browse industry problems posted by leading companies in your field of expertise</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>Submit Solutions</h3>
              <p>Apply your engineering skills to solve problems and showcase your innovative thinking</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">04</div>
            <div className="step-content">
              <h3>Get Recognized</h3>
              <p>Receive feedback from industry experts and build your professional reputation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-header">
          <h2>Trusted by Industry Leaders</h2>
          <p>What our partners and users say about EngineerConnect</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"EngineerConnect has revolutionized how we identify and recruit top engineering talent. The quality of solutions we receive is exceptional."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>CTO, TechCorp Industries</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"This platform provided me with real-world experience and helped me land my dream job. The problems are challenging and industry-relevant."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Michael Chen</h4>
                <p>Software Engineer, Google</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"We've found incredibly talented engineers through EngineerConnect. It's become our go-to platform for technical hiring."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Dr. Emily Rodriguez</h4>
                <p>Head of R&D, Innovation Labs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Shape the Future of Engineering?</h2>
          <p>Join our community of innovators and problem-solvers today</p>
          <div className="cta-actions">
            <button className="btn btn-primary cta-btn" onClick={handleGetStarted}>
              Start Your Journey
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;