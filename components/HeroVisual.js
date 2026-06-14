"use client";

import { Store, TrendingDown, Sparkles } from "lucide-react";

export default function HeroVisual() {
  const trendData = [
    [0, 40], [1, 30], [2, 35], [3, 22],
    [4, 27], [5, 18], [6, 20], [7, 10],
  ];
  const cw = 110, ch = 50, pd = 8;
  const sx = (cw - pd * 2) / (trendData.length - 1);
  const line = trendData.map(([xi, yi], i) => {
    const x = pd + xi * sx;
    const y = ch - pd - yi;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("");
  const area = line + `L${cw - pd},${ch - pd}L${pd},${ch - pd}Z`;

  return (
    <div className="relative w-full min-h-[420px] sm:min-h-[520px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-radial from-orange-200/25 via-orange-100/10 to-transparent rounded-[80px] blur-3xl" />

      <div className="relative z-10 w-full max-w-[460px] mx-auto px-4">
        <div className="relative flex items-center justify-center">
          <div className="relative z-10 drop-shadow-2xl">
            <svg width="170" height="350" viewBox="0 0 170 350" fill="none">
              <defs>
                <linearGradient id="screenBg" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="screenGlow" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="5" y="5" width="160" height="340" rx="22" fill="#111" stroke="#333" strokeWidth="1.5" />
              <rect x="14" y="18" width="142" height="314" rx="14" fill="url(#screenBg)" />
              <rect x="14" y="18" width="142" height="314" rx="14" fill="url(#screenGlow)" />
              <rect x="64" y="8" width="42" height="13" rx="6.5" fill="#111" />
              <circle cx="28" cy="35" r="2.5" fill="#f97316" />
              <text x="85" y="78" textAnchor="middle" fill="white" fontSize="18" fontFamily="monospace" fontWeight="bold">
                ₹48,999
              </text>
              <text x="85" y="93" textAnchor="middle" fill="#f97316" fontSize="8" fontFamily="sans-serif" opacity="0.7">
                Lowest Price
              </text>
              <path d="M22 235 L35 218 L48 224 L62 205 L76 209 L90 192 L108 184 L128 180" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M22 235 L35 218 L48 224 L62 205 L76 209 L90 192 L108 184 L128 180" stroke="#f97316" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.12" />
              <circle cx="22" cy="270" r="3.5" fill="#f97316" />
              <text x="32" y="273" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">Amazon</text>
              <circle cx="22" cy="284" r="3.5" fill="#22c55e" />
              <text x="32" y="287" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">Flipkart</text>
              <circle cx="22" cy="298" r="3.5" fill="#f43f5e" />
              <text x="32" y="301" fill="#94a3b8" fontSize="7" fontFamily="sans-serif">Reliance</text>
            </svg>
          </div>

          <div className="absolute left-0 sm:-left-6 top-4 sm:top-8 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/60 shadow-lg p-3 w-[124px]">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-0.5">
              Best Deal
            </div>
            <div className="text-[11px] font-semibold text-foreground truncate leading-tight">
              Reliance Digital
            </div>
            <div className="text-base font-bold font-mono text-orange-600 leading-tight mt-0.5">
              ₹48,999
            </div>
          </div>

          <div className="absolute right-0 sm:-right-6 top-8 sm:top-12 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/60 shadow-lg p-3 w-[110px] text-center">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
              Deal Score
            </div>
            <div className="text-lg font-bold text-foreground leading-none">92</div>
            <div className="text-[9px] text-muted-foreground font-medium">/ 100</div>
            <div className="mt-1.5 inline-flex items-center gap-1 text-[8px] font-bold text-white bg-orange-500 px-2 py-1 rounded-md">
              <Sparkles className="size-2.5" /> Buy Now
            </div>
          </div>

          <div className="absolute left-4 sm:left-0 bottom-16 sm:bottom-24 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/60 shadow-lg p-3 w-[108px]">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
              Compared Across
            </div>
            <div className="flex items-center gap-1.5">
              <Store className="size-3.5 text-orange-500" />
              <span className="text-lg font-bold font-mono text-foreground">6</span>
              <span className="text-[10px] text-muted-foreground font-medium">Stores</span>
            </div>
          </div>

          <div className="absolute right-4 sm:right-2 bottom-14 sm:bottom-20 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/60 shadow-lg p-3 w-[118px]">
            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
              Price Trend
            </div>
            <svg viewBox={`0 0 ${cw} ${ch}`} className="w-full h-8">
              <defs>
                <linearGradient id="trendGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#trendGrad)" />
              <path d={line} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={pd + (trendData.length - 1) * sx} cy={ch - pd - trendData[trendData.length - 1][1]} r="2" fill="#f97316" />
            </svg>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[8px] text-muted-foreground">₹54,999</span>
              <span className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5">
                <TrendingDown className="size-2" />-11%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
