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
    <form onSubmit={handleSet} className="flex items-center gap-2">
      <div className="relative flex-1 min-w-0 max-w-[120px]">
        <Input
          type="number"
          step="0.01"
          min="0.01"
          max={current}
          placeholder="Target"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="h-8 text-xs font-mono px-3 py-0 rounded-lg"
          required
        />
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={submitting || !targetPrice}
        className="h-8 px-3 text-xs shrink-0 rounded-lg"
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
        <Bell className="size-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          {compactForm}
        </div>
      </div>
    );
  }

  const compactActiveAlert = activeAlert && (
    <div className="flex items-center gap-2">
      <div className={`size-2 rounded-full ${current <= parseFloat(activeAlert.target_price) ? 'bg-emerald-500' : 'bg-indigo-400'} shrink-0`} />
      <span className="text-xs font-mono text-muted-foreground leading-none">
        Target: {currency} {parseFloat(activeAlert.target_price).toFixed(2)}
      </span>
      {current <= parseFloat(activeAlert.target_price) && (
        <span className="text-xs font-semibold text-emerald-600 font-mono leading-none">
          Reached!
        </span>
      )}
      <button
        onClick={() => handleRemove(activeAlert.id)}
        className="ml-auto size-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Remove alert"
      >
        <BellOff className="size-3" />
      </button>
    </div>
  );

  const compactProgress = activeAlert && current > parseFloat(activeAlert.target_price) && (
    <div className="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[160px]">
      <div
        className="h-full rounded-full bg-indigo-400/60 transition-all"
        style={{
          width: `${Math.min(100, ((current - parseFloat(activeAlert.target_price)) / current) * 100)}%`,
        }}
      />
    </div>
  );

  return (
    <div className="space-y-1.5">
      {compactActiveAlert}
      {compactProgress}
      {triggeredAlerts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {triggeredAlerts.map((alert) => (
            <span
              key={alert.id}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/60 bg-emerald-50 px-2 py-1"
            >
              <CheckCircle2 className="size-2.5 text-emerald-600" />
              <span className="text-[11px] font-mono font-semibold text-emerald-700">
                {currency} {parseFloat(alert.target_price).toFixed(2)}
              </span>
              {alert.savings > 0 && (
                <span className="text-[11px] font-semibold text-emerald-600">
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
