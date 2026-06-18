"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { AuthButton } from "./AuthModal";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";

export default function NavBar({ user, onMenuToggle, onShowAuth }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = `sticky top-0 z-30 transition-all duration-300 ${
    scrolled
      ? "bg-white/95 dark:bg-[#0a0a0b]/95 backdrop-blur-xl shadow-sm border-b border-gray-100/80"
      : "bg-white/80 dark:bg-[#0a0a0b]/80 backdrop-blur-lg border-b border-gray-100/80"
  }`;

  if (user) {
    return (
      <header className={headerClass}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuToggle}
              className="lg:hidden size-9 rounded-xl border border-gray-200/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Open menu"
            >
              <Menu className="size-[18px]" />
            </button>
            <Link href="/" className="flex items-center gap-3 shrink-0">
              <div className="size-3 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
              <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">NexPrice</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={headerClass}>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="size-3 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">NexPrice</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onShowAuth}
            className="inline-flex items-center gap-2 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.97] h-9 px-5 bg-primary text-primary-foreground hover:bg-orange-600"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
