const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const EventSchema = new mongoose.Schema({
  title: String,
  date: String,
  location: String,
  description: String,
});

const HomepageCMSSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["draft", "published"], default: "draft" },

    hero: {
      enabled: Boolean,
      title: String,
      subtitle: String,
      videoUrl: String,
      primaryBtn: String,
      secondaryBtn: String,
    },

    compiler: {
      enabled: Boolean,
      heading: String,
      apiUrl: String,
      languages: [String],
    },

    welcome: {
      enabled: Boolean,
      title: String,
      description: String,
      buttonText: String,
    },

    features: {
      enabled: Boolean,
      items: [FeatureSchema],
    },

    community: {
      enabled: Boolean,
    },

    events: {
      enabled: Boolean,
      items: [EventSchema],
    },

    gallery: {
      enabled: Boolean,
      images: [String],
    },

    contact: {
      enabled: Boolean,
      address: String,
      phone: String,
      email: String,
    },

    theme: {
      primary: String,
      accent: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomepageCMS", HomepageCMSSchema);