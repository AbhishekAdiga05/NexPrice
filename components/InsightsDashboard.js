"use client";

import Image from "next/image";
import {
  TrendingUp,
  Wallet,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  Tag,
  Store,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

function DealScoreBadgeSmall({ score, tier }) {
  const styles = {
    great: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    good: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    fair: "bg-amber-50 text-amber-700 border-amber-200/60",
    poor: "bg-red-50 text-red-700 border-red-200/60",
    none: "bg-gray-50 text-muted-foreground border-gray-200/60",
  };
  const color = styles[tier] || styles.none;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${color}`}>
      <Sparkles className="size-2.5" />
      {score}
    </span>
  );
}

export default function InsightsDashboard({ insights }) {
  if (!insights) return null;

  const {
    totalSavingsFormatted,
    activeCount,
    triggeredCount,
    totalAlerts,
    topDeals,
    recentSavings,
  } = insights;

  const currency = topDeals?.[0]?.currency || "$";
  const topDeal = topDeals?.[0] || null;
  const savingsDisplay = totalSavingsFormatted || `${currency} 0.00`;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">Total Savings</span>
            <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Wallet className="size-[18px] text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground tracking-tight leading-none">
            {savingsDisplay}
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-2 leading-none">{triggeredCount} alerts triggered</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">Active Alerts</span>
            <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Bell className="size-[18px] text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground tracking-tight leading-none">{activeCount}</div>
          <div className="text-xs text-muted-foreground font-mono mt-2 leading-none">{totalAlerts} total set</div>
        </div>
        <div className="bg-white rounded-xl border border-orange-200/60 shadow-[0_0_0_1px_rgba(249,115,22,0.15)] p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">Best Deal</span>
            <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Store className="size-[18px] text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground tracking-tight leading-none">
            {topDeal ? `${topDeal.currency} ${topDeal.current_price.toFixed(2)}` : "\u2014"}
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-2 leading-none truncate">
            {topDeal ? topDeal.name : "Track products to find deals"}
          </div>
        </div>
      </div>

        <section className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <Sparkles className="size-4 text-orange-500" />
            <h2 className="text-section">Best Deals Now</h2>
            <span className="text-[11px] font-semibold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-lg leading-none">{topDeals.length}</span>
            {topDeals.length > 0 && (
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-lg leading-none flex items-center gap-1">
                <TrendingDown className="size-2.5" />
                Lowest prices
              </span>
            )}
          </div>
          {topDeals.length === 0 ? (
          <div className="text-center py-12 px-5">
            <TrendingUp className="size-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Track products to see your best deals here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-gray-100">
            {topDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/products/${deal.id}`}
                className="bg-white p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="aspect-[4/3] rounded-lg border border-gray-100 overflow-hidden bg-gray-50 mb-3">
                  {deal.image_url ? (
                    <Image
                      src={deal.image_url}
                      alt={deal.name}
                      width={300}
                      height={225}
                      unoptimized
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag className="size-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                  {deal.name}
                </h3>
                <div className="flex items-center justify-between gap-1 mt-2.5">
                  <span className="text-base font-bold font-mono text-foreground tracking-tight">
                    {deal.currency} {deal.current_price.toFixed(2)}
                  </span>
                  <DealScoreBadgeSmall score={deal.dealScore.score} tier={deal.dealScore.tier} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <Wallet className="size-4 text-emerald-500" />
            <h2 className="text-section">Recent Savings</h2>
            <span className="text-[11px] font-semibold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-lg leading-none">{recentSavings.length}</span>
            {recentSavings.length > 0 && (
              <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-lg leading-none flex items-center gap-1">
                <Store className="size-2.5" />
                Price alerts triggered
              </span>
            )}
          </div>
        {recentSavings.length === 0 ? (
          <div className="text-center py-12 px-5">
            <DollarSign className="size-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Set a target price alert to start tracking savings.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentSavings.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.productId}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors group"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    width={40}
                    height={40}
                    unoptimized
                    className="size-12 rounded-xl border border-gray-100 object-cover shrink-0"
                  />
                ) : (
                  <div className="size-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                    <Tag className="size-4 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground group-hover:text-orange-600 transition-colors truncate leading-snug">
                    {item.productName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                    <span>Target: {item.currency} {item.targetPrice.toFixed(2)}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span>Paid: {item.currency} {item.currentPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold font-mono text-emerald-600 tracking-tight leading-none">
                    +{item.currency} {item.savings.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-1 leading-none">
                    <Clock className="size-3" />
                    {new Date(item.triggeredAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
