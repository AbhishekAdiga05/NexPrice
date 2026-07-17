import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default async function ErrorPage({ searchParams }) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background font-sans">
      <div className="text-center px-6 py-20 max-w-md">
        <div className="size-24 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-8 border border-red-200/60">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
          Authentication Error
        </h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          We encountered an issue during authentication. Please try signing in again.
        </p>

        {message && (
          <div className="bg-red-50 border border-red-200/60 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
              Error details
            </p>
            <p className="text-sm text-red-600/80 break-words">{message}</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-orange-600 shadow-sm hover:shadow-md transition-all"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
