import Stripe from "stripe";

export const createCheckoutSession = async (req, res) => {
  const { userId, plan } = req.body;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const PRICE_IDS = {
    Standard: process.env.STRIPE_PRICE_STANDARD,
    Premium: process.env.STRIPE_PRICE_PREMIUM,
  };

  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return res.status(400).json({ error: `Invalid plan: ${plan}` });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId, plan },
      // ✅ Include plan in success URL so frontend knows which plan was purchased
      success_url: `http://localhost:3000/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:3000/pricelist",
    });

    console.log("📝 [STRIPE] Checkout session created:", { userId, plan, sessionId: session.id });
    res.json({ url: session.url });

  } catch (err) {
    console.error("❌ Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
};