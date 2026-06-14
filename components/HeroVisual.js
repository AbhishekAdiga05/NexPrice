"use client";

import { Store, TrendingDown, Sparkles, Zap } from "lucide-react";

export default function HeroVisual() {
  const trendData = [[0,38],[1,28],[2,33],[3,20],[4,25],[5,16],[6,18],[7,8]];
  const cw = 100, ch = 44, pd = 6;
  const sx = (cw - pd * 2) / (trendData.length - 1);
  const line = trendData.map(([xi, yi], i) => {
    const x = pd + xi * sx;
    const y = ch - pd - yi;
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("");
  const area = line + `L${cw - pd},${ch - pd}L${pd},${ch - pd}Z`;

  return (
    <div className="relative w-full min-h-[380px] sm:min-h-[520px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-radial from-orange-200/25 via-orange-100/10 to-transparent rounded-[80px] blur-3xl" />

      <div className="relative z-10 w-full max-w-[500px] mx-auto px-4">
        <div className="relative flex items-center justify-center" style={{ minHeight: 430 }}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[380px] h-[380px] rounded-full bg-gradient-radial from-orange-400/10 via-orange-300/5 to-transparent blur-3xl" />
            </div>

            <svg
              width="200"
              height="410"
              viewBox="0 0 200 410"
              className="relative drop-shadow-2xl w-[180px] h-[370px] sm:w-[200px] sm:h-[410px]"
              fill="none"
            >
              <defs>
                <linearGradient id="screenBg" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1a1a2e" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="screenGlow" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="5" y="5" width="190" height="400" rx="26" fill="#111" stroke="#333" strokeWidth="1.5" />
              <rect x="14" y="18" width="172" height="374" rx="16" fill="url(#screenBg)" />
              <rect x="14" y="18" width="172" height="374" rx="16" fill="url(#screenGlow)" />
              <rect x="78" y="8" width="44" height="13" rx="6.5" fill="#111" />
              <circle cx="32" cy="36" r="2.5" fill="#f97316" />
              <rect x="40" y="34.5" width="22" height="3" rx="1.5" fill="#f97316" opacity="0.35" />

              <text x="175" y="40" textAnchor="end" fill="white" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.8">92</text>

              <text x="32" y="70" fill="#64748b" fontSize="8" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">DEAL SCORE</text>
              <text x="32" y="98" fill="white" fontSize="28" fontFamily="monospace" fontWeight="bold">92</text>

              <line x1="32" y1="116" x2="80" y2="116" stroke="#334155" strokeWidth="0.5" />

              <text x="32" y="140" fill="#64748b" fontSize="8" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">BEST PRICE</text>
              <text x="32" y="168" fill="white" fontSize="22" fontFamily="monospace" fontWeight="bold">₹48,999</text>

              <circle cx="32" cy="188" r="3" fill="#22c55e" />
              <text x="44" y="192" fill="#e2e8f0" fontSize="10" fontFamily="sans-serif" fontWeight="500">Reliance Digital</text>

              <line x1="32" y1="216" x2="80" y2="216" stroke="#334155" strokeWidth="0.5" />

              <text x="32" y="240" fill="#64748b" fontSize="8" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">COMPARED ACROSS</text>
              <text x="32" y="264" fill="white" fontSize="15" fontFamily="monospace" fontWeight="bold">6 Stores</text>

              <path d="M24 305 L38 288 L52 294 L66 275 L80 280 L96 263 L114 256 L134 253" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.9" />
              <path d="M24 305 L38 288 L52 294 L66 275 L80 280 L96 263 L114 256 L134 253" stroke="#f97316" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.12" />
              <circle cx="134" cy="253" r="2.5" fill="#f97316" />
            </svg>

            <div className="absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-3 w-[100px] sm:w-[108px] text-center">
                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 mb-0.5">
                  Deal Score
                </div>
                <div className="text-2xl font-bold text-foreground leading-none">92</div>
                <div className="text-[10px] text-muted-foreground/70 font-medium">/ 100</div>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[8px] font-bold text-white bg-orange-500 px-2.5 py-1 rounded-lg">
                  <Sparkles className="size-2.5" /> Buy Now
                </div>
              </div>
            </div>

            <div className="hidden sm:block absolute top-1/2 -left-[130px] -translate-y-1/2 z-20">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-3.5 w-[130px]">
                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 mb-1">
                  Best Deal
                </div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Zap className="size-2.5 text-orange-500" />
                  <span className="text-[11px] font-semibold text-foreground truncate leading-tight">
                    Reliance Digital
                  </span>
                </div>
                <div className="text-lg font-bold font-mono text-orange-600 leading-tight">
                  ₹48,999
                </div>
              </div>
            </div>

            <div className="hidden sm:block absolute top-1/2 -right-[118px] -translate-y-1/2 z-20">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-3.5 w-[118px]">
                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 mb-1.5">
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
                  <span className="text-[8px] text-muted-foreground font-medium">₹54,999</span>
                  <span className="text-[8px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <TrendingDown className="size-2" />-11%
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 sm:-bottom-10 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-xl p-3 w-[112px] sm:w-[120px] text-center whitespace-nowrap">
                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 mb-1">
                  Compared Across
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Store className="size-3.5 text-orange-500" />
                  <span className="text-lg font-bold font-mono text-foreground">6</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Stores</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
