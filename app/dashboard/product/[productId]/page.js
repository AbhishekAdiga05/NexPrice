import { createClient } from "@/utils/supabase/server";
import {
  getProductById,
  getPriceHistory,
  isOnWatchlist,
  getStorePrices,
} from "@/app/actions";
import { generateMockStorePrices } from "@/lib/mock-stores";
import { calculateTrendIndicator } from "@/lib/deal-score";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DashboardShell from "@/components/DashboardShell";
import PriceChart from "@/components/PriceChart";
import PricePrediction from "@/components/PricePrediction";
import DealScoreBadge from "@/components/DealScoreBadge";
import SetPriceAlert from "@/components/SetPriceAlert";
import StoreComparison from "@/components/StoreComparison";
import ProductActions from "./ProductActions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ShoppingCart,
  ExternalLink,
  Clock,
  Activity,
  TrendingDown,
  TrendingUp,
  Bell,
  CheckCircle2,
  DollarSign,
  Target,
  AlertTriangle,
  Gauge,
} from "lucide-react";

function SummaryStat({ label, value, icon: Icon }) {
  return (
    <div className="bg-muted rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <span className="text-base md:text-lg font-bold font-mono text-foreground">
        {value}
      </span>
    </div>
  );
}

function TimelineIcon({ type }) {
  if (type === "alert_created") return <Bell className="size-4 text-indigo-500" />;
  if (type === "alert_triggered")
    return <CheckCircle2 className="size-4 text-emerald-500" />;
  if (type === "new_low")
    return <TrendingDown className="size-4 text-emerald-500" />;
  if (type === "price_drop")
    return <TrendingDown className="size-4 text-emerald-500" />;
  if (type === "price_increase")
    return <TrendingUp className="size-4 text-red-500" />;
  return <Activity className="size-4 text-muted-foreground" />;
}

function generateTimelineEvents(product, priceHistory, alerts) {
  const events = [];
  for (const alert of alerts || []) {
    events.push({
      id: `alert-created-${alert.id}`,
      type: "alert_created",
      date: alert.created_at,
      description: `Alert created at ${product.currency} ${parseFloat(alert.target_price).toFixed(2)}`,
    });
    if (alert.status === "triggered") {
      events.push({
        id: `alert-triggered-${alert.id}`,
        type: "alert_triggered",
        date: alert.triggered_at,
        description: "Target price reached \u2014 alert triggered",
        highlight: true,
      });
    }
  }
  let minPrice = Infinity;
  for (const entry of priceHistory) {
    const price = parseFloat(entry.price);
    if (price < minPrice) {
      minPrice = price;
      events.push({
        id: `new-low-${entry.id}`,
        type: "new_low",
        date: entry.checked_at,
        description: `New lowest price: ${product.currency} ${price.toFixed(2)}`,
        highlight: true,
      });
    }
  }
  for (let i = 1; i < priceHistory.length; i++) {
    const prev = parseFloat(priceHistory[i - 1].price);
    const curr = parseFloat(priceHistory[i].price);
    const diff = curr - prev;
    if (diff !== 0) {
      events.push({
        id: `price-change-${priceHistory[i].id}`,
        type: diff < 0 ? "price_drop" : "price_increase",
        date: priceHistory[i].checked_at,
        description: `Price ${diff < 0 ? "dropped" : "increased"} ${product.currency} ${Math.abs(diff).toFixed(2)}`,
      });
    }
  }
  events.sort((a, b) => new Date(b.date) - new Date(a.date));
  return events.slice(0, 20);
}

export default async function ProductDetailPage({ params }) {
  const { productId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const product = await getProductById(productId);
  if (!product) redirect("/");

  const priceHistory = await getPriceHistory(productId);
  const watchlistEntry = await isOnWatchlist(productId);

  let storePrices = await getStorePrices(productId);
  if (!storePrices || storePrices.length === 0) {
    storePrices = generateMockStorePrices(productId, product.current_price);
  }

  const trend = calculateTrendIndicator(
    parseFloat(product.current_price),
    priceHistory
  );
  const timelineEvents = generateTimelineEvents(
    product,
    priceHistory,
    product.price_alerts || []
  );

  const activeAlert = (product.price_alerts || []).find(
    (a) => a.status === "active"
  );
  const currentPrice = parseFloat(product.current_price);
  const targetPrice = activeAlert ? parseFloat(activeAlert.target_price) : null;
  const priceDiff = targetPrice ? currentPrice - targetPrice : null;
  const triggeredAlerts = (product.price_alerts || []).filter(
    (a) => a.status === "triggered"
  );

  const formatDiff = (diff) => {
    if (diff === null) return "\u2014";
    const abs = Math.abs(diff).toFixed(2);
    return diff <= 0
      ? `${product.currency} ${abs} below target`
      : `${product.currency} ${abs} above target`;
  };

  return (
    <>
      <DashboardShell user={user}>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-gray-200/80 shadow-card overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row gap-5 p-5 sm:p-6">
            <div className="shrink-0">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={140}
                  height={140}
                  unoptimized
                  className="w-full md:w-36 rounded-xl border border-gray-100 object-cover aspect-square"
                />
              ) : (
                <div className="w-full md:w-36 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center text-muted-foreground aspect-square">
                  <ShoppingCart className="size-8" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
                  TRACKING
                </span>
                {priceHistory.length >= 2 && (
                  <Badge variant="outline" className="text-[11px]">
                    <Activity className="size-3 mr-1" />
                    {priceHistory.length} records
                  </Badge>
                )}
                {watchlistEntry && (
                  <Badge className="text-[11px] bg-indigo-50 text-indigo-700 border-indigo-200/60">
                    Watchlist
                  </Badge>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-3">
                <DealScoreBadge
                  productId={product.id}
                  currentPrice={product.current_price}
                />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 text-xs gap-1.5"
                >
                  <Link href={product.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    Open in Store
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                <SummaryStat
                  label="Current Price"
                  value={`${product.currency} ${currentPrice.toFixed(2)}`}
                  icon={DollarSign}
                />
                <SummaryStat
                  label="Target Price"
                  value={
                    targetPrice !== null
                      ? `${product.currency} ${targetPrice.toFixed(2)}`
                      : "Not set"
                  }
                  icon={Target}
                />
                <SummaryStat
                  label="Price Difference"
                  value={formatDiff(priceDiff)}
                  icon={priceDiff !== null && priceDiff <= 0 ? CheckCircle2 : AlertTriangle}
                />
                <SummaryStat
                  label="Last Updated"
                  value={new Date(product.updated_at).toLocaleDateString()}
                  icon={Clock}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <StoreComparison prices={storePrices} currency={product.currency} />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
                <CardDescription>
                  {priceHistory.length} data points tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PriceChart productId={product.id} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <PricePrediction
                  trend={trend}
                  currentPrice={currentPrice}
                  currency={product.currency}
                  priceHistory={priceHistory}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Timeline</CardTitle>
                <CardDescription>
                  Recent price events and activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timelineEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No events recorded yet. Activity will appear as prices change.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {timelineEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-start gap-3 py-2.5 px-3 rounded-lg transition-colors ${
                          event.highlight
                            ? "bg-emerald-50 border border-emerald-100"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <TimelineIcon type={event.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-secondary-foreground leading-snug">
                            {event.description}
                          </p>
                          <p className="text-xs font-mono text-muted-foreground mt-0.5">
                            {new Date(event.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gauge className="size-4 text-orange-500" />
                  <CardTitle>Deal Score</CardTitle>
                </div>
                <CardDescription>
                  Current deal rating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DealScoreBadge
                  productId={product.id}
                  currentPrice={product.current_price}
                />
                {priceHistory.length >= 2 && (
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground leading-relaxed">
                    <p>
                      Current price is{" "}
                      <span className="font-semibold text-foreground">
                        {product.currency} {currentPrice.toFixed(2)}
                      </span>.
                    </p>
                    <p>
                      Historical range:{" "}
                      <span className="text-emerald-600 font-semibold">
                        {product.currency}{" "}
                        {Math.min(...priceHistory.map((h) => parseFloat(h.price))).toFixed(2)}
                      </span>
                      {" \u2013 "}
                      <span className="text-red-600 font-semibold">
                        {product.currency}{" "}
                        {Math.max(...priceHistory.map((h) => parseFloat(h.price))).toFixed(2)}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-orange-500" />
                  <CardTitle>Alert Information</CardTitle>
                </div>
                <CardDescription>
                  Price alert settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SetPriceAlert
                  productId={product.id}
                  currentPrice={product.current_price}
                  currency={product.currency}
                  alerts={product.price_alerts || []}
                />

                {activeAlert && (
                  <div className="bg-indigo-50 border border-indigo-200/60 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-indigo-700">
                      <Bell className="size-3.5" />
                      <span className="font-semibold">Alert Active</span>
                    </div>
                    <p className="text-xs text-indigo-600/80 mt-1 leading-relaxed">
                      Notified when price drops to{" "}
                      <span className="font-mono font-semibold text-indigo-700">
                        {product.currency} {activeAlert.target_price}
                      </span>
                    </p>
                  </div>
                )}

                {triggeredAlerts.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3.5">
                    <div className="flex items-center gap-1.5 text-sm text-emerald-700">
                      <CheckCircle2 className="size-3.5" />
                      <span className="font-semibold">Triggered Alerts</span>
                    </div>
                    <p className="text-xs text-emerald-600/80 mt-1 leading-relaxed">
                      {triggeredAlerts.length} alert
                      {triggeredAlerts.length > 1 ? "s" : ""} have been triggered
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-orange-500" />
                  <CardTitle>Actions</CardTitle>
                </div>
                <CardDescription>
                  Manage this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProductActions productId={product.id} productName={product.name} />
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardShell>
    </>
  );
}
