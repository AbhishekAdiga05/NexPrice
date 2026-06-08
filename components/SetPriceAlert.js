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

  const compactForm = (
    <form onSubmit={handleSet} className="flex items-center gap-1.5">
      <div className="relative flex-1 min-w-0">
        <Input
          type="number"
          step="0.01"
          min="0.01"
          max={current}
          placeholder="Target price"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="h-8 text-[11px] font-mono bg-background pl-2 pr-2 rounded-md"
          required
        />
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={submitting || !targetPrice}
        className="h-8 px-3 gap-1 text-[10px] font-semibold shrink-0"
      >
        {submitting ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Bell className="size-3" />
        )}
        Set
      </Button>
    </form>
  );

  if (!activeAlert && triggeredAlerts.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Bell className="size-3 text-muted-foreground/40 shrink-0" />
        <div className="flex-1 min-w-0">
          {compactForm}
        </div>
      </div>
    );
  }

  const compactActiveAlert = activeAlert && (
    <div className="flex items-center gap-2">
      <div className={`size-2 rounded-full ${current <= parseFloat(activeAlert.target_price) ? 'bg-emerald-500' : 'bg-indigo-400'} shrink-0`} />
      <span className="text-[10px] font-mono text-muted-foreground/70 leading-none">
        Target: {currency} {parseFloat(activeAlert.target_price).toFixed(2)}
      </span>
      {current <= parseFloat(activeAlert.target_price) && (
        <span className="text-[10px] font-semibold text-emerald-400 font-mono leading-none">
          Reached!
        </span>
      )}
      <button
        onClick={() => handleRemove(activeAlert.id)}
        className="ml-auto size-5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-red-400 transition-colors"
        title="Remove alert"
      >
        <BellOff className="size-3" />
      </button>
    </div>
  );

  const compactProgress = activeAlert && current > parseFloat(activeAlert.target_price) && (
    <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full bg-indigo-500/60 transition-all"
        style={{
          width: `${Math.min(100, ((current - parseFloat(activeAlert.target_price)) / current) * 100)}%`,
        }}
      />
    </div>
  );

  return (
    <div className="space-y-1">
      {compactActiveAlert}
      {compactProgress}
      {triggeredAlerts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {triggeredAlerts.map((alert) => (
            <span
              key={alert.id}
              className="inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/[0.06] px-1.5 py-0.5"
            >
              <CheckCircle2 className="size-2.5 text-emerald-400" />
              <span className="text-[9px] font-mono font-medium text-emerald-300">
                {currency} {parseFloat(alert.target_price).toFixed(2)}
              </span>
              {alert.savings > 0 && (
                <span className="text-[9px] font-semibold text-emerald-400">
                  +{parseFloat(alert.savings).toFixed(2)}
                </span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
