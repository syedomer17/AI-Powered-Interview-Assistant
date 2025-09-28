import React, { useState, useEffect } from 'react';
import { healthAPI } from '../services/api';

const HealthCheck = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await healthAPI.check();
      if (response.status === 200) {
        setStatus('healthy');
      } else {
        setStatus('unhealthy');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  if (status === 'checking') {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm">
        Checking server...
      </div>
    );
  }

  if (status === 'healthy') {
    return null; // Don't show anything if healthy
  }

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm max-w-xs">
      <div className="flex items-center">
        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        Server unavailable
      </div>
      {error && <div className="text-xs mt-1">{error}</div>}
      <button 
        onClick={checkHealth}
        className="text-xs underline mt-1 hover:text-red-900"
      >
        Retry
      </button>
    </div>
  );
};

export default HealthCheck;