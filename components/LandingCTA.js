"use client";

import { ArrowRight } from "lucide-react";

export default function LandingCTA({ label = "Start Tracking", onShowAuth }) {
  return (
    <button
      onClick={onShowAuth}
      className="group inline-flex items-center gap-2.5 rounded-xl font-semibold text-[15px] transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] h-12 px-7 bg-primary text-primary-foreground hover:bg-orange-600"
    >
      <span>{label}</span>
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
}
