// server.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Anthropic from "@anthropic-ai/sdk";
import analysisRoutes from "./routes/analysisRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ─── Multer setup ─────────────────────────────
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Ensure uploads folder exists ─────────────
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ─── Middleware ───────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST"],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── MongoDB connection ───────────────────────
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ─── User Model ───────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  // ✅ Plan/Package field
  plan: { type: String, default: 'Basic', enum: ['Basic', 'Standard', 'Premium'] },
  role: { type: String, default: "user" },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

// ─── Analysis Model ───────────────────────────
// ✅ Used to count total jobs analyzed across all users
// Make sure this matches the schema in your analysisRoutes.js
const analysisSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  jobs: { type: Array, default: [] },
}, { timestamps: true });

const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

// ─── Anthropic Client ─────────────────────────
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY is missing in .env");
  process.exit(1);
}
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Helper: Build Job Search Prompt ─────────
function buildJobSearchPrompt(location, jobTypes, extraNotes) {
  return `You are an expert career advisor and job market researcher. A candidate has uploaded their CV/resume. Your task:

1. Extract skills, experience, education, and project highlights.
2. Generate 20 targeted job openings with:
   - Job title, Company, Location (${location || "Sri Lanka / Remote"})
   - Job type: ${jobTypes || "internship, entry-level, junior"}
   - Match quality, 3-5 relevant skills, application URL, reason
3. Provide a candidate summary (2-3 sentences), top 3 skills, 2-3 resume tips

${extraNotes ? `Additional notes: ${extraNotes}` : ""}

Respond ONLY in JSON like this:
{
  "candidateSummary": "string",
  "topSkills": ["skill1", "skill2", "skill3"],
  "resumeTips": ["tip1", "tip2", "tip3"],
  "jobs": [
    {
      "id": 1,
      "title": "string",
      "company": "string",
      "location": "string",
      "type": "fullstack|qa|mobile|frontend|backend|other",
      "matchQuality": "Strong fit|Good fit",
      "tags": ["tag1","tag2","tag3"],
      "url": "https://...",
      "reason": "string"
    }
  ]
}`;
}

// ─── Route: User Signup ───────────────────────
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─── Route: User Login ────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─── Route: Update User Plan ──────────────────
// ✅ After signup, user can select their plan/package
app.post("/api/auth/update-plan", async (req, res) => {
  const { userId, plan } = req.body;

  console.log("📝 [PLAN UPDATE] Incoming request:", { userId, plan });

  try {
    // ✅ Validate userId
    if (!userId) {
      console.warn("⚠️  [PLAN UPDATE] Missing userId");
      return res.status(400).json({ msg: "User ID is required" });
    }

    // Validate plan
    const validPlans = ['Basic', 'Standard', 'Premium'];
    if (!validPlans.includes(plan)) {
      console.warn("⚠️  [PLAN UPDATE] Invalid plan:", plan);
      return res.status(400).json({ msg: "Invalid plan selection" });
    }

    console.log("📍 [PLAN UPDATE] Looking for user with ID:", userId);

    // Update user plan
    const user = await User.findByIdAndUpdate(
      userId,
      { plan },
      { new: true }
    );

    if (!user) {
      console.warn("⚠️  [PLAN UPDATE] User not found:", userId);
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("✅ [PLAN UPDATE] Plan updated successfully:", { userId, plan: user.plan });
    res.status(200).json({ 
      msg: "Plan updated successfully", 
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan } 
    });
  } catch (err) {
    console.error("❌ [PLAN UPDATE] Error updating plan:", err.message);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
});

// ─── Route: Live User Count ───────────────────
app.get("/api/stats/user-count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─── Route: Total Jobs Analyzed ──────────────
// ✅ Aggregates the total number of jobs across all saved analyses
app.get("/api/stats/jobs-analyzed", async (req, res) => {
  try {
    const result = await Analysis.aggregate([
      {
        $group: {
          _id: null,
          totalJobs: { $sum: { $size: "$jobs" } },
        },
      },
    ]);

    const total = result.length > 0 ? result[0].totalJobs : 0;
    res.json({ count: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─── Route: Analysis (save & history) ────────
app.use("/api/analysis", analysisRoutes);

// ─── Route: CV Upload & Job Search ───────────
app.post("/api/search-jobs", upload.single("cv"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No CV file uploaded." });

  const { location, jobTypes, extraNotes } = req.body;
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    let messageContent = [];

    if (mimeType === "application/pdf") {
      const pdfData = fs.readFileSync(filePath).toString("base64");
      messageContent = [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfData } },
        { type: "text", text: buildJobSearchPrompt(location, jobTypes, extraNotes) },
      ];
    } else if (mimeType.startsWith("image/")) {
      const imgData = fs.readFileSync(filePath).toString("base64");
      messageContent = [
        { type: "image", source: { type: "base64", media_type: mimeType, data: imgData } },
        { type: "text", text: buildJobSearchPrompt(location, jobTypes, extraNotes) },
      ];
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Please upload a PDF or image file." });
    }

    // ─── SSE Streaming ────────────────────────
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: messageContent }],
    });

    let fullText = "";

    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        fullText += chunk.delta.text;
        res.write(`data: ${JSON.stringify({ type: "progress", text: chunk.delta.text })}\n\n`);
      }
    }

    // ─── Parse JSON Response ──────────────────
    const clean = fullText.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Could not parse JSON from Anthropic");
    }

    res.write(`data: ${JSON.stringify({ type: "result", data: parsed })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();

  } catch (err) {
    console.error("❌ Error:", err.message);
    if (!res.headersSent) return res.status(500).json({ error: err.message });
    try {
      res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
      res.end();
    } catch (_) {}
  } finally {
    try {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
  }
});

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));