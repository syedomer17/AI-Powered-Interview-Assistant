// models/Candidate.js
import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    // Only store the summary + file metadata
    resumeSummary: { type: String, default: "" },
    resumeFileName: { type: String, default: "" },
    resumeFilePath: { type: String, default: "" },

    missingFields: { type: [String], default: [] },
    interviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interview" }],
  },
  { timestamps: true } // provides createdAt / updatedAt
);

export const Candidate = mongoose.model("Candidate", CandidateSchema);
