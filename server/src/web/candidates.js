import { Router } from 'express';
import Candidate from '../models/Candidate.js';
import { upload } from '../middleware/upload.js';
import { parseResume } from '../lib/resume.js';
import { buildInterview } from '../lib/questions.js';
import { AnswerSchema, ProfileSchema, parseOrThrow } from '../utils/validate.js';
import { geminiScore, localScore, summarizeCandidate } from '../lib/score.js';

const router = Router();

// Create from resume upload
router.post('/upload-resume', upload.single('resume'), async (req, res, next) => {
  try{
    if (!req.file) throw Object.assign(new Error('No file uploaded'), { status: 400 });
    const { fields } = await parseResume(req.file);
    const candidate = await Candidate.create({
      ...fields,
      uploadedFileName: req.file.originalname,
      status: 'collecting-profile',
      chat: [{ sender:'system', text:'Welcome to Crisp! Please confirm Name, Email, Phone to begin.' }]
    });
    res.json(candidate);
  }catch(e){ next(e); }
});

// Update profile (and auto-start if complete)
router.patch('/candidates/:id/profile', async (req, res, next) => {
  try{
    const id = req.params.id;
    const data = parseOrThrow(ProfileSchema, req.body);
    const cand = await Candidate.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!cand) throw Object.assign(new Error('Candidate not found'), { status: 404 });

    if (cand.name && cand.email && cand.phone && cand.status !== 'completed'){
      // Start interview if not started
      if (!cand.items?.length){
        cand.items = buildInterview();
        cand.currentIndex = 0;
        cand.status = 'in-progress';
        cand.startedAt = new Date();
        cand.chat.push({ sender:'bot', text:'Great! Starting your interview now. 6 questions: 2 Easy, 2 Medium, 2 Hard.' });
        await cand.save();
      }
    }
    res.json(cand);
  }catch(e){ next(e); }
});

// List candidates with search & sort
router.get('/candidates', async (req, res, next) => {
  try{
    const q = String(req.query.q||'').toLowerCase();
    const sort = String(req.query.sort||'-totalScore');
    const filter = q ? { $or: [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { phone: new RegExp(q, 'i') },
      { summary: new RegExp(q, 'i') }
    ] } : {};
    const items = await Candidate.find(filter).sort(sort).lean();
    res.json(items);
  }catch(e){ next(e); }
});

// Get candidate detail
router.get('/candidates/:id', async (req, res, next) => {
  try{
    const cand = await Candidate.findById(req.params.id);
    if (!cand) throw Object.assign(new Error('Candidate not found'), { status: 404 });
    res.json(cand);
  }catch(e){ next(e); }
});

// Submit answer for current question
router.post('/candidates/:id/answer', async (req, res, next) => {
  try{
    const { answer, useGemini } = parseOrThrow(AnswerSchema, req.body);
    const cand = await Candidate.findById(req.params.id);
    if (!cand) throw Object.assign(new Error('Candidate not found'), { status: 404 });
    if (cand.status !== 'in-progress') throw Object.assign(new Error('Interview not in progress'), { status: 400 });

    const idx = cand.currentIndex || 0;
    const item = cand.items[idx];
    if (!item) throw Object.assign(new Error('No question available'), { status: 400 });

    // Save user message
    cand.chat.push({ sender:'user', text: answer || '[No answer]' });

    // Score
    let result = useGemini ? await geminiScore(item.question, answer) : null;
    if (!result) result = localScore(item.question, answer, item.difficulty);

    item.answer = answer;
    item.aiScore = result.score;
    item.aiNotes = result.notes;

    // Bot feedback
    cand.chat.push({ sender:'bot', text: `Score: ${result.score}/10. ${result.notes||''}` });

    // Advance or complete
    if (idx < cand.items.length - 1){
      cand.currentIndex = idx + 1;
    } else {
      cand.status = 'completed';
      cand.finishedAt = new Date();
      cand.totalScore = cand.items.reduce((a,b)=>a+(b.aiScore||0),0);
      cand.summary = summarizeCandidate(cand.name, cand.items);
      cand.chat.push({ sender:'bot', text:`Final score: ${cand.totalScore}/60. ${cand.summary}` });
    }

    await cand.save();

    res.json({ status: cand.status, nextIndex: cand.currentIndex, candidate: cand });
  }catch(e){ next(e); }
});

// Skip current question (stores blank)
router.post('/candidates/:id/skip', async (req, res, next) => {
  req.body = { answer: '' }; // reuse logic
  router.handle(req, res, next); // pass through to /answer
});

// Delete candidate
router.delete('/candidates/:id', async (req, res, next) => {
  try{ await Candidate.findByIdAndDelete(req.params.id); res.json({ ok:true }); }catch(e){ next(e); }
});

export default router;