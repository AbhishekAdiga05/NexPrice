"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";
import { ArrowRight } from "lucide-react";

export default function LandingCTA({ variant = "primary" }) {
  const [showAuth, setShowAuth] = useState(false);

  const base =
    "inline-flex items-center gap-2 rounded-xl font-bold text-sm transition-all cursor-pointer";
  const primary =
    "h-14 px-8 bg-accent text-white hover:bg-accent/90 shadow-lg shadow-glow-accent hover:shadow-xl hover:shadow-glow-accent hover:-translate-y-0.5";
  const secondary =
    "h-12 px-8 bg-accent text-white hover:bg-accent/90 shadow-lg shadow-glow-accent hover:shadow-xl hover:-translate-y-0.5";

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        className={`${base} ${variant === "primary" ? primary : secondary}`}
      >
        Start Saving Free
        <ArrowRight className="size-4" />
      </button>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
