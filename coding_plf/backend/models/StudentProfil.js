const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, default: "New Student" },
  email: { type: String, default: "" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  joinedDate: {
    type: String,
    default: () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
  },
  skills: { type: [String], default: [] },

  // ✅ New optional fields for complete profile editing
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  education: {
    college: { type: String, default: "" },
    degree: { type: String, default: "" },
    year: { type: String, default: "" },
  },
});

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
