import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import candidatesRoute from "./routes/candidates.js";
import interviewsRoute from './routes/interviews.js'

export function createApp() {
  const app = express();

  const origins = env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || ["*"];
  app.use(cors({ origin: (origin, cb) => !origin || origins.includes("*") || origins.includes(origin) ? cb(null, true) : cb(new Error("Not allowed by CORS")) }));

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use("/uploads", express.static("uploads"));
  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/candidates", candidatesRoute);
  app.use("/api/interviews", interviewsRoute);

  // 404 handler for unmatched routes
  app.use("*", (req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation error", details: err.message });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: "File too large" });
    }

    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });

  return app;
}
