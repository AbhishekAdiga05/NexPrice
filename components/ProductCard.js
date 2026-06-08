"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions";
import DealAnalyzer from "./DealAnalyzer";
import PriceChart from "./PriceChart";
import SetPriceAlert from "./SetPriceAlert";
import DealScoreBadge from "./DealScoreBadge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Trash2,
  ChevronDown,
  ChevronUp,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductCard({ product }) {
  const [showChart, setShowChart] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Stop tracking this product?")) return;
    setDeleting(true);
    await deleteProduct(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="group"
    >
      <div className="bg-card rounded-xl border border-white/[0.06] shadow-soft hover:shadow-panel transition-all duration-300 overflow-hidden">
        {/* Main row */}
        <div className="p-3 md:p-4">
          <div className="flex gap-3">
            {/* Product image */}
            <Link href={`/products/${product.id}`} className="shrink-0">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="size-10 md:size-11 rounded-lg object-cover border border-white/[0.08] group-hover:ring-1 group-hover:ring-accent/30 transition-all"
                />
              ) : (
                <div className="size-10 md:size-11 rounded-lg border border-white/[0.08] bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                  N/A
                </div>
              )}
            </Link>

            {/* Info column */}
            <div className="flex-1 min-w-0">
              {/* Header row: name + status + delete */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[9px] font-mono font-semibold text-muted-foreground/60 uppercase tracking-wider leading-none">
                      Active
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-accent transition-colors">
                    <Link href={`/products/${product.id}`}>
                      {product.name}
                    </Link>
                  </h3>
                </div>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="size-7 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors shrink-0"
                  title="Stop tracking"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>

              {/* Price row */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
                <span className="text-base md:text-lg font-bold font-mono text-foreground tracking-tight leading-none">
                  {product.currency} {product.current_price}
                </span>
                <DealScoreBadge
                  productId={product.id}
                  currentPrice={product.current_price}
                />
              </div>

              {/* SetPriceAlert inline */}
              <div className="mt-2">
                <SetPriceAlert
                  productId={product.id}
                  currentPrice={product.current_price}
                  currency={product.currency}
                  alerts={product.price_alerts}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.04]">
            <button
              onClick={() => setShowChart(!showChart)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-mono font-semibold text-muted-foreground/70 hover:text-accent hover:bg-accent/[0.06] transition-colors border border-transparent hover:border-accent/20"
            >
              <BarChart3 className="size-3" />
              {showChart ? "Hide" : "Chart"}
            </button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-7 px-2.5 text-[10px] font-mono font-semibold text-muted-foreground/70 hover:text-foreground"
            >
              <Link href={product.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3" />
                View
              </Link>
            </Button>
          </div>
        </div>

        {/* Expandable chart section */}
        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-white/[0.04] bg-muted/20"
            >
              <div className="p-4 md:p-5 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
                  <BarChart3 className="size-3.5 text-accent" />
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Price History & Analysis
                  </span>
                </div>
                <DealAnalyzer productId={product.id} />
                <PriceChart productId={product.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
