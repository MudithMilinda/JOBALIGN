import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // ✅ Log incoming signup data (including numbers in name)
  console.log("📝 [SIGNUP] Incoming data:", { name, email, passwordLength: password?.length });

  try {
    // ✅ Validate name allows numbers and check length (max 100 characters)
    if (!name || !name.trim()) {
      console.warn("⚠️  [SIGNUP] Invalid name:", name);
      return res.status(400).json({ msg: "Name is required" });
    }

    if (name.trim().length > 100) {
      console.warn("⚠️  [SIGNUP] Name exceeds max length:", { name, length: name.trim().length });
      return res.status(400).json({ msg: "Name must be 100 characters or less" });
    }

    console.log("✓ [SIGNUP] Name validation passed (supports numbers, max 100 chars):", name);

    const existing = await User.findOne({ email });
    if (existing) {
      console.warn("⚠️  [SIGNUP] User already exists:", email);
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user with name (supports alphanumeric)
    const user = new User({ name, email, password: hashedPassword });
    console.log("💾 [SIGNUP] User created object:", { name: user.name, email: user.email, userId: user._id });

    await user.save();
    console.log("✅ [SIGNUP] User saved to database:", { userId: user._id, name: user.name, email: user.email });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, plan: user.plan } });
    console.log("📤 [SIGNUP] Response sent successfully for user:", user.name);
  } catch (err) {
    console.error("❌ [SIGNUP] Error during registration:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ UPDATE PLAN function
export const updateUserPlan = async (req, res) => {
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
    res.status(200).json({ msg: "Plan updated successfully", user: { id: user._id, name: user.name, email: user.email, plan: user.plan } });
  } catch (err) {
    console.error("❌ [PLAN UPDATE] Error updating plan:", err.message);
    console.error("❌ [PLAN UPDATE] Full error:", err);
    res.status(500).json({ msg: "Server error: " + err.message });
  }
};

// ✅ LOGIN function add 
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // User check
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    // Token generate
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // ✅ user object return — Navbar (includes plan)
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan || 'Basic',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};