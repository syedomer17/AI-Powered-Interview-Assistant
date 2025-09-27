# 🧪 Postman Testing Guide - AI Interview Assistant API

## 📋 Qui**POST** `http://localhost:8081/api/candidates/{candidateId}/resume`k Setup (Port 8081)

### 1. Import Files into Postman
1**GET** `http://localhost:8081/api/candidates/{candidateId}` Open Postman
2. Cl**PATCH** `http://localhost:8081/api/candidates/{candidateId}`ck **Import** button
3. Import these two files:
   - `AI_Intervie**GET** `http://localhost:8081/api/interviews/{interviewId}/current-question`_Assistant_API.postman**POST** `http://localhost:8081/api/interviews/{interviewId}/answer`collection.json` (Collectio**POST** `http://localhost:8081/api/interviews/{interviewId}/skip`)
   - `AI_Interview_Assistant.postman_environment**POST** `http://localhost:8081/api/interviews/{interviewId}/finalize`json` (Environment)

### 2. Set Environment
- Select **"AI Interview Assistant Environment"** from environment dropdown
- Verify `baseUrl` is set to `http://localhost:8081`

## API Endpoints for Testing

### 1. Health Check
**GET** `http://localhost:8081/health`

**Headers**: None required

**Expected Response**:
```json
{
  "ok": true
}
```

---

### 2. Create Candidate
**POST** `http://localhost:8081/api/candidates`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "resumeText": "John Doe is a Full Stack Developer with 5 years of experience in React and Node.js..."
}
```

**Expected Response**:
```json
{
  "_id": "68d7c246d8be2d05890a5cfc",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "resumeText": "John Doe is a Full Stack Developer...",
  "missingFields": [],
  "interviews": [],
  "createdAt": "2025-09-27T..."
}
```

---

### 3. Upload Resume File
**POST** `http://localhost:8080/api/candidates/{candidate_id}/resume`

**Headers**: None (Content-Type will be set automatically for multipart)

**Body** (form-data):
- Key: `file`
- Type: File
- Value: Upload a .docx or .txt file

**Expected Response**:
```json
{
  "candidate": {
    "_id": "68d7c246d8be2d05890a5cfc",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "resumeText": "Extracted text from file...",
    "resumeFileName": "john_resume.docx",
    "missingFields": []
  },
  "extracted": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  },
  "missingFields": []
}
```

---

### 4. Get All Candidates
**GET** `http://localhost:8081/api/candidates`

**Headers**: None required

**Expected Response**:
```json
[
  {
    "_id": "68d7c246d8be2d05890a5cfc",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "latestFinalScore": null,
    "latestSummary": null,
    "totalInterviews": 0,
    "createdAt": "2025-09-27T..."
  }
]
```

---

### 5. Get Specific Candidate
**GET** `http://localhost:8080/api/candidates/{candidate_id}`

**Headers**: None required

**Expected Response**:
```json
{
  "_id": "68d7c246d8be2d05890a5cfc",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "resumeText": "Full resume text...",
  "interviews": [],
  "createdAt": "2025-09-27T..."
}
```

---

### 6. Update Candidate Info
**PATCH** `http://localhost:8080/api/candidates/{candidate_id}`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "name": "John Smith",
  "phone": "+1987654321"
}
```

**Expected Response**:
```json
{
  "_id": "68d7c246d8be2d05890a5cfc",
  "name": "John Smith",
  "email": "john.doe@example.com",
  "phone": "+1987654321",
  "missingFields": []
}
```

---

### 7. Start Interview
**POST** `http://localhost:8081/api/interviews`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "candidateId": "68d7c246d8be2d05890a5cfc"
}
```

**Expected Response**:
```json
{
  "_id": "68d7c248d8be2d05890a5d00",
  "candidate": "68d7c246d8be2d05890a5cfc",
  "status": "in_progress",
  "questions": [
    {
      "text": "What is the difference between let, const, and var in JavaScript?",
      "difficulty": "Easy",
      "idealAnswer": "let and const are block-scoped while var is function-scoped...",
      "startedAt": "2025-09-27T...",
      "_id": "68d7c248d8be2d05890a5d01"
    }
    // ... 5 more questions
  ],
  "createdAt": "2025-09-27T..."
}
```

---

### 8. Get Current Question
**GET** `http://localhost:8080/api/interviews/{interview_id}/current-question`

**Headers**: None required

**Expected Response**:
```json
{
  "question": {
    "_id": "68d7c248d8be2d05890a5d01",
    "text": "What is the difference between let, const, and var in JavaScript?",
    "difficulty": "Easy",
    "idealAnswer": "let and const are block-scoped while var is function-scoped...",
    "startedAt": "2025-09-27T..."
  },
  "questionIndex": 1,
  "totalQuestions": 6,
  "completed": false
}
```

---

### 9. Submit Answer
**POST** `http://localhost:8080/api/interviews/{interview_id}/answer`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "questionIndex": 0,
  "answer": "let and const are block-scoped while var is function-scoped. const cannot be reassigned after declaration."
}
```

**Expected Response**:
```json
{
  "success": true,
  "score": 8.5,
  "reasoning": "Good understanding of scope differences and const behavior",
  "completed": false
}
```

---

### 10. Skip Question
**POST** `http://localhost:8080/api/interviews/{interview_id}/skip`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "questionIndex": 0
}
```

**Expected Response**:
```json
{
  "success": true,
  "completed": false
}
```

---

### 11. Get All Interviews
**GET** `http://localhost:8081/api/interviews`

**Headers**: None required

**Expected Response**:
```json
[
  {
    "_id": "68d7c248d8be2d05890a5d00",
    "candidate": {
      "_id": "68d7c246d8be2d05890a5cfc",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890"
    },
    "status": "in_progress",
    "finalScore": null,
    "summary": null,
    "createdAt": "2025-09-27T..."
  }
]
```

---

### 12. Finalize Interview
**POST** `http://localhost:8080/api/interviews/{interview_id}/finalize`

**Headers**: None required

**Expected Response**:
```json
{
  "_id": "68d7c248d8be2d05890a5d00",
  "status": "completed",
  "finalScore": 7.5,
  "summary": "Interview Summary for John Doe: Answered 6/6 questions with an average score of 7.5/10. Strong performance with good technical knowledge.",
  "finalizedAt": "2025-09-27T..."
}
```

## Postman Collection JSON

You can import this JSON into Postman:

```json
{
  "info": {
    "name": "AI Interview Assistant API",
    "description": "Complete API collection for testing the AI-Powered Interview Assistant"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Create Candidate",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john.doe@example.com\",\n  \"phone\": \"+1234567890\",\n  \"resumeText\": \"John Doe is a Full Stack Developer...\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/candidates",
          "host": ["{{baseUrl}}"],
          "path": ["api", "candidates"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080"
    }
  ]
}
```

## Testing Workflow

1. **Start with Health Check** - Verify server is running
2. **Create a Candidate** - Copy the returned `_id`
3. **Upload Resume** (optional) - Use the candidate ID
4. **Start Interview** - Use candidate ID, copy interview `_id`
5. **Get Current Question** - Use interview ID
6. **Submit Answers** - Submit answers for each question (0-5)
7. **Finalize Interview** - Complete the interview process
8. **Check Results** - Get interview details with scores

## Environment Variables

Set up Postman environment variables:
- `baseUrl`: `http://localhost:8080`
- `candidateId`: (copy from create candidate response)
- `interviewId`: (copy from start interview response)

This will allow you to reuse IDs across different requests easily!