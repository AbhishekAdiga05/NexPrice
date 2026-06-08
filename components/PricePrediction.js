"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, TrendingDown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getConfidenceColor(confidence) {
  if (confidence === "high") return "bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/30";
  if (confidence === "medium") return "bg-indigo-500/[0.08] text-indigo-400 border-indigo-500/30";
  return "bg-amber-500/[0.08] text-amber-400 border-amber-500/30";
}

export default function PricePrediction({ productId, currentPrice, currency }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPrediction() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/products/${productId}/predict`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load prediction");
      }

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrediction();
  }, [productId]);

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Generating prediction...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-md border border-red-500/20 bg-red-500/[0.06] p-3">
        <p className="text-xs text-red-400">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadPrediction}
          className="mt-2 h-7 text-xs"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!data?.prediction) return null;

  const { prediction, source, cached } = data;

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="size-3.5 text-accent" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground font-mono">
            Price Prediction
          </span>
          <Badge
            variant="outline"
            className={`text-[9px] uppercase px-1.5 py-0 ${getConfidenceColor(prediction.confidence)}`}
          >
            {prediction.confidence}
          </Badge>
          {cached && (
            <Badge variant="outline" className="text-[9px] uppercase bg-white/5">
              cached
            </Badge>
          )}
          {source === "fallback" && (
            <Badge variant="outline" className="text-[9px] uppercase bg-white/5">
              rules
            </Badge>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={loadPrediction}
          disabled={loading}
          className="h-6 w-6 p-0 shrink-0"
        >
          {loading ? (
            <Loader2 className="size-2.5 animate-spin" />
          ) : (
            <RefreshCw className="size-2.5" />
          )}
        </Button>
      </div>

      {prediction.predicted_price ? (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <TrendingDown className="size-4 text-emerald-400" />
            <span className="text-lg font-bold font-mono text-emerald-400">
              {currency} {prediction.predicted_price.toFixed(2)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {prediction.timeframe || "soon"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {prediction.reasoning}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {prediction.reasoning}
        </p>
      )}
    </div>
  );
}
