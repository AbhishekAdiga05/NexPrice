import { createClient } from "@/utils/supabase/server";
import { getProducts, getInsights } from "./actions";
import AddProductForm from "@/components/AddProductForm";
import ProductCard from "@/components/ProductCard";
import {
  Zap,
  Bell,
  BellRing,
  TrendingUp,
  Sparkles,
  ListChecks,
  Wallet,
  BarChart3,
  ArrowRight,
  Activity,
  Search,
  Target,
  Brain,
  Settings,
} from "lucide-react";
import * as motion from "framer-motion/client";
import Link from "next/link";
import LandingCTA from "@/components/LandingCTA";
import Footer from "@/components/Footer";

async function LandingHero() {
  return (
    <section className="relative pt-28 pb-20 px-6 lg:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-background pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/[0.02] blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-card shadow-sm rounded-full border border-white/[0.08] mb-8 text-xs font-semibold text-accent">
              <Activity className="size-3" />
              Intelligent Price Intelligence
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.05] mb-6">
              Never Miss A{" "}
              <span className="text-accent">Price Drop</span>
              <br />
              Again
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              AI-powered price tracking that predicts, analyzes, and alerts you
              when the perfect buying moment arrives. Shop smarter, save more.
            </p>

            <div className="flex items-center gap-4 mb-10">
              <LandingCTA variant="primary" />
              <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-accent shadow-glow-accent" /> Free to use
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-accent shadow-glow-accent" /> No CC
                  required
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  label: "Real-time Tracking",
                  desc: "Automated daily price monitoring across all major retailers",
                  bg: "bg-accent/[0.04] border-white/[0.06] text-accent",
                  iconColor: "text-accent",
                },
                {
                  icon: Bell,
                  label: "Smart Alerts",
                  desc: "Instant email notifications the moment your target hits",
                  bg: "bg-emerald-500/[0.04] border-white/[0.06] text-emerald-400",
                  iconColor: "text-emerald-400",
                },
                {
                  icon: Sparkles,
                  label: "Deal Score™",
                  desc: "Proprietary 0-100 buy recommendation engine",
                  bg: "bg-amber-500/[0.04] border-white/[0.06] text-amber-400",
                  iconColor: "text-amber-400",
                },
                {
                  icon: Brain,
                  label: "AI Predictions",
                  desc: "Gemini-powered forecasts with confidence analysis",
                  bg: "bg-purple-500/[0.04] border-white/[0.06] text-purple-400",
                  iconColor: "text-purple-400",
                },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className={`rounded-xl border ${card.bg} p-5 hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <card.icon className={`size-5 mb-3 ${card.iconColor}`} />
                  <h3 className="text-sm font-bold text-foreground mb-1">
                    {card.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: Search,
      title: "Add Any Product",
      description:
        "Paste any product URL from Amazon, Walmart, or thousands of retailers. NexPrice instantly begins capturing pricing data.",
    },
    {
      number: "02",
      icon: BarChart3,
      title: "We Track Relentlessly",
      description:
        "Our system monitors prices daily, building a comprehensive history with interactive charts. Every fluctuation is recorded.",
    },
    {
      number: "03",
      icon: Bell,
      title: "Strike at the Right Moment",
      description:
        "Set your target price and let our Deal Score algorithm guide you. Get instant alerts when the timing is perfect.",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-muted/50 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent mb-4 block">
            How It Works
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Start saving in three simple moves
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            From product URL to real savings — no account setup, no credit card, no hassle.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.4 }}
              className="relative"
            >
              <div className="bg-card rounded-2xl p-8 shadow-card border border-white/[0.06] h-full relative hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300">
                <span className="text-5xl font-black text-accent/[0.06] absolute top-4 right-6 select-none">
                  {step.number}
                </span>
                <div className="size-14 rounded-xl bg-accent/[0.08] flex items-center justify-center mb-6">
                  <step.icon className="size-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Price Tracking",
      description:
        "Monitor unlimited products across any e-commerce site with automatic daily price snapshots and full historical records.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Set your ideal price and receive instant email notifications the moment it hits. Precision timing, zero effort.",
    },
    {
      icon: Sparkles,
      title: "Deal Score™",
      description:
        "Proprietary 0-100 algorithm analyzing four weighted signals to tell you exactly when to pull the trigger.",
    },
    {
      icon: Brain,
      title: "AI Predictions",
      description:
        "Gemini-powered forecasts that predict future prices with confidence levels and estimated timeframes.",
    },
    {
      icon: ListChecks,
      title: "Smart Watchlist",
      description:
        "A prioritized shopping list ranked by buying urgency, Deal Score, and your personal preferences.",
    },
    {
      icon: Wallet,
      title: "Savings Tracking",
      description:
        "Every triggered alert automatically calculates your savings. Watch your total grow across all products.",
    },
    {
      icon: TrendingUp,
      title: "Insights Dashboard",
      description:
        "Your command center showing top deals, total savings, and real-time alert activity at a glance.",
    },
    {
      icon: Activity,
      title: "Price History",
      description:
        "Interactive charts with low, high, and average markers. Spot patterns and make data-driven decisions.",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent mb-4 block">
            Everything You Need
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            A complete arsenal for smarter shopping
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            More than a price tracker — your intelligent shopping co-pilot.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="bg-card rounded-xl border border-white/[0.06] p-6 hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="size-10 rounded-lg bg-accent/[0.08] flex items-center justify-center mb-4 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <feature.icon className="size-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-accent/[0.03] to-transparent border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent mb-4 block">
            Start Saving Today
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-4">
            Ready to shop with unfair advantage?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Join thousands of savvy shoppers who never overpay. Free to start, no credit card required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <LandingCTA variant="secondary" />
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500 shadow-glow-green" /> Free
                forever
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500 shadow-glow-green" /> No CC
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500 shadow-glow-green" /> Cancel
                anytime
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

async function DashboardStats() {
  const insights = await getInsights();

  if (!insights) return null;

  const stats = [
    {
      label: "Tracked",
      value: insights.productCount,
      icon: Activity,
      accent: "accent",
      trend: `${insights.productCount} products`,
    },
    {
      label: "Alerts",
      value: insights.activeCount,
      icon: Target,
      accent: "indigo",
      trend: `${insights.totalAlerts} total`,
    },
    {
      label: "Savings",
      value: insights.totalSavingsFormatted,
      icon: Wallet,
      accent: "emerald",
      trend: `${insights.triggeredCount} captured`,
    },
    {
      label: "Triggered",
      value: insights.triggeredCount,
      icon: Bell,
      accent: "emerald",
      trend: "alerts hit",
    },
  ];

  const accentMap = {
    accent: { bg: "bg-accent/[0.08]", border: "border-accent/20", text: "text-accent", dot: "bg-accent" },
    indigo: { bg: "bg-indigo-500/[0.08]", border: "border-indigo-500/20", text: "text-indigo-400", dot: "bg-indigo-400" },
    emerald: { bg: "bg-emerald-500/[0.08]", border: "border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 mb-6 md:mb-8">
      {stats.map((s) => {
        const a = accentMap[s.accent];
        return (
          <div
            key={s.label}
            className="relative bg-card rounded-xl border border-white/[0.06] shadow-soft hover:shadow-elevated transition-all duration-300 p-3 md:p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`size-7 md:size-8 rounded-lg border ${a.border} ${a.bg} flex items-center justify-center`}>
                <s.icon className={`size-3.5 md:size-4 ${a.text}`} />
              </div>
              <span className={`size-1.5 rounded-full ${a.dot} opacity-30`} />
            </div>
            <div className="text-lg md:text-xl font-bold font-mono tracking-tight text-foreground leading-none">
              {s.value}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] md:text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground leading-none">
                {s.label}
              </span>
              <span className="text-[9px] md:text-[10px] text-muted-foreground/50 font-mono leading-none">
                {s.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuickNav() {
  const links = [
    { label: "Insights", href: "/insights", icon: TrendingUp },
    { label: "Alerts", href: "/alerts", icon: BellRing },
    { label: "Watchlist", href: "/watchlist", icon: ListChecks },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="flex items-center gap-1.5 md:gap-2 mb-6 md:mb-8 overflow-x-auto scrollbar-thin pb-0.5">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/[0.06] bg-card/30 hover:bg-card hover:border-white/10 transition-all duration-200 shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <link.icon className="size-3" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = user ? await getProducts() : [];

  if (!user) {
    return (
      <main className="min-h-screen font-sans">
        <LandingHero />
        <HowItWorksSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 md:py-10">
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
              Welcome back
              {user?.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name.split(" ")[0]}`
                : ""}
            </h1>
            <p className="text-sm text-muted-foreground/70 leading-snug mt-0.5">
              Here&apos;s what&apos;s happening with your products
            </p>
          </div>
          <QuickNav />
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Add Product + Products Grid — side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-5 mb-6 md:mb-8">
          <section className="w-full lg:w-[400px] xl:w-[440px] shrink-0 bg-card rounded-xl border border-white/[0.06] shadow-soft p-4 md:p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-accent/[0.08] rounded-lg text-accent">
                <Zap className="size-3.5 md:size-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight leading-snug">
                  Track a New Product
                </h2>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-snug">
                  Paste a URL to monitor prices and deals
                </p>
              </div>
            </div>
            <AddProductForm user={user} />
          </section>

          {products.length > 0 && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
                  <Activity className="size-3.5 md:size-4 text-accent" />
                  Your Products
                </h2>
                <span className="text-[10px] font-mono font-semibold text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-md leading-none">
                  {products.length}
                </span>
              </div>
              <div className="section-divider mb-3" />
              <motion.div layout className="grid gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* Empty state — standalone when no products */}
        {products.length === 0 && (
          <div className="text-center py-12 md:py-16 rounded-xl border border-dashed border-white/[0.06] bg-muted/20">
            <div className="size-14 md:size-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4 border border-white/[0.04]">
              <Search className="size-5 md:size-6 text-muted-foreground/60" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1 leading-snug">
              No products tracked yet
            </h3>
            <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto px-4 leading-relaxed">
              Paste a product URL above to start monitoring prices and deal insights.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
