import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  userName : {type : mongoose.Schema.Types.ObjectId, ref: "User"},
  title: String,
  description: String,
  status: {
    type: String,
    default: "TODO",
    enum: ["open", "in-progress", "closed"],
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  priority: String,
  deadline: Date,
  helpfulNotes: String,
  relatedSkills: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ticket", ticketSchema);
