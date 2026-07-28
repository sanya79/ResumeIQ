import mongoose from "mongoose";

const careerRoadmapSchema = new mongoose.Schema(
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
    targetRole: {
      type: String,
      required: true
    },
    careerReadinessScore: {
      type: Number,
      required: true
    },
    readinessStatus: {
      type: String,
      required: true
    },
    estimatedTimeToTarget: {
      type: String,
      required: true
    },
    skillGap: {
      type: Array,
      default: []
    },
    radarChartData: {
      type: Array,
      default: []
    },
    roadmap: {
      type: Array,
      default: []
    },
    certifications: {
      type: Array,
      default: []
    },
    learningResources: {
      type: Array,
      default: []
    },
    projectRecommendations: {
      type: Array,
      default: []
    },
    careerTimeline: {
      type: Array,
      default: []
    },
    insights: {
      type: Array,
      default: []
    },
    confidence: {
      type: Number,
      default: 1.0
    }
  },
  {
    timestamps: true
  }
);

export const CareerRoadmap = mongoose.model("CareerRoadmap", careerRoadmapSchema);
export default CareerRoadmap;
