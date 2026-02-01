const mongoose = require("mongoose");

const collegeProfileSchema = new mongoose.Schema({
  /* =====================
     COMMON (SAME AS CLUB)
  ===================== */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // 👇 SAME FIELD NAME AS CLUB
  name: {
    type: String,
    default: "New College",
  },

  email: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
  },

  // 👇 SAME FIELD NAME AS CLUB (avatar)
  avatar: {
    type: String,
    default: "",
  },

  joinedDate: {
    type: String,
    default: () =>
      new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
  },

  /* =====================
     SEMANTIC MAPPING
     (Club → College)
  ===================== */

  // clubName → collegeName
  clubName: {
    type: String,
    default: "",
  },

  // position → affiliation / type
  position: {
    type: String,
    default: "Institution",
  },

  // responsibilities → departments
  responsibilities: {
    type: [String],
    default: [],
  },

  // eventsManaged → eventsHosted
  eventsManaged: {
    type: [String],
    default: [],
  },

  // teamMembers → clubs / societies
  teamMembers: {
    type: [String],
    default: [],
  },

  /* =====================
     CONTACT / SOCIAL
     (IDENTICAL)
  ===================== */
  phone: {
    type: String,
    default: "",
  },

  linkedin: {
    type: String,
    default: "",
  },

  github: {
    type: String,
    default: "",
  },

  instagram: {
    type: String,
    default: "",
  },

  /* =====================
     EDUCATION → METADATA
  ===================== */
  education: {
    college: { type: String, default: "" },     // Affiliation (AICTE/UGC)
    degree: { type: String, default: "" },      // Type (Govt / Private)
    year: { type: String, default: "" },        // Established year
  },
});

module.exports = mongoose.model("CollegeProfile", collegeProfileSchema);