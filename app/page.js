import { createClient } from "@/utils/supabase/server";
import { getProducts } from "./actions";
import AddProductForm from "@/components/AddProductForm";
import ProductCard from "@/components/ProductCard";
import { Shield, Bell, Zap, Power, Activity } from "lucide-react";
import * as motion from "framer-motion/client";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products = user ? await getProducts() : [];

  const FEATURES = [
    {
      icon: Zap,
      title: "LIGHTNING FAST",
      description:
        "Extracts prices in seconds, handling dynamic content perfectly.",
    },
    {
      icon: Shield,
      title: "ALWAYS RELIABLE",
      description:
        "Works across all major e-commerce sites securely.",
    },
    {
      icon: Bell,
      title: "SMART ALERTS",
      description: "Get notified instantly when prices drop below your target.",
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: Typography & Copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white shadow-sm rounded-full border mb-8 text-xs font-semibold text-accent">
              <Activity className="size-3" />
            </div>

            {user ? (
              <>
                <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
                  Your Tracking <br className="hidden lg:block"/>
                  <span className="text-accent">Dashboard</span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                  Manage your active price alerts, view detailed history charts, and add new e-commerce links to your tracking module.
                </p>

                <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-accent" /> Active Sync
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-accent" /> Real-time Alerts
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
                  Never Miss A <br className="hidden lg:block"/>
                  <span className="text-accent">Price Drop</span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                  Track prices from any e-commerce site. Get instant alerts when prices drop. Save money effortlessly with our automated tracker.
                </p>

                <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-accent" /> Quick Setup
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-accent" /> Unlimited Products
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Right: Conditional Rendering Based on Auth */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            <div className="relative mx-auto w-full max-w-2xl">
              {user ? (
                <div className="relative rounded-2xl bg-white/50 backdrop-blur-md p-8 shadow-xl border border-white transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent">
                      <Power className="size-5" />
                    </div>
                    <h2 className="font-semibold text-xl text-foreground">Add New Product</h2>
                  </div>

                  <AddProductForm user={user} />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-border/50 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl shrink-0">
                      <Activity className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">1. Find Your Product</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">Ensure you capture the exact URL of the product you want to track from Amazon, Walmart, or any major retailer.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-border/50 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="p-3 bg-purple-50 text-purple-500 rounded-xl shrink-0">
                      <Zap className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">2. Paste The Link</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">Sign in and paste the link into the tracking module. Our system instantly syncs the current price data.</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-md border border-border/50 flex items-start gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="p-3 bg-green-50 text-green-500 rounded-xl shrink-0">
                      <Bell className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">3. Get Alerted</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">We monitor the price daily. When it drops, you&apos;ll be the first to know via an automated email alert.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Module Array */}
      {products.length === 0 && (
        <section className="py-24 px-6 lg:px-12 bg-background/50 border-t border-white shadow-[inset_0_1px_4px_rgba(0,0,0,0.05)]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {FEATURES.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 group hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                >
                  {/* Icon Housing */}
                  <div className="flex size-14 items-center justify-center rounded-xl bg-accent/10 mb-6 text-accent">
                    <Icon className="size-6" />
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Active Workloads (Products Grid) */}
      {user && products.length > 0 && (
        <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-10 pb-4 border-b-2 border-border/40">
            <h3 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
              <Activity className="size-6 text-accent" />
              Your Tracked Products
            </h3>
            <div className="text-sm px-3 py-1 bg-white shadow-sm rounded-full font-medium text-muted-foreground ml-auto">
              PRODUCTS: {products.length < 10 ? `0${products.length}` : products.length}
            </div>
          </div>

          <motion.div 
            layout
            className="grid gap-8 md:grid-cols-2"
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </section>
      )}

    </main>
  );
}
