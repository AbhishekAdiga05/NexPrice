"use client";

import { useState, useEffect, useRef } from "react";
import NavBar from "@/components/NavBar";
import AuthModal from "@/components/AuthModal";
import LandingHero from "@/components/LandingHero";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import PriceHistoryPreview from "@/components/PriceHistoryPreview";

function SectionFade({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-2 rounded-full bg-orange-500 shrink-0" />
            <span className="text-sm font-bold tracking-tight text-foreground">NexPrice</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">Track prices. Buy smarter.</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            &copy; 2026 All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingShell() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <NavBar user={null} onShowAuth={() => setShowAuth(true)} />
      <main className="font-sans">
        <SectionFade delay={0}>
          <LandingHero onShowAuth={() => setShowAuth(true)} />
        </SectionFade>
        <SectionFade delay={100}>
          <HowItWorksSection />
        </SectionFade>
        <SectionFade delay={200}>
          <FeaturesSection />
        </SectionFade>
        <SectionFade delay={300}>
          <PriceHistoryPreview />
        </SectionFade>
        <Footer />
      </main>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}