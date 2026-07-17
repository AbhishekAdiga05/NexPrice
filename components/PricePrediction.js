"use client";

import { TrendingDown, TrendingUp, TrendingUpDown } from "lucide-react";

export default function PricePrediction({ trend, currentPrice, currency, priceHistory }) {
  if (trend === null || !priceHistory || priceHistory.length < 2) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUpDown className="size-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Trend
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Track more price points to see the trend.
        </p>
      </div>
    );
  }

  const prices = priceHistory.map((p) => parseFloat(p.price));
  const avg = prices.reduce((s, v) => s + v, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const isBelowAvg = trend > 0;

  const absPct = Math.abs(trend).toFixed(1);

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUpDown className="size-4 text-orange-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
          Trend Indicator
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-2.5">
          {isBelowAvg ? (
            <TrendingDown className="size-5 text-emerald-500" aria-hidden="true" />
          ) : (
            <TrendingUp className="size-5 text-red-500" aria-hidden="true" />
          )}
          <span className={`text-xl font-bold font-mono ${isBelowAvg ? "text-emerald-600" : "text-red-600"}`}>
            <span className="sr-only">{isBelowAvg ? "Below average by " : "Above average by "}</span>
            {isBelowAvg ? "\u2212" : "+"}{absPct}%
          </span>
          <span className="text-xs text-muted-foreground">
            {isBelowAvg ? "below average" : "above average"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-muted rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Avg</div>
            <div className="font-semibold text-foreground mt-1">{currency} {avg.toFixed(2)}</div>
          </div>
          <div className="bg-muted rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Low</div>
            <div className="font-semibold text-emerald-600 mt-1">{currency} {min.toFixed(2)}</div>
          </div>
          <div className="bg-muted rounded-xl border border-gray-100 p-3 text-center">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">High</div>
            <div className="font-semibold text-red-600 mt-1">{currency} {max.toFixed(2)}</div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {isBelowAvg
            ? `Current price is ${absPct}% below the historical average. `
            : `Current price is ${absPct}% above the historical average. `}
          {priceHistory.length > 5 && isBelowAvg && "The trend suggests a favorable buying opportunity."}
          {priceHistory.length > 5 && !isBelowAvg && "Consider waiting for a price drop closer to the average."}
        </p>
      </div>
    </div>
  );
}
