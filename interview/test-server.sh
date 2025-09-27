#!/bin/bash

echo "🧪 Testing server startup..."

# Start server in background
cd /home/omar/AI-Powered-Interview-Assistant/interview
npm run dev > server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
echo "Testing health endpoint..."
RESPONSE=$(curl -s http://localhost:8080/health)

if [[ "$RESPONSE" == *"ok"* ]]; then
    echo "✅ Server is working correctly!"
    echo "Response: $RESPONSE"
else
    echo "❌ Server test failed"
    echo "Response: $RESPONSE"
fi

# Clean up
kill $SERVER_PID 2>/dev/null
echo "🧹 Server stopped"