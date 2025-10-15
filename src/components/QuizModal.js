// src/components/QuizModal.js
// This component provides the quiz interface for students

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const QuizModal = ({ quiz, problem, onClose, onSubmit }) => {
  console.log('🎯 QuizModal RENDERING with:', { quiz, problem, onClose, onSubmit });
  
  // Safely initialize state with proper defaults
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(() => {
    const timeLimit = quiz?.timeLimit || 30;
    return timeLimit * 60; // Convert minutes to seconds
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [hasExistingResponse, setHasExistingResponse] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check for existing quiz response on component mount
  useEffect(() => {
    const checkExistingResponse = async () => {
      console.log('🔍 Checking for existing quiz response for problem:', problem?._id);
      try {
        const response = await fetch(`${API_BASE_URL}/quiz/response/${problem._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const existingResponse = await response.json();
          console.log('✅ Found existing quiz response:', existingResponse);
          setHasExistingResponse(true);
          setQuizResults(existingResponse);
          setShowResults(true);
        } else if (response.status === 404) {
          // No existing response, user can take the quiz
          console.log('📝 No existing response - user can take quiz');
          setHasExistingResponse(false);
        }
      } catch (error) {
        console.error('❌ Error checking existing quiz response:', error);
      } finally {
        console.log('✅ Setting checkingExisting to false');
        setCheckingExisting(false);
      }
    };

    if (problem?._id) {
      checkExistingResponse();
    } else {
      // If no problem ID, skip checking and allow quiz to render
      console.log('⚠️ No problem ID provided, skipping existing response check');
      setCheckingExisting(false);
    }
  }, [problem?._id]);

  const handleRetakeQuiz = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quiz/response/${problem._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setHasExistingResponse(false);
        setShowResults(false);
        setQuizResults(null);
        setCurrentQuestion(0);
        setAnswers([]);
        setTimeLeft((quiz?.timeLimit || 30) * 60);
      } else {
        const error = await response.json();
        alert(`Failed to clear previous attempt: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting quiz response:', error);
      alert('Failed to clear previous attempt. Please try again.');
    }
    setIsSubmitting(false);
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      // Auto-submit when time runs out - use a separate useEffect for this
      setShowResults(true);
    }
  }, [timeLeft, showResults]);

  // Handle auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !showResults) {
      const autoSubmit = async () => {
        // Auto-submit quiz logic will be handled in the main component
        setShowResults(true);
      };
      autoSubmit();
    }
  }, [timeLeft, showResults]);

  // Header component for the quiz modal
  const QuizHeader = ({ title, showTimer = false }) => (
    <div className="quiz-modal-header">
      <div className="quiz-header-left">
        <button className="quiz-back-btn" onClick={onClose}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="quiz-logo">
          <i className="fas fa-code-branch"></i>
          <span>SKILLINK</span>
        </div>
      </div>
      <div className="quiz-header-center">
        <h3>{title}</h3>
      </div>
      <div className="quiz-header-right">
        {showTimer && (
          <div className="quiz-timer">
            <i className="fas fa-clock"></i>
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Early return if quiz data is invalid - AFTER all hooks
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="modal active">
        <div className="modal-content quiz-not-available">
          <QuizHeader title="Quiz Not Required" />
          <div className="quiz-not-available-content">
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-lightbulb"></i>
              </div>
              <div className="info-text">
                <h4>Ready to Share Your Innovation?</h4>
                <p>This problem doesn't require a quiz completion. You can proceed directly to submit your creative solution and implementation approach.</p>
              </div>
            </div>
            <div className="action-buttons">
              <button className="btn btn-primary submit-idea-btn" onClick={onSubmit}>
                <i className="fas fa-lightbulb"></i>
                <span>Submit My Idea</span>
              </button>
              <button className="btn btn-secondary" onClick={onClose}>
                <i className="fas fa-times"></i>
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer) => {
    const newAnswers = [...answers];
    const existingAnswerIndex = newAnswers.findIndex(a => a.questionIndex === currentQuestion);
    
    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex] = { questionIndex: currentQuestion, answer };
    } else {
      newAnswers.push({ questionIndex: currentQuestion, answer });
    }
    
    setAnswers(newAnswers);
  };

  const getCurrentAnswer = () => {
    const answer = answers.find(a => a.questionIndex === currentQuestion);
    return answer ? answer.answer : '';
  };

  const goToNext = () => {
    if (currentQuestion < (quiz.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const timeSpent = (quiz.timeLimit * 60) - timeLeft;
      
      const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          problemId: problem._id,
          answers,
          timeSpent
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Quiz submitted successfully!', result);
        console.log('📊 Quiz results:', result.result);
        console.log('🎯 Passed?', result.result.passed);
        console.log('📈 Percentage:', result.result.percentage);
        setQuizResults(result.result);
        setShowResults(true);
      } else {
        const error = await response.json();
        alert(`Quiz submission failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      alert('Failed to submit quiz. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleContinueToIdeaSubmission = () => {
    console.log('🎯 Submit My Idea clicked!');
    console.log('📊 Quiz results:', quizResults);
    console.log('✅ Passed?', quizResults?.passed);
    
    // Only call onSubmit if passed - it will handle closing quiz and opening idea modal
    if (quizResults && quizResults.passed) {
      console.log('🚀 Calling onSubmit to open idea submission modal...');
      onSubmit();
    } else {
      console.log('❌ Quiz not passed, closing modal');
      onClose();
    }
  };

  if (showResults) {
    return (
      <div className="modal active">
        <div className="modal-content quiz-results">
          <QuizHeader title={`Quiz Results - ${quizResults?.passed ? 'Passed' : 'Failed'}`} />
          
          <div className="quiz-results-content">
            <div className={`score-display ${quizResults?.passed ? 'passed' : 'failed'}`}>
              <div className="score-icon">
                <i className={`fas ${quizResults?.passed ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              </div>
              <h2>{quizResults?.percentage}%</h2>
              <p>{quizResults?.totalScore} out of {quizResults?.maxScore} points</p>
            </div>
            
            <div className="results-details">
              <div className="detail-item">
                <i className="fas fa-clock"></i>
                <span><strong>Time Spent:</strong> {Math.floor((quizResults?.timeSpent || 0) / 60)}:{((quizResults?.timeSpent || 0) % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="detail-item">
                <i className={`fas ${quizResults?.passed ? 'fa-check' : 'fa-times'}`}></i>
                <span><strong>Status:</strong> {quizResults?.passed ? 'Passed ✅' : 'Failed ❌'}</span>
              </div>
              <div className="detail-item">
                <i className="fas fa-target"></i>
                <span><strong>Passing Score:</strong> {quiz.passingScore}%</span>
              </div>
            </div>

            {quizResults?.passed ? (
              <div className="success-message">
                <div className="message-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <h4>🎉 Congratulations!</h4>
                <p>You passed the quiz and can now submit your innovative idea for this problem.</p>
              </div>
            ) : (
              <div className="failure-message">
                <div className="message-icon">
                  <i className="fas fa-book"></i>
                </div>
                <h4>Keep Learning!</h4>
                <p>You didn't meet the passing score this time. Review the problem description and try again when you're ready.</p>
              </div>
            )}
          </div>

          <div className="modal-actions" style={{
            display: 'flex',
            gap: '1rem',
            padding: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {quizResults?.passed && (
              <button 
                className="btn btn-primary"
                onClick={handleContinueToIdeaSubmission}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold'
                }}
              >
                <i className="fas fa-lightbulb"></i> Submit My Idea
              </button>
            )}
            {hasExistingResponse && (
              <button 
                className="btn btn-warning"
                onClick={handleRetakeQuiz}
                disabled={isSubmitting}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  backgroundColor: '#ffc107',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <i className="fas fa-redo"></i> 
                {isSubmitting ? 'Clearing...' : 'Retake Quiz'}
              </button>
            )}
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{
                padding: '1rem 2rem',
                fontSize: '1rem',
                cursor: 'pointer',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className="fas fa-home"></i> Back to Problems
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking for existing response
  if (checkingExisting) {
    return (
      <div className="modal active">
        <div className="modal-content quiz-modal">
          <QuizHeader title="Loading Quiz..." />
          <div className="loading-state">
            <div className="loading-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p>Checking quiz status...</p>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions?.[currentQuestion] || {};
  const progress = ((currentQuestion + 1) / (quiz.questions?.length || 1)) * 100;

  return (
    <>
      {/* Mobile-responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .quiz-modal {
            width: 95% !important;
            max-height: 95vh !important;
          }
          .quiz-navigation {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto auto !important;
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .nav-center {
            order: -1 !important;
          }
          .quiz-content {
            padding: 1.5rem 1rem !important;
          }
          .question-text {
            font-size: 1.1rem !important;
          }
          .option-item {
            padding: 1rem !important;
          }
        }
        @media (max-width: 480px) {
          .quiz-progress {
            padding: 1rem !important;
          }
          .quiz-modal-header h3 {
            font-size: 1rem !important;
          }
          .quiz-content {
            padding: 1.25rem 0.75rem !important;
            max-height: 45vh !important;
          }
        }
      `}</style>
      
      <div className="modal active" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="modal-content quiz-modal" style={{
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          backgroundColor: '#1a1a2e',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        <QuizHeader 
          title={quiz.title || 'Knowledge Assessment'} 
          showTimer={true} 
        />
        
        {/* Progress Section */}
        <div className="quiz-progress" style={{
          padding: '1.5rem 2rem',
          background: 'linear-gradient(135deg, rgba(0, 123, 255, 0.1), rgba(138, 43, 226, 0.1))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div className="progress-bar" style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '0.75rem'
          }}>
            <div className="progress-fill" style={{ 
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #007bff, #8a2be2)',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          <span className="progress-text" style={{
            fontSize: '0.9rem',
            color: '#adb5bd',
            fontWeight: '500'
          }}>
            Question {currentQuestion + 1} of {quiz.questions?.length || 0}
          </span>
        </div>

        {/* Question Content */}
        <div className="quiz-content" style={{
          padding: '2.5rem 2rem',
          minHeight: '300px',
          maxHeight: '50vh',
          overflowY: 'auto'
        }}>
          <div className="question-section">
            <h4 className="question-text" style={{
              fontSize: '1.4rem',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '2rem',
              lineHeight: '1.6',
              textAlign: 'left'
            }}>
              {question.question}
            </h4>
            
            {question.type === 'multiple-choice' && (
              <div className="options-list" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {question.options?.map((option, index) => (
                  <label key={index} className="option-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    backgroundColor: getCurrentAnswer() === option.text 
                      ? 'rgba(0, 123, 255, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: getCurrentAnswer() === option.text 
                      ? '2px solid #007bff' 
                      : '2px solid transparent',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (getCurrentAnswer() !== option.text) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (getCurrentAnswer() !== option.text) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option.text}
                      checked={getCurrentAnswer() === option.text}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      style={{
                        marginRight: '1rem',
                        width: '20px',
                        height: '20px',
                        accentColor: '#007bff',
                        cursor: 'pointer'
                      }}
                    />
                    <span className="option-text" style={{
                      fontSize: '1rem',
                      color: '#ffffff',
                      fontWeight: '500',
                      flex: 1
                    }}>
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'boolean' && (
              <div className="options-list" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {['true', 'false'].map((value) => (
                  <label key={value} className="option-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    backgroundColor: getCurrentAnswer() === value 
                      ? 'rgba(0, 123, 255, 0.2)' 
                      : 'rgba(255, 255, 255, 0.05)',
                    border: getCurrentAnswer() === value 
                      ? '2px solid #007bff' 
                      : '2px solid transparent',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (getCurrentAnswer() !== value) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (getCurrentAnswer() !== value) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={value}
                      checked={getCurrentAnswer() === value}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      style={{
                        marginRight: '1rem',
                        width: '20px',
                        height: '20px',
                        accentColor: '#007bff',
                        cursor: 'pointer'
                      }}
                    />
                    <span className="option-text" style={{
                      fontSize: '1rem',
                      color: '#ffffff',
                      fontWeight: '500',
                      flex: 1,
                      textTransform: 'capitalize'
                    }}>
                      {value}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'text' && (
              <div className="text-answer">
                <textarea
                  placeholder="Enter your answer..."
                  value={getCurrentAnswer()}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  rows={4}
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
                />
              </div>
            )}
          </div>
        </div>

        <div className="quiz-navigation" style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          gap: '1rem',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          {/* Previous Button */}
          <button 
            className="btn btn-secondary"
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
            style={{
              padding: '0.75rem 1.25rem',
              fontSize: '1.1rem',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQuestion === 0 ? 0.3 : 1,
              backgroundColor: currentQuestion === 0 ? '#333' : 'rgba(108, 117, 125, 0.8)',
              color: '#adb5bd',
              border: 'none',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: currentQuestion === 0 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.3)',
              minWidth: '60px'
            }}
            onMouseEnter={(e) => {
              if (currentQuestion !== 0) {
                e.currentTarget.style.backgroundColor = 'rgba(90, 98, 104, 0.9)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (currentQuestion !== 0) {
                e.currentTarget.style.backgroundColor = 'rgba(108, 117, 125, 0.8)';
                e.currentTarget.style.color = '#adb5bd';
              }
            }}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          
          {/* Points Badge */}
          <div className="nav-center" style={{
            textAlign: 'center',
            fontSize: '0.95rem',
            color: '#ffd700',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.15))',
            borderRadius: '12px',
            border: '1.5px solid rgba(255, 215, 0, 0.4)',
            boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)'
          }}>
            <i className="fas fa-star" style={{ fontSize: '1rem', color: '#ffd700' }}></i>
            <span style={{ letterSpacing: '0.3px' }}>{question.points}</span>
          </div>
          
          {/* Next/Submit Button */}
          {currentQuestion < (quiz.questions?.length || 0) - 1 ? (
            <button 
              className="btn btn-primary"
              onClick={goToNext}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #007bff, #0056b3)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '700',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)',
                minWidth: '100px',
                justifyContent: 'center'
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
              }}
            >
              Next <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button 
              className="btn btn-success"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                background: isSubmitting 
                  ? '#6c757d' 
                  : 'linear-gradient(135deg, #28a745, #1e7e34)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '700',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                boxShadow: isSubmitting 
                  ? 'none' 
                  : '0 4px 12px rgba(40, 167, 69, 0.4)',
                minWidth: '140px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1e7e34, #155724)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #28a745, #1e7e34)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Submit Quiz
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default QuizModal;