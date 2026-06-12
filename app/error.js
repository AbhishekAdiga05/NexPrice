"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center font-sans">
      <div className="text-center px-6 py-20 max-w-md">
        <div className="size-24 mx-auto rounded-2xl bg-red-500/[0.08] flex items-center justify-center mb-8 border border-red-500/30">
          <AlertTriangle className="size-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          An unexpected error occurred. This is usually temporary — try again.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 shadow-glow-accent hover:shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-white/[0.08] text-foreground font-bold text-sm hover:bg-white/[0.04] transition-all"
          >
            <ArrowLeft className="size-4" />
            Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 bg-red-500/[0.06] border border-red-500/20 rounded-xl p-4 text-left">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 mb-1">
              Dev error
            </p>
            <p className="text-sm text-red-400/80 break-words font-mono">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
