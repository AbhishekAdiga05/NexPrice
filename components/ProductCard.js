"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions";
import PriceChart from "./PriceChart";
import SetPriceAlert from "./SetPriceAlert";
import DealScoreBadge from "./DealScoreBadge";
import Image from "next/image";
import { Trash2, BarChart3, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ProductCard({ product }) {
  const [showChart, setShowChart] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setShowDeleteDialog(false);
    await deleteProduct(product.id);
  };

  const activeAlert = product.price_alerts?.find(
    (a) => a.status === "active"
  );
  const targetPrice = activeAlert
    ? parseFloat(activeAlert.target_price)
    : null;
  const triggeredCount = product.price_alerts?.filter(
    (a) => a.status === "triggered"
  ).length;
  const targetReached = activeAlert && parseFloat(product.current_price) <= parseFloat(activeAlert.target_price);

  return (
    <motion.div layout className="group">
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-card hover:shadow-elevated transition-shadow duration-300 overflow-hidden">
        {/* Top row: Image, Name, Price, Status Badge */}
        <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
          <Link
            href={`/dashboard/product/${product.id}`}
            className="shrink-0"
          >
            <div className="size-12 sm:size-14 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={56}
                  height={56}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center text-xs text-muted-foreground/50">
                  N/A
                </div>
              )}
            </div>
          </Link>

          <Link
            href={`/dashboard/product/${product.id}`}
            className="flex-1 min-w-0"
          >
            <h3 className="text-sm sm:text-base font-semibold text-foreground truncate leading-snug group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 sm:gap-3 mt-1">
              <span className="text-base sm:text-lg font-bold font-mono text-foreground tracking-tight">
                {product.currency} {parseFloat(product.current_price).toFixed(2)}
              </span>
              {targetPrice && (
                <span className="text-xs text-muted-foreground font-mono">
                  target {product.currency} {targetPrice.toFixed(2)}
                </span>
              )}
            </div>
          </Link>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <DealScoreBadge
              productId={product.id}
              currentPrice={product.current_price}
            />
            {targetReached && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Target Reached
              </span>
            )}
          </div>
        </div>

        {/* Second row: Target price, Alert status, Quick actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 sm:px-5 pb-4 sm:pb-5">
          <div className="w-full sm:flex-1 sm:min-w-0">
            <SetPriceAlert
              productId={product.id}
              currentPrice={product.current_price}
              currency={product.currency}
              alerts={product.price_alerts}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end sm:justify-start">
            {triggeredCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 whitespace-nowrap">
                {triggeredCount} captured
              </span>
            )}
            <button
              onClick={() => setShowChart(!showChart)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-orange-600 hover:bg-orange-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <BarChart3 className="size-3.5" />
              {showChart ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
            <Link
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-secondary-foreground hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title="Open in store"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3.5" />
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title="Stop tracking"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable chart */}
        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden border-t border-gray-100 bg-gray-50/50"
            >
              <div className="p-4 sm:p-5">
                <PriceChart productId={product.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Stop tracking?</DialogTitle>
            <DialogDescription>
              Remove <span className="font-medium text-foreground">{product.name}</span>?
              All history and alerts will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting\u2026" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
