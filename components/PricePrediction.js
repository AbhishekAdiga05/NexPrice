"use client";

import { TrendingDown, TrendingUp, TrendingUpDown } from "lucide-react";

export default function PricePrediction({ trend, currentPrice, currency, priceHistory }) {
  if (trend === null || !priceHistory || priceHistory.length < 2) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUpDown className="size-3.5 text-gray-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Trend
          </span>
        </div>
        <p className="text-xs text-gray-500">
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
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUpDown className="size-3.5 text-orange-500" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900 font-mono">
          Trend Indicator
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          {isBelowAvg ? (
            <TrendingDown className="size-4 text-emerald-500" />
          ) : (
            <TrendingUp className="size-4 text-red-500" />
          )}
          <span className={`text-lg font-bold font-mono ${isBelowAvg ? "text-emerald-600" : "text-red-600"}`}>
            {isBelowAvg ? "\u2212" : "+"}{absPct}%
          </span>
          <span className="text-[11px] text-gray-500">
            {isBelowAvg ? "below average" : "above average"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
          <div className="bg-gray-50 rounded border border-gray-100 p-2 text-center">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Avg</div>
            <div className="font-semibold text-gray-900">{currency} {avg.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded border border-gray-100 p-2 text-center">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Low</div>
            <div className="font-semibold text-emerald-600">{currency} {min.toFixed(2)}</div>
          </div>
          <div className="bg-gray-50 rounded border border-gray-100 p-2 text-center">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">High</div>
            <div className="font-semibold text-red-600">{currency} {max.toFixed(2)}</div>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
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
