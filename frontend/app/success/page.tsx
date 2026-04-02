'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function SuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [plan, setPlan] = useState<string>("");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    // ✅ Get plan from URL (VERY IMPORTANT)
    const boughtPlan = searchParams.get("plan");

    useEffect(() => {
        const syncUserPlan = async () => {
            const userStr = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!userStr || !token) {
                console.warn("⚠️ No user or token found");
                router.push("/");
                return;
            }

            const user = JSON.parse(userStr);
            const planFromUrl = boughtPlan; // Get from URL query params

            console.log("📝 [SUCCESS] Syncing plan:", { boughtPlan: planFromUrl, userId: user.id });

            try {
                // ✅ If we have plan from URL, update the backend
                if (planFromUrl && ['Basic', 'Standard', 'Premium'].includes(planFromUrl)) {
                    const updateRes = await fetch("http://localhost:5000/api/auth/update-plan", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ plan: planFromUrl }),
                    });

                    if (updateRes.ok) {
                        const updateData = await updateRes.json();
                        console.log("✅ [SUCCESS] Plan updated in database:", updateData.user.plan);

                        // ✅ Update localStorage
                        const updatedUser = { ...user, plan: updateData.user.plan };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        setPlan(updateData.user.plan);

                        // 🔄 Notify navbar
                        window.dispatchEvent(new Event("auth-change"));
                        window.dispatchEvent(new Event("planUpdated"));

                        setStatus("success");
                        return;
                    }
                }

                // 📍 Fallback: Fetch current plan from backend
                const res = await fetch("http://localhost:5000/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("📝 [SUCCESS] Fetched plan from DB:", data.plan);

                    // ✅ Update localStorage
                    const updatedUser = { ...user, plan: data.plan };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setPlan(data.plan);

                    // 🔄 Notify navbar
                    window.dispatchEvent(new Event("auth-change"));
                    window.dispatchEvent(new Event("planUpdated"));

                    setStatus("success");
                } else {
                    console.warn("⚠️ Failed to fetch user plan");
                    setStatus("error");
                }
            } catch (err) {
                console.error("❌ [SUCCESS] Sync failed:", err);
                setStatus("error");
            }
        };

        // ⏳ Small delay for webhook processing
        const delay = setTimeout(syncUserPlan, 1000);
        return () => clearTimeout(delay);

    }, []);

    // ✅ Redirect after success
    useEffect(() => {
        if (status === "success") {
            const timer = setTimeout(() => {
                router.push("/");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
            <div className="text-center space-y-6">

                {/* 🔄 LOADING */}
                {status === "loading" && (
                    <>
                        <Loader2 className="w-20 h-20 text-violet-400 mx-auto animate-spin" />
                        <h1 className="text-4xl font-bold">Processing Payment...</h1>
                        <p className="text-slate-400">Please wait a moment</p>
                    </>
                )}

                {/* ✅ SUCCESS */}
                {status === "success" && (
                    <>
                        <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" />
                        <h1 className="text-4xl font-bold">Payment Successful! 🎉</h1>

                        {plan && (
                            <p className="text-violet-400 text-lg">
                                You are now on the{" "}
                                <span
                                    className={`font-bold px-3 py-1 rounded-full text-white text-sm ${plan === "Premium"
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                            : plan === "Standard"
                                                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                                : "bg-gradient-to-r from-cyan-500 to-blue-500"
                                        }`}
                                >
                                    {plan}
                                </span>{" "}
                                plan
                            </p>
                        )}

                        <p className="text-slate-400">
                            Redirecting to home in 3 seconds...
                        </p>
                    </>
                )}

                {/* ⚠️ ERROR */}
                {status === "error" && (
                    <>
                        <CheckCircle2 className="w-20 h-20 text-yellow-400 mx-auto" />
                        <h1 className="text-4xl font-bold">Payment Completed</h1>

                        <p className="text-slate-400">
                            Plan will update shortly. Please refresh if needed.
                        </p>

                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-2 rounded-full bg-violet-500 hover:bg-violet-600 transition"
                        >
                            Go Home
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}