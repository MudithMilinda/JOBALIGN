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
// 🌐 CORS
// ─────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
}));

// ─────────────────────────────────────────────
// 🔥 STRIPE WEBHOOK (MUST BE BEFORE JSON PARSER)
// ─────────────────────────────────────────────
app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
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
        { new: true }
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
});

// ─────────────────────────────────────────────
// 🧠 Middleware
// ─────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─────────────────────────────────────────────
// 🗄️ MongoDB Connection
// ─────────────────────────────────────────────
mongoose.set("strictQuery", false);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

// ─────────────────────────────────────────────
// 👤 Models
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: {
    type: String,
    enum: ["Basic", "Standard", "Premium"],
    default: "Basic",
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

const analysisSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  jobs: { type: Array, default: [] },
}, { timestamps: true });

const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

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

// ✅ Get Current User (success page plan sync සඳහා)
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

// ✅ Update User Plan (called after payment success from frontend)
app.post("/api/auth/update-plan", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !['Basic', 'Standard', 'Premium'].includes(plan)) {
      console.warn("⚠️ [PLAN UPDATE] Invalid plan:", plan);
      return res.status(400).json({ msg: "Invalid plan" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { plan },
      { new: true }
    ).select("-password");

    if (!user) {
      console.warn("⚠️ [PLAN UPDATE] User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("✅ [PLAN UPDATE] Plan updated successfully:", { userId: user._id, plan: user.plan });

    res.json({
      msg: "Plan updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      }
    });
  } catch (err) {
    console.error("❌ [PLAN UPDATE] Error:", err.message);
    res.status(500).json({ msg: "Server error" });
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
// 🤖 Anthropic Setup
// ─────────────────────────────────────────────
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─────────────────────────────────────────────
// 🚀 Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});