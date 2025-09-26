import { randomUUID } from "node:crypto";

const EASY = [
  "What is the difference between let, const, and var in JavaScript?",
  "Explain how useState works in React.",
  "What is npm and what does package.json do?",
  "How do you handle environment variables in a React + Vite app?",
];
const MEDIUM = [
  "Describe how you would design a pagination API in Node/Express and consume it in React.",
  "What are React keys and why are they important? Provide pitfalls.",
  "Explain middleware in Express and give a real-world example.",
  "How would you debounce a search input in React without external libs?",
];
const HARD = [
  "Design a production-grade authentication flow for a React/Node app (tokens, refresh, cookies, CSRF).",
  "How would you scale a chat service (WebSockets, backpressure, horizontal scaling)?",
  "Explain React concurrent features and how they impact large forms or dashboards.",
  "Outline an indexing strategy for a MongoDB collection that supports text search and range filters.",
];

function pick(arr, n) {
  const a = [...arr];
  const out = [];
  while (n-- && a.length) {
    out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
  }
  return out;
}

export function buildInterview() {
  const easy = pick(EASY, 2).map((q, i) => ({
    questionId: `easy-${i}-${randomUUID()}`,
    difficulty: "easy",
    question: q,
    secondsAllowed: 20,
  }));
  const medium = pick(MEDIUM, 2).map((q, i) => ({
    questionId: `medium-${i}-${randomUUID()}`,
    difficulty: "medium",
    question: q,
    secondsAllowed: 60,
  }));
  const hard = pick(HARD, 2).map((q, i) => ({
    questionId: `hard-${i}-${randomUUID()}`,
    difficulty: "hard",
    question: q,
    secondsAllowed: 120,
  }));
  return [...easy, ...medium, ...hard];
}
