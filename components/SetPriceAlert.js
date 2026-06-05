"use client";

import { useState } from "react";
import { setPriceAlert, removePriceAlert } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Loader2,
  TrendingDown,
} from "lucide-react";

export default function SetPriceAlert({ productId, currentPrice, currency, alerts }) {
  const [targetPrice, setTargetPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeAlert = alerts?.find((a) => a.status === "active");
  const triggeredAlerts = alerts?.filter((a) => a.status === "triggered") || [];

  const current = parseFloat(currentPrice);

  const handleSet = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await setPriceAlert(productId, targetPrice);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message);
      setTargetPrice("");
    }
    setSubmitting(false);
  };

  const handleRemove = async (alertId) => {
    const result = await removePriceAlert(alertId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Alert removed");
    }
  };

  if (!activeAlert && triggeredAlerts.length === 0) {
    return (
      <div className="border-t border-border/50 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="size-3.5 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase font-mono">
            TARGET PRICE ALERT
          </span>
        </div>
        <form onSubmit={handleSet} className="flex items-center gap-2">
          <div className="relative flex-1">
            {/* <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground pointer-events-none">
              {currency}
            </span> */}
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={current}
              placeholder="Enter your target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="pl-8 h-10 text-sm font-mono bg-background"
              required
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={submitting || !targetPrice}
            className="h-10 px-5 gap-1.5 font-bold cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Bell className="size-3.5" />
            )}
            NOTIFY ME
          </Button>
        </form>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Current price: {currency} {current.toFixed(2)}
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border/50 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="size-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase font-mono">
          TARGET PRICE ALERT
        </span>
      </div>

      {activeAlert && (
        <div className="rounded-lg border border-indigo-200/70 bg-indigo-50/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bell className="size-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                  Alert Active
                  <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                </div>
                <div className="text-[11px] text-indigo-500 font-mono mt-0.5">
                  Target: {currency} {parseFloat(activeAlert.target_price).toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleRemove(activeAlert.id)}
              className="shrink-0 size-8 rounded-full flex items-center justify-center text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
              title="Remove alert"
            >
              <BellOff className="size-3.5" />
            </button>
          </div>

          {current > parseFloat(activeAlert.target_price) && (
            <>
              <div className="mt-3 h-1.5 rounded-full bg-indigo-200/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((current - parseFloat(activeAlert.target_price)) / current) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-indigo-400 font-mono">
                <span>{currency} {parseFloat(activeAlert.target_price).toFixed(2)}</span>
                <span>{currency} {current.toFixed(2)}</span>
              </div>
            </>
          )}

          {current <= parseFloat(activeAlert.target_price) && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <TrendingDown className="size-3" />
              Price is at or below your target!
            </div>
          )}
        </div>
      )}

      {triggeredAlerts.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase font-mono mb-2">
            TRIGGERED ALERTS
          </div>
          <div className="flex flex-wrap gap-2">
            {triggeredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1"
              >
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span className="text-[11px] font-medium text-emerald-700 font-mono">
                  {currency} {parseFloat(alert.target_price).toFixed(2)}
                </span>
                {alert.savings > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-600">
                    +{currency} {parseFloat(alert.savings).toFixed(2)}
                  </span>
                )}
                {alert.triggered_at && (
                  <span className="text-[10px] text-emerald-400">
                    {new Date(alert.triggered_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
