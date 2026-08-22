import mongoose from "mongoose";

const jobMatchSchema = new mongoose.Schema(
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
      required: true
    },
    jobDescription: {
      type: String,
      required: true
    },
    jobTitle: {
      type: String,
      default: ""
    },
    company: {
      type: String,
      default: ""
    },
    matchScore: {
      type: Number,
      required: true
    },
    semanticScore: {
      type: Number,
      default: 75
    },
    keywordScore: {
      type: Number,
      default: 75
    },
    matchedKeywords: {
      type: Array,
      default: []
    },
    missingKeywords: {
      type: Array,
      default: []
    },
    skillOverlap: {
      type: Array,
      default: []
    },
    experienceGap: {
      type: String,
      default: ""
    },
    categoryBreakdown: {
      type: Array,
      default: []
    },
    skillGap: {
      type: Array,
      default: []
    },
    experienceMatch: {
      type: Object,
      default: {}
    },
    projectRelevance: {
      type: Array,
      default: []
    },
    recommendations: {
      type: Array,
      default: []
    },
    hiringProbability: {
      type: Object,
      default: {}
    },
    visualizationData: {
      type: Object,
      default: {}
    },
    confidence: {
      type: Number,
      default: 1.0
    },
    isSaved: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

jobMatchSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

export const JobMatch = mongoose.model("JobMatch", jobMatchSchema);
export default JobMatch;
