"use client";

import { ExternalLink, Store, Clock, TrendingDown, Zap } from "lucide-react";

function formatLastUpdated(dateString) {
  const now = Date.now();
  const updated = new Date(dateString).getTime();
  const diffMs = now - updated;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString();
}

const STORE_COLOR_MAP = {
  Amazon: "bg-orange-500",
  Flipkart: "bg-emerald-500",
  Croma: "bg-indigo-500",
  "Reliance Digital": "bg-rose-500",
  "Tata CLiQ": "bg-sky-500",
  "Vijay Sales": "bg-amber-500",
};

const FALLBACK_COLORS = [
  "bg-orange-500", "bg-emerald-500", "bg-indigo-500",
  "bg-rose-500", "bg-sky-500", "bg-amber-500",
];

function getStoreColor(storeName, fallbackIndex) {
  return STORE_COLOR_MAP[storeName] || FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}

export default function StoreComparison({ prices = [], currency = "INR" }) {
  if (!prices || prices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <Store className="size-4 text-orange-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Store Comparison
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="size-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Store className="size-5 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No store prices yet
          </p>
          <p className="text-xs text-muted-foreground/50 max-w-[240px]">
            Store prices will appear here once we start tracking across multiple retailers.
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...prices]
    .filter((p) => {
      const val = parseFloat(p.price);
      return !isNaN(val) && val > 0;
    })
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <Store className="size-4 text-orange-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Store Comparison
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="size-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
            <Store className="size-5 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No valid store prices
          </p>
          <p className="text-xs text-muted-foreground/50 max-w-[240px]">
            Store prices will appear here once we start tracking across multiple retailers.
          </p>
        </div>
      </div>
    );
  }

  const lowestPrice = parseFloat(sorted[0].price);
  const highestPrice = parseFloat(sorted[sorted.length - 1].price);
  const totalSavings = highestPrice - lowestPrice;

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
        <Store className="size-4 text-orange-500" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Store Comparison
        </h2>
        <span className="text-[11px] font-semibold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-lg leading-none ml-auto">
          {sorted.length} stores
        </span>
      </div>

      <div className="divide-y divide-gray-50">
        {sorted.map((store, index) => {
          const price = parseFloat(store.price);
          const diff = price - lowestPrice;
          const isCheapest = diff === 0;
          const diffPercent = lowestPrice > 0 ? ((diff / lowestPrice) * 100).toFixed(1) : "0";
          const colorClass = getStoreColor(store.store_name, index);

          return (
            <a
              key={store.id}
              href={store.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition-colors group ${
                isCheapest ? "bg-orange-50/40" : ""
              }`}
            >
              <div
                className={`size-2.5 rounded-full shrink-0 ${colorClass} ${
                  isCheapest ? "shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" : ""
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {store.store_name}
                  </span>
                  {isCheapest && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200/60 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                      <Zap className="size-2.5" />
                      Best Deal
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-base font-bold font-mono text-foreground tracking-tight">
                    {currency} {price.toFixed(2)}
                  </span>
                  {!isCheapest && (
                    <span className="text-[11px] font-mono text-muted-foreground/60">
                      +{currency} {diff.toFixed(2)} ({diffPercent}% more)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                {isCheapest && totalSavings > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-1 rounded-lg whitespace-nowrap">
                    <TrendingDown className="size-3" />
                    Save {currency} {totalSavings.toFixed(2)}
                  </span>
                )}
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground/50">
                  <Clock className="size-3" />
                  <span>{formatLastUpdated(store.last_updated)}</span>
                </div>
                <span className="text-[11px] text-muted-foreground/40 group-hover:text-orange-500 transition-colors flex items-center gap-0.5">
                  Visit <ExternalLink className="size-2.5" />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {sorted.length > 1 && (
        <div className="px-6 py-3 bg-gradient-to-r from-orange-50/60 to-transparent border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="size-3 text-orange-500" />
            <span>
              Compare across <strong className="text-foreground">{sorted.length} stores</strong> to find the best deal.{" "}
              <strong className="text-orange-600">Save up to {currency} {totalSavings.toFixed(2)}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
