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

function StatCard({ label, value, icon: Icon, cardClass, iconClass, color }) {
  return (
    <div
      className={`rounded-xl border ${cardClass} p-5 flex items-center gap-4 shadow-card`}
    >
      <div className={`size-12 rounded-xl border ${iconClass} flex items-center justify-center shrink-0`}>
        <Icon className={`size-5 ${color}`} />
      </div>
      <div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
}

function DealScoreBadgeSmall({ score, tier }) {
  const colors = {
    great: "bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/30",
    good: "bg-indigo-500/[0.08] text-indigo-400 border-indigo-500/30",
    fair: "bg-amber-500/[0.08] text-amber-400 border-amber-500/30",
    poor: "bg-red-500/[0.08] text-red-400 border-red-500/30",
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
      cardClass: "bg-card border-white/[0.06]",
      iconClass: "bg-emerald-500/[0.08] border-emerald-500/20",
      color: "text-emerald-400",
    },
    {
      label: "Active Alerts",
      value: activeCount,
      icon: Bell,
      cardClass: "bg-card border-white/[0.06]",
      iconClass: "bg-indigo-500/[0.08] border-indigo-500/20",
      color: "text-indigo-400",
    },
    {
      label: "Triggered",
      value: triggeredCount,
      icon: CheckCircle2,
      cardClass: "bg-card border-white/[0.06]",
      iconClass: "bg-emerald-500/[0.08] border-emerald-500/20",
      color: "text-emerald-400",
    },
    {
      label: "Products",
      value: productCount,
      icon: Layers,
      cardClass: "bg-card border-white/[0.06]",
      iconClass: "bg-accent/[0.08] border-accent/20",
      color: "text-accent",
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/"
                className="size-8 rounded-full border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <TrendingUp className="size-6 text-accent" />
                Insights
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Your savings, deal scores, and performance metrics — all powered by real tracking data.
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
                Best Deals Now
              </h2>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {topDeals.length}
            </span>
          </div>

          {topDeals.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-white/[0.08] bg-muted/30">
              <TrendingUp className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Start tracking products to unlock deal scores and buying recommendations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {topDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/products/${deal.id}`}
                  className="group bg-card rounded-xl border border-white/[0.06] shadow-card hover:shadow-elevated transition-all duration-300 p-4 hover:-translate-y-0.5"
                >
                  {deal.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={deal.image_url}
                      alt={deal.name}
                      className="w-full aspect-square rounded-lg object-cover border border-white/[0.08] mb-3"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg border border-white/[0.08] bg-muted flex items-center justify-center text-xs text-muted-foreground mb-3">
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
            <div className="text-center py-12 rounded-xl border border-dashed border-white/[0.08] bg-muted/30">
              <Wallet className="size-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Set your first target price alert to start saving. Hit your targets, watch your savings grow.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSavings.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.productId}`}
                  className="group flex items-center gap-3 bg-card rounded-xl border border-white/[0.06] shadow-card hover:shadow-elevated transition-all duration-300 p-3.5 hover:-translate-y-0.5"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="size-10 rounded-lg object-cover border border-white/[0.08] shrink-0"
                    />
                  ) : (
                    <div className="size-10 rounded-lg border border-white/[0.08] bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
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
                    <div className="text-lg font-bold font-mono text-emerald-400">
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
