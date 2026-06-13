"use client";

import { useState } from "react";
import {
  removePriceAlert,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/dates";

function StatusBadge({ status }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
        <span className="size-1.5 rounded-full bg-indigo-500" />
        Watching
      </span>
    );
  }
  if (status === "triggered") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
        <CheckCircle2 className="size-3" />
        Captured
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-gray-50 text-muted-foreground border border-gray-200/60">
      Disabled
    </span>
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

  return (
    <div className="p-4 sm:p-5">
      <div className={`h-0.5 rounded-full w-12 mb-4 ${isTriggered ? "bg-emerald-400" : "bg-indigo-400"}`} />
      <div className="flex items-center gap-4">
        {alert.product?.image_url ? (
          <Image
            src={alert.product.image_url}
            alt={alert.product.name}
            width={40}
            height={40}
            unoptimized
            className="size-11 rounded-xl border border-gray-100 object-cover shrink-0"
          />
        ) : (
          <div className="size-11 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-xs text-muted-foreground shrink-0">
            N/A
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/products/${alert.product_id}`}
                className="text-sm font-semibold text-foreground hover:text-orange-600 transition-colors truncate leading-snug"
              >
                {alert.product?.name || "Unknown Product"}
              </Link>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
                <StatusBadge status={alert.status} />
                <span className="text-xs text-muted-foreground font-mono">
                  Target: {currency} {parseFloat(alert.target_price).toFixed(2)}
                </span>
                {isTriggered && alert.savings > 0 && (
                  <span className="text-xs font-semibold text-emerald-600 font-mono">
                    · Saved {currency} {parseFloat(alert.savings).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {alert.product && (
              <div className="text-right shrink-0">
                <div className="text-[11px] text-muted-foreground font-mono leading-none">Current</div>
                <div className="text-base font-bold text-foreground font-mono tracking-tight leading-none mt-0.5">
                  {currency} {parseFloat(alert.product.current_price).toFixed(2)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-3">
            {!isTriggered && alert.product && (
              <>
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[160px]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      targetReached ? "bg-emerald-500" : "bg-indigo-400/70"
                    }`}
                    style={{ width: `${targetReached ? 100 : progress}%` }}
                  />
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {!targetReached ? `${progress.toFixed(0)}% to target` : "Target reached!"}
                </span>
              </>
            )}

            <div className="ml-auto flex items-center gap-2">
              {alert.created_at && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatTimeAgo(alert.created_at)}
                </span>
              )}
              {alert.status === "active" && (
                <button
                  onClick={handleRemove}
                  disabled={removing}
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const triggeredAlerts = alerts.filter((a) => a.status === "triggered");
  const disabledAlerts = alerts.filter((a) => a.status === "disabled");
  const currency = activeAlerts[0]?.product?.currency || triggeredAlerts[0]?.product?.currency || "$";

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">Active</span>
            <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <BellRing className="size-[18px] text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground tracking-tight leading-none">{activeAlerts.length}</div>
          <div className="text-xs text-muted-foreground font-mono mt-2">currently watching</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">Captured</span>
            <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="size-[18px] text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground tracking-tight leading-none">{triggeredAlerts.length}</div>
          <div className="text-xs text-muted-foreground font-mono mt-2">targets hit</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">Total</span>
            <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Bell className="size-[18px] text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground tracking-tight leading-none">{alerts.length}</div>
          <div className="text-xs text-muted-foreground font-mono mt-2">all time</div>
        </div>
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <div className="size-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <BellOff className="size-6 text-muted-foreground/70" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No alerts set yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5 px-4">
            Set a target price on any tracked product and we&apos;ll notify you when the price drops.
          </p>
          <Button asChild>
            <Link href="/">Back to Dashboard</Link>
          </Button>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <BellRing className="size-4 text-indigo-500" />
            <h2 className="text-section">Watching</h2>
            <span className="text-[11px] font-semibold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-lg">{activeAlerts.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {activeAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} currency={alert.product?.currency || currency} />
            ))}
          </div>
        </section>
      )}

      {triggeredAlerts.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <h2 className="text-section">Captured</h2>
            <span className="text-[11px] font-semibold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-lg">{triggeredAlerts.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {triggeredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} currency={alert.product?.currency || currency} />
            ))}
          </div>
        </section>
      )}

      {disabledAlerts.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
            <BellOff className="size-4 text-muted-foreground" />
            <h2 className="text-section text-muted-foreground">Disabled</h2>
            <span className="text-[11px] font-semibold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-lg">{disabledAlerts.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {disabledAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} currency={alert.product?.currency || currency} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
