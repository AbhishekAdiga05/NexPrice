"use client";

import { useEffect, useState } from "react";
import { getStorePrices } from "@/app/actions";
import { getStoreSummary } from "@/lib/store-utils";
import { Store, TrendingDown, Zap } from "lucide-react";

export default function StorePriceBadge({ productId, currency = "INR", compact = false }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetch() {
      const prices = await getStorePrices(productId);
      if (mounted) {
        setSummary(getStoreSummary(prices, currency));
        setLoading(false);
      }
    }
    fetch();
    return () => { mounted = false; };
  }, [productId, currency]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/50 animate-pulse">
        <Store className="size-3" />
        <span>Loading stores...</span>
      </div>
    );
  }

  if (!summary || !summary.cheapestPrice || isNaN(summary.cheapestPrice)) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
          <TrendingDown className="size-3 text-orange-500" />
          {summary.currency} {summary.cheapestPrice.toFixed(2)}
        </span>
        <span className="text-muted-foreground font-medium">at {summary.cheapestStore}</span>
        <span className="text-muted-foreground/50">&middot;</span>
        <span className="text-muted-foreground/70">{summary.storeCount} {summary.storeCount === 1 ? "store" : "stores"}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-orange-50/30 border border-orange-100/80">
        <Zap className="size-3 text-orange-500" />
        <span className="text-xs font-bold text-foreground">
          {summary.currency} {summary.cheapestPrice.toFixed(2)}
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
          at {summary.cheapestStore}
        </span>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100/80">
        <Store className="size-3 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">{summary.storeCount}</span>
        <span className="text-[11px] text-muted-foreground font-medium">{summary.storeCount === 1 ? "store" : "stores"}</span>
      </div>

      {summary.storeCount > 1 && (
        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100/80">
          <TrendingDown className="size-3 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 font-mono">
            Save {summary.currency} {parseFloat(summary.savings).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
