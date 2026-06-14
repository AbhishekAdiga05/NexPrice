"use client";

import { ArrowRight } from "lucide-react";

export default function LandingCTA({ label = "Start Tracking", onShowAuth }) {
  return (
    <button
      onClick={onShowAuth}
      className="inline-flex items-center gap-2.5 rounded-xl font-semibold text-[15px] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] h-12 px-7 bg-primary text-primary-foreground hover:bg-orange-600"
    >
      {label}
      <ArrowRight className="size-4" />
    </button>
  );
}
