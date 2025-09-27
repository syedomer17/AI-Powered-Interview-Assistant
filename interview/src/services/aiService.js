import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

function safeJson(str) {
  try {
    return JSON.parse(
      str
        .trim()
        .replace(/^```json/i, "")
        .replace(/```$/i, "")
    );
  } catch {
    return null;
  }
}

export async function generateQuestions(role = "Full Stack (React/Node)") {
  const prompt = `
Generate exactly 6 interview questions for a ${role} position:
- 2 Easy questions (basic concepts, simple coding problems)
- 2 Medium questions (intermediate concepts, problem-solving)  
- 2 Hard questions (advanced concepts, complex scenarios)

Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "text": "Question here",
      "difficulty": "Easy|Medium|Hard",
      "idealAnswer": "Expected answer here"
    }
  ]
}

Make questions practical and relevant to the role.
`;

  try {
    const res = await model.generateContent(prompt);
    const responseText = res.response.text();
    const parsed = safeJson(responseText);
    
    if (!parsed?.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response format from AI");
    }
    
    if (parsed.questions.length !== 6) {
      throw new Error(`Expected 6 questions, got ${parsed.questions.length}`);
    }

    // Validate each question has required fields
    for (const q of parsed.questions) {
      if (!q.text || !q.difficulty || !q.idealAnswer) {
        throw new Error("Missing required question fields");
      }
      if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) {
        throw new Error(`Invalid difficulty: ${q.difficulty}`);
      }
    }

    return parsed.questions;
  } catch (error) {
    console.error("AI question generation failed:", error);
    // Fallback questions
    return getFallbackQuestions(role);
  }
}

export async function scoreAnswer(question, idealAnswer, userAnswer) {
  const prompt = `
Evaluate an answer.
Question: ${question}
Ideal Answer: ${idealAnswer}
Candidate Answer: ${userAnswer}
Return JSON ONLY: { "score": number (0-10), "reasoning": "short reason" }.
`;
  const res = await model.generateContent(prompt);
  const parsed = safeJson(res.response.text());
  return parsed?.score
    ? parsed
    : { score: 0, reasoning: "Could not parse score" };
}

export async function summarizeInterview(candidate, interview) {
  const prompt = `
Create a concise professional summary for an interview.
Candidate:
Name: ${candidate.name || "Unknown"}
Email: ${candidate.email || "Unknown"}
Phone: ${candidate.phone || "Unknown"}
Questions & Scores:
${interview.questions
  .map(
    (q) =>
      `Q: ${q.text}\nDifficulty: ${q.difficulty}\nScore: ${
        q.score ?? "N/A"
      }\nAnswer: ${q.answer || "(none)"}`
  )
  .join("\n\n")}

Return JSON ONLY: { "summary": "professional summary here" }
`;

  try {
    const res = await model.generateContent(prompt);
    const parsed = safeJson(res.response.text());
    return parsed?.summary || generateFallbackSummary(candidate, interview);
  } catch (error) {
    console.error("AI summary generation failed:", error);
    return generateFallbackSummary(candidate, interview);
  }
}

function getFallbackQuestions(role) {
  return [
    {
      text: "What is the difference between let, const, and var in JavaScript?",
      difficulty: "Easy",
      idealAnswer: "let and const are block-scoped while var is function-scoped. const cannot be reassigned after declaration."
    },
    {
      text: "Explain the concept of React components and their lifecycle.",
      difficulty: "Easy", 
      idealAnswer: "React components are reusable pieces of UI. They have lifecycle methods like componentDidMount, componentDidUpdate, etc."
    },
    {
      text: "How would you implement user authentication in a React/Node.js application?",
      difficulty: "Medium",
      idealAnswer: "Use JWT tokens, implement login/logout endpoints, store tokens securely, and protect routes on both frontend and backend."
    },
    {
      text: "Explain the difference between SQL and NoSQL databases and when to use each.",
      difficulty: "Medium",
      idealAnswer: "SQL databases are relational with structured schema, NoSQL are flexible. Use SQL for complex relationships, NoSQL for scalability."
    },
    {
      text: "Design a scalable system for handling millions of user requests per day.",
      difficulty: "Hard", 
      idealAnswer: "Use load balancers, microservices, caching layers, database sharding, CDNs, and horizontal scaling strategies."
    },
    {
      text: "Explain how you would optimize a slow-performing React application.",
      difficulty: "Hard",
      idealAnswer: "Use React.memo, useMemo, useCallback, code splitting, lazy loading, optimize bundle size, and implement virtual scrolling."
    }
  ];
}

function generateFallbackSummary(candidate, interview) {
  const totalQuestions = interview.questions.length;
  const answeredQuestions = interview.questions.filter(q => q.answer && !q.timedOut).length;
  const averageScore = interview.finalScore || 0;
  
  return `Interview Summary for ${candidate.name || 'Candidate'}: 
Answered ${answeredQuestions}/${totalQuestions} questions with an average score of ${averageScore}/10. 
${averageScore >= 7 ? 'Strong performance with good technical knowledge.' : 
  averageScore >= 5 ? 'Moderate performance with room for improvement.' : 
  'Needs significant improvement in technical skills.'}`
}
