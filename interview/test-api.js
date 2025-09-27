#!/usr/bin/env node

// Simple test to verify backend API endpoints
import fetch from 'node-fetch';
import { setTimeout } from 'timers/promises';

const BASE_URL = 'http://localhost:8080';

async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);

    // Test creating a candidate
    const candidateData = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      resumeText: 'Sample resume text for John Doe'
    };

    const candidateResponse = await fetch(`${BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidateData)
    });
    
    if (!candidateResponse.ok) {
      throw new Error(`Failed to create candidate: ${candidateResponse.statusText}`);
    }
    
    const candidate = await candidateResponse.json();
    console.log('✅ Created candidate:', candidate._id);

    // Test starting an interview
    const interviewResponse = await fetch(`${BASE_URL}/api/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId: candidate._id })
    });
    
    if (!interviewResponse.ok) {
      throw new Error(`Failed to start interview: ${interviewResponse.statusText}`);
    }
    
    const interview = await interviewResponse.json();
    console.log('✅ Started interview:', interview._id);
    console.log('✅ Questions generated:', interview.questions.length);

    // Test getting current question
    const currentQuestionResponse = await fetch(`${BASE_URL}/api/interviews/${interview._id}/current-question`);
    const currentQuestion = await currentQuestionResponse.json();
    console.log('✅ Current question:', currentQuestion.questionIndex);

    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  }
}

// Wait a bit for server to start then run tests
setTimeout(2000).then(testAPI);