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
import Stripe from "stripe";

// Routes
import analysisRoutes from "./routes/analysisRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";

dotenv.config();

// 🤖 Anthropic Setup (Moved to the top to fix initialization error)
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─────────────────────────────────────────────
// 📦 Multer Setup
// ─────────────────────────────────────────────
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ─────────────────────────────────────────────
// 🌐 CORS (Updated to support Vercel Frontend & Localhost)
// ─────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:3001",
    ].filter(Boolean),
    credentials: true,
  }),
);

// ─────────────────────────────────────────────
// 🔥 STRIPE WEBHOOK (MUST BE BEFORE JSON PARSER)
// ─────────────────────────────────────────────
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("❌ Webhook signature error:", err.message);
      return res.sendStatus(400);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        console.log("✅ Payment successful:", { userId, plan });

        const user = await User.findByIdAndUpdate(
          userId,
          { plan },
          { new: true },
        );

        if (user) {
          console.log("✅ Plan updated in DB:", user.plan);
        } else {
          console.warn("⚠️ User not found for update");
        }
      }
    } catch (err) {
      console.error("❌ Webhook processing error:", err.message);
    }

    res.sendStatus(200);
  },
);

// ─────────────────────────────────────────────
// 🧠 Middleware
// ─────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─────────────────────────────────────────────
// 🗄️ MongoDB Connection
// ─────────────────────────────────────────────
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ─────────────────────────────────────────────
// 👤 Models
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plan: {
      type: String,
      enum: ["Basic", "Standard", "Premium"],
      default: "Basic",
    },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

const analysisSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    jobs: { type: Array, default: [] },
  },
  { timestamps: true },
);

const Analysis =
  mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

// ─────────────────────────────────────────────
// 🔐 Auth Middleware
// ─────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

// ─────────────────────────────────────────────
// 🔐 Auth Routes
// ─────────────────────────────────────────────
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get Current User
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Update User Plan
app.post("/api/auth/update-plan", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !["Basic", "Standard", "Premium"].includes(plan)) {
      console.warn("⚠️ [PLAN UPDATE] Invalid plan:", plan);
      return res.status(400).json({ msg: "Invalid plan" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { plan },
      { new: true },
    ).select("-password");

    if (!user) {
      console.warn("⚠️ [PLAN UPDATE] User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("✅ [PLAN UPDATE] Plan updated successfully:", {
      userId: user._id,
      plan: user.plan,
    });

    res.json({
      msg: "Plan updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (err) {
    console.error("❌ [PLAN UPDATE] Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

function buildJobSearchPrompt(location, jobTypes, extraNotes) {
  return `You are an expert career advisor and job market researcher. Analyze the uploaded CV and return targeted job matches.

Extract the candidate's skills, experience level, tech stack, education, and project highlights. Generate 20 highly targeted job openings for ${location || "Sri Lanka / Remote"}, prioritizing ${jobTypes || "internship, entry-level, junior"}. Use real companies and job boards when possible. For each job include a direct application URL, 3-5 skill tags, a match quality of "Strong fit" or "Good fit", and one sentence explaining the match.

Also provide a 2-3 sentence candidate summary, the top 3 standout skills, and 2-3 resume improvement tips.

${extraNotes ? `Additional context from the user: ${extraNotes}` : ""}

Respond ONLY with valid JSON in exactly this structure:
{
  "candidateSummary": "string",
  "topSkills": ["skill1", "skill2", "skill3"],
  "resumeTips": ["tip1", "tip2", "tip3"],
  "jobs": [{
    "id": 1,
    "title": "string",
    "company": "string",
    "location": "string",
    "type": "fullstack|qa|mobile|frontend|backend|other",
    "matchQuality": "Strong fit|Good fit",
    "tags": ["tag1", "tag2", "tag3"],
    "url": "https://...",
    "reason": "string"
  }]
}`;
}

app.post("/api/search-jobs", upload.single("cv"), async (req, res) => {
  const filePath = req.file?.path;

  if (!req.file) {
    return res.status(400).json({ error: "No CV file uploaded." });
  }

  try {
    const { location, jobTypes, extraNotes } = req.body;
    const { mimetype } = req.file;
    let messageContent;

    if (mimetype === "application/pdf") {
      messageContent = [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: fs.readFileSync(filePath).toString("base64"),
          },
        },
        {
          type: "text",
          text: buildJobSearchPrompt(location, jobTypes, extraNotes),
        },
      ];
    } else if (mimetype.startsWith("image/")) {
      messageContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: mimetype,
            data: fs.readFileSync(filePath).toString("base64"),
          },
        },
        {
          type: "text",
          text: buildJobSearchPrompt(location, jobTypes, extraNotes),
        },
      ];
    } else {
      return res
        .status(400)
        .json({ error: "Please upload a PDF or image file." });
    }

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
        res.write(
          `data: ${JSON.stringify({ type: "progress", text: chunk.delta.text })}\n\n`,
        );
      }
    }

    const clean = fullText.replace(/```json|```/g, "").trim();
    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Could not parse JSON response from Claude.");
      result = JSON.parse(match[0]);
    }

    res.write(`data: ${JSON.stringify({ type: "result", data: result })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    const message = err?.message || "Unknown server error";
    console.error("Job search error:", message);

    if (!res.headersSent) return res.status(500).json({ error: message });
    res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
    res.end();
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

// ─────────────────────────────────────────────
// 📊 Stats Routes
// ─────────────────────────────────────────────
app.get("/api/stats/user-count", async (req, res) => {
  const count = await User.countDocuments();
  res.json({ count });
});

app.get("/api/stats/jobs-analyzed", async (req, res) => {
  const result = await Analysis.aggregate([
    {
      $group: {
        _id: null,
        totalJobs: { $sum: { $size: "$jobs" } },
      },
    },
  ]);

  res.json({ count: result[0]?.totalJobs || 0 });
});

// ─────────────────────────────────────────────
// 📁 Analysis Routes
// ─────────────────────────────────────────────
app.use("/api/analysis", analysisRoutes);

// ─────────────────────────────────────────────
// 💳 Stripe Routes
// ─────────────────────────────────────────────
app.use("/api/stripe", stripeRoutes);

// ─────────────────────────────────────────────
// 🚀 Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});