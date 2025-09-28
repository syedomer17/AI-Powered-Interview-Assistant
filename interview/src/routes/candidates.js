// routes/candidates.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Candidate } from "../models/Candidate.js";
import { extractResumeSummary } from "../services/resumeParser.js";

const router = express.Router();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: function (_req, file, cb) {
    const allowed = [".pdf", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext)
      ? cb(null, true)
      : cb(new Error("Invalid file type. Only PDF and DOCX files are allowed."));
  },
});

/** Create candidate (no resume text here) */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const missing = ["name", "email", "phone"].filter((f) => !req.body[f]);

    const candidate = await Candidate.create({
      name,
      email,
      phone,
      resumeSummary: "",      // <- we only store summary
      resumeFileName: "",
      resumeFilePath: "",
      missingFields: missing,
    });

    res.status(201).json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create candidate" });
  }
});

/** Upload resume -> parse -> store ONLY summary (+ file meta) */
router.post("/:id/resume", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Validate extension (multer already did; this is extra safety)
    const allowed = [".pdf", ".docx"];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(400)
        .json({ error: "Invalid file type. Only PDF and DOCX supported." });
    }

    try {
      const { extracted } = await extractResumeSummary(req.file.path);

      // If older docs had full text, ensure we don't keep it
      if ("resumeText" in candidate) candidate.resumeText = undefined;
      if ("resumeSections" in candidate) candidate.resumeSections = undefined;

      // Store only summary + file metadata
      candidate.resumeSummary = extracted.summary || "";
      candidate.resumeFileName = req.file.originalname;
      candidate.resumeFilePath = req.file.path;

      // Backfill PII if missing
      ["name", "email", "phone"].forEach((f) => {
        if (!candidate[f] && extracted[f]) candidate[f] = extracted[f];
      });

      candidate.missingFields = ["name", "email", "phone"].filter((f) => !candidate[f]);

      await candidate.save();

      res.json({
        candidate,
        extracted, // { name, email, phone, summary }
        missingFields: candidate.missingFields,
      });
    } catch (extractionError) {
      console.error("Resume extraction error:", extractionError);
      fs.unlink(req.file.path, () => {});
      res.status(500).json({ error: "Failed to process resume file" });
    }
  } catch (e) {
    console.error(e);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: "Failed to process resume" });
  }
});

/** List candidates (optionally include resumeSummary) */
router.get("/", async (_req, res) => {
  const candidates = await Candidate.find().populate("interviews").sort({ createdAt: -1 });
  const formatted = candidates.map((c) => ({
    _id: c._id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    resumeSummary: c.resumeSummary ?? null,
    latestFinalScore:
      c.interviews.filter((i) => i.status === "completed").slice(-1)[0]?.finalScore ?? null,
    latestSummary:
      c.interviews.filter((i) => i.status === "completed").slice(-1)[0]?.summary ?? null,
    totalInterviews: c.interviews.length,
    createdAt: c.createdAt,
  }));
  res.json(formatted);
});

router.get("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate("interviews");
    if (!candidate) return res.status(404).json({ error: "Not found" });
    res.json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get candidate" });
  }
});

/** Download resume file (optional feature) */
router.get("/:id/resume/download", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    if (!candidate.resumeFilePath || !fs.existsSync(candidate.resumeFilePath)) {
      return res.status(404).json({ error: "Resume file not found" });
    }

    res.download(candidate.resumeFilePath, candidate.resumeFileName);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to download resume" });
  }
});

/** Update candidate (name/email/phone) */
router.patch("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    if (name !== undefined) candidate.name = name;
    if (email !== undefined) candidate.email = email;
    if (phone !== undefined) candidate.phone = phone;

    candidate.missingFields = ["name", "email", "phone"].filter((f) => !candidate[f]);

    await candidate.save();
    res.json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update candidate" });
  }
});

export default router;
