import { GoogleGenerativeAI } from "@google/generative-ai";

export function localScore(question, answer, difficulty) {
  const t = (answer || "").toLowerCase();
  let s = 0;
  const max = difficulty === "easy" ? 8 : difficulty === "medium" ? 10 : 12;
  if (t.length > 40) s += 2;
  if (t.length > 120) s += 2;
  if (/let|const|var/.test(question.toLowerCase())) {
    const hits = ["let", "const", "var", "hoist", "scope", "temporal"].filter(
      (k) => t.includes(k)
    );
    s += Math.min(6, hits.length * 2);
  }
  if (/useState|hook/.test(question.toLowerCase())) {
    const hits = ["state", "setter", "functional", "re-render"].filter((k) =>
      t.includes(k)
    );
    s += Math.min(6, hits.length * 2);
  }
  s = Math.min(s, max);
  const normalized = Math.round((s / max) * 10);
  return { score: normalized, notes: "heuristic" };
}

export async function geminiScore(question, answer) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are an interviewer. Score the answer from 0..10 and give short notes. Respond ONLY JSON like {"score":number,"notes":".."}.
Question: ${question}\nAnswer: ${answer}`;
  try {
    const r = await model.generateContent(prompt);
    const text = r.response.text();
    const json = JSON.parse(text.trim());
    return { score: json.score ?? 0, notes: json.notes ?? "" };
  } catch (e) {
    console.error("Gemini scoring failed", e);
    return null;
  }
}

export function summarizeCandidate(name, items) {
  const avg = items.reduce((a, b) => a + (b.aiScore || 0), 0) / items.length;
  const strong =
    items
      .filter((i) => (i.aiScore || 0) >= 7)
      .map((i) => i.question.split(" ")[0])
      .slice(0, 3)
      .join(", ") || "—";
  const weak =
    items
      .filter((i) => (i.aiScore || 0) <= 4)
      .map((i) => i.question.split(" ")[0])
      .slice(0, 3)
      .join(", ") || "—";
  return `${name || "Candidate"} shows a ${avg.toFixed(
    1
  )}/10 average. Strengths: ${strong}. Areas to improve: ${weak}.`;
}