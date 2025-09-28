import React, { useState } from 'react';
import { candidateAPI, interviewAPI } from '../services/api';

const TestDataManager = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const createTestInterview = async () => {
    setLoading(true);
    try {
      // Get first candidate
      const candidatesResponse = await candidateAPI.getAll();
      if (candidatesResponse.data.length === 0) {
        setMessage('No candidates found. Create a candidate first.');
        return;
      }

      const firstCandidate = candidatesResponse.data[0];
      console.log('Creating interview for candidate:', firstCandidate);

      // Create interview
      const interviewResponse = await interviewAPI.start(firstCandidate._id);
      console.log('Created interview:', interviewResponse.data);

      setMessage(`Test interview created for ${firstCandidate.name}!`);
    } catch (error) {
      console.error('Failed to create test interview:', error);
      setMessage('Failed to create test interview: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkDataStructure = async () => {
    try {
      const [candidatesResponse, interviewsResponse] = await Promise.all([
        candidateAPI.getAll(),
        interviewAPI.getAll()
      ]);
      
      console.log('=== DATA STRUCTURE DEBUG ===');
      console.log('Candidates:', candidatesResponse.data);
      console.log('Interviews:', interviewsResponse.data);
      
      if (interviewsResponse.data.length > 0) {
        const sampleInterview = interviewsResponse.data[0];
        console.log('Sample interview candidate field:', sampleInterview.candidate);
        console.log('Sample interview candidate type:', typeof sampleInterview.candidate);
      }
      
      setMessage('Check console for data structure details');
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage('Failed to fetch data: ' + error.message);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Data Manager</h3>
      
      <div className="space-y-2">
        <button
          onClick={createTestInterview}
          disabled={loading}
          className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Test Interview'}
        </button>
        
        <button
          onClick={checkDataStructure}
          className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Debug Data Structure
        </button>
      </div>
      
      {message && (
        <p className="text-xs text-gray-600 mt-2">{message}</p>
      )}
    </div>
  );
};

export default TestDataManager;