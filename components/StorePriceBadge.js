"use client";

import { useEffect, useState } from "react";
import { getStorePrices } from "@/app/actions";
import { getStoreSummary } from "@/lib/store-utils";
import { Store, TrendingDown } from "lucide-react";

export default function StorePriceBadge({ productId, currency = "INR" }) {
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

  if (!summary) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <div className="flex items-center gap-1.5">
        <TrendingDown className="size-3 text-orange-500" />
        <span className="text-xs font-semibold text-foreground">
          Best: {summary.currency} {summary.cheapestPrice.toFixed(2)}
        </span>
        <span className="text-[11px] text-muted-foreground font-medium">
          at {summary.cheapestStore}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground/60 font-mono">
        {summary.storeCount} {summary.storeCount === 1 ? "store" : "stores"}
      </span>
      {summary.storeCount > 1 && (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
          Save {summary.currency} {parseFloat(summary.savings).toFixed(2)}
        </span>
      )}
    </div>
  );
}
