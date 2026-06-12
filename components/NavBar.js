"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";

export default function NavBar({ user }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="size-2 rounded-full bg-orange-500 shrink-0" />
            <span className="text-base font-bold tracking-tight text-gray-900">
              NEXPRICE
            </span>
          </Link>
        </div>
        <AuthButton user={user} />
      </div>
    </header>
  );
}
