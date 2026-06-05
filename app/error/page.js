import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default async function ErrorPage({ searchParams }) {
  const { message } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center font-sans">
      <div className="text-center px-6 py-20 max-w-md">
        <div className="size-24 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-8 border border-red-200">
          <AlertTriangle className="size-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
          Authentication Error
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sorry, there was an error during authentication. Please try again.
        </p>

        {message && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 mb-1">
              Error details
            </p>
            <p className="text-sm text-red-600 break-words">{message}</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 transition-all"
        >
          <ArrowLeft className="size-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
