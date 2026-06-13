"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";
import { ArrowRight } from "lucide-react";

export default function LandingCTA({ variant = "primary", label = "Start Tracking" }) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className={`inline-flex items-center gap-2.5 rounded-xl font-semibold text-[15px] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] ${
          variant === "primary"
            ? "h-12 px-7 bg-primary text-primary-foreground hover:bg-orange-600"
            : "h-12 px-7 bg-primary text-primary-foreground hover:bg-orange-600"
        }`}
      >
        {label}
        <ArrowRight className="size-4" />
      </button>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
