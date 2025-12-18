const mongoose = require("mongoose");

// --------------------
// ⭐ Reply Schema for ClubHead Comments
// --------------------
const commentReplySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: String, // optional, for quick display
  comment: { type: String, required: true }, // text of the reply
  dateCommented: { type: String, default: () => new Date().toISOString().split("T")[0] },
  timeCommented: { type: String, default: () => new Date().toLocaleTimeString() },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  updatedAt: { type: Date },
});

// --------------------
// ⭐ Comment Schema (with nested replies)
// --------------------
const commentSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: String, // optional
  comment: { type: String, required: true },
  dateCommented: { type: String, default: () => new Date().toISOString().split("T")[0] },
  timeCommented: { type: String, default: () => new Date().toLocaleTimeString() },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  updatedAt: { type: Date },
  // ⭐ Nested replies for each comment
  replies: [commentReplySchema],
});

// --------------------
// ⭐ Main ClubHeadPost Schema
// --------------------
const clubHeadPostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    postType: {
      type: String,
      enum: ["announcement", "notice", "update", "event", "question", "poll"],
      required: true,
    },

    title: { type: String, default: "" },
    content: { type: String, default: "" },
    tags: [String],

    image: {
      data: Buffer,        // ✅ store binary data
      contentType: String, // ✅ store MIME type
    },

    pollOptions: [
      {
        option: String,
        votes: { type: Number, default: 0 },
      },
    ],

    datePosted: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    timePosted: {
      type: String,
      default: () => new Date().toLocaleTimeString(),
    },

    // ✅ answers (currently no replies here – we can add later if you want)
    answers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        userName: String,
        answer: String,
        dateAnswered: String,
        timeAnswered: String,
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // ⭐ COMMENTS WITH THREADED REPLIES
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClubHeadPost", clubHeadPostSchema);
