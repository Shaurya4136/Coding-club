const mongoose = require("mongoose");


const clubHeadProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, default: "New Club Head" },
  email: { type: String, default: "" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  joinedDate: {
    type: String,
    default: () => new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
  },
  clubName: { type: String, default: "" },          // Name of the club
  position: { type: String, default: "Head" },      // e.g., Head, Co-Head
  responsibilities: { type: [String], default: [] }, // List of responsibilities
  eventsManaged: { type: [String], default: [] },   // Names of events organized
  teamMembers: { type: [String], default: [] },     // Names of key team members

  // Optional contact/social fields
  phone: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  github: { type: String, default: "" },
  instagram: { type: String, default: "" },

  // Optional education/work info
  education: {
    college: { type: String, default: "" },
    degree: { type: String, default: "" },
    year: { type: String, default: "" },
  },
});

module.exports = mongoose.model("ClubHeadProfile", clubHeadProfileSchema);
