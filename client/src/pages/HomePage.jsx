import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="flex items-center justify-center sm:justify-start">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">AI Interview Assistant</h1>
              </div>
            </div>
            <nav className="flex justify-center">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/candidate" 
                  className="w-full sm:w-auto text-center text-gray-900 hover:text-indigo-600 px-4 py-2 rounded-md text-sm font-medium border sm:border-0 hover:bg-indigo-50"
                >
                  For Candidates
                </Link>
                <Link 
                  to="/dashboard" 
                  className="w-full sm:w-auto text-center text-gray-900 hover:text-indigo-600 px-4 py-2 rounded-md text-sm font-medium border sm:border-0 hover:bg-indigo-50"
                >
                  Interviewer Dashboard
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
            AI-Powered
            <span className="text-indigo-600 block sm:inline"> Interview Platform</span>
          </h2>
          <p className="mt-4 sm:mt-6 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-8 md:text-xl md:max-w-3xl leading-relaxed">
            Experience the future of technical interviews with our AI-powered assistant. 
            Get real-time questions, instant feedback, and comprehensive scoring.
          </p>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* For Candidates */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">For Candidates</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Upload your resume, take AI-generated interviews, and get instant feedback on your performance.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/candidate"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Start Interview
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* For Interviewers */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">For Interviewers</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    View candidate profiles, interview scores, and detailed analytics in a comprehensive dashboard.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">AI-Powered</h3>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Dynamic question generation, real-time scoring, and intelligent resume parsing powered by AI.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Powered by AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mt-16">
          <div className="text-center">
            <h3 className="text-2xl font-extrabold text-gray-900">How It Works</h3>
            <p className="mt-4 text-lg text-gray-500">Simple steps to get started with your AI interview</p>
          </div>
          <div className="mt-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white text-xl font-bold mx-auto">
                  1
                </div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">Upload Resume</h4>
                <p className="mt-2 text-sm text-gray-500">
                  Upload your PDF or DOCX resume for AI analysis
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white text-xl font-bold mx-auto">
                  2
                </div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">Take Interview</h4>
                <p className="mt-2 text-sm text-gray-500">
                  Answer AI-generated questions in a chat-like interface
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-600 text-white text-xl font-bold mx-auto">
                  3
                </div>
                <h4 className="mt-4 text-lg font-medium text-gray-900">Get Results</h4>
                <p className="mt-2 text-sm text-gray-500">
                  Receive instant feedback and detailed scoring
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 AI Interview Assistant. Built with React + Node.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;