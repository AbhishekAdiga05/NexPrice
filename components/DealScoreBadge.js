"use client";

import { useEffect, useState } from "react";
import { getPriceHistory } from "@/app/actions";
import { calculateDealScore } from "@/lib/deal-score";
import { Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";

const TIER_STYLES = {
  great: "bg-emerald-50 border-emerald-200 text-emerald-700",
  good: "bg-indigo-50 border-indigo-200 text-indigo-700",
  fair: "bg-amber-50 border-amber-200 text-amber-700",
  poor: "bg-red-50 border-red-200 text-red-700",
  none: "bg-gray-50 border-gray-200 text-gray-400",
};

const ICONS = {
  great: TrendingDown,
  good: TrendingDown,
  fair: Minus,
  poor: TrendingUp,
};

export default function DealScoreBadge({ productId, currentPrice }) {
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border border-gray-200 bg-gray-50 text-gray-400">
        <Loader2 className="size-2.5 animate-spin" />
        Score
      </span>
    );
  }

  if (!result || result.score === null) {
    return null;
  }

  const Icon = ICONS[result.tier];
  const style = TIER_STYLES[result.tier];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${style}`}
      title={`Deal Score: ${result.score}/100 — ${result.label}`}
      aria-label={`Deal Score: ${result.score}/100 — ${result.label}`}
    >
      <Icon className="size-2.5" />
      {result.score}
    </span>
  );
}
