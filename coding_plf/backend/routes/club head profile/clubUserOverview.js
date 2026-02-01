const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const authenticateToken = require("../../middleware/authenticateToken");
const User = require("../../models/User");
const StudentQuestion = require("../../models/Studentpost");
const ClubHeadPost = require("../../models/ClubHeadPost");
const StudentProfile = require("../../models/StudentProfil");
const ClubHeadProfile = require("../../models/ClubHeadProfile");

// 🔐 ClubHead / Admin only
const allowModerators = (req, res, next) => {
  if (!["ClubHead", "Club Head", "Admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

router.get(
  "/user/:userId/overview",
  authenticateToken,
  allowModerators,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // ✅ SAFETY CHECK (THIS FIXES YOUR ERROR)
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          message: "Invalid userId",
          received: userId,
        });
      }

      // ---------------- USER ----------------
      const user = await User.findById(userId).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });

      // ---------------- PROFILE ----------------
      let profile = null;
      if (user.role === "Student") {
        profile = await StudentProfile.findOne({ userId });
      } else if (["ClubHead", "Club Head"].includes(user.role)) {
        profile = await ClubHeadProfile.findOne({ userId });
      }

      // ---------------- POSTS CREATED ----------------
      const studentPosts = await StudentQuestion.find({ userId })
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar")
        .sort({ createdAt: -1 });

      const clubPosts = await ClubHeadPost.find({ userId })
        .populate("userId", "name role avatar")
        .populate("comments.userId", "name role avatar")
        .populate("comments.replies.userId", "name role avatar")
        .sort({ createdAt: -1 });

      // ---------------- COMMENTS BY USER ----------------
      const commentedStudentPosts = await StudentQuestion.find({
        "answers.userId": userId,
      })
        .populate("userId", "name role avatar")
        .populate("answers.userId", "name role avatar")
        .populate("answers.replies.userId", "name role avatar");

      const commentedClubPosts = await ClubHeadPost.find({
        "comments.userId": userId,
      })
        .populate("userId", "name role avatar")
        .populate("comments.userId", "name role avatar")
        .populate("comments.replies.userId", "name role avatar");

      // ---------------- LIKES BY USER ----------------
      const likedStudentPosts = await StudentQuestion.find({ likes: userId })
        .populate("userId", "name role avatar");

      const likedClubPosts = await ClubHeadPost.find({ likes: userId })
        .populate("userId", "name role avatar");

      res.json({
        user,
        profile,
        posts: [...studentPosts, ...clubPosts],
        comments: {
          student: commentedStudentPosts,
          club: commentedClubPosts,
        },
        likes: [...likedStudentPosts, ...likedClubPosts],
      });
    } catch (err) {
      console.error("❌ User overview error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
