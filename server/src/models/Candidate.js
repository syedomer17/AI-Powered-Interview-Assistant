import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema({
  at: { type: Date, default: Date.now },
  sender: { type: String, enum: ['system','bot','user'], required: true },
  text: { type: String, required: true }
}, { _id: false });

const QAItemSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  difficulty: { type: String, enum: ['easy','medium','hard'], required: true },
  question: { type: String, required: true },
  answer: { type: String },
  secondsAllowed: { type: Number, required: true },
  aiScore: { type: Number },
  aiNotes: { type: String }
}, { _id: false });

const CandidateSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  uploadedFileName: String,
  status: { type: String, enum: ['collecting-profile','in-progress','completed'], default: 'collecting-profile' },
  role: { type: String, default: 'fullstack-react-node' },
  currentIndex: { type: Number, default: 0 },
  items: { type: [QAItemSchema], default: [] },
  chat: { type: [ChatMessageSchema], default: [] },
  totalScore: { type: Number, default: 0 },
  summary: { type: String },
  startedAt: { type: Date },
  finishedAt: { type: Date }
}, { timestamps: true });

CandidateSchema.index({ totalScore: -1, createdAt: -1 });

const Candidate = mongoose.model('Candidate', CandidateSchema);
export default Candidate;