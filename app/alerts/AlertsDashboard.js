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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
        <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
        Active
      </span>
    );
  }
  if (status === "triggered") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="size-2.5" />
        Triggered
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-border/50 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Target className="size-5 text-accent" />
            <h3 className="font-semibold text-lg">Set Target Price Alert</h3>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
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
    <div className="group relative bg-white rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        {alert.product?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alert.product.image_url}
            alt={alert.product.name}
            className="size-14 rounded-lg object-cover border border-border shrink-0"
          />
        ) : (
          <div className="size-14 rounded-lg border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
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
                <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden max-w-[200px]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
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
                  className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
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
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      label: "Triggered",
      value: triggeredAlerts.length,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Total",
      value: alerts.length,
      icon: Target,
      color: "text-accent bg-accent/5 border-accent/20",
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Page Header */}
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
                <Bell className="size-6 text-accent" />
                Alerts Dashboard
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Manage your target price alerts across all tracked products.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
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
          ))}
        </div>

        {/* No alerts state */}
        {alerts.length === 0 && (
          <div className="text-center py-20">
            <div className="size-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
              <BellOff className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No alerts yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Set a target price alert on any tracked product and we&apos;ll email you when the
              price drops to your desired level.
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
                Active Alerts
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
                Triggered Alerts
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
