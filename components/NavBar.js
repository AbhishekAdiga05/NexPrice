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
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b-2 border-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
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
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
