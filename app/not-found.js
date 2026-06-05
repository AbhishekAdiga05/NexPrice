import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center font-sans">
      <div className="text-center px-6 py-20 max-w-md">
        <div className="size-24 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-8">
          <SearchX className="size-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
          404
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Page not found
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
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
