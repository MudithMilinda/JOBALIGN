'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface SuccessModalProps {
  onClose?: () => void;
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plan, setPlan] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const boughtPlan = searchParams.get("plan");

  useEffect(() => {
    const syncUserPlan = async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!userStr || !token) {
        router.push("/");
        return;
      }

      const user = JSON.parse(userStr);

      try {
        if (boughtPlan && ['Basic', 'Standard', 'Premium'].includes(boughtPlan)) {
          const updateRes = await fetch("http://localhost:5000/api/auth/update-plan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ plan: boughtPlan }),
          });

          if (updateRes.ok) {
            const updateData = await updateRes.json();
            const updatedUser = { ...user, plan: updateData.user.plan };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setPlan(updateData.user.plan);
            window.dispatchEvent(new Event("auth-change"));
            window.dispatchEvent(new Event("planUpdated"));
            setStatus("success");
            return;
          }
        }

        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const updatedUser = { ...user, plan: data.plan };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setPlan(data.plan);
          window.dispatchEvent(new Event("auth-change"));
          window.dispatchEvent(new Event("planUpdated"));
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    const delay = setTimeout(syncUserPlan, 1000);
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        onClose ? onClose() : router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const planBadgeClass =
    plan === "Premium"
      ? "bg-gradient-to-r from-purple-500 to-pink-500"
      : plan === "Standard"
      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
      : "bg-gradient-to-r from-cyan-500 to-blue-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">

        {/* Loading */}
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-14 h-14 text-violet-400 mx-auto animate-spin" />
            <h2 className="text-2xl font-bold text-white">Processing payment...</h2>
            <p className="text-slate-400">Please wait a moment</p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Payment successful! 🎉</h2>
            {plan && (
              <p className="text-violet-300 text-base">
                You are now on the{" "}
                <span className={`font-bold px-3 py-1 rounded-full text-white text-sm ${planBadgeClass}`}>
                  {plan}
                </span>{" "}
                plan
              </p>
            )}
            <div className="w-full bg-slate-700 rounded-full h-1 mt-4 overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full animate-[grow_3s_linear_forwards]" />
            </div>
            <p className="text-slate-400 text-sm">Redirecting to home in 3 seconds...</p>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="space-y-4">
            <AlertCircle className="w-14 h-14 text-yellow-400 mx-auto" />
            <h2 className="text-2xl font-bold text-white">Payment completed</h2>
            <p className="text-slate-400">Plan will update shortly. Please refresh if needed.</p>
            <button
              onClick={() => onClose ? onClose() : router.push("/")}
              className="px-6 py-2 rounded-full bg-violet-500 hover:bg-violet-600 transition text-white"
            >
              Go home
            </button>
          </div>
        )}

      </div>
    </div>
  );
}