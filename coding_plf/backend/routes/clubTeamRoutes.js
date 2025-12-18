const express = require("express");
const User = require("../models/User");
const StudentPost = require("../models/Studentpost");
const BlockRequest = require("../models/BlockRequest");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

/**
 * GET all users (Club Head)
 */
router.get("/team", authenticateToken, async (req, res) => {
  try {
    if (!["ClubHead", "Club Head"].includes(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}


    const { search, role } = req.query;

    const query = {};
    if (role) query.role = role;

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET user activity (posts, comments, likes)
 */
router.get("/user/:userId/activity", authenticateToken, async (req, res) => {
  try {
   if (!["ClubHead", "Club Head"].includes(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}


    const userId = req.params.userId;

    const posts = await StudentPost.find({ userId })
      .populate("userId", "name");

    const comments = await StudentPost.find({
      "comments.user": userId,
    });

    const likedPosts = await StudentPost.find({
      likes: userId,
    });

    res.json({
      posts,
      comments,
      likedPosts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST block request
 */
router.post("/block-request", authenticateToken, async (req, res) => {
  try {
    if (!["ClubHead", "Club Head"].includes(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}


    const { userId, reason } = req.body;

    await BlockRequest.create({
      requestedBy: req.user.id,
      targetUser: userId,
      reason,
    });

    await User.findByIdAndUpdate(userId, {
      status: "BlockRequested",
    });

    res.json({ message: "Block request submitted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
