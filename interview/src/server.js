import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";       // { PORT, ALLOWED_ORIGINS, ... }
import { connectDB } from "./config/db.js";  // your Mongo connect
import candidatesRoute from "./routes/candidates.js";
import interviewsRoute from "./routes/interviews.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


connectDB();
const PORT = env.PORT || 8080;

const app = express();

app.use(express.static(path.join(__dirname, "dist")));

app.use(express.json());

// 3) CORS (simple allowlist via env)
    const allowed =
      env.ALLOWED_ORIGINS?.split(",").map(s => s.trim()).filter(Boolean) || ["*"];
    app.use(
      cors({
        origin: (origin, cb) => {
          if (!origin || allowed.includes("*") || allowed.includes(origin)) return cb(null, true);
          return cb(new Error("Not allowed by CORS"));
        },
      })
    );

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/uploads", express.static("uploads"));
app.get("/health", (_req, res) => res.json({ ok: true }));

// 4) API routes
app.use("/api/candidates", candidatesRoute);
app.use("/api/interviews", interviewsRoute);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});