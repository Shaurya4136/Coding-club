const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    meta: { type: Object }, // 👈 IMPORTANT (for block request details)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);