"use client";

import { Store, TrendingDown, Zap, ExternalLink } from "lucide-react";

const stores = [
  { name: "Amazon India", price: "₹49,999", color: "bg-orange-500" },
  { name: "Flipkart", price: "₹50,499", color: "bg-emerald-500" },
  { name: "Reliance Digital", price: "₹48,999", color: "bg-rose-500" },
  { name: "Croma", price: "₹51,299", color: "bg-indigo-500" },
];

export default function HeroVisual() {
  return (
    <div className="relative w-full min-h-[420px] sm:min-h-[520px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-radial from-orange-200/25 via-orange-100/10 to-transparent rounded-[80px] blur-3xl" />

      <div className="relative z-10 w-full max-w-sm mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <Store className="size-4 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Store Comparison
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-lg leading-none ml-auto">
              6 stores
            </span>
          </div>

          <div className="divide-y divide-gray-50">
            {stores.map((store, i) => {
              const isCheapest = store.name === "Reliance Digital";
              return (
                <div
                  key={store.name}
                  className={`flex items-center gap-3 px-5 py-3.5 ${
                    isCheapest ? "bg-orange-50/40" : ""
                  }`}
                >
                  <div
                    className={`size-2 rounded-full shrink-0 ${store.color} ${
                      isCheapest ? "shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" : ""
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {store.name}
                      </span>
                      {isCheapest && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200/60 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                          <Zap className="size-2.5" />
                          Best Deal
                        </span>
                      )}
                    </div>
                    <span className="text-base font-bold font-mono text-foreground tracking-tight">
                      {store.price}
                    </span>
                  </div>
                  {!isCheapest && (
                    <span className="text-[11px] font-mono text-muted-foreground/60 shrink-0">
                      +₹{i === 1 ? "1,500" : i === 0 ? "1,000" : "2,300"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3.5 bg-gradient-to-r from-orange-50/80 to-transparent border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <TrendingDown className="size-3.5 text-orange-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-orange-700">
                  Best Price Available
                </span>
                <p className="text-[11px] text-orange-500/80 mt-0.5">
                  Save ₹2,300 compared to highest store
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
