import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null
    },
    role: {
      type: String,
      default: "Software Engineer"
    },
    type: {
      type: String,
      enum: ["TECHNICAL", "HR", "BEHAVIOURAL"],
      default: "TECHNICAL"
    },
    timed: {
      type: Boolean,
      default: false
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
    currentQuestionIndex: {
      type: Number,
      default: 0
    },
    elapsedSeconds: {
      type: Number,
      default: 0
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
