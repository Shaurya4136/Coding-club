const router = require("express").Router();
const authenticateToken = require("../../middleware/authenticateToken");
const mongoose = require("mongoose");

// MODELS
const User = require("../../models/User");
const {
  Department,
  Club,
  Event,
  Approval,
  Notification,
} = require("../../models/collegeModels");

/* 🔐 COLLEGE ONLY */
const allowCollege = (req, res, next) => {
  if (req.user.role !== "College") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

/* ======================================================
   📊 DASHBOARD COUNTS
====================================================== */
router.get("/dashboard", authenticateToken, allowCollege, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const db = mongoose.connection.db;

    const safeCount = async (name) => {
      try {
        return await db.collection(name).countDocuments();
      } catch {
        return 0; // 👈 prevents crash if collection missing
      }
    };

    const [
      totalUsers,
      students,
      clubHeads,
      activeUsers,
      blockedUsers,
      clubs,
      studentProfiles,
      studentQuestions,
      clubHeadPosts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "Student" }),
      User.countDocuments({
  role: { $in: ["club head", "clubhead", "Club Head", "ClubHead"] }
}),
      User.countDocuments({ status: "Active" }),
      User.countDocuments({ status: "Blocked" }),
      safeCount("clubprofiles"),
      safeCount("studentprofiles"),
      safeCount("studentquestions"),
      safeCount("clubheadposts"),
    ]);

    res.json({
      users: totalUsers,
      students,
      clubHeads,
      activeUsers,
      blockedUsers,
      clubs,
      studentProfiles,
      questions: studentQuestions,
      clubPosts: clubHeadPosts,
    });
  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Dashboard analytics failed" });
  }
});


/* ======================================================
   🕒 REGISTRATION REQUESTS (PENDING USERS)
====================================================== */
router.get(
  "/block-requests",
  authenticateToken,
  allowCollege,
  async (req, res) => {
    try {
      const requests = await User.find({
        status: "BlockRequested",
      }).select("name email role createdAt");

      res.json(requests);
    } catch (err) {
      console.error("Block requests fetch error:", err);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  }
);


/* ======================================================
   👥 GET ALL USERS (ADMIN)
====================================================== */
router.get("/users", authenticateToken, allowCollege, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const users = await User.find()
      .select("name email role status createdAt")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ======================================================
   🚫 BLOCK USER
====================================================== */
router.put("/users/:userId/block", authenticateToken, allowCollege, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { status: "Blocked" },
    { new: true }
  ).select("name email role status");

  res.json({ success: true, user });
});

/* ======================================================
   ✅ UNBLOCK USER
====================================================== */
router.put("/users/:userId/unblock", authenticateToken, allowCollege, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { status: "Active" },
    { new: true }
  ).select("name email role status");

  res.json({ success: true, user });
});

/* ======================================================
   GENERIC CRUD
====================================================== */
const crud = (Model) => ({
  get: async (_, res) => res.json(await Model.find().sort({ createdAt: -1 })),
  post: async (req, res) => res.json(await Model.create(req.body)),
  put: async (req, res) =>
    res.json(await Model.findByIdAndUpdate(req.params.id, req.body, { new: true })),
  delete: async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  },
});

/* DEPARTMENTS */
const d = crud(Department);
router.get("/departments", authenticateToken, allowCollege, d.get);
router.post("/departments", authenticateToken, allowCollege, d.post);
router.put("/departments/:id", authenticateToken, allowCollege, d.put);
router.delete("/departments/:id", authenticateToken, allowCollege, d.delete);

/* CLUBS */
const c = crud(Club);
router.get("/clubs", authenticateToken, allowCollege, c.get);
router.post("/clubs", authenticateToken, allowCollege, c.post);
router.put("/clubs/:id", authenticateToken, allowCollege, c.put);
router.delete("/clubs/:id", authenticateToken, allowCollege, c.delete);

/* EVENTS */
const e = crud(Event);
router.get("/events", authenticateToken, allowCollege, e.get);
router.post("/events", authenticateToken, allowCollege, e.post);
router.put("/events/:id", authenticateToken, allowCollege, e.put);
router.delete("/events/:id", authenticateToken, allowCollege, e.delete);

/* ======================================================
   APPROVALS
====================================================== */
router.get("/approvals", authenticateToken, allowCollege, async (_, res) => {
  res.json(await Approval.find({ status: "pending" }));
});

router.put("/approvals/:id/approve", authenticateToken, allowCollege, async (req, res) => {
  const approval = await Approval.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );

  const notification = await Notification.create({
    message: `✅ ${approval.name} approved (Club: ${approval.club})`,
  });

  req.io.emit("notification", notification);
  res.json({ success: true });
});

router.put("/approvals/:id/reject", authenticateToken, allowCollege, async (req, res) => {
  const approval = await Approval.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );

  const notification = await Notification.create({
    message: `❌ ${approval.name} rejected (Club: ${approval.club})`,
  });

  req.io.emit("notification", notification);
  res.json({ success: true });
});

/* ======================================================
   🔔 NOTIFICATIONS
====================================================== */
router.get("/notifications", authenticateToken, allowCollege, async (_, res) => {
  res.json(await Notification.find().sort({ createdAt: -1 }));
});

module.exports = router;