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

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ─── Multer setup for file uploads ─────────────
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Ensure uploads folder exists ─────────────
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ─── Middleware ───────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // your frontend URLs
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
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }, // optional role field
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

// ─── Anthropic Client ────────────────────────
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
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ─── LOGIN ROUTE ───────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // 3. Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4. Send response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

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

    // ─── SSE Streaming ───────────────────────
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

    // ─── Parse JSON Response ─────────────────
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
    try { res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`); res.end(); } catch (_) {}
  } finally {
    // ─── Cleanup uploaded file ─────────────
    try { if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
  }
});

// ─── Start Server ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));