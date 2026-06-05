"use client";

import {
  TrendingUp,
  Wallet,
  Bell,
  CheckCircle2,
  Layers,
  ArrowLeft,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div
      className={`rounded-xl border p-5 ${color} flex items-center gap-4`}
    >
      <div className="size-12 rounded-xl bg-white/60 border border-current/20 flex items-center justify-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-70">
          {label}
        </div>
      </div>
    </div>
  );
}

function DealScoreBadgeSmall({ score, tier }) {
  const colors = {
    great: "bg-emerald-50 text-emerald-700 border-emerald-200",
    good: "bg-indigo-50 text-indigo-700 border-indigo-200",
    fair: "bg-amber-50 text-amber-700 border-amber-200",
    poor: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${colors[tier] || colors.fair}`}
    >
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
    productCount,
    topDeals,
    recentSavings,
  } = insights;

  const stats = [
    {
      label: "Total Savings",
      value: totalSavingsFormatted,
      icon: Wallet,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Active Alerts",
      value: activeCount,
      icon: Bell,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      label: "Triggered",
      value: triggeredCount,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Products",
      value: productCount,
      icon: Layers,
      color: "text-accent bg-accent/5 border-accent/20",
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-border/40">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/"
                className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <TrendingUp className="size-6 text-accent" />
                Insights
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Powered by your tracking data — savings, scores, and stats at a
              glance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-accent" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
              Top Deals Right Now
            </h2>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {topDeals.length}
            </span>
          </div>

          {topDeals.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border/50 bg-muted/30">
              <TrendingUp className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Track more products to see deal scores.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {topDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/products/${deal.id}`}
                  className="group bg-white rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 p-4"
                >
                  {deal.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={deal.image_url}
                      alt={deal.name}
                      className="w-full aspect-square rounded-lg object-cover border border-border mb-3"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground mb-3">
                      NO IMG
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors leading-tight">
                      {deal.name}
                    </h3>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold font-mono">
                        {deal.currency} {deal.current_price.toFixed(2)}
                      </span>
                      <DealScoreBadgeSmall
                        score={deal.dealScore.score}
                        tier={deal.dealScore.tier}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="size-4 text-emerald-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
              Recent Savings
            </h2>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {recentSavings.length}
            </span>
          </div>

          {recentSavings.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border/50 bg-muted/30">
              <Wallet className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Set target price alerts to start saving. Hit your targets, see
                your savings grow.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSavings.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.productId}`}
                  className="group flex items-center gap-3 bg-white rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 p-3.5"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="size-10 rounded-lg object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="size-10 rounded-lg border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                      N/A
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {item.productName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span className="font-mono">
                        Target: {item.currency} {item.targetPrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="font-mono">
                        Paid: {item.currency} {item.currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold font-mono text-emerald-600">
                      +{item.currency} {item.savings.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
                      <Clock className="size-2.5" />
                      {new Date(item.triggeredAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
