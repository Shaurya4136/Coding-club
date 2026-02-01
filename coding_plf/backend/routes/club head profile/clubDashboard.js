const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authenticateToken");
const User = require("../../models/User");
const Event = require("../models/Event");
const Post = require("../../models/ClubHeadPost");

router.get("/dashboard", authenticate, async (req, res) => {
  if (req.user.role !== "ClubHead")
    return res.status(403).json({ message: "Access denied" });

  const members = await User.countDocuments({ role: "Student" });
  const events = await Event.countDocuments();
  const posts = await Post.countDocuments();

  res.json({
    members,
    events,
    posts,
    chartData: [
      { month: "Jan", posts: 12 },
      { month: "Feb", posts: 18 },
      { month: "Mar", posts: 24 },
    ],
  });
});

module.exports = router;
