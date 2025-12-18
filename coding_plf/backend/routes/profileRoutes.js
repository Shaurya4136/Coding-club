const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const authenticateToken = require("../middleware/authenticateToken.js");

const StudentProfile = require("../models/StudentProfil.js");
const ClubHeadProfile = require("../models/ClubHeadProfile.js");
const CollegeProfile = require("../models/CollegeProfile.js");
const User = require("../models/User.js");

// Helper: get correct model based on role
const getProfileModel = (role) => {
  switch (role) {
    case "Student": return StudentProfile;
    case "Club Head": return ClubHeadProfile;
    case "College": return CollegeProfile;
    default: return null;
  }
};

// ✅ GET profile (auto-create template if not found)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    let profile = await Model.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new Model({
        userId: req.user.id,
        email: req.user.email,
        name: req.user.name,
      });
      await profile.save();
      return res.status(201).json(profile);
    }
    res.json(profile);
  } catch (err) {
    console.error("GET profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CREATE profile manually
router.post("/", authenticateToken, async (req, res) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const existing = await Model.findOne({ userId: req.user.id });
    if (existing) return res.status(400).json({ message: "Profile already exists" });

    const profile = new Model({ userId: req.user.id, ...req.body });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE profile
router.put("/", authenticateToken, async (req, res) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const updated = await Model.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE profile
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const deleted = await Model.findOneAndDelete({ userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Profile not found" });

    res.json({ success: true, message: "Profile deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* 🔹 EXTRA ACCOUNT FUNCTIONALITIES 🔹 */

// ✅ Change password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Change email
router.put("/change-email", authenticateToken, async (req, res) => {
  try {
    const { newEmail } = req.body;
    const existing = await User.findOne({ email: newEmail });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email: newEmail },
      { new: true }
    );

    res.json({
      success: true,
      message: "Email updated successfully",
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
