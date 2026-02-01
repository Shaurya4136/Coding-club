const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 🔥 FIXED ROLE ENUM
    role: {
      type: String,
      enum: ["Student", "ClubHead", "College"],
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Blocked", "BlockRequested"],
      default: "Active",
    },
  },
  { timestamps: true }
);
userSchema.pre("save", function (next) {
  if (!this.role) return next();

  const roleMap = {
    "clubhead": "ClubHead",
    "club head": "ClubHead",
    "Club Head": "ClubHead",
    "ClubHead": "ClubHead",
    "student": "Student",
    "Student": "Student",
    "college": "College",
    "College": "College",
  };

  this.role = roleMap[this.role] || this.role;
  next();
});
module.exports = mongoose.model("User", userSchema);