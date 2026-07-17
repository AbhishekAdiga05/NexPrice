import { Link2, Store, TrendingDown } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Link2,
      title: "Add Product",
      desc: "Paste any product URL to start tracking.",
    },
    {
      icon: Store,
      title: "Compare Store Prices",
      desc: "See prices across Amazon, Flipkart, and more.",
    },
    {
      icon: TrendingDown,
      title: "Find Best Deal",
      desc: "We highlight the cheapest store for you.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-28 px-4 sm:px-8 bg-orange-50/40 dark:bg-[#18181b]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            How It Works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3">Three simple steps.</p>
        </div>

        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 sm:gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100/80 dark:border-zinc-700 shadow-sm p-6 sm:p-10 text-center group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-5 sm:mb-6">
                <div className="relative size-14 sm:size-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-[0_4px_16px_rgba(249,115,22,0.25)]">
                  <step.icon className="size-6 sm:size-7 text-white" />
                  <span className="absolute -top-1 -right-1 size-5 sm:size-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-orange-500 flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-orange-500 shadow-sm">
                    {i + 1}
                  </span>
                </div>
              </div>
              <h3 className="text-sm sm:text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}