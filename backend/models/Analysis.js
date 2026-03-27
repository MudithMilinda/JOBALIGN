import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  id:           Number,
  title:        String,
  company:      String,
  location:     String,
  type:         String,
  matchQuality: String,
  tags:         [String],
  url:          String,
  reason:       String,
});

const AnalysisSchema = new mongoose.Schema(
  {
    // ✅ Which user did this analysis
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ Uploaded file info
    fileName: { type: String, default: "" },

    // ✅ Claude generated data
    candidateSummary: { type: String, default: "" },
    topSkills:        { type: [String], default: [] },
    resumeTips:       { type: [String], default: [] },

    // ✅ Matched jobs
    jobs: { type: [JobSchema], default: [] },
  },
  { timestamps: true } // createdAt, updatedAt auto add වෙනවා
);

export default mongoose.models.Analysis ||
  mongoose.model("Analysis", AnalysisSchema);