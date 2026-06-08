"use client";

import { useState } from "react";
import { deleteProduct } from "@/app/actions";
import DealAnalyzer from "./DealAnalyzer";
import PriceChart from "./PriceChart";
import SetPriceAlert from "./SetPriceAlert";
import DealScoreBadge from "./DealScoreBadge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Power,
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      layout
      className="group h-full flex flex-col"
    >
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="pb-4 border-b border-white/[0.06] flex-1">
          <div className="flex gap-4">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="size-20 lg:size-24 object-cover rounded-md border border-white/[0.08] shadow-sm group-hover:scale-105 transition-all duration-500"
              />
            ) : (
              <div className="size-20 lg:size-24 rounded-md border border-white/[0.08] bg-muted flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                NO_IMG
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-2 rounded-full bg-emerald-500 shadow-glow-green animate-breathe" />
                  <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                    ACTIVE
                  </span>
                </div>
                <h3 className="font-bold text-foreground line-clamp-2 leading-tight">
                  {product.name}
                </h3>
              </div>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-foreground">
                  {product.currency} {product.current_price}
                </span>
                <Badge variant="outline" className="gap-1 mt-1 text-[10px] border-white/10">
                  <div className="size-1.5 rounded-full bg-accent" />
                  TRACKING
                </Badge>
                <DealScoreBadge
                  productId={product.id}
                  currentPrice={product.current_price}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-3">
          <SetPriceAlert
            productId={product.id}
            currentPrice={product.current_price}
            currency={product.currency}
            alerts={product.price_alerts}
          />

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChart(!showChart)}
              className="gap-2 w-full text-xs"
            >
              <div className={`size-1.5 rounded-full transition-colors ${showChart ? 'bg-accent' : 'bg-muted-foreground'}`} />
              CHART
            </Button>

            <Button variant="outline" size="sm" asChild className="gap-2 w-full text-xs">
              <Link href={product.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-3" />
                VIEW
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 w-full text-xs font-bold text-red-400 hover:text-white hover:bg-red-500 transition-all"
            >
              <Power className="size-3" />
              REMOVE
            </Button>
          </div>
        </CardContent>

        <AnimatePresence>
          {showChart && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardFooter className="flex flex-col items-start gap-4 border-t border-white/[0.06] bg-muted/30 p-6">
                 <div className="font-semibold text-xs uppercase text-muted-foreground w-full border-b border-white/[0.06] pb-2">
                   PRICE HISTORY
                 </div>
                 <DealAnalyzer productId={product.id} />
                 <PriceChart productId={product.id} />
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
