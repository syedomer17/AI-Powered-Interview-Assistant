import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  resumeText: String,
  resumeFileName: String,
  missingFields: [String],
  interviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interview" }],
  createdAt: { type: Date, default: Date.now }
});

export const Candidate = mongoose.model("Candidate", CandidateSchema);