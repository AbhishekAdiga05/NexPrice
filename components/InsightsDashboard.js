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
} from "lucide-react";
import Link from "next/link";

function DealScoreBadgeSmall({ score, tier }) {
  const styles = {
    great: "bg-emerald-50 text-emerald-700 border-emerald-200",
    good: "bg-indigo-50 text-indigo-700 border-indigo-200",
    fair: "bg-amber-50 text-amber-700 border-amber-200",
    poor: "bg-red-50 text-red-700 border-red-200",
    none: "bg-gray-50 text-gray-400 border-gray-200",
  };
  const color = styles[tier] || styles.none;

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${color}`}>
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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="size-3.5 text-emerald-500" />
            <span className="text-[11px] font-semibold text-gray-500">Total Savings</span>
          </div>
          <div className="text-lg font-bold font-mono text-gray-900 tracking-tight">
            {totalSavingsFormatted}
          </div>
          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
            {triggeredCount} alerts triggered
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Bell className="size-3.5 text-indigo-500" />
            <span className="text-[11px] font-semibold text-gray-500">Active Alerts</span>
          </div>
          <div className="text-lg font-bold font-mono text-gray-900 tracking-tight">
            {activeCount}
          </div>
          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
            {totalAlerts} total set
          </div>
        </div>
      </div>

      {/* Best Deals */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
          <Sparkles className="size-3.5 text-orange-500" />
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Best Deals Now
          </h2>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {topDeals.length}
          </span>
        </div>
        {topDeals.length === 0 ? (
          <div className="text-center py-10 px-4">
            <TrendingUp className="size-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Track products to see your best deals here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-gray-100">
            {topDeals.map((deal) => (
              <Link
                key={deal.id}
                href={`/products/${deal.id}`}
                className="bg-white p-3 hover:bg-gray-50 transition-colors group"
              >
                <div className="aspect-[4/3] rounded border border-gray-100 overflow-hidden bg-gray-50 mb-2">
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
                      <Tag className="size-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                  {deal.name}
                </h3>
                <div className="flex items-center justify-between gap-1 mt-1.5">
                  <span className="text-sm font-bold font-mono text-gray-900 tracking-tight">
                    {deal.currency} {deal.current_price.toFixed(2)}
                  </span>
                  <DealScoreBadgeSmall
                    score={deal.dealScore.score}
                    tier={deal.dealScore.tier}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Savings */}
      <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
          <Wallet className="size-3.5 text-emerald-500" />
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Savings
          </h2>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {recentSavings.length}
          </span>
        </div>
        {recentSavings.length === 0 ? (
          <div className="text-center py-10 px-4">
            <DollarSign className="size-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Set a target price alert to start tracking savings.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentSavings.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.productId}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors group"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    width={40}
                    height={40}
                    unoptimized
                    className="size-9 rounded border border-gray-100 object-cover shrink-0"
                  />
                ) : (
                  <div className="size-9 rounded border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0">
                    <Tag className="size-3.5 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 leading-snug">
                    {item.productName}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    <span className="font-mono">Target: {item.currency} {item.targetPrice.toFixed(2)}</span>
                    <span className="text-gray-200">·</span>
                    <span className="font-mono">Paid: {item.currency} {item.currentPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-base font-bold font-mono text-emerald-600 tracking-tight leading-none">
                    +{item.currency} {item.savings.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 justify-end mt-0.5 leading-none">
                    <Clock className="size-2.5" />
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
