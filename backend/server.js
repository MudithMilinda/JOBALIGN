import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });

// Validate API key on startup
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY is missing in .env");
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Allow requests from Next.js frontend
app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3000", "http://localhost:3002"],
  methods: ["GET", "POST"],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Ensure uploads dir exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ─── Helper: build the job-search prompt ──────────────────────────────────────
function buildJobSearchPrompt(location, jobTypes, extraNotes) {
  return `You are an expert career advisor and job market researcher. A candidate has uploaded their CV/resume. Your task is to:

1. **Extract & analyze** the candidate's skills, experience level, tech stack, education, and project highlights from the CV.
2. **Generate 20 highly targeted job openings** that match their profile. For each job include:
   - Job title
   - Company name (real companies in their region when possible)
   - Location (${location || "Sri Lanka / Remote"})
   - Job type preference: ${jobTypes || "internship, entry-level, junior"}
   - Match quality: "Strong fit" or "Good fit"
   - 3-5 relevant skill tags from the candidate's own skill set
   - A direct application URL (use real job boards: itpro.lk, linkedin.com/jobs, rooster.jobs, careers pages)
   - A one-sentence reason WHY this role matches the candidate

3. Also provide:
   - A brief **candidate summary** (2-3 sentences) highlighting their strongest assets
   - **Top 3 standout skills** from their profile
   - **2-3 resume improvement tips** specific to their target roles

${extraNotes ? `Additional context from user: ${extraNotes}` : ""}

Respond ONLY with valid JSON in exactly this structure:
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
      "tags": ["tag1", "tag2", "tag3"],
      "url": "https://...",
      "reason": "string"
    }
  ]
}`;
}

// ─── Route: analyze CV + search jobs ──────────────────────────────────────────
app.post("/api/search-jobs", upload.single("cv"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No CV file uploaded." });
  }

  const { location, jobTypes, extraNotes } = req.body;
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    let messageContent = [];

    // Handle PDF vs image CV
    if (mimeType === "application/pdf") {
      const pdfData = fs.readFileSync(filePath).toString("base64");
      messageContent = [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: pdfData },
        },
        { type: "text", text: buildJobSearchPrompt(location, jobTypes, extraNotes) },
      ];
    } else if (mimeType.startsWith("image/")) {
      const imgData = fs.readFileSync(filePath).toString("base64");
      messageContent = [
        {
          type: "image",
          source: { type: "base64", media_type: mimeType, data: imgData },
        },
        { type: "text", text: buildJobSearchPrompt(location, jobTypes, extraNotes) },
      ];
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Please upload a PDF or image file." });
    }

    // Stream response from Claude
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
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        fullText += chunk.delta.text;
        res.write(`data: ${JSON.stringify({ type: "progress", text: chunk.delta.text })}\n\n`);
      }
    }

    // Parse and send final result
    const clean = fullText.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      // Try to extract JSON from text
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error("Could not parse JSON response from Claude.");
    }

    res.write(`data: ${JSON.stringify({ type: "result", data: parsed })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();

  } catch (err) {
    const msg = err?.message || "Unknown server error";
    console.error("❌ Error:", msg);

    // Headers not sent yet → plain JSON error response
    if (!res.headersSent) {
      return res.status(500).json({ error: msg });
    }

    // Headers already sent (SSE started) → send error event then close
    try {
      res.write(`data: ${JSON.stringify({ type: "error", message: msg })}\n\n`);
      res.end();
    } catch (_) {
      // client already disconnected
    }
  } finally {
    // Always clean up the uploaded temp file
    try {
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅  CV Job Search running at http://localhost:${PORT}`));