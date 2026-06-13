import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background font-sans">
      <div className="text-center px-6 py-20 max-w-md">
        <div className="size-24 mx-auto rounded-2xl bg-white border border-gray-200/80 shadow-card flex items-center justify-center mb-8">
          <SearchX className="size-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
          404
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved to a different location.
        </p>
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
