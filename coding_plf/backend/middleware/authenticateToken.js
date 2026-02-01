const jwt = require("jsonwebtoken");
const User = require("../models/User");
const normalizeRole = require("../utils/normalizeRole");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ SUPPORT BOTH id & userId (CRITICAL FIX)
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ NORMALIZE ROLE ONCE (GLOBAL FIX)
    const role = normalizeRole(user.role);

    // ✅ SINGLE SOURCE OF TRUTH (DB)
    req.user = {
      _id: user._id,
      id: user._id,       // legacy
      userId: user._id,   // legacy
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      role,               // Student | ClubHead | College
      status: user.status,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authenticateToken;
