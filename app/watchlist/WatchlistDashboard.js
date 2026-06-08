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
  ChevronDown,
  GripVertical,
  Eye,
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
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${color}`}
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
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${colors[tier] || colors.none}`}
    >
      <Sparkles className="size-2.5" />
      {score !== null ? score : "—"}
    </span>
  );
}

function PriorityDropdown({ value, onChange, onClose }) {
  const [open, setOpen] = useState(false);

  const labels = { high: "High", medium: "Medium", low: "Low" };
  const styles = {
    high: "text-emerald-400 border-emerald-500/30 bg-emerald-500/[0.06]",
    medium: "text-accent border-accent/30 bg-accent/[0.06]",
    low: "text-muted-foreground border-white/[0.08] bg-white/[0.02]",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border transition-colors ${styles[value]}`}
      >
        {labels[value]}
        <ChevronDown className="size-2.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-popover rounded-lg border border-white/10 shadow-elevated z-20 py-1 min-w-[120px] overflow-hidden">
            {["high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                  value === p
                    ? "text-accent bg-accent/[0.08]"
                    : "text-foreground hover:bg-white/[0.04]"
                }`}
              >
                <span className={`size-1.5 rounded-full ${
                  p === "high" ? "bg-emerald-400" :
                  p === "medium" ? "bg-accent" : "bg-muted-foreground"
                }`} />
                {labels[p]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WatchlistItem({ item, onRemove, onPriorityChange }) {
  const [removing, setRemoving] = useState(false);

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
  };

  const daysOnList = Math.floor(
    (Date.now() - new Date(item.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="group relative bg-card rounded-xl border border-white/[0.06] shadow-panel hover:shadow-elevated transition-all duration-300">
      <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
        {/* Product Image */}
        <Link href={`/products/${item.productId}`} className="shrink-0">
          {item.product?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="size-12 md:size-14 rounded-lg object-cover border border-white/[0.08] group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="size-12 md:size-14 rounded-lg border border-white/[0.08] bg-muted flex items-center justify-center text-xs text-muted-foreground">
              N/A
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.productId}`}
            className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-1 leading-snug"
          >
            {item.product?.name || "Unknown Product"}
          </Link>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5">
            {item.product && (
              <span className="text-sm font-bold font-mono text-foreground tracking-tight">
                {item.product.currency}{" "}
                {parseFloat(item.product.current_price).toFixed(2)}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/40 hidden sm:inline">|</span>
            <DealScoreBadgeSmall
              score={item.dealScore?.score}
              tier={item.dealScore?.tier}
            />
            <BuyPriorityBadge score={item.buyPriority} />
            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Clock className="size-2.5" />
              {daysOnList}d
            </span>
            <PriorityDropdown
              value={item.priority}
              onChange={handlePriority}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/products/${item.productId}`}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-accent hover:bg-accent/[0.06] transition-colors"
            title="View product"
          >
            <Eye className="size-3.5" />
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors"
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

  const highCount = items.filter((i) => i.priority === "high").length;
  const buyNowCount = items.filter((i) => i.buyPriority >= 70).length;

  return (
    <main className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link
                href="/"
                className="size-7 md:size-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors shrink-0"
              >
                <ArrowLeft className="size-3.5 md:size-4" />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
                Watchlist
              </h1>
            </div>
            <p className="text-sm text-muted-foreground/70 ml-10 md:ml-11 leading-relaxed">
              Items ranked by buying urgency and deal quality.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border border-white/[0.06] bg-card/50 px-4 py-3 shadow-soft">
            <div className="text-xl md:text-2xl font-bold font-mono text-foreground tracking-tight leading-none">{items.length}</div>
            <div className="text-[10px] md:text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/70 mt-1 leading-none">
              Items
            </div>
          </div>
          <div className={`rounded-xl border px-4 py-3 shadow-soft transition-colors ${
            highCount > 0
              ? "border-emerald-500/30 bg-emerald-500/[0.04]"
              : "border-white/[0.06] bg-card/50"
          }`}>
            <div className={`text-xl md:text-2xl font-bold font-mono tracking-tight leading-none ${
              highCount > 0 ? "text-emerald-400" : "text-foreground/40"
            }`}>{highCount}</div>
            <div className={`text-[10px] md:text-[11px] font-mono font-semibold uppercase tracking-wider mt-1 leading-none ${
              highCount > 0 ? "text-emerald-400/70" : "text-muted-foreground/40"
            }`}>
              High Priority
            </div>
          </div>
          <div className={`rounded-xl border px-4 py-3 shadow-soft transition-colors ${
            buyNowCount > 0
              ? "border-indigo-500/30 bg-indigo-500/[0.04]"
              : "border-white/[0.06] bg-card/50"
          }`}>
            <div className={`text-xl md:text-2xl font-bold font-mono tracking-tight leading-none ${
              buyNowCount > 0 ? "text-indigo-400" : "text-foreground/40"
            }`}>{buyNowCount}</div>
            <div className={`text-[10px] md:text-[11px] font-mono font-semibold uppercase tracking-wider mt-1 leading-none ${
              buyNowCount > 0 ? "text-indigo-400/70" : "text-muted-foreground/40"
            }`}>
              Buy Now
            </div>
          </div>
        </div>

        {/* Section header */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListChecks className="size-3.5 text-accent" />
              <h2 className="text-[11px] md:text-xs font-mono font-semibold uppercase tracking-wider text-foreground/70 leading-none">
                Flagged Items
              </h2>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/50 leading-none">
              Sorted by buy priority
            </span>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="text-center py-16 md:py-20 rounded-xl border border-dashed border-white/[0.06] bg-muted/20">
            <div className="size-16 md:size-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-5 border border-white/[0.04]">
              <ListChecks className="size-6 md:size-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-1.5 leading-snug">
              Nothing on your watchlist yet
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-6 px-4 leading-relaxed">
              Flag products you&apos;re considering and we&apos;ll rank them by buying urgency, deal score, and your priorities.
            </p>
            <Button asChild className="cursor-pointer h-11 px-6">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
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
