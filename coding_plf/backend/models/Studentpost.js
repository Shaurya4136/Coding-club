const mongoose = require("mongoose");

// --------------------
// ⭐ Reply Schema
// --------------------
const replySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reply: { type: String, required: true },
  dateReplied: { type: String, default: () => new Date().toISOString().split("T")[0] },
  timeReplied: { type: String, default: () => new Date().toLocaleTimeString() },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// --------------------
// ⭐ Answer Schema
// --------------------
const answerSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: String,
  answer: { type: String, required: true },
  dateAnswered: { type: String, default: () => new Date().toISOString().split("T")[0] },
  timeAnswered: { type: String, default: () => new Date().toLocaleTimeString() },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // ⭐ Nested replies supported
  replies: [replySchema],
});

// --------------------
// ⭐ Main Schema
// --------------------
const studentQuestionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },

    datePosted: { type: String, default: () => new Date().toISOString().split("T")[0] },
    timePosted: { type: String, default: () => new Date().toLocaleTimeString() },

    tags: [String],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ⭐ Answers with replies
    answers: [answerSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentQuestion", studentQuestionSchema);
