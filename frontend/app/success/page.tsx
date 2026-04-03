import { Suspense } from "react";
import SuccessModal from "../components/SuccessModal";
import { Loader2 } from "lucide-react";

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
      </div>
    }>
      <SuccessModal />
    </Suspense>
  );
}