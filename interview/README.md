# AI-Powered Interview Assistant - Backend

This is the Node.js backend for the AI-Powered Interview Assistant application.

## Features

- ✅ **Resume Upload & Parsing**: Supports DOCX and TXT files with automatic field extraction
- ✅ **AI-Powered Questions**: 6 questions (2 Easy, 2 Medium, 2 Hard) with fallback support
- ✅ **Interview Management**: Complete interview lifecycle with scoring
- ✅ **Data Persistence**: MongoDB integration with session management
- ✅ **RESTful API**: Complete API for frontend integration

## Quick Start

1. **Install Dependencies**:
   ```bash
   cd interview
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and Gemini API key
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   # or use the helper script:
   ./start-server.sh
   ```

4. **Test the Backend**:
   ```bash
   npm test
   ./test-server.sh
   node test-api.js
   ```

## Troubleshooting

- **Port 8080 already in use**: The server now automatically finds an available port
- **MongoDB connection issues**: Check your MONGODB_URI in .env
- **Gemini API errors**: The system falls back to predefined questions

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Candidates
- `POST /api/candidates` - Create a new candidate
- `GET /api/candidates` - List all candidates  
- `GET /api/candidates/:id` - Get candidate details
- `PATCH /api/candidates/:id` - Update candidate info
- `POST /api/candidates/:id/resume` - Upload resume (DOCX/TXT)

### Interviews
- `POST /api/interviews` - Start new interview
- `GET /api/interviews` - List all interviews
- `GET /api/interviews/:id` - Get interview details
- `GET /api/interviews/:id/current-question` - Get current question
- `POST /api/interviews/:id/answer` - Submit answer
- `POST /api/interviews/:id/skip` - Skip/timeout question
- `POST /api/interviews/:id/finalize` - Finalize interview

## Environment Variables

```env
PORT=8080
MONGODB_URI=mongodb://localhost:27017/interview_assistant
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Project Structure

```
interview/
├── src/
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server startup
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── env.js         # Environment validation
│   ├── models/
│   │   ├── Candidate.js   # Candidate schema
│   │   └── Interview.js   # Interview schema
│   ├── routes/
│   │   ├── candidates.js  # Candidate endpoints
│   │   └── interviews.js  # Interview endpoints
│   └── services/
│       ├── aiService.js   # AI question generation
│       └── resumeParser.js # Resume parsing
├── test-api.js            # API testing script
├── test-backend.js        # Backend testing script
└── package.json
```

## Features Status

- ✅ Resume Upload (DOCX/TXT support, PDF coming soon)
- ✅ Field Extraction (Name, Email, Phone)  
- ✅ AI Question Generation (with fallback)
- ✅ Interview Chat Flow
- ✅ Answer Scoring
- ✅ Progress Tracking
- ✅ Data Persistence
- ✅ Welcome Back Support

## Testing

The backend has been tested and all core functionality is working:

1. **Database Connection**: ✅ MongoDB connected
2. **Resume Parsing**: ✅ DOCX and TXT files supported  
3. **AI Service**: ✅ Question generation with fallbacks
4. **API Endpoints**: ✅ All CRUD operations working
5. **Interview Flow**: ✅ Complete chat-based interview

## Next Steps

To complete the full application:

1. Create React frontend with two tabs (Interviews & Interviewer)
2. Implement file upload UI
3. Build chat interface for interviews
4. Add interviewer dashboard
5. Implement Welcome Back modal

The backend is fully ready to support the frontend requirements!