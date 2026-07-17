import { Activity, Store, LineChart, TrendingDown } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    { icon: Activity, title: "Price Tracking", desc: "Auto-track prices across stores." },
    { icon: Store, title: "Multi-Store Comparison", desc: "Compare prices across Amazon, Flipkart, Croma, and more." },
    { icon: LineChart, title: "Price History", desc: "View trends before you buy." },
    { icon: TrendingDown, title: "Best Deal Finder", desc: "We find and highlight the cheapest option for you." },
  ];

  const iconColors = [
    "from-orange-400 to-amber-500",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-purple-500",
  ];

  return (
    <section id="features" className="py-16 sm:py-28 px-4 sm:px-8 bg-white dark:bg-[#18181b]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Key Features
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3">
            Simple tools for smarter shopping.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100/80 dark:border-zinc-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 p-5 sm:p-8 text-center"
            >
              <div className="flex items-center justify-center mb-3 sm:mb-5">
                <div className={`size-10 sm:size-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${iconColors[i]} flex items-center justify-center shadow-sm sm:shadow-md`}>
                  <feature.icon className="size-5 sm:size-7 text-white" />
                </div>
              </div>
              <h3 className="text-xs sm:text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 sm:mt-2 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}