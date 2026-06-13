"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";
import AuthButton from "./AuthButton";
import ThemeToggle from "./ThemeToggle";

export default function NavBar({ user }) {
  const [showAuth, setShowAuth] = useState(false);

  if (user) {
    return (
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="size-3 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
            <span className="text-xl font-bold tracking-tight text-foreground">NexPrice</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton user={user} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100/80">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="size-3 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
          <span className="text-xl font-bold tracking-tight text-foreground">NexPrice</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center gap-2 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-[0.97] h-9 px-5 bg-primary text-primary-foreground hover:bg-orange-600"
          >
            Sign Up
          </button>
        </div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </header>
  );
}
