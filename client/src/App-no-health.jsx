import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CandidateFlow from './pages/CandidateFlow';
import InterviewChat from './pages/InterviewChat';
import InterviewerDashboard from './pages/InterviewerDashboard';
import CandidateDetails from './pages/CandidateDetails';
import HealthCheck from './components/HealthCheck';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <HealthCheck />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/candidate" element={<CandidateFlow />} />
          <Route path="/interview/:interviewId" element={<InterviewChat />} />
          <Route path="/dashboard" element={<InterviewerDashboard />} />
          <Route path="/candidate/:candidateId" element={<CandidateDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;