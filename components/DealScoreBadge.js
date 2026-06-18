"use client";

import { useEffect, useState } from "react";
import { getPriceHistory } from "@/app/actions";
import { calculateDealScore } from "@/lib/deal-score";
import { Loader2 } from "lucide-react";

const TIER_CONFIG = {
  great: { color: "#10b981", label: "Great Deal" },
  good: { color: "#6366f1", label: "Good Deal" },
  fair: { color: "#f59e0b", label: "Fair" },
  poor: { color: "#ef4444", label: "Not Now" },
  none: { color: "#9ca3af", label: "No Data" },
};

export default function DealScoreBadge({ productId, currentPrice, showLabel = true }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const history = await getPriceHistory(productId);
      if (!cancelled) {
        setResult(calculateDealScore(parseFloat(currentPrice), history));
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [productId, currentPrice]);

  useEffect(() => {
    if (!result || result.score === null) return;
    const timer = setTimeout(() => setAnimatedScore(result.score), 100);
    return () => clearTimeout(timer);
  }, [result]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200/60 bg-gray-50 text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Score
      </span>
    );
  }

  if (!result || result.score === null) {
    return null;
  }

  const cfg = TIER_CONFIG[result.tier] || TIER_CONFIG.none;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      <div className="relative size-10 shrink-0">
        <svg className="size-10 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="3" />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={cfg.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono"
          style={{ color: cfg.color }}>
          {animatedScore}
        </span>
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>
          {cfg.label}
        </span>
      )}
    </div>
  );
}
