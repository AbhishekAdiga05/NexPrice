import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default async function ErrorPage({ searchParams }) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center font-sans">
      <div className="text-center px-6 py-20 max-w-md">
        <div className="size-24 mx-auto rounded-2xl bg-red-500/[0.08] flex items-center justify-center mb-8 border border-red-500/30">
          <AlertTriangle className="size-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
          Authentication Error
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          We encountered an issue during authentication. Please try signing in again.
        </p>

        {message && (
          <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 mb-1">
              Error details
            </p>
            <p className="text-sm text-red-400/80 break-words">{message}</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 shadow-glow-accent hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
