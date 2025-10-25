// src/components/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home-BW-Theme.css";

const Home = ({ isLoggedIn, userRole }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      if (userRole === "student") {
        navigate("/student-dashboard");
      } else if (userRole === "company") {
        navigate("/company-dashboard");
      } else if (userRole === "admin") {
        navigate("/admin-dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  const handlePostProblems = () => {
    if (isLoggedIn && userRole === "company") {
      navigate("/post-problem");
    } else if (isLoggedIn && userRole !== "company") {
      alert("Only companies can post problems!");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-container bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Modern gradient background with improved layout */}
      <section className="hero-section relative overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="hero-content max-w-7xl mx-auto text-center lg:text-left lg:flex lg:items-center lg:justify-between">
          <div className="lg:max-w-3xl">
            <div className="hero-badge inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-medium text-sm mb-6 shadow-sm">
              <span className="mr-2">🚀</span>
              <span>Connecting Innovation</span>
            </div>
            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Bridge Engineering Talent with Industry Challenges
            </h1>
            <p className="hero-description text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              SKILLINK is the premier platform where engineering students showcase their problem-solving skills 
              and companies discover the next generation of innovative talent. Join thousands of engineers solving 
              real-world challenges.
            </p>
            <div className="hero-actions flex flex-col sm:flex-row justify-center lg:justify-start gap-4 mb-10">
              <button className="btn btn-primary hero-btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center" onClick={handleGetStarted}>
                <i className="fas fa-rocket mr-2"></i>
                Explore Challenges
              </button>
              <button className="btn btn-outline hero-btn border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out flex items-center justify-center" onClick={handlePostProblems}>
                <i className="fas fa-plus-circle mr-2"></i>
                Post Problems
              </button>
            </div>
          </div>
          <div className="hero-stats hidden lg:flex lg:flex-col gap-6 bg-white p-8 rounded-xl shadow-xl">
            <div className="stat-item flex items-center">
              <div className="stat-icon bg-blue-100 p-4 rounded-full mr-4">
                <i className="fas fa-user-graduate text-blue-600 text-xl"></i>
              </div>
              <div>
                <div className="stat-number text-3xl font-bold text-gray-900">10K+</div>
                <div className="stat-label text-gray-600">Engineering Students</div>
              </div>
            </div>
            <div className="stat-item flex items-center">
              <div className="stat-icon bg-indigo-100 p-4 rounded-full mr-4">
                <i className="fas fa-building text-indigo-600 text-xl"></i>
              </div>
              <div>
                <div className="stat-number text-3xl font-bold text-gray-900">500+</div>
                <div className="stat-label text-gray-600">Industry Partners</div>
              </div>
            </div>
            <div className="stat-item flex items-center">
              <div className="stat-icon bg-purple-100 p-4 rounded-full mr-4">
                <i className="fas fa-check-circle text-purple-600 text-xl"></i>
              </div>
              <div>
                <div className="stat-number text-3xl font-bold text-gray-900">2K+</div>
                <div className="stat-label text-gray-600">Problems Solved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Card-based layout with subtle shadows */}
      <section className="features-section py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="features-header text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose SKILLINK?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Empowering the future of engineering through collaboration</p>
          </div>
          <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="feature-icon inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                <i className="fas fa-brain text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real Industry Problems</h3>
              <p className="text-gray-600">Work on authentic challenges posted by leading companies across various engineering domains</p>
            </div>
            <div className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="feature-icon inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
                <i className="fas fa-users text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Talent Discovery</h3>
              <p className="text-gray-600">Companies discover and recruit top engineering talent based on proven problem-solving abilities</p>
            </div>
            <div className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="feature-icon inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-6">
                <i className="fas fa-trophy text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Skill Recognition</h3>
              <p className="text-gray-600">Earn recognition for your technical skills through our comprehensive scoring and ranking system</p>
            </div>
            <div className="feature-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="feature-icon inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-6">
                <i className="fas fa-network-wired text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Network</h3>
              <p className="text-gray-600">Build connections with industry professionals and fellow engineers in your field</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Modern timeline design */}
      <section className="how-it-works-section py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="how-it-works-header text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How SKILLINK Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">A seamless process connecting talent with opportunity</p>
          </div>
          <div className="steps-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="step-item relative">
              <div className="step-number absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">01</div>
              <div className="step-content bg-white p-8 pt-10 rounded-xl shadow-md h-full border-t-4 border-blue-600">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign Up & Create Profile</h3>
                <p className="text-gray-600">Create your professional profile highlighting your engineering expertise and interests</p>
              </div>
            </div>
            <div className="step-item relative">
              <div className="step-number absolute -top-4 -left-4 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">02</div>
              <div className="step-content bg-white p-8 pt-10 rounded-xl shadow-md h-full border-t-4 border-indigo-600">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Explore Real Challenges</h3>
                <p className="text-gray-600">Browse industry problems posted by leading companies in your field of expertise</p>
              </div>
            </div>
            <div className="step-item relative">
              <div className="step-number absolute -top-4 -left-4 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">03</div>
              <div className="step-content bg-white p-8 pt-10 rounded-xl shadow-md h-full border-t-4 border-purple-600">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Submit Solutions</h3>
                <p className="text-gray-600">Apply your engineering skills to solve problems and showcase your innovative thinking</p>
              </div>
            </div>
            <div className="step-item relative">
              <div className="step-number absolute -top-4 -left-4 w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">04</div>
              <div className="step-content bg-white p-8 pt-10 rounded-xl shadow-md h-full border-t-4 border-teal-600">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Recognized</h3>
                <p className="text-gray-600">Receive feedback from industry experts and build your professional reputation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Modern card design with quotes */}
      <section className="testimonials-section py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="testimonials-header text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">What our partners and users say about SKILLINK</p>
          </div>
          <div className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="testimonial-card bg-white rounded-xl p-8 shadow-lg border border-gray-100 relative">
              <div className="absolute -top-5 left-8 text-6xl text-blue-200">"</div>
              <div className="testimonial-content pt-6 relative z-10">
                <p className="text-gray-700 italic mb-6">SKILLINK has revolutionized how we identify and recruit top engineering talent. The quality of solutions we receive is exceptional.</p>
              </div>
              <div className="testimonial-author flex items-center">
                <div className="author-avatar w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">SJ</span>
                </div>
                <div className="author-info">
                  <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-gray-600 text-sm">CTO, TechCorp Industries</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card bg-white rounded-xl p-8 shadow-lg border border-gray-100 relative">
              <div className="absolute -top-5 left-8 text-6xl text-indigo-200">"</div>
              <div className="testimonial-content pt-6 relative z-10">
                <p className="text-gray-700 italic mb-6">This platform provided me with real-world experience and helped me land my dream job. The problems are challenging and industry-relevant.</p>
              </div>
              <div className="testimonial-author flex items-center">
                <div className="author-avatar w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                  <span className="text-indigo-600 font-bold">MC</span>
                </div>
                <div className="author-info">
                  <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-gray-600 text-sm">Software Engineer, Google</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card bg-white rounded-xl p-8 shadow-lg border border-gray-100 relative">
              <div className="absolute -top-5 left-8 text-6xl text-purple-200">"</div>
              <div className="testimonial-content pt-6 relative z-10">
                <p className="text-gray-700 italic mb-6">We've found incredibly talented engineers through SKILLINK. It's become our go-to platform for technical hiring.</p>
              </div>
              <div className="testimonial-author flex items-center">
                <div className="author-avatar w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-bold">ER</span>
                </div>
                <div className="author-info">
                  <h4 className="font-semibold text-gray-900">Dr. Emily Rodriguez</h4>
                  <p className="text-gray-600 text-sm">Head of R&D, Innovation Labs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient background with improved layout */}
      <section className="cta-section py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="cta-content max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Shape the Future of Engineering?</h2>
          <p className="text-xl mb-10 opacity-90">Join our community of innovators and problem-solvers today</p>
          <div className="cta-actions">
            <button className="btn btn-primary cta-btn bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105" onClick={handleGetStarted}>
              Start Your Journey
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;