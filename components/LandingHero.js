"use client";

import LandingCTA from "./LandingCTA";
import HeroVisual from "./HeroVisual";

export default function LandingHero({ onShowAuth }) {
  return (
    <section className="pt-20 sm:pt-32 pb-16 sm:pb-28 px-4 sm:px-8 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-center">
        <div className="max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
          <h1 className="text-[2.2rem] sm:text-[4.2rem] lg:text-[5.2rem] font-bold text-foreground tracking-tight leading-[1.05]">
            Track Prices.
            <br />
            Compare Stores.
            <br />
            Buy at the{" "}
            <span className="text-orange-500">Right Time.</span>
          </h1>
          <p className="text-sm sm:text-lg text-secondary-foreground mt-4 sm:mt-6 leading-relaxed max-w-md mx-auto lg:mx-0">
            Monitor product prices across Amazon, Flipkart, and more. Find the best deal with one click.
          </p>
          <div className="mt-6 sm:mt-10">
            <LandingCTA label="Start Tracking" onShowAuth={onShowAuth} />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}