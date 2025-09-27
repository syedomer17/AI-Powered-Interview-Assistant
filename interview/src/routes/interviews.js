import express from "express";
import { Candidate } from "../models/Candidate.js";
import { Interview } from "../models/Interview.js";
import {
  generateQuestions,
  scoreAnswer,
  summarizeInterview,
} from "../services/aiService.js";

const router = express.Router();

// Start a new interview
router.post("/", async (req, res) => {
  try {
    const { candidateId } = req.body;
    const candidate = await Candidate.findById(candidateId);
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });

    const existing = await Interview.findOne({
      candidate: candidateId,
      status: "in_progress",
    });
    if (existing)
      return res
        .status(400)
        .json({ error: "Interview in progress", interviewId: existing._id });

    const rawQuestions = await generateQuestions();
    const questions = rawQuestions.map((q) => ({
      ...q,
      startedAt: new Date(),
    }));

    const interview = await Interview.create({
      candidate: candidate._id,
      questions,
    });
    candidate.interviews.push(interview._id);
    await candidate.save();

    res.status(201).json(interview);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to start interview" });
  }
});

// Get interview details
router.get("/:id", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("candidate");
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }
    res.json(interview);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get interview" });
  }
});

// Get current question for interview
router.get("/:id/current-question", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    const currentQuestion = interview.questions.find(
      (q) => !q.answer && !q.timedOut
    );

    if (!currentQuestion) {
      return res.json({ 
        completed: true, 
        message: "Interview completed",
        totalQuestions: interview.questions.length,
        answeredQuestions: interview.questions.filter(q => q.answer || q.timedOut).length
      });
    }

    const questionIndex = interview.questions.indexOf(currentQuestion);
    res.json({
      question: currentQuestion,
      questionIndex: questionIndex + 1,
      totalQuestions: interview.questions.length,
      completed: false
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get current question" });
  }
});

// Submit answer to a question
router.post("/:id/answer", async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    const question = interview.questions[questionIndex];
    if (question.answer) {
      return res.status(400).json({ error: "Question already answered" });
    }

    // Score the answer using AI
    const scoreResult = await scoreAnswer(
      question.text,
      question.idealAnswer,
      answer
    );

    // Update the question
    question.answer = answer;
    question.score = scoreResult.score;
    question.reasoning = scoreResult.reasoning;
    question.answeredAt = new Date();

    await interview.save();

    // Check if interview is complete
    const allAnswered = interview.questions.every(q => q.answer || q.timedOut);
    if (allAnswered) {
      await finalizeInterview(interview);
    }

    res.json({
      success: true,
      score: scoreResult.score,
      reasoning: scoreResult.reasoning,
      completed: allAnswered
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

// Skip/timeout a question
router.post("/:id/skip", async (req, res) => {
  try {
    const { questionIndex } = req.body;
    const interview = await Interview.findById(req.params.id);
    
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    const question = interview.questions[questionIndex];
    if (question.answer || question.timedOut) {
      return res.status(400).json({ error: "Question already processed" });
    }

    question.timedOut = true;
    question.score = 0;
    question.reasoning = "Question skipped or timed out";
    question.answeredAt = new Date();

    await interview.save();

    // Check if interview is complete
    const allAnswered = interview.questions.every(q => q.answer || q.timedOut);
    if (allAnswered) {
      await finalizeInterview(interview);
    }

    res.json({
      success: true,
      completed: allAnswered
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to skip question" });
  }
});

// Finalize interview
router.post("/:id/finalize", async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate("candidate");
    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    await finalizeInterview(interview);
    res.json(interview);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to finalize interview" });
  }
});

// Get all interviews
router.get("/", async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("candidate", "name email phone")
      .sort({ createdAt: -1 });
    
    res.json(interviews);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to get interviews" });
  }
});

// Helper function to finalize interview
async function finalizeInterview(interview) {
  const answeredQuestions = interview.questions.filter(q => q.score !== undefined);
  const totalScore = answeredQuestions.reduce((sum, q) => sum + q.score, 0);
  const averageScore = answeredQuestions.length > 0 ? totalScore / answeredQuestions.length : 0;
  
  interview.finalScore = Math.round(averageScore * 10) / 10; // Round to 1 decimal
  interview.status = "completed";
  interview.finalizedAt = new Date();
  
  // Generate AI summary
  try {
    interview.summary = await summarizeInterview(interview.candidate, interview);
  } catch (e) {
    console.error("Failed to generate summary:", e);
    interview.summary = `Interview completed with ${answeredQuestions.length}/${interview.questions.length} questions answered. Average score: ${interview.finalScore}/10.`;
  }
  
  await interview.save();
  return interview;
}

export default router;
