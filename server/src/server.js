import express from "express";
import multer from "multer";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import env from "./config/env.js";

import parseResume from "./lib/resume.js";

import connectDB from "./config/db.js";

connectDB();
// Express app
const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // buffer upload

// Security & parsing
app.use(helmet());
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Resume upload
app.post("/api/upload", upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await parseResume(req.file);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error", status });
});

// Start server
const port = env.PORT || 8080;
app.listen(port, () =>
  console.log(`🚀 Backend listening on http://localhost:${port}`)
);
