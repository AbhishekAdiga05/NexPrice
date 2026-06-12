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
} from "lucide-react";
import * as motion from "framer-motion/client";

// ─── Landing page ────────────────────────────────────────────────────────────

function LandingHero() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-200 mb-6 text-xs font-semibold text-orange-600">
          <Activity className="size-3" />
          Smart Price Tracking
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-4">
          Never Miss A{" "}
          <span className="text-orange-500">Price Drop</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Track prices across stores and get notified the moment your target price hits.
        </p>
        <div className="flex items-center justify-center gap-4">
          <LandingCTA variant="primary" />
          <span className="text-xs text-gray-400">Free · No CC required</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Add Any Product",
      description: "Paste any product URL. NexPrice captures pricing data automatically.",
    },
    {
      number: "02",
      title: "We Track Relentlessly",
      description: "Our system monitors prices daily and records every fluctuation.",
    },
    {
      number: "03",
      title: "Strike at the Right Moment",
      description: "Set your target price and get instant alerts when the timing is right.",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 border-t border-gray-200 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-2 block">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Start saving in three simple moves
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="bg-white rounded-lg border border-gray-200 p-6">
              <span className="text-3xl font-black text-orange-100 block mb-3">
                {step.number}
              </span>
              <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { title: "Price Tracking", description: "Monitor unlimited products with automatic daily price snapshots." },
    { title: "Smart Alerts", description: "Set your ideal price and receive instant email notifications." },
    { title: "Deal Score", description: "0-100 algorithm that tells you exactly when to buy." },
    { title: "Trend Analysis", description: "Real-time price trend detection and timing recommendations." },
    { title: "Watchlist", description: "Ranked shopping list by buying urgency and deal score." },
    { title: "Savings Tracking", description: "Every triggered alert automatically calculates your savings." },
    { title: "Insights", description: "Command center showing top deals and alert activity at a glance." },
    { title: "Price History", description: "Interactive charts with low, high, and average markers." },
  ];

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-2 block">
            Everything You Need
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            A complete toolkit for smarter shopping
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-elevated transition-shadow">
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">{feature.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 px-4 sm:px-6 border-t border-gray-200 bg-orange-50/30">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
          Ready to shop smarter?
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Free to start, no credit card required.
        </p>
        <div className="flex items-center justify-center gap-4">
          <LandingCTA variant="secondary" />
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard sections ──────────────────────────────────────────────────────

async function DashboardStats({ insights }) {
  if (!insights) return null;

  const stats = [
    {
      label: "Tracked Products",
      value: insights.productCount,
      icon: Activity,
      sub: "being monitored",
    },
    {
      label: "Active Alerts",
      value: insights.activeCount,
      icon: Target,
      sub: `${insights.totalAlerts} total set`,
    },
    {
      label: "Total Savings",
      value: insights.totalSavingsFormatted,
      icon: Wallet,
      sub: `${insights.triggeredCount} captured`,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-lg border border-gray-200 p-3"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <s.icon className="size-3.5 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-500 leading-none">
              {s.label}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-gray-900 tracking-tight leading-none">
            {s.value}
          </div>
          {s.sub && (
            <div className="text-[11px] text-gray-400 font-mono mt-0.5 leading-none">
              {s.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-1/3" />
      <div className="h-20 bg-gray-100 rounded-lg" />
      <div className="h-20 bg-gray-100 rounded-lg" />
    </div>
  );
}

// ─── Products tab ─────────────────────────────────────────────────────────────

function ProductsTab({ user, products, recentSavings }) {
  return (
    <div className="space-y-6">
      {/* Add product */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <AddProductForm user={user} compact />
      </div>

      {/* Stat cards */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="size-3.5 text-gray-400" />
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Tracked Products
          </h2>
          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded leading-none">
            {products.length}
          </span>
        </div>
        {products.length > 0 ? (
          <div className="space-y-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <div className="size-10 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <Search className="size-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Paste a product URL above to start tracking.</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <RecentActivity recentSavings={recentSavings} recentProducts={products.slice(0, 5)} />
    </div>
  );
}

// ─── Main page component ──────────────────────────────────────────────────────

export default async function Home({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Logged-out: show marketing landing page ──
  if (!user) {
    return (
      <>
        <NavBar user={null} />
        <main className="min-h-screen font-sans">
          <LandingHero />
          <HowItWorksSection />
          <FeaturesSection />
          <CTASection />
          <Footer />
        </main>
      </>
    );
  }

  // ── Logged-in: resolve active tab ──
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
        {/* Welcome header — only on products tab */}
        {tab === null && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Welcome back
              {user?.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name.split(" ")[0]}`
                : ""}
            </h1>
          </div>
        )}

        {/* Stats — only on products tab */}
        {tab === null && <DashboardStats insights={insights} />}

        {/* Tab panels */}
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
