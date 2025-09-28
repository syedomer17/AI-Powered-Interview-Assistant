import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI, getTimeLimit, formatTime } from '../services/api';

const InterviewChat = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [messages, setMessages] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchInterview();
    // Store interview ID in localStorage for persistence
    localStorage.setItem('currentInterviewId', interviewId);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [interviewId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      const timeLimit = getTimeLimit(currentQuestion.difficulty);
      setTimeLeft(timeLimit);
      startTimer(timeLimit);
      
      setMessages(prev => [...prev, {
        type: 'question',
        content: currentQuestion.text,
        difficulty: currentQuestion.difficulty,
        timeLimit: timeLimit,
        timestamp: new Date()
      }]);
    }
  }, [currentQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchInterview = async () => {
    try {
      const response = await interviewAPI.getById(interviewId);
      setInterview(response.data);
      
      if (response.data.status === 'completed') {
        setIsCompleted(true);
        setFinalScore(response.data.finalScore);
        setMessages([{
          type: 'system',
          content: `Interview completed! Your final score: ${response.data.finalScore}/10`,
          timestamp: new Date()
        }]);
      } else {
        // Get current question
        fetchCurrentQuestion();
      }
    } catch (error) {
      console.error('Failed to fetch interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentQuestion = async () => {
    try {
      const response = await interviewAPI.getCurrentQuestion(interviewId);
      
      console.log('=== QUESTION FETCH DEBUG ===');
      console.log('Response data:', response.data);
      console.log('Question Index:', response.data.questionIndex);
      console.log('Is Completed:', response.data.completed);
      
      if (response.data.completed) {
        // Interview is complete, finalize it
        await finalizeInterview();
      } else {
        setCurrentQuestion(response.data.question);
        setCurrentQuestionIndex(response.data.questionIndex);
      }
    } catch (error) {
      console.error('Failed to fetch current question:', error);
    }
  };

  const startTimer = (timeLimit) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAutoSubmit = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (answer.trim()) {
      submitAnswer(answer);
    } else {
      skipQuestion();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    submitAnswer(answer);
  };

  const submitAnswer = async (answerText) => {
    setSubmitting(true);
    
    // Add user's answer to messages
    setMessages(prev => [...prev, {
      type: 'answer',
      content: answerText,
      timestamp: new Date()
    }]);

    try {
      const response = await interviewAPI.submitAnswer(interviewId, currentQuestionIndex, answerText);
      
      // Add AI feedback message
      setMessages(prev => [...prev, {
        type: 'feedback',
        content: `Answer submitted! Score: ${response.data.score}/10. ${response.data.reasoning}`,
        score: response.data.score,
        timestamp: new Date()
      }]);

      setAnswer('');
      
      if (response.data.completed) {
        await finalizeInterview();
      } else {
        // Move to next question after a delay
        setTimeout(() => {
          fetchCurrentQuestion();
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Failed to submit answer. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setSubmitting(false);
    }
  };

  const skipQuestion = async () => {
    setSubmitting(true);
    
    setMessages(prev => [...prev, {
      type: 'system',
      content: 'Time expired - question skipped.',
      timestamp: new Date()
    }]);

    try {
      const response = await interviewAPI.skipQuestion(interviewId, currentQuestionIndex);
      
      if (response.data.completed) {
        await finalizeInterview();
      } else {
        // Move to next question after a delay
        setTimeout(() => {
          fetchCurrentQuestion();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to skip question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const finalizeInterview = async () => {
    try {
      const response = await interviewAPI.finalize(interviewId);
      const finalizedInterview = response.data;
      
      setIsCompleted(true);
      setFinalScore(finalizedInterview.finalScore);
      
      // Clear the stored interview ID when complete
      localStorage.removeItem('currentInterviewId');
      
      setMessages(prev => [...prev, {
        type: 'system',
        content: `🎉 Interview completed! Your final score: ${finalizedInterview.finalScore}/10`,
        finalScore: finalizedInterview.finalScore,
        summary: finalizedInterview.summary,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Failed to finalize interview:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalQ = getTotalQuestions();
    if (totalQ === 0) return 0;
    
    // Use currentQuestionIndex to calculate progress
    // Progress represents completed questions, so currentQuestionIndex represents progress
    const progress = (currentQuestionIndex / totalQ) * 100;
    
    console.log('=== PROGRESS DEBUG ===');
    console.log('Current Question Index:', currentQuestionIndex);
    console.log('Total Questions:', totalQ);
    console.log('Calculated Progress:', progress);
    
    return progress;
  };

  const getTotalQuestions = () => {
    return interview?.questions?.length || 6;
  };

  const getCurrentQuestionNumber = () => {
    // currentQuestionIndex is 0-based, so add 1 for display
    // If interview is completed, show the last question number
    if (isCompleted) {
      return getTotalQuestions();
    }
    return currentQuestionIndex + 1;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Interview not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                AI Interview - Q{getCurrentQuestionNumber()}/{getTotalQuestions()}
              </h1>
              {currentQuestion && (
                <span className={`ml-0 sm:ml-3 px-2 py-1 rounded text-xs font-medium w-fit ${
                  currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>
            <div className="flex items-center justify-center sm:justify-end">
              {!isCompleted && (
                <div className={`px-3 py-2 rounded-full text-sm font-medium ${
                  timeLeft > 30 ? 'bg-green-100 text-green-800' : 
                  timeLeft > 10 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800 timer-warning'
                }`}>
                  ⏱ {formatTime(timeLeft)}
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full interview-progress"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center sm:text-left">
              Progress: {Math.round(getProgressPercentage())}% complete
            </p>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-80 sm:h-96 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'answer' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-lg p-3 chat-bubble ${
                  message.type === 'question' ? 'bg-gray-100 text-gray-900' :
                  message.type === 'answer' ? 'bg-indigo-600 text-white' :
                  message.type === 'feedback' ? 'bg-green-100 text-green-800' :
                  message.type === 'error' ? 'bg-red-100 text-red-800' :
                  message.type === 'system' && message.finalScore ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  <div className="flex items-start">
                    {message.type === 'question' && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">AI</span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm">{message.content}</p>
                        {message.type === 'question' && message.difficulty && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            message.difficulty === 'Easy' ? 'bg-green-200 text-green-800' :
                            message.difficulty === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                            {message.difficulty} ({message.timeLimit}s)
                          </span>
                        )}
                        {message.type === 'feedback' && message.score && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            message.score >= 8 ? 'bg-green-200 text-green-800' :
                            message.score >= 6 ? 'bg-yellow-200 text-yellow-800' :
                            'bg-red-200 text-red-800'
                          }`}>
                            {message.score}/10
                          </span>
                        )}
                      </div>
                      {message.type === 'system' && message.finalScore && (
                        <div className="mt-2 p-3 bg-white rounded border">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                              {message.finalScore}/10
                            </div>
                            <div className="text-sm text-gray-600">Final Score</div>
                            {message.summary && (
                              <div className="mt-3 text-sm text-gray-700">
                                {message.summary}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${
                        message.type === 'answer' ? 'text-indigo-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Answer Input */}
          {!isCompleted && currentQuestion && (
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!answer.trim() || submitting}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </form>
              <div className="mt-2 flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                <p className="text-center sm:text-left">Press Enter + Shift for new line</p>
                <p className="text-center sm:text-right">{answer.length} characters</p>
              </div>
            </div>
          )}

          {/* Interview Completion */}
          {isCompleted && (
            <div className="border-t border-gray-200 p-4 sm:p-6 text-center bg-purple-50">
              <div className="mb-4">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-2">
                Interview Completed! 🎉
              </h3>
              <p className="text-sm sm:text-base text-purple-700 mb-4 px-2">
                Thank you for taking the time to complete this AI-powered interview.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  View Dashboard
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Interview Guidelines */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">💡 Interview Tips</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1.5">
                  <li><strong>Be specific:</strong> Provide concrete examples and details in your answers</li>
                  <li><strong>Time management:</strong> Questions have dynamic time limits based on difficulty (Easy: 20s, Medium: 1m, Hard: 2m)</li>
                  <li><strong>Think aloud:</strong> Explain your thought process and reasoning</li>
                  <li><strong>Use STAR method:</strong> Situation, Task, Action, Result for behavioral questions</li>
                  <li><strong>Ask clarifications:</strong> If unclear, mention what you'd ask in a real interview</li>
                  <li><strong>Review before submit:</strong> Check your answer for completeness and accuracy</li>
                  <li><strong>Stay calm:</strong> Take a breath, the AI provides fair and constructive feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewChat;