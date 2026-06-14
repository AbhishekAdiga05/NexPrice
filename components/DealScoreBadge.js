"use client";

import { useEffect, useState } from "react";
import { getPriceHistory } from "@/app/actions";
import { calculateDealScore } from "@/lib/deal-score";
import { Loader2, TrendingDown, TrendingUp, Minus, Sparkles } from "lucide-react";

const TIER_CONFIG = {
  great: {
    bg: "bg-emerald-50",
    border: "border-emerald-200/60",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Great Deal",
    icon: Sparkles,
  },
  good: {
    bg: "bg-indigo-50",
    border: "border-indigo-200/60",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
    label: "Good Deal",
    icon: TrendingDown,
  },
  fair: {
    bg: "bg-amber-50",
    border: "border-amber-200/60",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Fair",
    icon: Minus,
  },
  poor: {
    bg: "bg-red-50",
    border: "border-red-200/60",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Not Now",
    icon: TrendingUp,
  },
  none: {
    bg: "bg-gray-50",
    border: "border-gray-200/60",
    text: "text-muted-foreground",
    dot: "bg-gray-300",
    label: "No Data",
    icon: Minus,
  },
};

export default function DealScoreBadge({ productId, currentPrice, showLabel = true }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

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
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text} shadow-sm`}
      title={`Deal Score: ${result.score}/100 — ${cfg.label}`}
    >
      <span className={`size-1.5 rounded-full ${cfg.dot} shrink-0`} />
      <Icon className="size-3 shrink-0" />
      <span className="font-mono font-bold">{result.score}</span>
      {showLabel && (
        <>
          <span className="text-muted-foreground/30 mx-0.5">/</span>
          <span>{cfg.label}</span>
        </>
      )}
    </span>
  );
}
