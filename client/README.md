# AI-Powered Interview Assistant - Frontend

A modern, responsive React application for conducting AI-powered technical interviews with real-time chat interface, resume parsing, and comprehensive scoring.

## Features

### For Candidates
- **Easy Registration**: Simple 3-step process with profile creation and resume upload
- **Resume Upload**: PDF/DOCX support with validation and 2MB limit
- **Real-time Chat Interface**: Interactive interview experience with AI-generated questions
- **Timer System**: 2-minute time limit per question with visual indicators
- **Progress Tracking**: Real-time progress bar and question counter
- **Session Persistence**: Resume interrupted interviews with "Welcome Back" modal
- **Mobile Responsive**: Optimized for all device sizes

### For Interviewers
- **Comprehensive Dashboard**: View all candidates with search and filtering
- **Detailed Analytics**: Candidate scores, interview status, and completion rates
- **Candidate Profiles**: Complete view of candidate information and resume
- **Interview History**: Detailed question-by-question breakdown with AI feedback
- **Score Analysis**: Color-coded scoring system and performance metrics
- **Search & Sort**: Find candidates by name, email, score, or interview status

### Technical Features
- **React Router DOM**: Client-side routing for smooth navigation
- **Tailwind CSS**: Modern, responsive design with utility-first CSS
- **Axios Integration**: RESTful API integration with the backend
- **LocalStorage Persistence**: Resume interrupted sessions
- **Real-time Updates**: Dynamic question loading and answer submission
- **Error Handling**: Comprehensive error messages and loading states
- **File Validation**: Resume upload validation with proper error feedback

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

## Application Structure

```
src/
├── components/
│   └── WelcomeBackModal.jsx    # Session persistence modal
├── pages/
│   ├── HomePage.jsx            # Landing page
│   ├── CandidateFlow.jsx       # Registration and resume upload
│   ├── InterviewChat.jsx       # Real-time interview interface
│   ├── InterviewerDashboard.jsx # Dashboard for interviewers
│   └── CandidateDetails.jsx    # Detailed candidate view
├── services/
│   └── api.js                  # API integration layer
├── App.jsx                     # Main app with routing
├── App.css                     # Custom styles and animations
└── index.css                   # Tailwind CSS imports
```

## Usage

### For Candidates
1. Visit homepage and click "Start Interview"
2. Register with name, email, and phone
3. Upload PDF/DOCX resume (max 2MB)
4. Take the AI-powered interview
5. Get real-time feedback and scoring

### For Interviewers
1. Visit homepage and click "Interviewer Dashboard"
2. View all candidates and their interview status
3. Search, filter, and sort candidates
4. Click "View Details" to see complete profiles and interview history

## Technologies Used

- **React 19** - UI framework with latest features
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Vite** - Fast development build tool

## Responsive Design

Fully responsive across all devices:
- **Desktop**: Multi-column layouts with full features
- **Tablet**: Adapted layouts with touch-friendly interfaces  
- **Mobile**: Single-column optimized layouts

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Configuration

The application connects to the backend API at `http://localhost:8080/api`. 
Update the `API_BASE_URL` in `src/services/api.js` if needed.

## Features Implementation

### Session Persistence
- Uses localStorage to track active interviews
- "Welcome Back" modal for interrupted sessions
- Automatic progress restoration

### Real-time Chat Interface
- 2-minute timer per question
- Visual progress indicators
- Auto-submit on timeout
- Instant feedback display

### File Upload
- Drag-and-drop support
- File type validation (PDF, DOCX)
- Size limit enforcement (2MB)
- Progress feedback

### Dashboard Features
- Real-time search and filtering
- Sortable columns
- Detailed candidate views
- Interview analytics

This frontend application provides a complete, production-ready interface for the AI-Powered Interview Assistant system.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
