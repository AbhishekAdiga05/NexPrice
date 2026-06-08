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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function StatusBadge({ status }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/[0.08] text-indigo-400 border border-indigo-500/30">
        <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Active
      </span>
    );
  }
  if (status === "triggered") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="size-2.5" />
        Triggered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/[0.04] text-muted-foreground border border-white/[0.08]">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-popover rounded-2xl shadow-elevated border border-white/10 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-accent" />
              <h3 className="font-semibold text-lg">New Target Price Alert</h3>
          </div>
          <button
            onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-white/[0.06] transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Target Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground pointer-events-none">
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
                className="pl-8 h-12 text-lg font-mono"
                required
                autoFocus
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Current price: {currency} {parseFloat(currentPrice).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !targetPrice} className="flex-1 h-11 gap-2 font-bold cursor-pointer">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Bell className="size-4" />
              )}
              SET ALERT
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

  return (
    <div className="group relative bg-card rounded-xl border border-white/[0.06] shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        {alert.product?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alert.product.image_url}
            alt={alert.product.name}
            className="size-14 rounded-lg object-cover border border-white/[0.08] shrink-0"
          />
        ) : (
          <div className="size-14 rounded-lg border border-white/[0.08] bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
            NO_IMG
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/products/${alert.product_id}`}
                className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
              >
                {alert.product?.name || "Unknown Product"}
              </Link>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={alert.status} />
                <span className="text-[11px] text-muted-foreground font-mono">
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
                <div className="text-xs text-muted-foreground font-mono">Current</div>
                <div className="text-lg font-bold text-foreground font-mono">
                  {currency} {parseFloat(alert.product.current_price).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            {!isTriggered && alert.product && (
              <>
                <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden max-w-[200px]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((parseFloat(alert.product.current_price) - parseFloat(alert.target_price)) /
                          parseFloat(alert.product.current_price)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {parseFloat(alert.product.current_price) > parseFloat(alert.target_price)
                    ? `${(
                        ((parseFloat(alert.product.current_price) - parseFloat(alert.target_price)) /
                          parseFloat(alert.product.current_price)) *
                        100
                      ).toFixed(0)}% to target`
                    : "Target reached!"}
                </span>
              </>
            )}

            <div className="ml-auto flex items-center gap-1">
              {alert.created_at && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-2.5" />
                  {new Date(alert.created_at).toLocaleDateString()}
                </span>
              )}
              {alert.status === "active" && (
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-500/[0.1] hover:text-red-400 transition-colors"
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
  const currency = activeAlerts[0]?.product?.currency || triggeredAlerts[0]?.product?.currency || "$";

  const stats = [
    {
      label: "Active Alerts",
      value: activeAlerts.length,
      icon: BellRing,
      cardClass: "bg-card border-white/[0.06]",
      iconClass: "bg-indigo-500/[0.08] border-indigo-500/20",
      color: "text-indigo-400",
    },
    {
      label: "Triggered",
      value: triggeredAlerts.length,
      icon: CheckCircle2,
      cardClass: "bg-card border-white/[0.06]",
      iconClass: "bg-emerald-500/[0.08] border-emerald-500/20",
      color: "text-emerald-400",
    },
    {
      label: "Total",
      value: alerts.length,
      icon: Target,
      cardClass: "bg-card border-white/[0.06]",
      iconClass: "bg-accent/[0.08] border-accent/20",
      color: "text-accent",
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Page Header */}
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
                <Bell className="size-6 text-accent" />
                Alerts
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Monitor and manage every target price alert across your tracked products.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon, cardClass, iconClass, color }) => (
            <div
              key={label}
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
          ))}
        </div>

        {/* No alerts state */}
        {alerts.length === 0 && (
          <div className="text-center py-20">
          <div className="size-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6 border border-white/[0.06]">
            <BellOff className="size-8 text-muted-foreground" />
          </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No alerts set yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Set a target price on any tracked product and we&apos;ll notify you instantly
              when the price drops to your desired level.
            </p>
            <Button asChild className="cursor-pointer">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <BellRing className="size-4 text-indigo-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
                Watching
              </h2>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {activeAlerts.length}
              </span>
            </div>
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  currency={alert.product?.currency || currency}
                />
              ))}
            </div>
          </div>
        )}

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
                Captured
              </h2>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {triggeredAlerts.length}
              </span>
            </div>
            <div className="space-y-3">
              {triggeredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  currency={alert.product?.currency || currency}
                />
              ))}
            </div>
          </div>
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
