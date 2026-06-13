"use client";

import Image from "next/image";
import { Bell, TrendingDown } from "lucide-react";

export default function HeroVisual() {
  return (
    <div className="relative w-full min-h-[420px] sm:min-h-[520px] flex items-center justify-center">
      {/* Orange glow */}
      <div className="absolute inset-0 bg-gradient-radial from-orange-200/25 via-orange-100/10 to-transparent rounded-[80px] blur-3xl" />

      {/* Price card - top right */}
      <div className="absolute top-2 sm:top-8 right-0 sm:right-4 z-20 bg-white rounded-2xl border border-gray-100/80 shadow-lg px-5 py-4 min-w-[170px] sm:min-w-[190px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-semibold text-emerald-600">Target Reached</span>
        </div>
        <div className="flex items-center justify-between gap-5">
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Current</span>
            <div className="text-base sm:text-lg font-bold font-mono text-foreground tracking-tight mt-0.5">₹47,999</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em]">Target</span>
            <div className="text-sm sm:text-base font-bold font-mono text-muted-foreground mt-0.5 line-through decoration-gray-300">₹50,000</div>
          </div>
        </div>
      </div>

      {/* iPhone image - centered */}
      <div className="relative z-10">
        <Image
          src="/iphone 17.png"
          alt="iPhone 17"
          width={300}
          height={620}
          priority
          className="w-[220px] sm:w-[300px] h-auto object-contain drop-shadow-2xl"
        />
      </div>

      {/* Alert card - bottom left */}
      <div className="absolute bottom-2 sm:bottom-8 left-0 sm:left-4 z-20 bg-white rounded-xl border border-gray-100/80 shadow-lg px-4 py-3 flex items-center gap-3 max-w-[200px] sm:max-w-[220px]">
        <div className="size-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
          <Bell className="size-4 text-orange-600" />
        </div>
        <div className="min-w-0">
          <span className="text-xs font-semibold text-orange-700">Price Alert</span>
          <p className="text-[11px] text-orange-500/80 mt-0.5 truncate">Target price reached</p>
        </div>
        <TrendingDown className="size-3.5 text-emerald-500 shrink-0" />
      </div>
    </div>
  );
}
