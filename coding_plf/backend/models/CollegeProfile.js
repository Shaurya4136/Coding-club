const mongoose = require("mongoose");

const collegeProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  collegeName: { type: String, default: "Unnamed College" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
  description: { type: String, default: "" },
  logo: { type: String, default: "https://via.placeholder.com/200" },
  joinedDate: { type: String, default: () => new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) },
});

module.exports = mongoose.model("CollegeProfile", collegeProfileSchema);
