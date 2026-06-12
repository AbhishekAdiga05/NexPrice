"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions";
import PriceChart from "./PriceChart";
import SetPriceAlert from "./SetPriceAlert";
import DealScoreBadge from "./DealScoreBadge";
import Image from "next/image";
import { Trash2, BarChart3, ExternalLink } from "lucide-react";
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

  return (
    <motion.div layout>
      <div className="bg-white rounded-lg border border-gray-200/60 shadow-card overflow-hidden">
        <Link
          href={`/dashboard/product/${product.id}`}
          className="flex items-center gap-4 p-4"
        >
          {/* Image */}
          <div className="size-12 rounded-md border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={48}
                height={48}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full flex items-center justify-center text-[10px] text-gray-300">
                N/A
              </div>
            )}
          </div>

          {/* Info columns */}
          <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 items-start">
            {/* Title row */}
            <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug group-hover:text-orange-600 transition-colors">
              {product.name}
            </h3>
            <div className="justify-self-end">
              <DealScoreBadge
                productId={product.id}
                currentPrice={product.current_price}
              />
            </div>

            {/* Price row */}
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold font-mono text-gray-900 tracking-tight leading-none">
                {product.currency} {parseFloat(product.current_price).toFixed(2)}
              </span>
              {targetPrice && (
                <span className="text-[11px] font-mono text-gray-400 leading-none">
                  target {product.currency} {targetPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-3 text-[11px] text-gray-400 justify-self-end">
              {triggeredCount > 0 && (
                <span className="text-emerald-600 font-medium">
                  {triggeredCount} captured
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* Action row */}
        <div className="flex items-center gap-1 px-4 pb-3.5 border-t border-gray-50 pt-2.5">
          <button
            onClick={() => setShowChart(!showChart)}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <BarChart3 className="size-3" />
            {showChart ? "Hide chart" : "Price chart"}
          </button>

          <div className="flex-1 min-w-0 px-2">
            <SetPriceAlert
              productId={product.id}
              currentPrice={product.current_price}
              currency={product.currency}
              alerts={product.price_alerts}
            />
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="size-7 rounded-md flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
              title="Open in store"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3" />
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleting}
              className="size-7 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Stop tracking"
            >
              <Trash2 className="size-3" />
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
              className="overflow-hidden border-t border-gray-100 bg-gray-50/30"
            >
              <div className="p-4">
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
              Remove <span className="font-medium text-gray-900">{product.name}</span>?
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
