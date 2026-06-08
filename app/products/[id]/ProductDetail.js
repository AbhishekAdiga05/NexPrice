"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SetPriceAlert from "@/components/SetPriceAlert";
import PriceChart from "@/components/PriceChart";
import DealAnalyzer from "@/components/DealAnalyzer";
import DealScoreBadge from "@/components/DealScoreBadge";
import PricePrediction from "@/components/PricePrediction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deleteProduct,
  addToWatchlist,
  removeFromWatchlist,
} from "@/app/actions";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  BarChart3,
  Activity,
  ShoppingCart,
  Trash2,
  Loader2,
  Plus,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProductDetail({
  product,
  priceHistory,
  watchlistEntry,
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [onWatchlist, setOnWatchlist] = useState(
    watchlistEntry ? watchlistEntry.priority || "medium" : false
  );
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Stop tracking this product?")) return;
    setDeleting(true);
    const result = await deleteProduct(product.id);
    if (result.error) {
      toast.error(result.error);
      setDeleting(false);
    } else {
      toast.success("Product removed");
      router.push("/");
    }
  };

  const handleWatchlistToggle = async () => {
    setWatchlistLoading(true);
    if (onWatchlist) {
      const result = await removeFromWatchlist(product.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setOnWatchlist(false);
        toast.success("Removed from watchlist");
      }
    } else {
      const result = await addToWatchlist(product.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setOnWatchlist("medium");
        toast.success("Added to watchlist");
      }
    }
    setWatchlistLoading(false);
  };

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="size-8 rounded-full border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </div>
        </div>

        {/* Product Hero */}
        <div className="bg-card rounded-2xl border border-white/[0.06] shadow-card overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row gap-8 p-6 lg:p-8">
            {/* Image */}
            <div className="shrink-0">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full md:w-52 lg:w-64 rounded-xl border border-white/[0.08] object-cover aspect-square"
                />
              ) : (
                <div className="w-full md:w-52 lg:w-64 rounded-xl border border-white/[0.08] bg-muted flex items-center justify-center text-muted-foreground aspect-square">
                  <ShoppingCart className="size-12" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-2 rounded-full bg-emerald-500 shadow-glow-green animate-breathe" />
                  <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                    TRACKING
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    <Activity className="size-2.5 mr-1" />
                    {priceHistory.length} records
                  </Badge>
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-4">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-foreground font-mono">
                    {product.currency} {parseFloat(product.current_price).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Current price
                  </span>
                  <DealScoreBadge
                    productId={product.id}
                    currentPrice={product.current_price}
                  />
                </div>

                {priceHistory.length >= 2 && (
                  <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Lowest
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {product.currency}{" "}
                        {Math.min(...priceHistory.map((h) => parseFloat(h.price))).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Highest
                      </span>
                      <span className="text-red-400 font-bold">
                        {product.currency}{" "}
                        {Math.max(...priceHistory.map((h) => parseFloat(h.price))).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Average
                      </span>
                      <span>
                        {product.currency}{" "}
                        {(
                          priceHistory.reduce((s, h) => s + parseFloat(h.price), 0) /
                          priceHistory.length
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Tracking since
                      </span>
                      <span>
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/[0.06]">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <Link href={product.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    Open in Store
                  </Link>
                </Button>
                <Button
                  variant={onWatchlist ? "default" : "outline"}
                  size="sm"
                  onClick={handleWatchlistToggle}
                  disabled={watchlistLoading}
                  className={`gap-2 ${
                    onWatchlist
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : ""
                  }`}
                >
                  {watchlistLoading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : onWatchlist ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                  {onWatchlist ? "On Watchlist" : "Add to Watchlist"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="gap-2 text-red-400 hover:text-white hover:bg-red-500"
                >
                  {deleting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left column: Chart + Analysis */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Chart */}
            <div className="bg-card rounded-xl border border-white/[0.06] shadow-card p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
                <BarChart3 className="size-4 text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  Price History &amp; Analysis
                </h2>
              </div>
              <PriceChart productId={product.id} />
            </div>

            {/* Deal Analysis */}
            <div className="bg-card rounded-xl border border-white/[0.06] shadow-card p-6">
              <DealAnalyzer productId={product.id} />
            </div>

            {/* Price Prediction */}
            <div className="bg-card rounded-xl border border-white/[0.06] shadow-card p-6">
              <PricePrediction
                productId={product.id}
                currentPrice={product.current_price}
                currency={product.currency}
              />
            </div>
          </div>

          {/* Right column: Alert management */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-white/[0.06] shadow-card p-6 sticky top-28">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/[0.06]">
                <Activity className="size-4 text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  Alerts &amp; History
                </h2>
              </div>
              <SetPriceAlert
                productId={product.id}
                currentPrice={product.current_price}
                currency={product.currency}
                alerts={product.price_alerts}
              />

              {/* Price History Summary */}
              {priceHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase font-mono">
                      Recent Prices
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {[...priceHistory].reverse().slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between text-[11px] font-mono py-1.5 px-2 rounded-md hover:bg-white/[0.04] transition-colors"
                      >
                        <span className="text-muted-foreground">
                          {new Date(entry.checked_at).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-foreground">
                          {product.currency} {parseFloat(entry.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
