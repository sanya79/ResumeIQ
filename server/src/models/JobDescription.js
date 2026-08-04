import mongoose from "mongoose";

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      default: "manual",
    },
  },
  {
    timestamps: true,
  }
);

export const JobDescription = mongoose.model("JobDescription", jobDescriptionSchema);
export default JobDescription;
