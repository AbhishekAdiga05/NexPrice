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
import SectionFade from "@/components/SectionFade";
import PriceHistoryPreview from "@/components/PriceHistoryPreview";
import {
  Activity,
  Target,
  Wallet,
  Search,
  Link2,
  Bell,
  LineChart,
  ListChecks,
} from "lucide-react";
import HeroVisual from "@/components/HeroVisual";

function LandingHero() {
  return (
    <section className="pt-24 sm:pt-32 pb-20 sm:pb-28 px-5 sm:px-8 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-12 items-center">
        <div className="max-w-lg">
          <h1 className="text-[2.8rem] sm:text-[4.2rem] lg:text-[5.2rem] font-bold text-foreground tracking-tight leading-[1.05]">
            Track Prices.
            <br />
            Buy at the{" "}
            <span className="text-orange-500">Right Time.</span>
          </h1>
          <p className="text-base sm:text-lg text-secondary-foreground mt-6 leading-relaxed max-w-md">
            Monitor product prices and get notified when they hit your target.
          </p>
          <div className="mt-8 sm:mt-10">
            <LandingCTA label="Start Tracking" />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <HeroVisual />
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
      desc: "Paste any product URL.",
    },
    {
      icon: Target,
      title: "Set Target Price",
      desc: "Pick the price you want.",
    },
    {
      icon: Bell,
      title: "Get Alert",
      desc: "We notify you when it drops.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-5 sm:px-8 bg-orange-50/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-secondary-foreground mt-3">Three simple steps.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-8 sm:p-10 text-center group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="relative size-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.25)]">
                  <step.icon className="size-7 text-white" />
                  <span className="absolute -top-1 -right-1 size-6 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center text-[11px] font-bold text-orange-500 shadow-sm">
                    {i + 1}
                  </span>
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-secondary-foreground mt-2 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Activity, title: "Price Tracking", desc: "Auto-track prices across stores." },
    { icon: Bell, title: "Smart Alerts", desc: "Instant notifications at your target price." },
    { icon: LineChart, title: "Price History", desc: "View trends before you buy." },
    { icon: ListChecks, title: "Watchlist", desc: "Manage all tracked products in one place." },
  ];

  const iconColors = [
    "from-orange-400 to-amber-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-purple-500",
  ];

  return (
    <section id="features" className="py-20 sm:py-28 px-5 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Key Features
          </h2>
          <p className="text-sm sm:text-base text-secondary-foreground mt-3">
            Simple tools for smarter shopping.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-8 text-center"
            >
              <div className="flex items-center justify-center mb-5">
                <div className={`size-14 rounded-2xl bg-gradient-to-br ${iconColors[i]} flex items-center justify-center shadow-md`}>
                  <feature.icon className="size-7 text-white" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-secondary-foreground mt-2 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceHistorySection() {
  return (
    <section id="price-trend" className="py-20 sm:py-28 px-5 sm:px-8 bg-orange-50/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Price Trend Analysis
          </h2>
          <p className="text-sm sm:text-base text-secondary-foreground mt-3">
            30-day price history for iPhone 15.
          </p>
        </div>

        <PriceHistoryPreview />
      </div>
    </section>
  );
}

// ─── Dashboard stat cards ───────────────────────────────────────────────────

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
              <Search className="size-6 text-muted-foreground/70" />
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
        <main className="font-sans">
          <SectionFade delay={0}>
            <LandingHero />
          </SectionFade>
          <SectionFade delay={100}>
            <HowItWorksSection />
          </SectionFade>
          <SectionFade delay={200}>
            <FeaturesSection />
          </SectionFade>
          <SectionFade delay={300}>
            <PriceHistorySection />
          </SectionFade>
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
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground tracking-tight leading-tight">
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
