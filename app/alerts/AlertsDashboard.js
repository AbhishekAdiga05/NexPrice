"use client";

import { useState } from "react";
import {
  removePriceAlert,
  setPriceAlert,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowLeft,
  X,
  Target,
  Crosshair,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function StatusBadge({ status }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/[0.08] text-indigo-400 border border-indigo-500/30">
        <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Watching
      </span>
    );
  }
  if (status === "triggered") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="size-2.5" />
        Captured
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/[0.04] text-muted-foreground border border-white/[0.08]">
      Disabled
    </span>
  );
}

function NewAlertDialog({ productId, currentPrice, currency, onClose }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await setPriceAlert(productId, targetPrice);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-popover rounded-xl shadow-elevated border border-white/10 w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-accent/[0.08] rounded-lg">
              <Crosshair className="size-4 text-accent" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">New Target Price Alert</h3>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-white/[0.06] transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Target Price
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground pointer-events-none">
                {currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={currentPrice}
                placeholder="0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="pl-8 h-11 text-base font-mono"
                required
                autoFocus
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground/70 font-mono">
              Current price: {currency} {parseFloat(currentPrice).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !targetPrice} className="flex-1 h-10 gap-2 font-bold text-xs cursor-pointer">
              {submitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Bell className="size-3.5" />
              )}
              Set Alert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AlertCard({ alert, currency }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    const result = await removePriceAlert(alert.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Alert removed");
    }
    setRemoving(false);
  };

  const isTriggered = alert.status === "triggered";
  const progress = alert.product
    ? Math.min(100, ((parseFloat(alert.product.current_price) - parseFloat(alert.target_price)) / parseFloat(alert.product.current_price)) * 100)
    : 0;
  const targetReached = alert.product && parseFloat(alert.product.current_price) <= parseFloat(alert.target_price);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="group relative bg-card rounded-xl border border-white/[0.06] shadow-panel hover:shadow-elevated transition-all duration-300 overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${
        isTriggered ? "bg-emerald-500/50" : "bg-indigo-500/50"
      }`} />
      <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 pl-4 md:pl-5">
        {alert.product?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alert.product.image_url}
            alt={alert.product.name}
            className="size-10 md:size-12 rounded-lg object-cover border border-white/[0.08] shrink-0"
          />
        ) : (
          <div className="size-10 md:size-12 rounded-lg border border-white/[0.08] bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
            N/A
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/products/${alert.product_id}`}
                className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
              >
                {alert.product?.name || "Unknown Product"}
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                <StatusBadge status={alert.status} />
                <span className="text-[11px] text-muted-foreground/70 font-mono">
                  Target: {currency} {parseFloat(alert.target_price).toFixed(2)}
                </span>
                {isTriggered && alert.savings > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-400 font-mono">
                    · Saved {currency} {parseFloat(alert.savings).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {alert.product && (
              <div className="text-right shrink-0">
                <div className="text-[10px] text-muted-foreground/60 font-mono">Current</div>
                <div className="text-base md:text-lg font-bold text-foreground font-mono">
                  {currency} {parseFloat(alert.product.current_price).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2.5">
            {!isTriggered && alert.product && (
              <>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden max-w-[160px] md:max-w-[200px]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      targetReached ? "bg-emerald-500" : "bg-indigo-500/70"
                    }`}
                    style={{ width: `${targetReached ? 100 : progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground/70 font-mono">
                  {!targetReached
                    ? `${progress.toFixed(0)}% to target`
                    : "Target reached!"}
                </span>
              </>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              {alert.created_at && (
                <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="size-2.5" />
                  {formatDate(alert.created_at)}
                </span>
              )}
              {alert.status === "active" && (
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:bg-red-500/[0.08] hover:text-red-400 transition-colors"
                  title="Remove alert"
                >
                  {removing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <BellOff className="size-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlertsDashboard({ alerts }) {
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlertProductId, setNewAlertProductId] = useState(null);

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const triggeredAlerts = alerts.filter((a) => a.status === "triggered");
  const disabledAlerts = alerts.filter((a) => a.status === "disabled");
  const currency = activeAlerts[0]?.product?.currency || triggeredAlerts[0]?.product?.currency || "$";

  const stats = [
    {
      label: "Active",
      value: activeAlerts.length,
      icon: BellRing,
      accent: "indigo",
      sub: "currently watching",
    },
    {
      label: "Captured",
      value: triggeredAlerts.length,
      icon: CheckCircle2,
      accent: "emerald",
      sub: "targets hit",
    },
    {
      label: "Total",
      value: alerts.length,
      icon: Target,
      accent: "accent",
      sub: "all time",
    },
  ];

  const accentMap = {
    indigo: { bg: "bg-indigo-500/[0.08]", border: "border-indigo-500/20", text: "text-indigo-400", dot: "bg-indigo-400" },
    emerald: { bg: "bg-emerald-500/[0.08]", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
    accent: { bg: "bg-accent/[0.08]", border: "border-accent/20", text: "text-accent", dot: "bg-accent" },
  };

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
                Alerts
              </h1>
            </div>
            <p className="text-sm text-muted-foreground/70 ml-10 md:ml-11">
              Monitor and manage target price alerts across all tracked products.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon, accent, sub }) => {
            const a = accentMap[accent];
            return (
              <div
                key={label}
                className="group relative bg-card rounded-xl border border-white/[0.06] shadow-panel hover:shadow-elevated transition-all duration-300 p-4 md:p-5"
              >
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
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/60 font-mono">
                    <span className={`size-1 rounded-full ${a.dot}`} />
                    {sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No alerts state */}
        {alerts.length === 0 && (
          <div className="text-center py-16 md:py-20 rounded-xl border border-dashed border-white/[0.06] bg-muted/20">
            <div className="size-16 md:size-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-5 border border-white/[0.04]">
              <BellOff className="size-6 md:size-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1.5">
              No alerts set yet
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-6 px-4">
              Set a target price on any tracked product and we&apos;ll notify you instantly
              when the price drops to your desired level.
            </p>
            <Button asChild className="cursor-pointer h-11 px-6">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <BellRing className="size-4 text-indigo-400" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                  Watching
                </h2>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {activeAlerts.length}
                </span>
              </div>
            </div>
            <div className="section-divider mb-4" />
            <div className="space-y-2 md:space-y-3">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  currency={alert.product?.currency || currency}
                />
              ))}
            </div>
          </section>
        )}

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-400" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                  Captured
                </h2>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {triggeredAlerts.length}
                </span>
              </div>
            </div>
            <div className="section-divider mb-4" />
            <div className="space-y-2 md:space-y-3">
              {triggeredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  currency={alert.product?.currency || currency}
                />
              ))}
            </div>
          </section>
        )}

        {/* Disabled Alerts */}
        {disabledAlerts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <BellOff className="size-4 text-muted-foreground/60" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground/60">
                  Disabled
                </h2>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                  {disabledAlerts.length}
                </span>
              </div>
            </div>
            <div className="section-divider mb-4" />
            <div className="space-y-2 md:space-y-3">
              {disabledAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  currency={alert.product?.currency || currency}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {showNewAlert && newAlertProductId && (
        <NewAlertDialog
          productId={newAlertProductId}
          currentPrice={0}
          currency={currency}
          onClose={() => {
            setShowNewAlert(false);
            setNewAlertProductId(null);
          }}
        />
      )}
    </main>
  );
}
