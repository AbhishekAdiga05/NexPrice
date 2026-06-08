import Link from "next/link";
import {
  Activity,
  Bell,
  TrendingUp,
  Sparkles,
  ListChecks,
  Wallet,
  Settings,
} from "lucide-react";

const footerFeatures = [
  { label: "Price Tracking", icon: Activity, href: "/" },
  { label: "Smart Alerts", icon: Bell, href: "/alerts" },
  { label: "Deal Score", icon: Sparkles, href: "/insights" },
  { label: "Price Prediction", icon: TrendingUp, href: "/insights" },
  { label: "Watchlist", icon: ListChecks, href: "/watchlist" },
  { label: "Savings Tracker", icon: Wallet, href: "/insights" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-card mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <div className="size-2.5 rounded-full bg-emerald-500 shadow-glow-green" />
              <span className="text-xl font-bold tracking-tight">
                <span className="text-accent">NEXPRICE</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              AI-powered price tracking platform that predicts, analyzes, and alerts you to the perfect buying moment. Never overpay again.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Dashboard", href: "/" },
                { label: "Insights", href: "/insights" },
                { label: "Watchlist", href: "/watchlist" },
                { label: "Alerts", href: "/alerts" },
                { label: "Settings", href: "/settings" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground font-mono mb-4">
              Features
            </h3>
            <ul className="space-y-3">
              {footerFeatures.map((f) => (
                <li key={f.label}>
                  <Link
                    href={f.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2"
                  >
                    <f.icon className="size-3" />
                    {f.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NexPrice. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Precision price intelligence — powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
}
