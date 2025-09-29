import axios from 'axios';

export const API_BASE_URL = 'https://hirelens.syedomer.xyz/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Health check API
export const healthAPI = {
  check: () => axios.get('https://hirelens.syedomer.xyz/health'),
};

// Candidate API
export const candidateAPI = {
  create: (candidateData) => api.post('/candidates', candidateData),
  getAll: () => api.get('/candidates'),
  getById: (id) => api.get(`/candidates/${id}`),
  update: (id, candidateData) => api.patch(`/candidates/${id}`, candidateData),
  uploadResume: (id, formData) => api.post(`/candidates/${id}/resume`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
};

// Interview API
export const interviewAPI = {
  start: (candidateId) => api.post('/interviews', { candidateId }),
  getAll: () => api.get('/interviews'),
  getById: (id) => api.get(`/interviews/${id}`),
  getCurrentQuestion: (id) => api.get(`/interviews/${id}/current-question`),
  submitAnswer: (id, questionIndex, answer) => 
    api.post(`/interviews/${id}/answer`, { questionIndex, answer }),
  skipQuestion: (id, questionIndex) => 
    api.post(`/interviews/${id}/skip`, { questionIndex }),
  finalize: (id) => api.post(`/interviews/${id}/finalize`),
};

// Utility function to get time limit based on difficulty
export const getTimeLimit = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 20;
    case 'medium': return 60;
    case 'hard': return 120;
    default: return 60;
  }
};

// Utility function to format time
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default api;
