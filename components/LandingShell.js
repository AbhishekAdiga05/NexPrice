"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import AuthModal from "@/components/AuthModal";
import LandingHero from "@/components/LandingHero";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import PriceHistorySection from "@/components/PriceHistorySection";
import Footer from "@/components/Footer";
import SectionFade from "@/components/SectionFade";

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
          <PriceHistorySection />
        </SectionFade>
        <Footer />
      </main>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}