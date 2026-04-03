'use client';

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  plan?: string;
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
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData: UserData = JSON.parse(userStr);
        setUser(userData);
        setSelectedPlan(userData.plan || "Basic");
      } catch {
        console.error("Error loading user");
      }
    }
  }, []);

  const handleSelectPlan = (planName: string) => {
    if (!user) {
      alert("Please sign up first");
      router.push("/signup");
      return;
    }
    if (planName === "Basic") {
      setSelectedPlan("Basic");
      const updatedUser = { ...user, plan: "Basic" };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("✅ Basic plan selected");
      setTimeout(() => router.push("/"), 1500);
    }
  };

  const handleCheckout = async (plan: string) => {
    if (!user) {
      alert("Login first");
      router.push("/signup");
      return;
    }
    try {
      setLoadingPlan(plan);
      const res = await fetch("http://localhost:5000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id || user._id, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error: ${res.status}`);
      if (!data.url) throw new Error("No checkout URL returned");
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      console.error("Checkout error:", err);
      alert(`Payment failed: ${message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <section className="py-30 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-slate-400 text-lg">Flexible pricing for every stage of your job search</p>
          {user && (
            <p className="text-violet-400 text-sm mt-2">
              👤 {user.name} | Current Plan: {selectedPlan}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index}
              className={`bg-white/5 border backdrop-blur-sm rounded-3xl p-8 hover:scale-105 transition-all duration-300 ${
                selectedPlan === plan.name ? "border-violet-500 scale-105 bg-violet-500/10" : "border-white/10"
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                <span className={`px-4 py-1 rounded-full text-sm bg-gradient-to-r ${plan.color}`}>
                  {plan.name}
                </span>
                {selectedPlan === plan.name && <CheckCircle2 className="w-5 h-5 text-green-400" />}
              </div>

              <h2 className="text-5xl font-bold mb-2">{plan.price}</h2>
              <p className="text-slate-400 mb-6">/ per month</p>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle2 className="text-green-400 w-5 h-5" />
                    ) : (
                      <XCircle className="text-gray-500 w-5 h-5" />
                    )}
                    <span className={!feature.included ? "text-gray-500" : ""}>{feature.text}</span>
                  </div>
                ))}
              </div>

              {plan.name === "Standard" || plan.name === "Premium" ? (
                <button
                  onClick={() => handleCheckout(plan.name)}
                  disabled={loadingPlan === plan.name}
                  className={`w-full py-3 rounded-full font-semibold bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all hover:scale-105 ${loadingPlan === plan.name ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loadingPlan === plan.name ? "⏳ Loading..." : `Subscribe ${plan.name}`}
                </button>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-3 rounded-full font-semibold bg-gradient-to-r ${plan.color} hover:opacity-90 transition-all hover:scale-105`}
                >
                  Subscribe Basic
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