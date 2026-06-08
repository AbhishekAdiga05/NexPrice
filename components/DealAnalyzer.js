"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Loader2,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function getIcon(label) {
  if (label === "Great time to buy") return TrendingDown;
  if (label === "Price recently increased") return TrendingUp;
  return Minus;
}

function getTone(label) {
  if (label === "Great time to buy") {
    return "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400";
  }

  if (label === "Wait for a lower price") {
    return "border-amber-500/30 bg-amber-500/[0.06] text-amber-400";
  }

  if (label === "Price recently increased") {
    return "border-red-500/30 bg-red-500/[0.06] text-red-400";
  }

  return "border-white/10 bg-white/[0.03] text-muted-foreground";
}

export default function DealAnalyzer({ productId }) {
  const [analysis, setAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAnalysis() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/products/${productId}/deal-analysis`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to load deal analysis");
      }

      setAnalysis(result.analysis);
      setStats(result.stats);
      setSource(result.source || "");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  if (loading && !analysis) {
    return (
      <div className="flex w-full items-center gap-2 rounded-md border border-white/10 bg-background p-4 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Analyzing deal data...
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="w-full rounded-md border border-red-500/20 bg-red-500/[0.06] p-4">
        <div className="text-sm font-semibold text-red-400">
          AI analysis unavailable
        </div>
        <p className="mt-1 text-xs text-red-400/80">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadAnalysis}
          className="mt-3"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!analysis) return null;

  const Icon = getIcon(analysis.label);
  const tone = getTone(analysis.label);

  return (
    <div className={`w-full rounded-md border p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Brain className="mt-0.5 size-4 shrink-0" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold">AI Deal Analysis</h4>
              <Badge variant="outline" className="text-[10px] uppercase">
                {analysis.confidence} confidence
              </Badge>
              {source === "fallback" && (
                <Badge variant="outline" className="text-[10px] uppercase bg-white/5">
                  rules
                </Badge>
              )}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <Icon className="size-4 shrink-0" />
              <span className="text-sm font-semibold">{analysis.label}</span>
            </div>

            <p className="mt-2 text-sm leading-relaxed">{analysis.summary}</p>

            {analysis.reasons?.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs leading-relaxed">
                {analysis.reasons.map((reason) => (
                  <li key={reason}>- {reason}</li>
                ))}
              </ul>
            )}

            {stats && (
              <div className="mt-3 text-[11px] opacity-80">
                Average: {stats.averagePrice} | Lowest: {stats.lowestPrice} |
                Points: {stats.historyCount}
              </div>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={loadAnalysis}
          disabled={loading}
          className="h-8 w-8 shrink-0 p-0"
          title="Refresh deal analysis"
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
        </Button>
      </div>
    </div>
  );
}
