"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";

export default function NavBar({ user }) {
  if (user) {
    return (
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="size-3 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
            <span className="text-lg font-bold tracking-tight text-gray-900">
              NexPrice
            </span>
          </Link>
          <AuthButton user={user} />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100/80">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="size-3 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
          <span className="text-xl font-bold tracking-tight text-gray-900">
            NexPrice
          </span>
        </Link>
        <AuthButton user={null} />
      </div>
    </header>
  );
}
