import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateAPI, interviewAPI } from '../services/api';

const CandidateFlow = () => {
  const [step, setStep] = useState(1);
  const [candidateData, setCandidateData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [candidateId, setCandidateId] = useState(null);
  const navigate = useNavigate();

  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await candidateAPI.create(candidateData);
      setCandidateId(response.data._id);
      setStep(2);
    } catch (err) {
      setError('Failed to create candidate profile. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please select a resume file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      
      const response = await candidateAPI.uploadResume(candidateId, formData);
      
      // Update candidate with parsed resume data if available
      if (response.data.resumeText) {
        const updatedData = {
          resumeText: response.data.resumeText,
          extractedData: response.data.extractedData
        };
        await candidateAPI.update(candidateId, updatedData);
      }
      
      setStep(3);
    } catch (err) {
      setError('Failed to upload resume. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await interviewAPI.start(candidateId);
      // Store the interview ID for persistence
      localStorage.setItem('currentInterviewId', response.data._id);
      navigate(`/interview/${response.data._id}`);
    } catch (err) {
      setError('Failed to start interview. Please try again.');
      console.error(err);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload only PDF or DOCX files');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      setResumeFile(file);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 text-xs sm:text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : 'bg-white text-gray-500 border-gray-300'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                    step > stepNum ? 'bg-indigo-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Profile</span>
            <span>Resume</span>
            <span>Interview</span>
          </div>
        </div>

        <div className="bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-10 shadow rounded-lg">
          {/* Step 1: Candidate Information */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Your Profile</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Let's start with your basic information
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCandidateSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateData.name}
                    onChange={(e) => setCandidateData({...candidateData, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={candidateData.email}
                    onChange={(e) => setCandidateData({...candidateData, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={candidateData.phone}
                    onChange={(e) => setCandidateData({...candidateData, phone: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating Profile...' : 'Continue'}
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Resume Upload */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upload Your Resume</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Upload your resume in PDF or DOCX format (max 2MB)
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleResumeUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume File *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOCX up to 2MB</p>
                      {resumeFile && (
                        <p className="text-sm text-indigo-600">Selected: {resumeFile.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !resumeFile}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Ready for Interview */}
          {step === 3 && (
            <div className="text-center">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">You're All Set!</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your profile and resume have been uploaded successfully. Ready to start your AI interview?
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Interview Guidelines:</strong><br />
                      • Answer questions in a chat-like interface<br />
                      • Each question has a time limit<br />
                      • You can see your progress throughout<br />
                      • Get instant AI feedback after each answer
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartInterview}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Starting Interview...' : 'Start Interview'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateFlow;