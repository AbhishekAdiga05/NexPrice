"use client";

import { useEffect, useState } from "react";
import { getPriceHistory } from "@/app/actions";
import { calculateDealScore } from "@/lib/deal-score";
import { Loader2, TrendingDown, TrendingUp, Minus } from "lucide-react";

const TIER_STYLES = {
  great: "bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-400",
  good: "bg-indigo-500/[0.08] border-indigo-500/30 text-indigo-400",
  fair: "bg-amber-500/[0.08] border-amber-500/30 text-amber-400",
  poor: "bg-red-500/[0.08] border-red-500/30 text-red-400",
  none: "bg-white/[0.04] border-white/[0.08] text-muted-foreground",
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border border-white/[0.08] bg-white/[0.04] text-muted-foreground">
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${style}`}
      title={`Deal Score: ${result.score}/100 — ${result.label}`}
    >
      <Icon className="size-2.5" />
      {result.score}
    </span>
  );
}
