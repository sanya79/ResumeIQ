import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    config: {
      type: { type: String, required: true },
      difficulty: { type: String, required: true },
      experienceLevel: { type: String, required: true },
      targetRole: { type: String, required: true }
    },
    questions: {
      type: Array,
      default: []
    },
    answers: {
      type: Array,
      default: []
    },
    status: {
      type: String,
      enum: ["generating", "in_progress", "completed"],
      default: "generating"
    },
    report: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const InterviewSession = mongoose.model("InterviewSession", interviewSessionSchema);
export default InterviewSession;
