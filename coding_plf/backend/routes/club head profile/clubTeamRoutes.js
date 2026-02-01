const express = require("express");
const User = require("../../models/User");
const StudentPost = require("../../models/Studentpost");
const BlockRequest = require("../../models/BlockRequest");
const authenticateToken = require("../../middleware/authenticateToken");
const { isClubHead } = require("../../utils/roles");
const { Notification } = require("../../models/collegeModels");
const router = express.Router();

/* ================= GET TEAM ================= */
router.get("/team", authenticateToken, async (req, res) => {
  try {
    if (!isClubHead(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { search, role, status } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;

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

/* ================= USER ACTIVITY ================= */
router.get("/user/:userId/activity", authenticateToken, async (req, res) => {
  try {
    if (!isClubHead(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const userId = req.params.userId;

    const posts = await StudentPost.find({ userId }).populate("userId", "name");
    const comments = await StudentPost.find({ "comments.user": userId });
    const likedPosts = await StudentPost.find({ likes: userId });

    res.json({ posts, comments, likedPosts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= BLOCK REQUEST ================= */
router.post("/block-request", authenticateToken, async (req, res) => {
try {
if (!isClubHead(req.user.role)) {
return res.status(403).json({ message: "Access denied" });
}


const { userId, reason } = req.body;


if (!userId || !reason) {
return res.status(400).json({ message: "UserId & reason required" });
}


const targetUser = await User.findById(userId);
if (!targetUser) {
return res.status(404).json({ message: "User not found" });
}


if (targetUser.status === "Blocked") {
return res.status(400).json({ message: "User already blocked" });
}


const existing = await BlockRequest.findOne({
targetUser: userId,
status: "Pending",
});


if (existing) {
return res.status(400).json({
message: "Block request already pending",
});
}


// ✅ SAVE BLOCK REQUEST
const blockRequest = await BlockRequest.create({
requestedBy: req.user.id,
targetUser: userId,
reason,
status: "Pending",
});


// ✅ UPDATE USER STATUS
targetUser.status = "BlockRequested";
await targetUser.save();


// ✅ CREATE COLLEGE NOTIFICATION
const notification = await Notification.create({
message: `🚫 Block request for ${targetUser.name}`,
meta: {
type: "BLOCK_REQUEST",
blockRequestId: blockRequest._id,
requestedBy: req.user.id,
targetUser: userId,
reason,
},
});


// ✅ REALTIME PUSH TO COLLEGE DASHBOARD
req.io?.emit("notification", notification);


res.json({ message: "✅ Block request submitted successfully" });
} catch (err) {
console.error("Block request error:", err);
res.status(500).json({ message: err.message });
}
});

module.exports = router;