// src/components/QuizModal.js
// This component provides the quiz interface for students

import React, { useState, useEffect } from 'react';

const QuizModal = ({ quiz, problem, onClose, onSubmit }) => {
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
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/quiz/response/${problem._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const existingResponse = await response.json();
          setHasExistingResponse(true);
          setQuizResults(existingResponse);
          setShowResults(true);
        } else if (response.status === 404) {
          // No existing response, user can take the quiz
          setHasExistingResponse(false);
        }
      } catch (error) {
        console.error('Error checking existing quiz response:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    if (problem?._id) {
      checkExistingResponse();
    }
  }, [problem?._id]);

  const handleRetakeQuiz = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/quiz/response/${problem._id}`, {
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
          <span>EngineerConnect</span>
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
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/quiz/submit`, {
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
    if (quizResults && quizResults.passed) {
      onSubmit(); // This will open the idea submission modal
    }
    onClose();
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

          <div className="modal-actions">
            {quizResults?.passed && (
              <button 
                className="btn btn-primary"
                onClick={handleContinueToIdeaSubmission}
              >
                <i className="fas fa-lightbulb"></i> Submit My Idea
              </button>
            )}
            {hasExistingResponse && (
              <button 
                className="btn btn-warning"
                onClick={handleRetakeQuiz}
                disabled={isSubmitting}
              >
                <i className="fas fa-redo"></i> 
                {isSubmitting ? 'Clearing...' : 'Retake Quiz'}
              </button>
            )}
            <button className="btn btn-secondary" onClick={onClose}>
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
    <div className="modal active">
      <div className="modal-content quiz-modal">
        <QuizHeader 
          title={quiz.title || 'Knowledge Assessment'} 
          showTimer={true} 
        />
        
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">
            Question {currentQuestion + 1} of {quiz.questions?.length || 0}
          </span>
        </div>

        <div className="quiz-content">
          <div className="question-section">
            <h4 className="question-text">{question.question}</h4>
            
            {question.type === 'multiple-choice' && (
              <div className="options-list">
                {question.options?.map((option, index) => (
                  <label key={index} className="option-item">
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={option.text}
                      checked={getCurrentAnswer() === option.text}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                    />
                    <span className="option-text">{option.text}</span>
                  </label>
                ))}
              </div>
            )}

            {question.type === 'boolean' && (
              <div className="options-list">
                <label className="option-item">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value="true"
                    checked={getCurrentAnswer() === 'true'}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  />
                  <span className="option-text">True</span>
                </label>
                <label className="option-item">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value="false"
                    checked={getCurrentAnswer() === 'false'}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  />
                  <span className="option-text">False</span>
                </label>
              </div>
            )}

            {question.type === 'text' && (
              <div className="text-answer">
                <textarea
                  placeholder="Enter your answer..."
                  value={getCurrentAnswer()}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
        </div>

        <div className="quiz-navigation">
          <button 
            className="btn btn-secondary"
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
          >
            <i className="fas fa-arrow-left"></i> Previous
          </button>
          
          <div className="nav-center">
            <span className="points-info">
              <i className="fas fa-star"></i>
              {question.points} point{question.points !== 1 ? 's' : ''}
            </span>
          </div>
          
          {currentQuestion < (quiz.questions?.length || 0) - 1 ? (
            <button 
              className="btn btn-primary"
              onClick={goToNext}
            >
              Next <i className="fas fa-arrow-right"></i>
            </button>
          ) : (
            <button 
              className="btn btn-success"
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
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
  );
};

export default QuizModal;