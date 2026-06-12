"use client";

import { useState } from "react";
import {
  removePriceAlert,
  setPriceAlert,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Crosshair,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function StatusBadge({ status }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <span className="size-1.5 rounded-full bg-indigo-500" />
        Watching
      </span>
    );
  }
  if (status === "triggered") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="size-2.5" />
        Captured
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-gray-50 text-gray-400 border border-gray-200">
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
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Crosshair className="size-4 text-orange-500" />
            <DialogTitle>New Target Price Alert</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Target Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-gray-400 pointer-events-none">
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
                className="pl-7 h-10 text-base font-mono"
                required
                autoFocus
              />
            </div>
            <p className="mt-1 text-xs text-gray-400 font-mono">
              Current price: {currency} {parseFloat(currentPrice).toFixed(2)}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !targetPrice} className="h-9 gap-1.5 text-xs cursor-pointer">
              {submitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Bell className="size-3.5" />
              )}
              Set Alert
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className={`h-0.5 ${isTriggered ? "bg-emerald-400" : "bg-indigo-400"}`} />
      <div className="flex items-center gap-3 p-3">
        {alert.product?.image_url ? (
          <Image
            src={alert.product.image_url}
            alt={alert.product.name}
            width={40}
            height={40}
            unoptimized
            className="size-9 rounded border border-gray-100 object-cover shrink-0"
          />
        ) : (
          <div className="size-9 rounded border border-gray-100 bg-gray-50 flex items-center justify-center text-xs text-gray-400 shrink-0">
            N/A
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/products/${alert.product_id}`}
                className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1 leading-snug"
              >
                {alert.product?.name || "Unknown Product"}
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                <StatusBadge status={alert.status} />
                <span className="text-[11px] text-gray-400 font-mono tracking-tight">
                  Target: {currency} {parseFloat(alert.target_price).toFixed(2)}
                </span>
                {isTriggered && alert.savings > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600 font-mono tracking-tight">
                    · Saved {currency} {parseFloat(alert.savings).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {alert.product && (
              <div className="text-right shrink-0">
                <div className="text-[10px] text-gray-400 font-mono leading-none">Current</div>
                <div className="text-sm font-bold text-gray-900 font-mono tracking-tight leading-none">
                  {currency} {parseFloat(alert.product.current_price).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            {!isTriggered && alert.product && (
              <>
                <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden max-w-[160px]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      targetReached ? "bg-emerald-500" : "bg-indigo-400/70"
                    }`}
                    style={{ width: `${targetReached ? 100 : progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-mono leading-none">
                  {!targetReached
                    ? `${progress.toFixed(0)}% to target`
                    : "Target reached!"}
                </span>
              </>
            )}

            <div className="ml-auto flex items-center gap-1.5">
              {alert.created_at && (
                <span className="text-[10px] text-gray-400 flex items-center gap-1 leading-none">
                  <Clock className="size-2.5" />
                  {formatDate(alert.created_at)}
                </span>
              )}
              {alert.status === "active" && (
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="size-6 rounded flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Remove alert"
                >
                  {removing ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <BellOff className="size-3" />
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
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const triggeredAlerts = alerts.filter((a) => a.status === "triggered");
  const disabledAlerts = alerts.filter((a) => a.status === "disabled");
  const currency = activeAlerts[0]?.product?.currency || triggeredAlerts[0]?.product?.currency || "$";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <BellRing className="size-3.5 text-indigo-500" />
            <span className="text-[11px] font-semibold text-gray-500">Active</span>
          </div>
          <div className="text-lg font-bold font-mono text-gray-900">{activeAlerts.length}</div>
          <div className="text-[11px] text-gray-400 font-mono mt-0.5">currently watching</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span className="text-[11px] font-semibold text-gray-500">Captured</span>
          </div>
          <div className="text-lg font-bold font-mono text-gray-900">{triggeredAlerts.length}</div>
          <div className="text-[11px] text-gray-400 font-mono mt-0.5">targets hit</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Bell className="size-3.5 text-orange-500" />
            <span className="text-[11px] font-semibold text-gray-500">Total</span>
          </div>
          <div className="text-lg font-bold font-mono text-gray-900">{alerts.length}</div>
          <div className="text-[11px] text-gray-400 font-mono mt-0.5">all time</div>
        </div>
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-16 rounded-lg border border-dashed border-gray-200 bg-gray-50">
          <div className="size-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <BellOff className="size-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No alerts set yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4 px-4">
            Set a target price on any tracked product and we&apos;ll notify you when the price drops.
          </p>
          <Button asChild className="cursor-pointer">
            <Link href="/">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
            <BellRing className="size-3.5 text-indigo-500" />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Watching</h2>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{activeAlerts.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {activeAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} currency={alert.product?.currency || currency} />
            ))}
          </div>
        </section>
      )}

      {triggeredAlerts.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Captured</h2>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{triggeredAlerts.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {triggeredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} currency={alert.product?.currency || currency} />
            ))}
          </div>
        </section>
      )}

      {disabledAlerts.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
            <BellOff className="size-3.5 text-gray-400" />
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Disabled</h2>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{disabledAlerts.length}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {disabledAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} currency={alert.product?.currency || currency} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
