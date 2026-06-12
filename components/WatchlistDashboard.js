"use client";

import { useState } from "react";
import Link from "next/link";
import {
  removeFromWatchlist,
  updateWatchlistPriority,
} from "@/app/actions";
import Image from "next/image";
import {
  ListChecks,
  Loader2,
  Clock,
  Trash2,
  Sparkles,
  Flag,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DEAL_SCORE_COLORS = {
  great: "bg-emerald-50 text-emerald-700 border-emerald-200",
  good: "bg-indigo-50 text-indigo-700 border-indigo-200",
  fair: "bg-amber-50 text-amber-700 border-amber-200",
  poor: "bg-red-50 text-red-700 border-red-200",
  none: "bg-gray-50 text-gray-400 border-gray-200",
};

function BuyPriorityBadge({ score }) {
  let color;
  if (score >= 70) color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (score >= 45) color = "bg-indigo-50 text-indigo-700 border-indigo-200";
  else color = "bg-gray-50 text-gray-400 border-gray-200";

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${color}`}>
      <Flag className="size-2.5" />
      {score}
    </span>
  );
}

function DealScoreBadgeSmall({ score, tier }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${DEAL_SCORE_COLORS[tier] || DEAL_SCORE_COLORS.none}`}>
      <Sparkles className="size-2.5" />
      {score !== null ? score : "\u2014"}
    </span>
  );
}

function PriorityDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const labels = { high: "High", medium: "Medium", low: "Low" };
  const styles = {
    high: "text-emerald-700 border-emerald-200 bg-emerald-50",
    medium: "text-orange-600 border-orange-200 bg-orange-50",
    low: "text-gray-400 border-gray-200 bg-gray-50",
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition-colors ${styles[value]}`}
      >
        {labels[value]}
        <ChevronDown className="size-2.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-elevated z-20 py-1 min-w-[120px] overflow-hidden">
            {["high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  onChange(p);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs font-medium transition-colors ${
                  value === p
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-700 hover:bg-gray-50"
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
      <div className="flex items-center gap-3 p-3">
        <Link href={`/products/${item.productId}`} className="shrink-0">
          {item.product?.image_url ? (
            <Image
              src={item.product.image_url}
              alt={item.product.name}
              width={48}
              height={48}
              unoptimized
              className="size-10 rounded border border-gray-100 object-cover"
            />
          ) : (
            <div className="size-10 rounded border border-gray-100 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
              N/A
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.productId}`}
            className="text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1 leading-snug"
          >
            {item.product?.name || "Unknown Product"}
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            {item.product && (
              <span className="text-sm font-bold font-mono text-gray-900 tracking-tight">
                {item.product.currency}{" "}
                {parseFloat(item.product.current_price).toFixed(2)}
              </span>
            )}
            <DealScoreBadgeSmall
              score={item.dealScore?.score}
              tier={item.dealScore?.tier}
            />
            <BuyPriorityBadge score={item.buyPriority} />
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Clock className="size-2.5" />
              {daysOnList}d
            </span>
            <PriorityDropdown
              value={item.priority}
              onChange={handlePriority}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            href={`/products/${item.productId}`}
            className="size-7 rounded flex items-center justify-center text-gray-300 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            title="View product"
          >
            <Eye className="size-3.5" />
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="size-7 rounded flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="text-lg font-bold font-mono text-gray-900 tracking-tight leading-none">{items.length}</div>
          <div className="text-[11px] font-semibold text-gray-500 mt-1 leading-none">Items</div>
        </div>
        <div className={`rounded-lg border p-3 ${
          highCount > 0
            ? "border-emerald-200 bg-emerald-50"
            : "border-gray-200 bg-white"
        }`}>
          <div className={`text-lg font-bold font-mono tracking-tight leading-none ${
            highCount > 0 ? "text-emerald-700" : "text-gray-300"
          }`}>{highCount}</div>
          <div className={`text-[11px] font-semibold mt-1 leading-none ${
            highCount > 0 ? "text-emerald-600" : "text-gray-400"
          }`}>High Priority</div>
        </div>
        <div className={`rounded-lg border p-3 ${
          buyNowCount > 0
            ? "border-indigo-200 bg-indigo-50"
            : "border-gray-200 bg-white"
        }`}>
          <div className={`text-lg font-bold font-mono tracking-tight leading-none ${
            buyNowCount > 0 ? "text-indigo-700" : "text-gray-300"
          }`}>{buyNowCount}</div>
          <div className={`text-[11px] font-semibold mt-1 leading-none ${
            buyNowCount > 0 ? "text-indigo-600" : "text-gray-400"
          }`}>Buy Now</div>
        </div>
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <ListChecks className="size-3.5 text-gray-400" />
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Flagged Items
          </h2>
          <span className="text-[10px] text-gray-400">Sorted by buy priority</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 rounded-lg border border-dashed border-gray-200 bg-gray-50">
          <div className="size-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <ListChecks className="size-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Nothing on your watchlist yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4 px-4">
            Flag products you&apos;re considering and we&apos;ll rank them by buying urgency and deal score.
          </p>
          <Button asChild className="cursor-pointer">
            <Link href="/">
              Browse Products
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
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
  );
}
