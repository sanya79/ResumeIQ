import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    originalName: {
      type: String,
      required: true
    },
    storedName: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number, // in bytes
      required: true
    },
    extension: {
      type: String, // e.g. .pdf, .docx
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    storageUrl: {
      type: String,
      required: true
    },
    version: {
      type: Number,
      required: true,
      default: 1
    },
    status: {
      type: String,
      enum: ["Uploaded", "Queued", "Parsing", "Analyzing", "Completed", "Failed", "Archived"],
      default: "Uploaded",
      index: true
    },
    isLatest: {
      type: Boolean,
      default: true,
      index: true
    },
    uploadSource: {
      type: String,
      default: "Web Dashboard"
    },
    rawText: {
      type: String
    },
    parsedProfile: {
      type: Object,
      default: {}
    },
    comparisonSummary: {
      type: String,
      default: ""
    },
    language: {
      type: String,
      default: "en"
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date
    },
    atsScorecard: {
      overallScore: { type: Number },
      breakdown: { type: Array },
      weakAreas: { type: Array },
      strengths: { type: Array },
      top10Improvements: { type: Array },
      estimatedImprovedScore: { type: Number },
      confidence: { type: Number },
      atsVersion: { type: String },
      timestamp: { type: Date },
      visualizationData: { type: Object }
    }
  },
  {
    timestamps: true
  }
);

// Mongoose query middleware to filter out soft-deleted files by default
resumeSchema.pre(/^find/, function (next) {
  // If not explicitly querying deleted files, exclude them
  if (this.getQuery().includeDeleted !== true) {
    this.where({ isDeleted: false });
  }
  next();
});

export const Resume = mongoose.model("Resume", resumeSchema);
export default Resume;
