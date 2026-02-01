const mongoose = require("mongoose");

/* COMMON SCHEMA */
const simpleSchema = {
  name: { type: String, required: true }
};

/* DEPARTMENT */
const Department = mongoose.model(
  "Department",
  new mongoose.Schema(simpleSchema, { timestamps: true })
);

/* CLUB */
const Club = mongoose.model(
  "Club",
  new mongoose.Schema(simpleSchema, { timestamps: true })
);

/* EVENT */
const Event = mongoose.model(
  "Event",
  new mongoose.Schema(simpleSchema, { timestamps: true })
);

/* APPROVAL */
const Approval = mongoose.model(
  "Approval",
  new mongoose.Schema({
    name: String,
    club: String,
    status: { type: String, default: "pending" }
  }, { timestamps: true })
);

/* NOTIFICATION */
const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema({
    message: String
  }, { timestamps: true })
);

module.exports = {
  Department,
  Club,
  Event,
  Approval,
  Notification
};