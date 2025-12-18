import mongoose from "mongoose";

const blockRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Club Head
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // Student
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
}, { timestamps: true });

export default mongoose.model("BlockRequest", blockRequestSchema);
