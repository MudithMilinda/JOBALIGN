'use client';

import React, { useState, useEffect } from "react";
import Script from "next/script";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// ✅ Stripe Buy Button Type Declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': {
        'buy-button-id': string;
        'publishable-key': string;
      };
    }
  }
}

const plans = [
  {
    name: "Basic",
    price: "Free",
    color: "from-cyan-500 to-blue-500",
    features: [
      { text: "Resume Analysis", included: true },
      { text: "Basic Job Matching", included: true },
      { text: "Limited Feedback", included: true },
      { text: "Application Tracking", included: false },
      { text: "Priority Support", included: false },
    ],
  },
  {
    name: "Standard",
    price: "$1.50",
    color: "from-blue-500 to-indigo-500",
    features: [
      { text: "Resume Analysis", included: true },
      { text: "Advanced Job Matching", included: true },
      { text: "Detailed Feedback", included: true },
      { text: "Application Tracking", included: true },
      { text: "Priority Support", included: false },
    ],
  },
  {
    name: "Premium",
    price: "$2.50",
    color: "from-purple-500 to-pink-500",
    features: [
      { text: "Resume Analysis", included: true },
      { text: "AI Job Matching", included: true },
      { text: "Full Optimization Tips", included: true },
      { text: "Application Tracking", included: true },
      { text: "Priority Support", included: true },
    ],
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("Basic");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setSelectedPlan(userData.plan || "Basic");
      } catch (err) {
        console.error("Error loading user:", err);
      }
    }
  }, []);

  const handleSelectPlan = async (planName: string) => {
    if (!user) {
      alert("Please sign up first");
      router.push("/signup");
      return;
    }

    // ✅ If already Basic → skip API
    if (planName === "Basic" && selectedPlan === "Basic") {
      alert("✅ Basic plan selected successfully!");

      setTimeout(() => {
        router.push("/");
      }, 1500);

      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan: planName }),
      });

      const data = await res.json();

      if (res.ok) {
        setSelectedPlan(planName);

        const updatedUser = { ...user, plan: planName };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        alert(`✅ ${planName} plan selected successfully!`);

        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        alert(data.msg || "Failed to select plan");
      }
    } catch (err) {
      alert("Error selecting plan");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      
      {/* ✅ Stripe Script */}
      <Script async src="https://js.stripe.com/v3/buy-button.js" />

      <Navbar />

      <section className="py-30 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-slate-400 text-lg">
            Flexible pricing for every stage of your job search
          </p>

          {user && (
            <p className="text-violet-400 text-sm mt-2">
              👤 {user.name} | Current Plan: {selectedPlan}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white/5 border backdrop-blur-sm rounded-3xl p-8 hover:scale-105 transition-all duration-300 relative ${
                selectedPlan === plan.name
                  ? 'border-violet-500 scale-105 bg-violet-500/10'
                  : 'border-white/10'
              }`}
            >
              {/* Stripe badge */}
              {(plan.name === 'Standard' || plan.name === 'Premium') && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 rounded-full text-xs font-semibold">
                  💳 Stripe Payment
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-6 flex items-center justify-between">
                <span className={`px-4 py-1 rounded-full text-sm bg-gradient-to-r ${plan.color}`}>
                  {plan.name}
                </span>
                {selectedPlan === plan.name && (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                )}
              </div>

              {/* Price */}
              <h2 className="text-5xl font-bold mb-2">{plan.price}</h2>
              <p className="text-slate-400 mb-6">/ per month</p>

              {/* Features */}
              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle2 className="text-green-400 w-5 h-5" />
                    ) : (
                      <XCircle className="text-gray-500 w-5 h-5" />
                    )}
                    <span className={!feature.included ? "text-gray-500" : ""}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              {plan.name === 'Standard' ? (
                <stripe-buy-button
                  buy-button-id="buy_btn_1THHCx3L1c0HogFY3O0UHh7J"
                  publishable-key="pk_test_51THGoS3L1c0HogFYrOt2UXSl2Cmnv3qlPHHoWkVJ37Va7O0CAGrOUcnFWNNGXzmMkhjQLn5DH8XxOUIxG83LWP1Z00SKT9mDYP"
                />
              ) : plan.name === 'Premium' ? (
                <stripe-buy-button
                  buy-button-id="buy_btn_1THHLn3L1c0HogFYbad7czQ4"
                  publishable-key="pk_test_51THGoS3L1c0HogFYrOt2UXSl2Cmnv3qlPHHoWkVJ37Va7O0CAGrOUcnFWNNGXzmMkhjQLn5DH8XxOUIxG83LWP1Z00SKT9mDYP"
                />
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={loading}
                  className={`w-full py-3 rounded-full font-semibold bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all hover:scale-105`}
                >
                  {loading ? '⏳ Selecting...' : 'Subscribe'}
                </button>
              )}
            </div>
          ))}
        </div>

        
       
      </section>

      <Footer />
    </div>
  );
}