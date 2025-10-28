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
    <div className="quiz-modal-header quiz-header-custom" style={{
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      borderBottom: '3px solid #ffffff',
      padding: '18px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    }}>
      <div className="quiz-header-left" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button className="quiz-back-btn" onClick={onClose} style={{
          background: '#ffffff',
          color: '#000000',
          border: '2px solid #000000',
          borderRadius: '10px',
          width: '42px',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#000000';
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.color = '#000000';
          e.currentTarget.style.transform = 'scale(1)';
        }}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="quiz-logo" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '2px solid #000000'
        }}>
          <i className="fas fa-code-branch" style={{
            fontSize: '1.2rem',
            color: '#000000'
          }}></i>
          <span style={{
            fontWeight: '800',
            fontSize: '1.1rem',
            color: '#000000',
            letterSpacing: '1px'
          }}>SKILLINK</span>
        </div>
      </div>
      <div className="quiz-header-center" style={{
        flex: 1,
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: '700',
          color: '#ffffff',
          letterSpacing: '0.5px'
        }}>{title}</h3>
      </div>
      <div className="quiz-header-right">
        {showTimer && (
          <div className="quiz-timer quiz-timer-custom" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: timeLeft < 60 ? '#ff0000' : '#ffffff',
            color: timeLeft < 60 ? '#ffffff' : '#000000',
            borderRadius: '10px',
            border: `2px solid ${timeLeft < 60 ? '#ffffff' : '#000000'}`,
            fontWeight: '700',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            animation: timeLeft < 60 ? 'pulse 1s infinite' : 'none'
          }}>
            <i className="fas fa-clock" style={{ fontSize: '1.1rem' }}></i>
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
    </div>
  );

  // Early return if quiz data is invalid - AFTER all hooks
  if (!quiz || !quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return (
      <div className="modal active quiz-modal-overlay-custom">
        <div className="modal-content quiz-not-available quiz-modal-custom">
          <QuizHeader title="Quiz Not Required" />
          <div className="quiz-not-available-content" style={{
            padding: '40px 32px',
            background: '#ffffff',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div className="info-card" style={{
              padding: '32px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '3px solid #000000',
              borderRadius: '16px',
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
              marginBottom: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
            }}>
              <div className="info-icon" style={{
                fontSize: '4rem',
                color: '#000000',
                flexShrink: 0
              }}>
                <i className="fas fa-lightbulb"></i>
              </div>
              <div className="info-text">
                <h4 style={{
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  marginBottom: '12px',
                  color: '#000000'
                }}>Ready to Share Your Innovation?</h4>
                <p style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  margin: 0,
                  color: '#000000',
                  fontWeight: '500'
                }}>This problem doesn't require a quiz completion. You can proceed directly to submit your creative solution and implementation approach.</p>
              </div>
            </div>
            <div className="action-buttons" style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button className="btn btn-primary submit-idea-btn" onClick={onSubmit} style={{
                padding: '14px 32px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                background: '#000000',
                color: '#ffffff',
                border: '3px solid #000000',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
              }}>
                <i className="fas fa-lightbulb"></i>
                <span>Submit My Idea</span>
              </button>
              <button className="btn btn-secondary" onClick={onClose} style={{
                padding: '14px 32px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                background: '#ffffff',
                color: '#000000',
                border: '3px solid #000000',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
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
      <div className="modal active quiz-modal-overlay-custom">
        <div className="modal-content quiz-results quiz-modal-custom" style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}>
          <QuizHeader title={`Quiz Results - ${quizResults?.passed ? 'Passed' : 'Failed'}`} />
          
          <div className="quiz-results-content" style={{
            padding: '32px 28px',
            overflowY: 'auto',
            flex: 1
          }}>
            <div className={`score-display ${quizResults?.passed ? 'passed' : 'failed'}`} style={{
              textAlign: 'center',
              padding: '40px 30px',
              background: quizResults?.passed 
                ? 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: `4px solid ${quizResults?.passed ? '#000000' : '#000000'}`,
              borderRadius: '20px',
              marginBottom: '30px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="score-icon" style={{
                fontSize: '5rem',
                marginBottom: '20px',
                color: quizResults?.passed ? '#ffffff' : '#000000'
              }}>
                <i className={`fas ${quizResults?.passed ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              </div>
              <h2 style={{
                fontSize: '4rem',
                fontWeight: '900',
                margin: '0 0 12px 0',
                color: quizResults?.passed ? '#ffffff' : '#000000'
              }}>{quizResults?.percentage}%</h2>
              <p style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: 0,
                color: quizResults?.passed ? '#ffffff' : '#000000'
              }}>{quizResults?.totalScore} out of {quizResults?.maxScore} points</p>
            </div>
            
            <div className="results-details" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '30px'
            }}>
              <div className="detail-item" style={{
                padding: '18px 20px',
                background: '#ffffff',
                border: '3px solid #000000',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)'
              }}>
                <i className="fas fa-clock" style={{
                  fontSize: '1.8rem',
                  color: '#000000'
                }}></i>
                <span style={{
                  fontSize: '0.95rem',
                  color: '#000000',
                  fontWeight: '600'
                }}>
                  <strong>Time:</strong> {Math.floor((quizResults?.timeSpent || 0) / 60)}:{((quizResults?.timeSpent || 0) % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="detail-item" style={{
                padding: '18px 20px',
                background: '#ffffff',
                border: '3px solid #000000',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)'
              }}>
                <i className={`fas ${quizResults?.passed ? 'fa-check' : 'fa-times'}`} style={{
                  fontSize: '1.8rem',
                  color: '#000000'
                }}></i>
                <span style={{
                  fontSize: '0.95rem',
                  color: '#000000',
                  fontWeight: '600'
                }}>
                  <strong>Status:</strong> {quizResults?.passed ? 'Passed ✅' : 'Failed ❌'}
                </span>
              </div>
              <div className="detail-item" style={{
                padding: '18px 20px',
                background: '#ffffff',
                border: '3px solid #000000',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)'
              }}>
                <i className="fas fa-target" style={{
                  fontSize: '1.8rem',
                  color: '#000000'
                }}></i>
                <span style={{
                  fontSize: '0.95rem',
                  color: '#000000',
                  fontWeight: '600'
                }}>
                  <strong>Required:</strong> {quiz.passingScore}%
                </span>
              </div>
            </div>

            {quizResults?.passed ? (
              <div className="success-message" style={{
                padding: '28px',
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                border: '3px solid #000000',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}>
                <div className="message-icon" style={{
                  fontSize: '3.5rem',
                  marginBottom: '16px',
                  color: '#ffffff'
                }}>
                  <i className="fas fa-trophy"></i>
                </div>
                <h4 style={{
                  fontSize: '1.8rem',
                  fontWeight: '800',
                  marginBottom: '12px',
                  color: '#ffffff'
                }}>🎉 Congratulations!</h4>
                <p style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  margin: 0,
                  color: '#ffffff',
                  fontWeight: '500'
                }}>You passed the quiz and can now submit your innovative idea for this problem.</p>
              </div>
            ) : (
              <div className="failure-message" style={{
                padding: '28px',
                background: '#ffffff',
                border: '3px solid #000000',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}>
                <div className="message-icon" style={{
                  fontSize: '3.5rem',
                  marginBottom: '16px',
                  color: '#000000'
                }}>
                  <i className="fas fa-book"></i>
                </div>
                <h4 style={{
                  fontSize: '1.8rem',
                  fontWeight: '800',
                  marginBottom: '12px',
                  color: '#000000'
                }}>Keep Learning!</h4>
                <p style={{
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  margin: 0,
                  color: '#000000',
                  fontWeight: '500'
                }}>You didn't meet the passing score this time. Review the problem description and try again when you're ready.</p>
              </div>
            )}
          </div>

          <div className="modal-actions" style={{
            display: 'flex',
            gap: '14px',
            padding: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            borderTop: '2px solid #e0e0e0',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            position: 'sticky',
            bottom: 0
          }}>
            {quizResults?.passed && (
              <button 
                className="btn btn-primary"
                onClick={handleContinueToIdeaSubmission}
                style={{
                  padding: '14px 28px',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: '3px solid #000000',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.3px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
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
                  padding: '14px 28px',
                  fontSize: '1.05rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: '3px solid #000000',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.3px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#000000';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
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
                padding: '14px 28px',
                fontSize: '1.05rem',
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '3px solid #000000',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.transform = 'translateY(0)';
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
      <div className="modal active quiz-modal-overlay-custom">
        <div className="modal-content quiz-modal quiz-modal-custom">
          <QuizHeader title="Loading Quiz..." />
          <div className="loading-state" style={{
            padding: '60px 40px',
            textAlign: 'center',
            background: '#ffffff'
          }}>
            <div className="loading-spinner" style={{
              fontSize: '4rem',
              marginBottom: '20px',
              color: '#000000',
              animation: 'spin 1s linear infinite'
            }}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p style={{
              fontSize: '1.2rem',
              color: '#000000',
              fontWeight: '600',
              margin: 0
            }}>Checking quiz status...</p>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions?.[currentQuestion] || {};
  const progress = ((currentQuestion + 1) / (quiz.questions?.length || 1)) * 100;

  return (
    <>
      {/* Professional B&W Theme - Mobile Full-Screen Responsive CSS */}
      <style>{`
        /* Desktop Quiz Modal */
        .quiz-modal-overlay-custom {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justifyContent: center;
          z-index: 10000;
          padding: 20px;
        }

        .quiz-modal-custom {
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border: 2px solid #000000;
          border-radius: 20px;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
          max-width: 900px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .quiz-modal-custom::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #000000, #666666, #000000);
        }

        /* Mobile Full-Screen */
        @media (max-width: 768px) {
          .quiz-modal-overlay-custom {
            padding: 0;
            align-items: stretch;
            justify-content: stretch;
          }

          .quiz-modal-custom {
            width: 100%;
            max-width: 100%;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            border: none;
            border-top: 4px solid #000000;
          }

          .quiz-modal-custom::before {
            display: none;
          }

          .quiz-header-custom {
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          }

          .quiz-navigation-custom {
            position: sticky !important;
            bottom: 0 !important;
            z-index: 100 !important;
            box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15) !important;
            flex-direction: column !important;
            gap: 12px !important;
            padding: 16px !important;
          }

          .quiz-nav-points-custom {
            order: -1 !important;
            width: 100% !important;
          }

          .quiz-nav-buttons-custom {
            width: 100% !important;
            display: flex !important;
            gap: 12px !important;
          }

          .quiz-nav-buttons-custom button {
            flex: 1 !important;
            min-height: 48px !important;
          }

          .quiz-content-custom {
            padding: 20px 16px 100px 16px !important;
          }

          .question-text-custom {
            font-size: 1.1rem !important;
          }

          .option-item-custom {
            padding: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .quiz-header-custom h3 {
            font-size: 0.95rem !important;
          }

          .quiz-progress-custom {
            padding: 14px 12px !important;
          }

          .quiz-content-custom {
            padding: 16px 12px 100px 12px !important;
          }

          .question-text-custom {
            font-size: 1rem !important;
          }

          .option-item-custom {
            padding: 12px !important;
          }

          .quiz-timer-custom {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
      
      <div className="quiz-modal-overlay-custom">
        <div className="quiz-modal-custom">
        <QuizHeader 
          title={quiz.title || 'Knowledge Assessment'} 
          showTimer={true} 
        />
        
        {/* Progress Section */}
        <div className="quiz-progress quiz-progress-custom" style={{
          padding: '20px 28px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <div className="progress-bar" style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e0e0e0',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '12px',
            border: '2px solid #000000',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="progress-fill" style={{ 
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #000000, #333333)',
              borderRadius: '8px',
              transition: 'width 0.4s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}></div>
          </div>
          <span className="progress-text" style={{
            fontSize: '0.95rem',
            color: '#000000',
            fontWeight: '700',
            letterSpacing: '0.3px'
          }}>
            Question {currentQuestion + 1} of {quiz.questions?.length || 0}
          </span>
        </div>

        {/* Question Content */}
        <div className="quiz-content quiz-content-custom" style={{
          padding: '32px 28px',
          minHeight: '300px',
          maxHeight: '50vh',
          overflowY: 'auto',
          background: '#ffffff'
        }}>
          <div className="question-section">
            <h4 className="question-text question-text-custom" style={{
              fontSize: '1.35rem',
              fontWeight: '700',
              color: '#000000',
              marginBottom: '28px',
              lineHeight: '1.6',
              textAlign: 'left',
              paddingBottom: '16px',
              borderBottom: '3px solid #000000'
            }}>
              {question.question}
            </h4>
            
            {question.type === 'multiple-choice' && (
              <div className="options-list" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {question.options?.map((option, index) => (
                  <label key={index} className="option-item option-item-custom" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    backgroundColor: getCurrentAnswer() === option.text 
                      ? '#000000' 
                      : '#ffffff',
                    border: getCurrentAnswer() === option.text 
                      ? '3px solid #000000' 
                      : '3px solid #e0e0e0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: getCurrentAnswer() === option.text
                      ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                      : '0 2px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (getCurrentAnswer() !== option.text) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#000000';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (getCurrentAnswer() !== option.text) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option.text}
                      checked={getCurrentAnswer() === option.text}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      style={{
                        marginRight: '16px',
                        width: '22px',
                        height: '22px',
                        accentColor: '#000000',
                        cursor: 'pointer'
                      }}
                    />
                    <span className="option-text" style={{
                      fontSize: '1.05rem',
                      color: getCurrentAnswer() === option.text ? '#ffffff' : '#000000',
                      fontWeight: getCurrentAnswer() === option.text ? '700' : '600',
                      flex: 1,
                      transition: 'color 0.3s ease'
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
                gap: '14px'
              }}>
                {['true', 'false'].map((value) => (
                  <label key={value} className="option-item option-item-custom" style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    backgroundColor: getCurrentAnswer() === value 
                      ? '#000000' 
                      : '#ffffff',
                    border: getCurrentAnswer() === value 
                      ? '3px solid #000000' 
                      : '3px solid #e0e0e0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: getCurrentAnswer() === value
                      ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                      : '0 2px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (getCurrentAnswer() !== value) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.borderColor = '#000000';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (getCurrentAnswer() !== value) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}>
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={value}
                      checked={getCurrentAnswer() === value}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      style={{
                        marginRight: '16px',
                        width: '22px',
                        height: '22px',
                        accentColor: '#000000',
                        cursor: 'pointer'
                      }}
                    />
                    <span className="option-text" style={{
                      fontSize: '1.05rem',
                      color: getCurrentAnswer() === value ? '#ffffff' : '#000000',
                      fontWeight: getCurrentAnswer() === value ? '700' : '600',
                      flex: 1,
                      textTransform: 'capitalize',
                      transition: 'color 0.3s ease'
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
                    padding: '16px',
                    backgroundColor: '#ffffff',
                    border: '3px solid #e0e0e0',
                    borderRadius: '12px',
                    color: '#000000',
                    fontSize: '1.05rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    minHeight: '140px',
                    transition: 'border-color 0.3s ease',
                    fontWeight: '500'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#000000';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 0, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="quiz-navigation quiz-navigation-custom" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderTop: '2px solid #e0e0e0',
          gap: '16px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          position: 'sticky',
          bottom: 0,
          zIndex: 100
        }}>
          {/* Previous Button */}
          <button 
            className="btn btn-secondary"
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
            style={{
              padding: '12px 24px',
              fontSize: '1rem',
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQuestion === 0 ? 0.4 : 1,
              backgroundColor: currentQuestion === 0 ? '#e0e0e0' : '#ffffff',
              color: '#000000',
              border: '3px solid #000000',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              transition: 'all 0.3s ease',
              boxShadow: currentQuestion === 0 ? 'none' : '0 3px 10px rgba(0, 0, 0, 0.2)',
              minWidth: '120px',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              if (currentQuestion !== 0) {
                e.currentTarget.style.backgroundColor = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentQuestion !== 0) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
              }
            }}
          >
            <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
            Previous
          </button>
          
          {/* Points Badge */}
          <div className="nav-center quiz-nav-points-custom" style={{
            textAlign: 'center',
            fontSize: '1rem',
            color: '#000000',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px 24px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '3px solid #000000',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
            letterSpacing: '0.5px'
          }}>
            <i className="fas fa-star" style={{ fontSize: '1.2rem', color: '#000000' }}></i>
            <span>{question.points} Points</span>
          </div>
          
          {/* Next/Submit Button */}
          <div className="quiz-nav-buttons-custom">
          {currentQuestion < (quiz.questions?.length || 0) - 1 ? (
            <button 
              className="btn btn-primary"
              onClick={goToNext}
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                cursor: 'pointer',
                background: '#000000',
                color: '#ffffff',
                border: '3px solid #000000',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000000';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
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
                padding: '12px 28px',
                fontSize: '1rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                background: isSubmitting ? '#6c757d' : '#000000',
                color: '#ffffff',
                border: '3px solid #000000',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '700',
                letterSpacing: '0.3px',
                transition: 'all 0.3s ease',
                boxShadow: isSubmitting ? 'none' : '0 3px 10px rgba(0, 0, 0, 0.3)',
                minWidth: '160px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#000000';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
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
    </div>
    </>
  );
};

export default QuizModal;