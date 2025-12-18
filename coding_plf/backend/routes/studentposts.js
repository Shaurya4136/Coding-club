const express = require("express");
const router = express.Router();
const StudentQuestion = require("../models/Studentpost");
const authenticateToken = require("../middleware/authenticateToken");
const StudentProfile = require("../models/StudentProfil");
const User = require("../models/User"); // User model

// Helper to format answers with profile & likes info
const formatAnswers = async (answers) => {
  return await Promise.all(
    answers.map(async (a) => {
      const profile = await StudentProfile.findOne({ userId: a.userId });
      const userInfo = await User.findById(a.userId);

      const likesFull = await Promise.all(
        a.likes.map(async (uid) => {
          const user = await User.findById(uid);
          return user ? { _id: user._id, name: user.name } : null;
        })
      );

      return {
        _id: a._id,
        answer: a.answer,
        dateAnswered: a.dateAnswered,
        timeAnswered: a.timeAnswered,
        userId: a.userId,
        profile: {
          name: profile?.name || userInfo?.name || "Unknown",
          avatar: profile?.avatar || "/default-avatar.png",
          role: profile?.role || userInfo?.role || "Student",
        },
        likes: likesFull.filter(Boolean),
      };
    })
  );
};

// Helper to format a question with profile & answers
const formatQuestion = async (q) => {
  const profile = await StudentProfile.findOne({ userId: q.userId });
  const userInfo = await User.findById(q.userId);

  return {
    _id: q._id,
    question: q.question,
    datePosted: q.datePosted,
    timePosted: q.timePosted,
    tags: q.tags,
    likes: q.likes || [], // ✅ include likes for persistence
    profile: {
      name: profile?.name || userInfo?.name || "Unknown",
      avatar: profile?.avatar || "/default-avatar.png",
      role: profile?.role || userInfo?.role || "Student",
    },
    answers: await formatAnswers(q.answers),
    userId: q.userId,
  };
};

// ================= Routes =================

// GET all questions for the logged-in user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const questions = await StudentQuestion.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const formatted = await Promise.all(questions.map((q) => formatQuestion(q)));
    res.json(formatted);
  } catch (err) {
    console.error("Fetch questions error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Add new question
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;

    const newQuestion = new StudentQuestion({
      userId: req.user.id,
      question,
      datePosted: new Date().toLocaleDateString(),
      timePosted: new Date().toLocaleTimeString(),
      tags: [],
      answers: [],
    });

    await newQuestion.save();
    const formatted = await formatQuestion(newQuestion);
    res.json(formatted);
  } catch (err) {
    console.error("Add question error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update question
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    const updated = await StudentQuestion.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { question },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Question not found" });
    const formatted = await formatQuestion(updated);
    res.json(formatted);
  } catch (err) {
    console.error("Update question error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete question
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    await StudentQuestion.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Question deleted" });
  } catch (err) {
    console.error("Delete question error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add answer
router.post("/:id/answers", authenticateToken, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) return res.status(400).json({ error: "Answer cannot be empty" });

    const question = await StudentQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const newAnswer = {
      userId: req.user.id,
      answer,
      dateAnswered: new Date().toLocaleDateString(),
      timeAnswered: new Date().toLocaleTimeString(),
      likes: [],
    };

    question.answers.push(newAnswer);
    await question.save();

    const formatted = await formatQuestion(question);
    res.json(formatted);
  } catch (err) {
    console.error("Add answer error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Edit answer
// Edit answer
router.put("/:questionId/answers/:answerId", authenticateToken, async (req, res) => {
  try {
    const { answer } = req.body;

    // Find question
    const question = await StudentQuestion.findById(req.params.questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    // Find answer using subdocument helper
    const ans = question.answers.id(req.params.answerId);
    if (!ans) return res.status(404).json({ error: "Answer not found" });

    // ✅ Convert both to strings safely (handle populated vs non-populated)
    const answerUserId = ans.userId._id ? ans.userId._id.toString() : ans.userId.toString();
    const questionUserId = question.userId._id ? question.userId._id.toString() : question.userId.toString();
    const loggedUserId = req.user.id.toString();

    // Authorization check
    if (answerUserId !== loggedUserId && questionUserId !== loggedUserId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Update answer
    ans.answer = answer;
    ans.dateAnswered = new Date().toLocaleDateString();
    ans.timeAnswered = new Date().toLocaleTimeString();

    await question.save();

    const formatted = await formatQuestion(question);
    res.json(formatted);

  } catch (err) {
    console.error("Edit answer error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete answer
router.delete("/:questionId/answers/:answerId", authenticateToken, async (req, res) => {
  try {
    const question = await StudentQuestion.findById(req.params.questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const ans = question.answers.find(a => a._id.toString() === req.params.answerId);
    if (!ans) return res.status(404).json({ error: "Answer not found" });

    const userId = req.user.id.toString();

    // Handle populated ObjectId vs plain string
    const answerUserId = ans.userId._id ? ans.userId._id.toString() : ans.userId.toString();
    const questionUserId = question.userId._id ? question.userId._id.toString() : question.userId.toString();

    // Authorization: only answer owner or question owner
    if (answerUserId !== userId && questionUserId !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Remove the answer
    question.answers = question.answers.filter(a => a._id.toString() !== req.params.answerId);
    await question.save();

    const formatted = await formatQuestion(question);
    res.json(formatted);

  } catch (err) {
    console.error("Delete answer error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});
// ✅ Like/unlike a student question (main post)
// ✅ Like / Unlike a Student Question
router.put("/:questionId/like", authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user._id;

    const question = await StudentQuestion.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (!Array.isArray(question.likes)) question.likes = [];

    const alreadyLiked = question.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      question.likes = question.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      question.likes.push(userId);
    }

    await question.save();

    // ✅ Return ONLY the updated likes array (no double response)
    return res.json({
      questionId: question._id,
      likes: question.likes,
    });

  } catch (err) {
    console.error("Like question error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Server Error" });
    }
  }
});


// Like/unlike answer
router.put("/:questionId/answers/:answerId/like", authenticateToken, async (req, res) => {
  try {
    const { questionId, answerId } = req.params;
    const userId = req.user.id;

    const question = await StudentQuestion.findById(questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const ans = question.answers.id(answerId);
    if (!ans) return res.status(404).json({ error: "Answer not found" });

    // Toggle like/unlike
    if (ans.likes.includes(userId)) {
      ans.likes = ans.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      ans.likes.push(userId);
    }

    await question.save();

    // ✅ Return only updated likes for this answer
    return res.json({
      answerId: ans._id,
      likes: ans.likes,
    });

  } catch (err) {
    console.error("Like answer error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  }
});


module.exports = router;
