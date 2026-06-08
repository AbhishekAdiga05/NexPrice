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
  ArrowUpRight,
  Tag,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

function StatCard({ label, value, icon: Icon, accent, sub }) {
  const accentMap = {
    emerald: {
      bg: "bg-emerald-500/[0.08]",
      border: "border-emerald-500/20",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    indigo: {
      bg: "bg-indigo-500/[0.08]",
      border: "border-indigo-500/20",
      text: "text-indigo-400",
      dot: "bg-indigo-400",
    },
    accent: {
      bg: "bg-accent/[0.08]",
      border: "border-accent/20",
      text: "text-accent",
      dot: "bg-accent",
    },
  };

  const a = accentMap[accent];

  return (
    <div className="group relative bg-card rounded-xl border border-white/[0.06] shadow-panel hover:shadow-elevated transition-all duration-300 p-4 md:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`size-9 md:size-10 rounded-lg border ${a.border} ${a.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`size-4 md:size-5 ${a.text}`} />
        </div>
        <span className={`size-1.5 rounded-full ${a.dot} opacity-40 group-hover:opacity-100 transition-opacity`} />
      </div>
      <div>
        <div className="text-xl md:text-2xl font-bold font-mono tracking-tight text-foreground">
          {value}
        </div>
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">
          {label}
        </div>
        {sub && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/60 font-mono">
            <span className={`size-1 rounded-full ${a.dot}`} />
            {sub}
          </div>
        )}
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
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${colors[tier] || colors.fair}`}
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
      accent: "emerald",
      sub: "across all triggered alerts",
    },
    {
      label: "Active Alerts",
      value: activeCount,
      icon: Bell,
      accent: "indigo",
      sub: `${totalAlerts} total alerts`,
    },
    {
      label: "Triggered",
      value: triggeredCount,
      icon: CheckCircle2,
      accent: "emerald",
      sub: "alerts captured",
    },
    {
      label: "Products",
      value: productCount,
      icon: Layers,
      accent: "accent",
      sub: "being tracked",
    },
  ];

  return (
    <main className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/"
                className="size-7 md:size-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors shrink-0"
              >
                <ArrowLeft className="size-3.5 md:size-4" />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Insights
              </h1>
            </div>
            <p className="text-sm text-muted-foreground/70 ml-10 md:ml-11">
              Savings, deal scores, and tracking metrics — powered by real data.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Best Deals Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-accent" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                Best Deals Now
              </h2>
              <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {topDeals.length}
              </span>
            </div>
          </div>

          <div className="section-divider mb-5" />

          {topDeals.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-white/[0.06] bg-muted/20">
              <TrendingUp className="size-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm text-muted-foreground/70">
                Start tracking products to unlock deal scores and buying recommendations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {topDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/products/${deal.id}`}
                  className="group bg-card rounded-xl border border-white/[0.06] shadow-panel hover:shadow-elevated transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted/50">
                    {deal.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={deal.image_url}
                        alt={deal.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Tag className="size-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4 space-y-2">
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                      {deal.name}
                    </h3>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold font-mono text-foreground">
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
        </section>

        {/* Recent Savings Section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Wallet className="size-4 text-emerald-400" />
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                Recent Savings
              </h2>
              <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                {recentSavings.length}
              </span>
            </div>
          </div>

          <div className="section-divider mb-5" />

          {recentSavings.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-white/[0.06] bg-muted/20">
              <DollarSign className="size-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm text-muted-foreground/70">
                Set your first target price alert to start saving. Hit your targets, watch your savings grow.
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {recentSavings.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.productId}`}
                  className="group flex items-center gap-3 md:gap-4 bg-card rounded-xl border border-white/[0.06] shadow-panel hover:shadow-elevated transition-all duration-300 p-3 md:p-4"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="size-10 md:size-12 rounded-lg object-cover border border-white/[0.08] shrink-0"
                    />
                  ) : (
                    <div className="size-10 md:size-12 rounded-lg border border-white/[0.08] bg-muted flex items-center justify-center shrink-0">
                      <Tag className="size-4 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {item.productName}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground/70 mt-0.5">
                      <span className="font-mono">
                        Target: {item.currency} {item.targetPrice.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground/30 hidden sm:inline">·</span>
                      <span className="font-mono">
                        Paid: {item.currency} {item.currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base md:text-lg font-bold font-mono text-emerald-400">
                      +{item.currency} {item.savings.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 justify-end mt-0.5">
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
    </main>
  );
}
