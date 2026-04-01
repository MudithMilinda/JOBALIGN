import express from "express";
import { registerUser, updateUserPlan } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", registerUser);
// ✅ Add route to update user plan after signup
router.post("/update-plan", updateUserPlan);

export default router;