const jwt = require("jsonwebtoken");
const User = require("../models/User");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // store in memory as Buffer

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Use _id so your routes work correctly
      req.user = {
      _id: user._id,
      id: user._id, // ✅ keep backward compatibility
      role: user.role,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
    };


    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res.status(403).json({ message: "Authentication error" });
  }
};

module.exports = authenticateToken;
