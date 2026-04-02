import express from "express";
import { createCheckoutSession } from "../controllers/stripeController.js";

const router = express.Router();

// 💳 Create Stripe Checkout Session
router.post("/create-checkout-session", createCheckoutSession);

export default router;