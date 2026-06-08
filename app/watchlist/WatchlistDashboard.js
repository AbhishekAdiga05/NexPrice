"use client";

import { useState } from "react";
import Link from "next/link";
import {
  removeFromWatchlist,
  updateWatchlistPriority,
} from "@/app/actions";
import {
  ListChecks,
  ArrowLeft,
  Loader2,
  Clock,
  Trash2,
  Sparkles,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function BuyPriorityBadge({ score }) {
  let color;
  if (score >= 70) color = "bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/30";
  else if (score >= 45) color = "bg-indigo-500/[0.08] text-indigo-400 border-indigo-500/30";
  else color = "bg-white/[0.04] text-muted-foreground border-white/[0.08]";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${color}`}
    >
      <Flag className="size-2.5" />
      {score}
    </span>
  );
}

function DealScoreBadgeSmall({ score, tier }) {
  const colors = {
    great: "bg-emerald-500/[0.08] text-emerald-400 border-emerald-500/30",
    good: "bg-indigo-500/[0.08] text-indigo-400 border-indigo-500/30",
    fair: "bg-amber-500/[0.08] text-amber-400 border-amber-500/30",
    poor: "bg-red-500/[0.08] text-red-400 border-red-500/30",
    none: "bg-white/[0.04] text-muted-foreground border-white/[0.08]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${colors[tier] || colors.none}`}
    >
      <Sparkles className="size-2.5" />
      {score !== null ? score : "—"}
    </span>
  );
}

function WatchlistItem({ item, onRemove, onPriorityChange }) {
  const [removing, setRemoving] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    const result = await removeFromWatchlist(item.productId);
    if (result.error) {
      toast.error(result.error);
      setRemoving(false);
    } else {
      toast.success("Removed from watchlist");
      onRemove(item.productId);
    }
  };

  const handlePriority = async (priority) => {
    const result = await updateWatchlistPriority(item.productId, priority);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Priority set to ${priority}`);
      onPriorityChange(item.productId, priority);
    }
    setPriorityOpen(false);
  };

  const daysOnList = Math.floor(
    (Date.now() - new Date(item.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="group relative bg-card rounded-xl border border-white/[0.06] shadow-card hover:shadow-elevated transition-all duration-300 p-4">
      <div className="flex items-center gap-4">
        {item.product?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.product.image_url}
            alt={item.product.name}
            className="size-14 rounded-lg object-cover border border-white/[0.08] shrink-0"
          />
        ) : (
          <div className="size-14 rounded-lg border border-white/[0.08] bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
            NO IMG
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/products/${item.productId}`}
                className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
              >
                {item.product?.name || "Unknown Product"}
              </Link>
              <div className="flex items-center gap-2 mt-1.5">
                {item.product && (
                  <span className="text-sm font-bold font-mono text-foreground">
                    {item.product.currency}{" "}
                    {parseFloat(item.product.current_price).toFixed(2)}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground">·</span>
                <DealScoreBadgeSmall
                  score={item.dealScore?.score}
                  tier={item.dealScore?.tier}
                />
                <span className="text-[11px] text-muted-foreground">·</span>
                <BuyPriorityBadge score={item.buyPriority} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-2.5" />
                {daysOnList}d on list
              </span>

              <div className="relative">
                <button
                  onClick={() => setPriorityOpen(!priorityOpen)}
                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
                >
                  {item.priority}
                </button>
                {priorityOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-popover rounded-lg border border-white/10 shadow-elevated z-10 py-1 min-w-[100px]">
                    {["high", "medium", "low"].map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePriority(p)}
                        className={`block w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-white/[0.04] transition-colors ${
                          item.priority === p
                            ? "text-accent bg-accent/[0.08]"
                            : "text-foreground"
                        }`}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleRemove}
              disabled={removing}
              className="size-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-500/[0.1] hover:text-red-400 transition-colors"
              title="Remove from watchlist"
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WatchlistDashboard({ items: initialItems }) {
  const [items, setItems] = useState(initialItems);

  const handleRemove = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handlePriorityChange = (productId, priority) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, priority } : i
        )
        .sort((a, b) => b.buyPriority - a.buyPriority)
    );
  };

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/"
                className="size-8 rounded-full border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <ListChecks className="size-6 text-accent" />
                Smart Watchlist
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">
              Items you&apos;ve flagged, ranked by buying urgency and deal quality.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="rounded-xl border border-white/[0.06] bg-card px-5 py-3 shadow-card">
            <div className="text-2xl font-bold font-mono">{items.length}</div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Items
            </div>
          </div>
          {items.filter((i) => i.priority === "high").length > 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] px-5 py-3 text-emerald-400">
              <div className="text-2xl font-bold font-mono">
                {items.filter((i) => i.priority === "high").length}
              </div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider">
                High Priority
              </div>
            </div>
          )}
          {items.filter((i) => i.buyPriority >= 70).length > 0 && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/[0.06] px-5 py-3 text-indigo-400">
              <div className="text-2xl font-bold font-mono">
                {items.filter((i) => i.buyPriority >= 70).length}
              </div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider">
                Buy Now
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="text-center py-20">
          <div className="size-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6 border border-white/[0.06]">
            <ListChecks className="size-8 text-muted-foreground" />
          </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nothing on your watchlist yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Flag products you&apos;re considering and we&apos;ll rank them by buying urgency, deal score, and your priorities.
            </p>
            <Button asChild className="cursor-pointer">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <WatchlistItem
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onPriorityChange={handlePriorityChange}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
