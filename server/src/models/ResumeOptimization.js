import mongoose from "mongoose";

const resumeOptimizationSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      default: "",
    },
    targetCompany: {
      type: String,
      default: "",
    },
    rewrittenSummary: {
      type: String,
      default: "",
    },
    rewrittenBullets: {
      type: [String],
      default: [],
    },
    quantifiedImpactSuggestions: {
      type: [String],
      default: [],
    },
    tailoringNotes: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const ResumeOptimization = mongoose.model("ResumeOptimization", resumeOptimizationSchema);
export default ResumeOptimization;
