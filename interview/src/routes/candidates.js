import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Candidate } from "../models/Candidate.js";
import { extractResumeData } from "../services/resumeParser.js";

const router = express.Router();
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, resumeText } = req.body;
    const missing = ["name", "email", "phone"].filter((f) => !req.body[f]);
    const candidate = await Candidate.create({
      name,
      email,
      phone,
      resumeText,
      missingFields: missing,
    });
    res.status(201).json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create candidate" });
  }
});

// Upload and process resume
router.post("/:id/resume", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const allowedTypes = [".pdf", ".docx"];
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      return res
        .status(400)
        .json({ error: "Invalid file type. Only PDF and DOCX supported." });
    }

    // ✅ Extract clean text and metadata (no binary gibberish)
    const { rawText, extracted } = await extractResumeData(req.file.path);

    candidate.resumeText = rawText;          // plain text
    candidate.resumeFileName = req.file.originalname;

    ["name", "email", "phone"].forEach((f) => {
      if (!candidate[f] && extracted[f]) candidate[f] = extracted[f];
    });

    candidate.missingFields = ["name", "email", "phone"].filter(
      (f) => !candidate[f]
    );

    await candidate.save();

    // Cleanup temp file
    fs.unlink(req.file.path, () => {});

    res.json({
      candidate,
      extracted,
      missingFields: candidate.missingFields,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to process resume" });
  }
});

router.get("/", async (_req, res) => {
  const candidates = await Candidate.find()
    .populate("interviews")
    .sort({ createdAt: -1 });
  const formatted = candidates.map((c) => ({
    _id: c._id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    latestFinalScore:
      c.interviews.filter((i) => i.status === "completed").slice(-1)[0]
        ?.finalScore ?? null,
    latestSummary:
      c.interviews.filter((i) => i.status === "completed").slice(-1)[0]
        ?.summary ?? null,
    totalInterviews: c.interviews.length,
    createdAt: c.createdAt,
  }));
  res.json(formatted);
});

router.get("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate(
      "interviews"
    );
    if (!candidate) return res.status(404).json({ error: "Not found" });
    res.json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get candidate" });
  }
});

// Update candidate missing fields
router.patch("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Update provided fields
    if (name !== undefined) candidate.name = name;
    if (email !== undefined) candidate.email = email;
    if (phone !== undefined) candidate.phone = phone;

    // Recalculate missing fields
    candidate.missingFields = ["name", "email", "phone"].filter(
      (f) => !candidate[f]
    );

    await candidate.save();
    res.json(candidate);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update candidate" });
  }
});

export default router;
