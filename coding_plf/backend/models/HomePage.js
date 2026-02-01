// models/HomePage.js
const mongoose = require("mongoose");

const homePageSchema = new mongoose.Schema({
  status: { type: String, enum: ["draft", "published"], default: "draft" },

  hero: {
    title: String,
    subtitle: String,
    mediaUrl: String, // video OR image
    primaryBtnText: String,
    secondaryBtnText: String,
  },

  editor: {
    enabled: Boolean,
    title: String,
  },

  welcome: {
    heading: String,
    content: String, // Quill HTML
    buttonText: String,
  },

  features: [
    { title: String, description: String }
  ],

  events: [
    { title: String, date: String, location: String, description: String }
  ],

  contact: {
    address: String,
    phone: String,
    email: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("HomePage", homePageSchema);