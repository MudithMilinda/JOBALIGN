import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Analysis from "../models/Analysis.js";

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/analysis/save
// Frontend result MongoDB save 
// ─────────────────────────────────────────────
router.post("/save", protect, async (req, res) => {
  try {
    const { fileName, candidateSummary, topSkills, resumeTips, jobs } = req.body;

    const analysis = new Analysis({
      user:             req.user.id,   // JWT එකෙන් ආපු user id
      fileName:         fileName || "",
      candidateSummary: candidateSummary || "",
      topSkills:        topSkills || [],
      resumeTips:       resumeTips || [],
      jobs:             jobs || [],
    });

    await analysis.save();

    res.status(201).json({ msg: "Analysis saved", id: analysis._id });
  } catch (err) {
    console.error("Save analysis error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /api/analysis/history
// User  past analyses (latest first)
// ─────────────────────────────────────────────
router.get("/history", protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // newest first
      .lean();

    res.json(analyses);
  } catch (err) {
    console.error("Get history error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;