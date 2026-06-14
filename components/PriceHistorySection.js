import PriceHistoryPreview from "./PriceHistoryPreview";

export default function PriceHistorySection() {
  return (
    <section id="price-trend" className="py-16 sm:py-28 px-4 sm:px-8 bg-orange-50/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Price Trend Analysis
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3">
            30-day price history for iPhone 15.
          </p>
        </div>

        <PriceHistoryPreview />
      </div>
    </section>
  );
}