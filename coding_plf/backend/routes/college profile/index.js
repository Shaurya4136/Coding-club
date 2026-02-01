const express = require("express");
const mongoose = require("mongoose");
const authenticateToken = require("../../middleware/authenticateToken");

// MODELS
const User = require("../../models/User");
const BlockRequest = require("../../models/BlockRequest");
const {
  Department,
  Club,
  Event,
  Approval,
  Notification,
} = require("../../models/collegeModels");

const router = express.Router();

/* ======================================================
   🔐 COLLEGE ROLE CHECK
====================================================== */
const allowCollege = (req, res, next) => {
  if (req.user.role !== "College") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* ======================================================
   📊 DASHBOARD ANALYTICS (UNCHANGED)
====================================================== */
router.get("/dashboard", authenticateToken, allowCollege, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const db = mongoose.connection.db;
    const safeCount = async (name) => {
      try {
        return await db.collection(name).countDocuments();
      } catch {
        return 0;
      }
    };

    const [
      users,
      students,
      clubHeads,
      activeUsers,
      blockedUsers,
      clubs,
      studentProfiles,
      studentQuestions,
      clubPosts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "Student" }),
      User.countDocuments({ role: "ClubHead" }),
      User.countDocuments({ status: "Active" }),
      User.countDocuments({ status: "Blocked" }),
      safeCount("clubprofiles"),
      safeCount("studentprofiles"),
      safeCount("studentquestions"),
      safeCount("clubheadposts"),
    ]);

    res.json({
      users,
      students,
      clubHeads,
      activeUsers,
      blockedUsers,
      clubs,
      studentProfiles,
      questions: studentQuestions,
      clubPosts,
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard analytics failed" });
  }
});

/* ======================================================
   🆕 CLUB HEAD REGISTRATION REQUESTS
====================================================== */
router.get(
  "/registration-requests",
  authenticateToken,
  allowCollege,
  async (req, res) => {
    const requests = await User.find({
      role: "ClubHead",
      status: "BlockRequested",
    }).select("name email createdAt");

    res.json(requests);
  }
);

router.put(
  "/registration-requests/:id/approve",
  authenticateToken,
  allowCollege,
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "Active" },
      { new: true }
    );

    const notification = await Notification.create({
      message: `✅ Club Head approved: ${user.name}`,
      meta: { type: "CLUBHEAD_APPROVED", userId: user._id },
    });

    req.io?.emit("notification", notification);
    res.json({ success: true });
  }
);

router.put(
  "/registration-requests/:id/reject",
  authenticateToken,
  allowCollege,
  async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    const notification = await Notification.create({
      message: `❌ Club Head registration rejected: ${user.email}`,
    });

    req.io?.emit("notification", notification);
    res.json({ success: true });
  }
);

/* ======================================================
   👥 USERS / BLOCK REQUESTS / CRUD / NOTIFICATIONS
   (ALL EXISTING ROUTES — UNCHANGED)
====================================================== */

/* 👥 USERS */
router.get("/users", authenticateToken, allowCollege, async (_, res) => {
  const users = await User.find()
    .select("name email role status createdAt")
    .sort({ createdAt: -1 });
  res.json(users);
});

/* 🚫 BLOCK REQUESTS */
router.get("/block-requests", authenticateToken, allowCollege, async (_, res) => {
  const requests = await BlockRequest.find({ status: "Pending" })
    .populate("requestedBy", "name email")
    .populate("targetUser", "name email status");
  res.json(requests);
});

/* 🔔 NOTIFICATIONS */
router.get("/notifications", authenticateToken, allowCollege, async (_, res) => {
  res.json(await Notification.find().sort({ createdAt: -1 }));
});

module.exports = router;
