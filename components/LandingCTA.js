"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";
import { ArrowRight } from "lucide-react";

export default function LandingCTA({ variant = "primary" }) {
  const [showAuth, setShowAuth] = useState(false);

  const primary = "h-11 px-6 bg-orange-500 text-white hover:bg-orange-600 shadow-sm";
  const secondary = "h-10 px-5 bg-orange-500 text-white hover:bg-orange-600 shadow-sm";

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className={`inline-flex items-center gap-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
          variant === "primary" ? primary : secondary
        }`}
      >
        Start Saving Free
        <ArrowRight className="size-4" />
      </button>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
