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
    <form onSubmit={handleSet} className="flex items-center gap-1.5">
      <div className="relative flex-1 min-w-0">
        <Input
          type="number"
          step="0.01"
          min="0.01"
          max={current}
          placeholder="Target"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="h-7 text-[10px] font-mono px-2 py-0"
          required
        />
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={submitting || !targetPrice}
        className="h-7 px-2 gap-1 text-[10px] shrink-0"
      >
        {submitting ? (
          <Loader2 className="size-2.5 animate-spin" />
        ) : (
          <Bell className="size-2.5" />
        )}
        Set
      </Button>
    </form>
  );

  if (!activeAlert && triggeredAlerts.length === 0) {
    return (
      <div className="flex items-center gap-1.5">
        <Bell className="size-3 text-gray-300 shrink-0" />
        <div className="flex-1 min-w-0">
          {compactForm}
        </div>
      </div>
    );
  }

  const compactActiveAlert = activeAlert && (
    <div className="flex items-center gap-1.5">
      <div className={`size-1.5 rounded-full ${current <= parseFloat(activeAlert.target_price) ? 'bg-emerald-500' : 'bg-indigo-400'} shrink-0`} />
      <span className="text-[10px] font-mono text-gray-400 leading-none">
        Target: {currency} {parseFloat(activeAlert.target_price).toFixed(2)}
      </span>
      {current <= parseFloat(activeAlert.target_price) && (
        <span className="text-[10px] font-semibold text-emerald-600 font-mono leading-none">
          Reached!
        </span>
      )}
      <button
        onClick={() => handleRemove(activeAlert.id)}
        className="ml-auto size-4 rounded flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
        title="Remove alert"
      >
        <BellOff className="size-2.5" />
      </button>
    </div>
  );

  const compactProgress = activeAlert && current > parseFloat(activeAlert.target_price) && (
    <div className="mt-1 h-1 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-indigo-400/60 transition-all"
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
        <div className="flex flex-wrap gap-1">
          {triggeredAlerts.map((alert) => (
            <span
              key={alert.id}
              className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5"
            >
              <CheckCircle2 className="size-2 text-emerald-600" />
              <span className="text-[9px] font-mono font-medium text-emerald-700">
                {currency} {parseFloat(alert.target_price).toFixed(2)}
              </span>
              {alert.savings > 0 && (
                <span className="text-[9px] font-semibold text-emerald-600">
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
