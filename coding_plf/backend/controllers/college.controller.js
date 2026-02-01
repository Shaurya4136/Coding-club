const User = require("../models/User");
const bcrypt = require("bcrypt");

/* =========================
   GET ALL USERS
========================= */
exports.getAllUsers = async (req, res) => {
  try {
    const students = await User.find({ role: "Student" }).select("-password");
    const clubHeads = await User.find({ role: "ClubHead" }).select("-password");

    res.json({ students, clubHeads });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* =========================
   CREATE USER
========================= */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: "Active",
    });

    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(500).json({ message: "User creation failed" });
  }
};

/* =========================
   UPDATE USER (NAME / EMAIL)
========================= */
exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, email: req.body.email },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "User update failed" });
  }
};

/* =========================
   DELETE USER
========================= */
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

/* =========================
   RESET PASSWORD (SUPER ADMIN)
========================= */
exports.resetPassword = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await User.findByIdAndUpdate(req.params.id, {
      password: hashedPassword,
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
};

/* =========================
   BLOCK / UNBLOCK USER
========================= */
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.status = user.status === "Blocked" ? "Active" : "Blocked";
    await user.save();

    res.json({
      message:
        user.status === "Blocked"
          ? "User blocked"
          : "User unblocked",
    });
  } catch (err) {
    res.status(500).json({ message: "Block action failed" });
  }
};

/* =========================
   APPROVE BLOCK REQUEST
========================= */
exports.approveBlockRequest = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      status: "Active",
    });

    res.json({ message: "User approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
};