"use client";

import { useState } from "react";
import Link from "next/link";
import {
  removeFromWatchlist,
  updateWatchlistPriority,
} from "@/app/actions";
import Image from "next/image";
import { getProductImageFallback } from "@/lib/image-utils";
import {
  ListChecks,
  Loader2,
  Clock,
  Trash2,
  Sparkles,
  Flag,
  ChevronDown,
  Eye,
  Store,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StorePriceBadge from "./StorePriceBadge";

const DEAL_SCORE_COLORS = {
  great: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  good: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  fair: "bg-amber-50 text-amber-700 border-amber-200/60",
  poor: "bg-red-50 text-red-700 border-red-200/60",
  none: "bg-gray-50 text-muted-foreground border-gray-200/60",
};

function BuyPriorityBadge({ score }) {
  let color;
  if (score >= 70) color = "bg-emerald-50 text-emerald-700 border-emerald-200/60";
  else if (score >= 45) color = "bg-indigo-50 text-indigo-700 border-indigo-200/60";
  else color = "bg-gray-50 text-muted-foreground border-gray-200/60";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${color}`}>
      <Flag className="size-2.5" />
      {score}
    </span>
  );
}

function DealScoreBadgeSmall({ score, tier }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${DEAL_SCORE_COLORS[tier] || DEAL_SCORE_COLORS.none}`}>
      <Sparkles className="size-2.5" />
      {score !== null ? score : "\u2014"}
    </span>
  );
}

function PriorityDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const labels = { high: "High", medium: "Medium", low: "Low" };
  const styles = {
    high: "text-emerald-700 border-emerald-200/60 bg-emerald-50",
    medium: "text-orange-600 border-orange-200/60 bg-orange-50",
    low: "text-muted-foreground border-gray-200/60 bg-gray-50",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${styles[value]}`}
      >
        {labels[value]}
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl border border-gray-200/80 shadow-elevated z-20 py-1.5 min-w-[130px]">
            {["high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  value === p
                    ? "text-orange-600 bg-orange-50"
                    : "text-secondary-foreground hover:bg-gray-50"
                }`}
              >
                <span className={`size-1.5 rounded-full ${
                  p === "high" ? "bg-emerald-500" :
                  p === "medium" ? "bg-orange-500" : "bg-gray-300"
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
  const [now] = useState(() => Date.now());

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
    (now - new Date(item.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 shadow-card hover:shadow-elevated transition-shadow duration-300 overflow-hidden group">
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <Link href={`/products/${item.productId}`} className="shrink-0">
          <Image
            src={item.product?.image_url || getProductImageFallback(item.product?.name)}
            alt={item.product?.name || "Product"}
            width={48}
            height={48}
            unoptimized
            className="size-12 rounded-xl border border-gray-100 object-cover bg-gray-50"
            onError={(e) => {
              if (e.target.src !== getProductImageFallback(item.product?.name)) {
                e.target.src = getProductImageFallback(item.product?.name);
              }
            }}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.productId}`}
            className="text-sm sm:text-base font-semibold text-foreground hover:text-orange-600 transition-colors truncate leading-snug"
          >
            {item.product?.name || "Unknown Product"}
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5">
            {item.product && (
              <span className="text-base font-bold font-mono text-foreground tracking-tight">
                {item.product.currency}{" "}
                {parseFloat(item.product.current_price).toFixed(2)}
              </span>
            )}
            <DealScoreBadgeSmall score={item.dealScore?.score} tier={item.dealScore?.tier} />
            <BuyPriorityBadge score={item.buyPriority} />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {daysOnList}d
            </span>
            <PriorityDropdown value={item.priority} onChange={handlePriority} />
          </div>
          {item.product && (
            <div className="mt-2">
              <StorePriceBadge productId={item.productId} currency={item.product.currency} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href={`/products/${item.productId}`}
            className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-orange-600 hover:bg-orange-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            title="View product"
          >
            <Eye className="size-4" />
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            title="Remove from watchlist"
          >
            {removing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
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
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">Items</span>
          <div className="text-3xl font-bold font-mono text-foreground tracking-tight mt-2">{items.length}</div>
        </div>
        <div className={`rounded-xl border p-5 ${
          highCount > 0
            ? "border-emerald-200/60 bg-emerald-50/50 shadow-card"
            : "border-gray-200/80 bg-white shadow-card"
        }`}>
          <span className={`text-xs font-semibold uppercase tracking-[0.06em] ${
            highCount > 0 ? "text-emerald-600" : "text-muted-foreground"
          }`}>High Priority</span>
          <div className={`text-3xl font-bold font-mono tracking-tight mt-2 ${
            highCount > 0 ? "text-emerald-700" : "text-muted-foreground/50"
          }`}>{highCount}</div>
        </div>
        <div className={`rounded-xl border p-5 ${
          buyNowCount > 0
            ? "border-indigo-200/60 bg-indigo-50/50 shadow-card"
            : "border-gray-200/80 bg-white shadow-card"
        }`}>
          <span className={`text-xs font-semibold uppercase tracking-[0.06em] ${
            buyNowCount > 0 ? "text-indigo-600" : "text-muted-foreground"
          }`}>Buy Now</span>
          <div className={`text-3xl font-bold font-mono tracking-tight mt-2 ${
            buyNowCount > 0 ? "text-indigo-700" : "text-muted-foreground/50"
          }`}>{buyNowCount}</div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-2.5 mb-2">
          <ListChecks className="size-4 text-orange-500" />
          <h2 className="text-section">Flagged Items</h2>
          <span className="text-xs text-muted-foreground font-medium">Sorted by buy priority</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
          <div className="size-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ListChecks className="size-6 text-muted-foreground/70" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Nothing on your watchlist yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5 px-4">
            Flag products you&apos;re considering and we&apos;ll rank them by buying urgency and deal score.
          </p>
          <Button asChild>
            <Link href="/">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {items.map((item) => (
            <WatchlistItem key={item.id} item={item} onRemove={handleRemove} onPriorityChange={handlePriorityChange} />
          ))}
        </div>
      )}
    </div>
  );
}
