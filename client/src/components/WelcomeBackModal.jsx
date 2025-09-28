import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';

const WelcomeBackModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [unfinishedInterview, setUnfinishedInterview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkForUnfinishedInterview();
  }, []);

  const checkForUnfinishedInterview = async () => {
    try {
      // Check if there's an unfinished interview in localStorage
      const savedInterviewId = localStorage.getItem('currentInterviewId');
      
      if (savedInterviewId) {
        // Verify the interview still exists and is in progress
        try {
          const response = await interviewAPI.getById(savedInterviewId);
          const interview = response.data;
          
          if (interview.status === 'in_progress') {
            setUnfinishedInterview(interview);
            setShowModal(true);
          } else {
            // Interview is completed or not found, clear localStorage
            localStorage.removeItem('currentInterviewId');
          }
        } catch (error) {
          // Interview not found, clear localStorage
          localStorage.removeItem('currentInterviewId');
        }
      }
    } catch (error) {
      console.error('Failed to check for unfinished interview:', error);
    }
  };

  const handleContinueInterview = () => {
    setShowModal(false);
    navigate(`/interview/${unfinishedInterview._id}`);
  };

  const handleStartNew = () => {
    setShowModal(false);
    // Clear the stored interview ID
    localStorage.removeItem('currentInterviewId');
    navigate('/candidate');
  };

  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal || !unfinishedInterview) {
    return null;
  }

  const getCurrentQuestion = () => {
    if (!unfinishedInterview.questions) return 1;
    const answered = unfinishedInterview.questions.filter(q => q.answer || q.timedOut).length;
    return Math.min(answered + 1, unfinishedInterview.questions.length);
  };

  const getProgress = () => {
    if (!unfinishedInterview.questions) return 0;
    const answered = unfinishedInterview.questions.filter(q => q.answer || q.timedOut).length;
    return Math.round((answered / unfinishedInterview.questions.length) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Center the modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Welcome Back!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  We found an unfinished interview from your previous session. 
                  You were on question {getCurrentQuestion()} of {unfinishedInterview.questions.length}.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Info */}
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{getProgress()}% complete</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Interview ID: #{unfinishedInterview._id.slice(-6)}
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              onClick={handleContinueInterview}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
            >
              Continue Interview
            </button>
            <button
              type="button"
              onClick={handleStartNew}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Start New Interview
            </button>
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss (I'll decide later)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;