import { createClient } from "@/utils/supabase/server";
import { getProducts, getInsights } from "./actions";
import AddProductForm from "@/components/AddProductForm";
import ProductCard from "@/components/ProductCard";
import {
  Zap,
  Bell,
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
} from "lucide-react";
import * as motion from "framer-motion/client";
import Link from "next/link";
import LandingCTA from "@/components/LandingCTA";
import Footer from "@/components/Footer";

async function LandingHero() {
  return (
    <section className="relative pt-28 pb-20 px-6 lg:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white shadow-sm rounded-full border border-border/50 mb-8 text-xs font-semibold text-accent">
              <Activity className="size-3" />
              Smart Shopping Assistant
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.05] mb-6">
              Never Miss A{" "}
              <span className="text-accent">Price Drop</span>
              <br />
              Again
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Track prices from any e-commerce site. Get AI-powered predictions,
              Deal Scores, and instant alerts when prices drop to your target.
            </p>

            <div className="flex items-center gap-4 mb-10">
              <LandingCTA variant="primary" />
              <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-accent" /> Free to use
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-accent" /> No CC
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
                  label: "Real-time Price Tracking",
                  desc: "Automated daily price checks",
                  color: "text-indigo-500 bg-indigo-50 border-indigo-200",
                },
                {
                  icon: Bell,
                  label: "Target Price Alerts",
                  desc: "Email notifications on drops",
                  color: "text-emerald-500 bg-emerald-50 border-emerald-200",
                },
                {
                  icon: Sparkles,
                  label: "Deal Score™",
                  desc: "0-100 buy recommendation",
                  color: "text-amber-500 bg-amber-50 border-amber-200",
                },
                {
                  icon: Brain,
                  label: "AI Price Prediction",
                  desc: "Gemini-powered forecasts",
                  color: "text-purple-500 bg-purple-50 border-purple-200",
                },
              ].map((card, i) => (
                <div
                  key={card.label}
                  className={`rounded-xl border p-5 ${card.color} backdrop-blur-sm`}
                >
                  <card.icon className="size-5 mb-3" />
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
      title: "Find Your Product",
      description:
        "Copy the URL of any product from Amazon, Walmart, or major retailers. Paste it into NexPrice to start tracking.",
    },
    {
      number: "02",
      icon: BarChart3,
      title: "We Track It Daily",
      description:
        "Our system checks the price automatically every day. Build a complete price history with charts and trends.",
    },
    {
      number: "03",
      icon: Bell,
      title: "Get Smart Alerts",
      description:
        "Set target prices and get instant email alerts when the price drops. Our Deal Score tells you when to buy.",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-muted/50 border-t border-border/50">
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
            Three simple steps to start saving
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            From URL to savings in minutes. No account setup hassle.
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
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-border/50 h-full relative">
                <span className="text-5xl font-black text-accent/10 absolute top-4 right-6 select-none">
                  {step.number}
                </span>
                <div className="size-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
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
        "Track unlimited products from any e-commerce site. Automatic daily price checks with full history.",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description:
        "Set target prices and get instant email notifications when prices drop. Never miss a deal again.",
    },
    {
      icon: Sparkles,
      title: "Deal Score™",
      description:
        "Proprietary 0-100 algorithm that tells you if it's a good time to buy based on 4 weighted signals.",
    },
    {
      icon: Brain,
      title: "AI Predictions",
      description:
        "Gemini-powered price forecasts showing likely future prices, confidence levels, and timeframes.",
    },
    {
      icon: ListChecks,
      title: "Smart Watchlist",
      description:
        "Prioritized shopping list ranked by urgency, Deal Score, and your own priority settings.",
    },
    {
      icon: Wallet,
      title: "Savings Tracking",
      description:
        "Every triggered alert calculates money saved. See your total savings across all products.",
    },
    {
      icon: TrendingUp,
      title: "Insights Dashboard",
      description:
        "Central hub showing top deals, savings totals, and recent alert activity at a glance.",
    },
    {
      icon: Activity,
      title: "Price History",
      description:
        "Interactive charts with low/high/average markers. Spot trends and make informed decisions.",
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
            Smart features for smarter shopping
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Not just a price tracker — a complete shopping assistant.
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
              className="bg-white rounded-xl border border-border/50 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-200">
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
    <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-accent/5 to-transparent border-t border-border/50">
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
            Ready to make smarter purchases?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Join NexPrice and never overpay again. Free to start, no credit card
            required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <LandingCTA variant="secondary" />
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-green-500" /> Free
                forever
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-green-500" /> No CC
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-green-500" /> Cancel
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
      label: "Products Tracked",
      value: insights.productCount,
      icon: Activity,
      color: "text-accent bg-accent/5 border-accent/20",
    },
    {
      label: "Active Alerts",
      value: insights.activeCount,
      icon: Target,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      label: "Total Savings",
      value: insights.totalSavingsFormatted,
      icon: Wallet,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Triggered",
      value: insights.triggeredCount,
      icon: Bell,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-xl border p-5 ${s.color} flex items-center gap-4`}
        >
          <div className="size-12 rounded-xl bg-white/60 border border-current/20 flex items-center justify-center shrink-0">
            <s.icon className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">{s.value}</div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider opacity-70">
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickActions() {
  const actions = [
    {
      label: "View Insights",
      href: "/insights",
      icon: TrendingUp,
      desc: "Deal scores & savings",
      color: "border-accent/20 text-accent hover:bg-accent/5",
    },
    {
      label: "Manage Alerts",
      href: "/alerts",
      icon: Bell,
      desc: "Active & triggered alerts",
      color: "border-indigo-200 text-indigo-600 hover:bg-indigo-50",
    },
    {
      label: "Watchlist",
      href: "/watchlist",
      icon: ListChecks,
      desc: "Buy priority rankings",
      color: "border-emerald-200 text-emerald-600 hover:bg-emerald-50",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Activity,
      desc: "Email preferences",
      color: "border-slate-200 text-slate-600 hover:bg-slate-50",
    },
  ];

  return (
    <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${action.color} transition-all shrink-0 hover:-translate-y-0.5 hover:shadow-sm`}
        >
          <action.icon className="size-4" />
          <div className="text-left">
            <div className="text-xs font-bold">{action.label}</div>
            <div className="text-[10px] opacity-70">{action.desc}</div>
          </div>
        </Link>
      ))}
    </div>
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
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {/* Welcome */}
        <div className="mb-10 pb-6 border-b-2 border-border/40">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
              Welcome back
              {user?.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name.split(" ")[0]}`
                : ""}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your tracked products.
          </p>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <QuickActions />

        {/* Add Product */}
        <div className="mb-10 bg-white rounded-2xl border border-border/50 shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Zap className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">
                Add New Product
              </h2>
              <p className="text-xs text-muted-foreground">
                Paste a product URL to start tracking its price
              </p>
            </div>
          </div>
          <AddProductForm user={user} />
        </div>

        {/* Products Grid */}
        {products.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-border/40">
              <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-3">
                <Activity className="size-5 text-accent" />
                Your Tracked Products
              </h2>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-full ml-auto">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            </div>

            <motion.div layout className="grid gap-6 md:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </section>
        )}

        {/* Empty state for dashboard with no products yet */}
        {products.length === 0 && (
          <div className="text-center py-20 rounded-2xl border border-dashed border-border/50 bg-muted/30">
            <div className="size-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-6">
              <Search className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No products yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Add your first product URL above to start tracking prices,
              receiving alerts, and discovering great deals.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
