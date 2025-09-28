// services/resumeParser.js
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // CommonJS package

const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phoneRegex = /(\+?\d[\d\s\-()]{7,}\d)/;

/** Slightly conservative name heuristic */
const nameHeuristic = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (
      line.length > 50 ||
      line.includes("@") ||
      line.includes("http") ||
      line.includes("www.") ||
      line.toLowerCase().includes("resume") ||
      line.toLowerCase().includes("curriculum") ||
      /^\d+/.test(line) ||
      line.includes(":")
    )
      continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4) {
      const isNameLike = words.every(
        (w) => /^[A-Z][a-z]+$/.test(w) || /^[A-Z]\.?$/.test(w)
      );
      if (isNameLike) return line;
    }
  }

  return (
    lines.find(
      (l) =>
        l.length <= 30 &&
        !l.includes("@") &&
        !l.toLowerCase().includes("resume") &&
        l.split(" ").length <= 4
    ) || ""
  );
};

function normalizeText(txt) {
  return txt
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** -------- Robust heading handling -------- */
const CANON_KEYS = new Set([
  "professionalsummary",
  "summary",
  "objective",
  "profile",
  "aboutme",
  "experience",
  "workexperience",
  "employment",
  "education",
  "projects",
  "skills",
  "certifications",
  "achievements",
  "publications",
  "awards",
  "interests",
  "contact",
  "personaldetails",
]);

function normalizeHeading(line) {
  return line.replace(/[^a-z]/gi, "").toLowerCase();
}

function mapKey(norm) {
  if (norm.includes("professionalsummary")) return "professionalsummary";
  if (norm === "summary") return "summary";
  if (norm === "objective") return "objective";
  if (norm === "profile" || norm === "aboutme") return "aboutme";
  if (norm.includes("workexperience") || norm === "experience" || norm === "employment")
    return "experience";
  if (norm === "education") return "education";
  if (norm.startsWith("project")) return "projects";
  if (norm.startsWith("skill")) return "skills";
  if (norm.startsWith("certification")) return "certifications";
  if (norm.startsWith("achievement") || norm.startsWith("award")) return "achievements";
  if (norm.startsWith("publication")) return "publications";
  if (norm.startsWith("interest")) return "interests";
  if (norm.startsWith("contact") || norm.startsWith("personaldetail")) return "contact";
  return "_other";
}

function extractSections(raw) {
  const lines = raw.split("\n");
  const sections = [];
  let current = { title: "_start", content: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    const norm = normalizeHeading(trimmed);

    // Treat as a heading if normalized form maps to a known key
    if (norm && (CANON_KEYS.has(norm) || mapKey(norm) !== "_other")) {
      if (current.content.length) sections.push(current);
      current = { title: mapKey(norm), content: [] };
    } else {
      current.content.push(line);
    }
  }
  if (current.content.length) sections.push(current);

  const out = {};
  for (const s of sections) {
    const key = s.title;
    const text = normalizeText(s.content.join("\n"));
    if (!out[key]) out[key] = text;
    else out[key] += `\n\n${text}`;
  }
  return out;
}

function pickSummaryLike(sections) {
  if (sections.professionalsummary) return sections.professionalsummary;
  if (sections.summary) return sections.summary;
  if (sections.objective) return sections.objective;
  if (sections.aboutme) return sections.aboutme;
  return "";
}

function generateFallbackSummary(raw, maxWords = 120) {
  const skipPatterns = [
    /@/i,
    /http/i,
    /www\./i,
    /^\+?\d[\d\s\-()]{7,}\d$/,
    /address/i,
    /linkedin|github|portfolio/i,
    /email/i,
  ];

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !skipPatterns.some((rx) => rx.test(l)));

  const firstPara = lines.slice(0, 12).join(" ");
  const words = firstPara.split(/\s+/);
  return words.slice(0, maxWords).join(" ").trim();
}

/** -------- File readers -------- */
async function extractTextFromPdf(filePath) {
  const buf = fs.readFileSync(filePath);
  const data = await pdfParse(buf);
  return data.text || "";
}

async function extractTextFromDocx(filePath) {
  const { value } = await mammoth.extractRawText({ path: filePath });
  return value || "";
}

/** -------- Public API: return ONLY summary + basic fields -------- */
export async function extractResumeSummary(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let raw = "";

  if (ext === ".pdf") {
    try {
      raw = await extractTextFromPdf(filePath);
    } catch {
      throw new Error(
        "Failed to extract text from PDF. It may be corrupted, password-protected, or image-based."
      );
    }
  } else if (ext === ".docx") {
    raw = await extractTextFromDocx(filePath);
  } else {
    // Router restricts to PDF/DOCX, but keep a guard
    throw new Error("Unsupported file type. Only PDF or DOCX are allowed.");
  }

  raw = normalizeText(raw);
  if (!raw) throw new Error("No text content found in the file.");

  const sections = extractSections(raw);
  let summary = pickSummaryLike(sections)?.trim();
  if (!summary) summary = generateFallbackSummary(raw);

  const email = raw.match(emailRegex)?.[0]?.trim() || "";
  const phone = raw.match(phoneRegex)?.[0]?.trim() || "";
  const name = nameHeuristic(raw).trim();

  return {
    extracted: { name, email, phone, summary },
  };
}
