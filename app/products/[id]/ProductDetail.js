"use client";

import { useState } from "react";
import Link from "next/link";
import SetPriceAlert from "@/components/SetPriceAlert";
import PriceChart from "@/components/PriceChart";
import DealAnalyzer from "@/components/DealAnalyzer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteProduct } from "@/app/actions";
import {
  ArrowLeft,
  ExternalLink,
  Clock,
  BarChart3,
  Activity,
  ShoppingCart,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ProductDetail({ product, priceHistory }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

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

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row gap-8 p-6 lg:p-8">
            {/* Image */}
            <div className="shrink-0">
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full md:w-52 lg:w-64 rounded-xl border border-border object-cover aspect-square"
                />
              ) : (
                <div className="w-full md:w-52 lg:w-64 rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground aspect-square">
                  <ShoppingCart className="size-12" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="size-2 rounded-full bg-green-500 shadow-sm animate-[pulse_2s_ease-in-out_infinite]" />
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
                    current price
                  </span>
                </div>

                {priceHistory.length >= 2 && (
                  <div className="flex items-center gap-6 text-xs text-muted-foreground font-mono">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Lowest
                      </span>
                      <span className="text-emerald-600 font-bold">
                        {product.currency}{" "}
                        {Math.min(...priceHistory.map((h) => parseFloat(h.price))).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Highest
                      </span>
                      <span className="text-red-600 font-bold">
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

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-2 cursor-pointer"
                >
                  <Link href={product.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    View on Store
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="gap-2 text-red-500 hover:text-white hover:bg-red-500 cursor-pointer"
                >
                  {deleting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Stop Tracking
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left column: Chart + Analysis */}
          <div className="lg:col-span-3 space-y-6">
            {/* Price Chart */}
            <div className="bg-white rounded-xl border border-border/50 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <BarChart3 className="size-4 text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  Price History
                </h2>
              </div>
              <PriceChart productId={product.id} />
            </div>

            {/* Deal Analysis */}
            <div className="bg-white rounded-xl border border-border/50 shadow-sm p-6">
              <DealAnalyzer productId={product.id} />
            </div>
          </div>

          {/* Right column: Alert management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-border/50 shadow-sm p-6 sticky top-28">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                <Activity className="size-4 text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  Alert Settings
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
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase font-mono">
                      Recent History
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {[...priceHistory].reverse().slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between text-[11px] font-mono py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
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
