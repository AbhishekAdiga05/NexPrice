import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-orange-500" />
            <span className="text-base font-bold tracking-tight text-gray-900">
              NEXPRICE
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/" className="hover:text-gray-600 transition-colors">Dashboard</Link>
            <span className="text-gray-200">·</span>
            <Link href="/?tab=insights" className="hover:text-gray-600 transition-colors">Insights</Link>
            <span className="text-gray-200">·</span>
            <Link href="/?tab=alerts" className="hover:text-gray-600 transition-colors">Alerts</Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} NexPrice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
