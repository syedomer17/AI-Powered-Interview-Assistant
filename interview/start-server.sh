#!/bin/bash

# Kill any existing processes on port 8080
echo "🧹 Cleaning up existing processes on port 8080..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "No processes found on port 8080"

# Wait a moment
sleep 1

# Start the server
echo "🚀 Starting the interview backend server..."
cd /home/omar/AI-Powered-Interview-Assistant/interview
npm run dev