import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  text: String,
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  idealAnswer: String,
  answer: String,
  score: Number,
  reasoning: String,
  startedAt: Date,
  answeredAt: Date,
  timedOut: { type: Boolean, default: false }
});

const InterviewSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
  questions: [QuestionSchema],
  status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
  finalScore: Number,
  summary: String,
  createdAt: { type: Date, default: Date.now },
  finalizedAt: Date
});

export const Interview = mongoose.model("Interview", InterviewSchema);