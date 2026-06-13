"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background font-sans">
      <div className="text-center px-6 py-20 max-w-md">
        <div className="size-24 mx-auto rounded-2xl bg-red-50 border border-red-200/60 flex items-center justify-center mb-8">
          <AlertTriangle className="size-10 text-red-500" />
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
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-orange-600 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl border border-gray-200/80 text-foreground font-semibold text-sm hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="size-4" />
            Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 bg-red-50 border border-red-200/60 rounded-xl p-4 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
              Dev error
            </p>
            <p className="text-sm text-red-600/80 break-words">
              {error.message}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
