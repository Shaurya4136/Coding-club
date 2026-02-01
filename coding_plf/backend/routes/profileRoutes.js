const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const authenticateToken = require("../middleware/authenticateToken");
const normalizeRole = require("../utils/normalizeRole");

// MODELS
const StudentProfile = require("../models/StudentProfil");
const ClubHeadProfile = require("../models/ClubHeadProfile");
const CollegeProfile = require("../models/CollegeProfile");
const User = require("../models/User");

// ✅ ROLE → MODEL (NORMALIZED)
const getProfileModel = (rawRole) => {
  const role = normalizeRole(rawRole);

  switch (role) {
    case "Student":
      return StudentProfile;
    case "ClubHead":
      return ClubHeadProfile;
    case "College":
      return CollegeProfile;
    default:
      return null;
  }
};

/* ======================================================
   ✅ GET PROFILE (AUTO CREATE)
====================================================== */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    let profile = await Model.findOne({ userId: req.user.id });

    if (!profile) {
      profile = await Model.create({
        userId: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar || null,
      });
    }

    res.json(profile);
  } catch (err) {
    console.error("GET profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ✅ CREATE PROFILE (OPTIONAL)
====================================================== */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await Model.findOne({ userId: req.user.id });
    if (exists) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await Model.create({
      userId: req.user.id,
      ...req.body,
    });

    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ✅ UPDATE PROFILE (FIXES YOUR 400 ERROR)
====================================================== */
router.put("/", authenticateToken, async (req, res) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await Model.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("UPDATE profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   ✅ DELETE PROFILE
====================================================== */
/* ======================================================
   ❌ DELETE ACCOUNT (PROFILE + USER)
====================================================== */
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 1️⃣ Delete profile (if exists)
    await Model.findOneAndDelete({ userId: req.user.id });

    // 2️⃣ Delete user account
    const userDeleted = await User.findByIdAndDelete(req.user.id);
    if (!userDeleted) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Success
    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error("DELETE account error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ======================================================
   🔐 CHANGE PASSWORD
====================================================== */
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ======================================================
   📧 CHANGE EMAIL
====================================================== */
router.put("/change-email", authenticateToken, async (req, res) => {
  try {
    const { newEmail } = req.body;

    const exists = await User.findOne({ email: newEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email: newEmail },
      { new: true }
    );

    res.json({ success: true, email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
