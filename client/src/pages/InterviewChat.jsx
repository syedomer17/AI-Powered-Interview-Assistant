import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewAPI, getTimeLimit /* remove formatTime import here */ } from '../services/api';

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
    localStorage.setItem('currentInterviewId', String(interviewId));
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [interviewId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentQuestion && !isCompleted) {
      const timeLimit = getTimeLimit(currentQuestion.difficulty);
      setTimeLeft(timeLimit);
      startTimer(timeLimit);
      setMessages(prev => [
        ...prev,
        {
          type: 'question',
          content: currentQuestion.text,
          difficulty: currentQuestion.difficulty,
          timeLimit,
          timestamp: new Date(),
        },
      ]);
    }
  }, [currentQuestion, isCompleted]);

  const fetchInterview = async () => {
    try {
      const { data } = await interviewAPI.getById(interviewId);
      setInterview(data);
      if (data.status === 'completed') {
        setIsCompleted(true);
        setFinalScore(data.finalScore);
        setMessages([
          {
            type: 'system',
            content: `Interview completed! Your final score: ${data.finalScore}/10`,
            timestamp: new Date(),
          },
        ]);
      } else {
        fetchCurrentQuestion();
      }
    } catch (e) {
      console.error('Failed to fetch interview:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentQuestion = async () => {
    try {
      const { data } = await interviewAPI.getCurrentQuestion(interviewId);
      if (data.completed) {
        await finalizeInterview();
      } else {
        setCurrentQuestion(data.question);
        setCurrentQuestionIndex(data.questionIndex);
      }
    } catch (e) {
      console.error('Failed to fetch current question:', e);
    }
  };

  const startTimer = (timeLimit) => {
    if (timerRef.current) clearInterval(timerRef.current);
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
    if (timerRef.current) clearInterval(timerRef.current);
    if (answer.trim()) submitAnswer(answer);
    else skipQuestion();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    if (timerRef.current) clearInterval(timerRef.current);
    submitAnswer(answer);
  };

  const submitAnswer = async (answerText) => {
    setSubmitting(true);
    setMessages(prev => [...prev, { type: 'answer', content: answerText, timestamp: new Date() }]);
    try {
      const { data } = await interviewAPI.submitAnswer(interviewId, currentQuestionIndex, answerText);
      setMessages(prev => [
        ...prev,
        {
          type: 'feedback',
          content: `Answer submitted! Score: ${data.score}/10. ${data.reasoning}`,
          score: data.score,
          timestamp: new Date(),
        },
      ]);
      setAnswer('');
      if (data.completed) {
        await finalizeInterview();
      } else {
        setTimeout(() => {
          fetchCurrentQuestion();
        }, 1200);
      }
    } catch (e) {
      console.error('Failed to submit answer:', e);
      setMessages(prev => [
        ...prev,
        { type: 'error', content: 'Failed to submit answer. Please try again.', timestamp: new Date() },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const skipQuestion = async () => {
    setSubmitting(true);
    setMessages(prev => [...prev, { type: 'system', content: 'Time expired - question skipped.', timestamp: new Date() }]);
    try {
      const { data } = await interviewAPI.skipQuestion(interviewId, currentQuestionIndex);
      if (data.completed) {
        await finalizeInterview();
      } else {
        setTimeout(() => {
          fetchCurrentQuestion();
        }, 800);
      }
    } catch (e) {
      console.error('Failed to skip question:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const finalizeInterview = async () => {
    try {
      const { data } = await interviewAPI.finalize(interviewId);
      setIsCompleted(true);
      setFinalScore(data.finalScore);
      localStorage.removeItem('currentInterviewId');
      setMessages(prev => [
        ...prev,
        {
          type: 'system',
          content: `🎉 Interview completed! Your final score: ${data.finalScore}/10`,
          finalScore: data.finalScore,
          summary: data.summary,
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      console.error('Failed to finalize interview:', e);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalQuestions = () => interview?.questions?.length || 6;
  const getCurrentQuestionNumber = () => (isCompleted ? getTotalQuestions() : currentQuestionIndex + 1);
  const getProgressPercentage = () => {
    const totalQ = getTotalQuestions();
    return totalQ ? (currentQuestionIndex / totalQ) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Interview not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                AI Interview - Q{getCurrentQuestionNumber()}/{getTotalQuestions()}
              </h1>
              {currentQuestion && (
                <span
                  className={`px-2 py-1 rounded text-xs font-medium w-fit ${
                    currentQuestion.difficulty === 'Easy'
                      ? 'bg-green-100 text-green-800'
                      : currentQuestion.difficulty === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              )}
            </div>
            {!isCompleted && (
              <div
                className={`px-3 py-2 rounded-full text-sm font-medium ${
                  timeLeft > 30 ? 'bg-green-100 text-green-800' : timeLeft > 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}
              >
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center sm:text-left">
              Progress: {Math.round(getProgressPercentage())}% complete
            </p>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-[60vh] sm:min-h-[65vh]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.type === 'answer' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-3xl rounded-lg p-3 ${
                    m.type === 'question'
                      ? 'bg-gray-100 text-gray-900'
                      : m.type === 'answer'
                      ? 'bg-indigo-600 text-white'
                      : m.type === 'feedback'
                      ? 'bg-green-100 text-green-800'
                      : m.type === 'error'
                      ? 'bg-red-100 text-red-800'
                      : m.type === 'system' && m.finalScore
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  <div className="flex items-start">
                    {m.type === 'question' && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">AI</span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm">{m.content}</p>
                        {m.type === 'question' && m.difficulty && (
                          <span
                            className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                              m.difficulty === 'Easy'
                                ? 'bg-green-200 text-green-800'
                                : m.difficulty === 'Medium'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {m.difficulty} ({m.timeLimit}s)
                          </span>
                        )}
                        {m.type === 'feedback' && m.score != null && (
                          <span
                            className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                              m.score >= 8 ? 'bg-green-200 text-green-800' : m.score >= 6 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {m.score}/10
                          </span>
                        )}
                      </div>

                      {m.type === 'system' && m.finalScore && (
                        <div className="mt-2 p-3 bg-white rounded border">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">{m.finalScore}/10</div>
                            <div className="text-sm text-gray-600">Final Score</div>
                            {m.summary && <div className="mt-3 text-sm text-gray-700">{m.summary}</div>}
                          </div>
                        </div>
                      )}

                      <p className={`text-xs mt-1 ${m.type === 'answer' ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {new Date(m.timestamp).toLocaleTimeString()}
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
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 sm:items-start"
              >
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-24"
                  rows={4}
                  disabled={submitting}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (answer.trim() && !submitting) handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!answer.trim() || submitting}
                  className="sm:w-auto w-full px-6 py-3 sm:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </button>
              </form>
              <div className="mt-2 flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500 gap-1">
                <p className="text-center sm:text-left">Enter = submit · Shift+Enter = new line</p>
                <p className="text-center sm:text-right">{answer.length} characters</p>
              </div>
            </div>
          )}

          {/* Completed */}
          {isCompleted && (
            <div className="border-t border-gray-200 p-4 sm:p-6 text-center bg-purple-50">
              <div className="mb-4">
                <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-2">Interview Completed! 🎉</h3>
              <p className="text-sm sm:text-base text-purple-700 mb-4 px-2">Thank you for taking the time to complete this AI-powered interview.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-2">
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

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">💡 Interview Tips</h4>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1.5">
                <li><strong>Be specific:</strong> Provide concrete examples and details</li>
                <li><strong>Time:</strong> Easy 20s · Medium 1m · Hard 2m</li>
                <li><strong>Think aloud:</strong> Explain your reasoning</li>
                <li><strong>Use STAR:</strong> Situation · Task · Action · Result</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewChat;
