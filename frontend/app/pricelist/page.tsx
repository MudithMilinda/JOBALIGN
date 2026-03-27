'use client';

import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle2, XCircle } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "$2.99",
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
    price: "$5.99",
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
    price: "$7.99",
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />

      <section className="py-30 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-slate-400 text-lg">
            Flexible pricing for every stage of your job search
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 hover:scale-105 transition-all duration-300"
            >
              {/* Plan Name */}
              <div className="mb-6">
                <span className={`px-4 py-1 rounded-full text-sm bg-gradient-to-r ${plan.color}`}>
                  {plan.name}
                </span>
              </div>

              {/* Price */}
              <h2 className="text-5xl font-bold mb-2">
                {plan.price}
              </h2>
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
                    <span className={`${feature.included ? "" : "text-gray-500"}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                className={`w-full py-3 rounded-xl font-semibold bg-gradient-to-r ${plan.color} hover:opacity-90 transition`}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}