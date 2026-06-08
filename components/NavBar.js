"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthButton from "./AuthButton";
import { LayoutDashboard, Bell, Settings, TrendingUp, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NavBar({ user }) {
  const pathname = usePathname();

  const navLinks = user
    ? [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/insights", label: "Insights", icon: TrendingUp },
        { href: "/watchlist", label: "Watchlist", icon: ListChecks },
        { href: "/alerts", label: "Alerts", icon: Bell },
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    : [];

  return (
    <header className="bg-background/70 backdrop-blur-xl sticky top-0 z-50 border-b border-white/[0.06] shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-2.5 rounded-full bg-emerald-500 shadow-glow-green animate-pulse" />
            <span className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-accent font-bold">NEXPRICE</span>
            </span>
          </Link>

          {navLinks.length > 0 && (
            <nav className="hidden sm:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                    pathname === href
                      ? "text-accent bg-accent/10 shadow-glow-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <AuthButton user={user} />
      </div>
    </header>
  );
}
