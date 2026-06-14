import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  getProducts,
  getInsights,
  getWatchlist,
  getAlerts,
  getUserSettings,
} from "./actions";
import LandingShell from "@/components/LandingShell";
import AddProductForm from "@/components/AddProductForm";
import ProductCard from "@/components/ProductCard";
import InsightsDashboard from "@/components/InsightsDashboard";
import WatchlistDashboard from "@/components/WatchlistDashboard";
import AlertsDashboard from "@/components/AlertsDashboard";
import SettingsForm from "@/components/SettingsForm";
import DashboardShell from "@/components/DashboardShell";
import DashboardAnalyticsChart from "@/components/DashboardAnalyticsChart";
import RecentActivity from "@/components/RecentActivity";
import {
  Activity,
  Target,
  Wallet,
  Search,
  BarChart3,
  Store,
  Sparkles,
} from "lucide-react";

// ─── Dashboard stat cards ───────────────────────────────────────────────────

async function DashboardStats({ insights }) {
  if (!insights) return null;

  const bestDeal = insights?.topDeals?.[0] || null;
  const bestDealScore = insights.bestDealScore;

  const stats = [
    {
      label: "Products Tracked",
      value: insights.productCount,
      icon: BarChart3,
      sub: `${insights.productCount} product${insights.productCount !== 1 ? "s" : ""} tracked`,
      accent: "from-orange-500 to-amber-500",
      bg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      label: "Stores Compared",
      value: insights.storeCount,
      icon: Store,
      sub: `${insights.productsWithStoreCount} product${insights.productsWithStoreCount !== 1 ? "s" : ""} with store data`,
      accent: "from-blue-500 to-indigo-500",
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Best Deal Score",
      value: bestDealScore !== null ? `${bestDealScore}` : "\u2014",
      icon: Sparkles,
      sub: bestDealScore !== null
        ? bestDealScore >= 70 ? "Great Deal" : bestDealScore >= 50 ? "Good Deal" : bestDealScore >= 30 ? "Fair" : "Not Now"
        : "Track products to see scores",
      accent: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      highlight: bestDealScore !== null,
    },
    {
      label: "Potential Savings",
      value: insights.totalSavingsFormatted || "$0.00",
      icon: Wallet,
      sub: `${insights.triggeredCount} alert${insights.triggeredCount !== 1 ? "s" : ""} triggered`,
      accent: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="mb-6 sm:mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-muted-foreground/70">
                {s.label}
              </span>
              <div className={`size-9 sm:size-10 rounded-xl ${s.bg} flex items-center justify-center shadow-sm`}>
                <s.icon className={`size-4 sm:size-[18px] ${s.iconColor}`} />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight leading-none ${
              s.highlight
                ? "bg-gradient-to-r bg-clip-text text-transparent " + s.accent
                : "text-foreground"
            }`}>
              {s.value}
            </div>
            <div className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-1.5 leading-none">
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 sm:mt-4">
        <DashboardAnalyticsChart />
      </div>
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-lg w-1/3" />
      <div className="h-24 bg-gray-100 rounded-xl" />
      <div className="h-24 bg-gray-100 rounded-xl" />
    </div>
  );
}

function ProductsTab({ user, products, recentSavings }) {
  return (
    <div className="space-y-5 sm:space-y-8">
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-4 sm:p-5">
        <AddProductForm user={user} compact />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
          <Activity className="size-4 text-orange-500" />
          <h2 className="text-section">Tracked Products</h2>
          <span className="text-[11px] font-semibold text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-lg leading-none">
            {products.length}
          </span>
        </div>
        {products.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
            <div className="size-12 sm:size-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4">
              <Search className="size-5 sm:size-6 text-muted-foreground/70" />
            </div>
            <p className="text-sm text-muted-foreground px-4">Paste a product URL above to start tracking.</p>
          </div>
        )}
      </div>

      {(recentSavings?.length > 0 || products.length > 0) && (
        <RecentActivity recentSavings={recentSavings} recentProducts={products.slice(0, 5)} />
      )}
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

export default async function Home({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingShell />;
  }

  const params = await searchParams;
  const tab = params?.tab ?? null;

  const [products, insights, watchlistItems, alerts, settings] =
    await Promise.all([
      tab === null ? getProducts() : Promise.resolve([]),
      tab === null || tab === "insights" ? getInsights() : Promise.resolve(null),
      tab === "watchlist" ? getWatchlist() : Promise.resolve([]),
      tab === "alerts" ? getAlerts() : Promise.resolve([]),
      tab === "settings" ? getUserSettings() : Promise.resolve(null),
    ]);

  return (
    <>
      <DashboardShell user={user}>
        {tab === null && (
          <div className="mb-5 sm:mb-8">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight">
              Welcome back
              {user?.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name.split(" ")[0]}`
                : ""}
            </h1>
          </div>
        )}

        {tab === null && <DashboardStats insights={insights} />}

        <Suspense fallback={<TabSkeleton />}>
          {tab === null && <ProductsTab user={user} products={products} recentSavings={insights?.recentSavings} />}
        </Suspense>
        <Suspense fallback={<TabSkeleton />}>
          {tab === "insights" && <InsightsDashboard insights={insights} />}
        </Suspense>
        <Suspense fallback={<TabSkeleton />}>
          {tab === "watchlist" && <WatchlistDashboard items={watchlistItems} />}
        </Suspense>
        <Suspense fallback={<TabSkeleton />}>
          {tab === "alerts" && <AlertsDashboard alerts={alerts} />}
        </Suspense>
        <Suspense fallback={<TabSkeleton />}>
          {tab === "settings" && <SettingsForm user={user} settings={settings} />}
        </Suspense>
      </DashboardShell>
    </>
  );
}
