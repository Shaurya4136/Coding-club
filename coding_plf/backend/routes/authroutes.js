// Import required modules
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const normalizeRole = require("../utils/normalizeRole");

/* =====================================================
   REGISTER
   - Student / College → Active immediately
   - ClubHead → BlockRequested (approval needed)
===================================================== */
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // ✅ Normalize role (CRITICAL)
    role = normalizeRole(role);
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Approval logic
    const status = role === "ClubHead" ? "BlockRequested" : "Active";

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status,
    });

    // 🟡 ClubHead → wait for approval
    if (status === "BlockRequested") {
      return res.status(201).json({
        success: true,
        pendingApproval: true,
        message: "Registration request sent for college approval",
      });
    }

    // 🟢 Auto-login for Student / College
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      token,
      redirectUrl:
        role === "Student"
          ? "/student-community"
          : "/college-community",
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   LOGIN
   - Role normalized
   - Blocks unapproved users BEFORE token creation
===================================================== */
router.post("/login", async (req, res) => {
  try {
    let { email, password, role } = req.body;

    // ✅ Normalize role
    role = normalizeRole(role);
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // ✅ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Role check
    if (user.role !== role) {
      return res.status(403).json({ message: "Access denied for this role" });
    }

    // ✅ Password check
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔒 Status gate
    if (user.status === "Blocked") {
      return res.status(403).json({
        message: "Your account has been blocked by the college admin",
      });
    }

    if (user.status === "BlockRequested") {
      return res.status(403).json({
        message: "Your account is pending college approval",
      });
    }

    // ✅ Generate token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Redirect mapping
    const redirectMap = {
      Student: "/student-community",
      ClubHead: "/club-community",
      College: "/college-community",
    };

    res.json({
      success: true,
      token,
      redirectUrl: redirectMap[user.role],
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
