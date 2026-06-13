import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  getProducts,
  getInsights,
  getWatchlist,
  getAlerts,
  getUserSettings,
} from "./actions";
import NavBar from "@/components/NavBar";
import AddProductForm from "@/components/AddProductForm";
import ProductCard from "@/components/ProductCard";
import InsightsDashboard from "@/components/InsightsDashboard";
import WatchlistDashboard from "@/components/WatchlistDashboard";
import AlertsDashboard from "@/components/AlertsDashboard";
import SettingsForm from "@/components/SettingsForm";
import DashboardShell from "@/components/DashboardShell";
import RecentActivity from "@/components/RecentActivity";
import LandingCTA from "@/components/LandingCTA";
import Footer from "@/components/Footer";
import {
  Activity,
  Target,
  Wallet,
  Search,
  TrendingUp,
  DollarSign,
  Link2,
  Bell,
  LineChart,
  ListChecks,
} from "lucide-react";
import ProductAlertPreview from "@/components/ProductAlertPreview";

function LandingHero() {
  return (
    <section className="pt-24 sm:pt-32 pb-20 sm:pb-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_auto] gap-16 lg:gap-24 items-center">
        <div className="max-w-xl">
          <h1 className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.25rem] font-bold text-gray-900 tracking-tight leading-[1.08]">
            Track Prices.
            <br />
            Buy at the{" "}
            <span className="text-orange-500">Right Time.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mt-8 leading-relaxed max-w-md">
            Monitor product prices across stores and get notified when they reach your target price.
          </p>
          <div className="mt-10">
            <LandingCTA variant="primary" label="Start Tracking" />
          </div>
        </div>

        <div className="lg:justify-self-end">
          <ProductAlertPreview />
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: Link2,
      title: "Add Product",
      description: "Paste a product URL to start tracking.",
    },
    {
      icon: Target,
      title: "Set Target Price",
      description: "Choose the price you want to pay.",
    },
    {
      icon: Bell,
      title: "Get Alert",
      description: "Receive a notification when the price drops.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-5 sm:px-8 border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-base text-muted-foreground mt-3">Three steps. No complexity.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="size-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.25)]">
                  <step.icon className="size-6 text-white" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 size-7 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-orange-500">{i + 1}</span>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-[200px] leading-relaxed">{step.description}</p>

              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-orange-200 to-orange-100" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Activity, title: "Price Tracking", description: "Monitor prices automatically across supported stores." },
    { icon: Bell, title: "Smart Alerts", description: "Get notified instantly when prices hit your target." },
    { icon: LineChart, title: "Price History", description: "View historical price trends before purchasing." },
    { icon: ListChecks, title: "Watchlist", description: "Track and manage products in one place." },
  ];

  const iconBg = [
    "from-orange-400 to-amber-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-purple-500",
  ];

  return (
    <section className="py-24 sm:py-32 px-5 sm:px-8 border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Everything You Need
          </h2>
          <p className="text-base text-muted-foreground mt-3">Simple tools for smarter shopping.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group bg-white rounded-2xl border border-gray-100/80 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 p-7"
            >
              <div className="relative mb-5 flex items-center justify-center">
                <div className={`size-13 rounded-2xl bg-gradient-to-br ${iconBg[i]} flex items-center justify-center shadow-lg`}>
                  <feature.icon className="size-6 text-white" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 text-center">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed text-center mt-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 sm:py-32 px-5 sm:px-8 border-t border-gray-100">
      <div className="max-w-3xl mx-auto bg-[#FFF7ED] rounded-3xl px-8 py-16 sm:px-16 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
          Ready to buy smarter?
        </h2>
        <p className="text-lg text-muted-foreground mb-10">
          Start tracking products in under a minute.
        </p>
        <LandingCTA variant="primary" label="Get Started" />
      </div>
    </section>
  );
}

// ─── Redesigned Stat Cards ──────────────────────────────────────────────────

async function DashboardStats({ insights }) {
  if (!insights) return null;

  const stats = [
    {
      label: "Tracked Products",
      value: insights.productCount,
      icon: Activity,
      sub: `${insights.productCount} product${insights.productCount !== 1 ? "s" : ""} tracked`,
    },
    {
      label: "Active Alerts",
      value: insights.activeCount,
      icon: Target,
      sub: `${insights.totalAlerts} total alerts`,
    },
    {
      label: "Total Savings",
      value: insights.totalSavingsFormatted,
      icon: Wallet,
      sub: `${insights.triggeredCount} captured`,
    },
  ];

  const iconColors = [
    "text-orange-600 bg-orange-50",
    "text-indigo-600 bg-indigo-50",
    "text-emerald-600 bg-emerald-50",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="bg-white rounded-xl border border-gray-200/80 shadow-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {s.label}
            </span>
            <div className={`size-10 rounded-xl flex items-center justify-center ${iconColors[i]}`}>
              <s.icon className="size-[18px]" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-foreground tracking-tight leading-none">
            {s.value}
          </div>
          <div className="text-xs text-muted-foreground font-mono mt-2 leading-none">
            {s.sub}
          </div>
        </div>
      ))}
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
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-card p-4 sm:p-5">
        <AddProductForm user={user} compact />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-5">
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
          <div className="text-center py-16 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
            <div className="size-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="size-6 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">Paste a product URL above to start tracking.</p>
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
    return (
      <>
        <NavBar user={null} />
        <main className="min-h-screen bg-landing font-sans">
          <LandingHero />
          <HowItWorksSection />
          <FeaturesSection />
          <CTASection />
          <Footer />
        </main>
      </>
    );
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
      <NavBar user={user} />
      <DashboardShell>
        {tab === null && (
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
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
