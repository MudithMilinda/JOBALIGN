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

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    console.log("📤 [SIGNUP] Response sent successfully for user:", user.name);
  } catch (err) {
    console.error("❌ [SIGNUP] Error during registration:", err);
    res.status(500).json({ msg: "Server error" });
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

    // ✅ user object  return  — Navbar 
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};