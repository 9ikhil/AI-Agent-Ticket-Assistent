import mongoose from "mongoose";
import User from "./user.js"; 

const ticketSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    default: "TODO",
    enum: [ {default : 'TODO'} ,"open", "in-progress", "closed"],
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
  userName : {type : mongoose.Schema.Types.ObjectId, ref: "User"},
});

export default mongoose.model("Ticket", ticketSchema);
