"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  ListChecks,
  Bell,
  Settings,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Products", href: "/", icon: LayoutDashboard },
  { label: "Insights", href: "/?tab=insights", icon: BarChart3 },
  { label: "Watchlist", href: "/?tab=watchlist", icon: ListChecks },
  { label: "Alerts", href: "/?tab=alerts", icon: Bell },
  { label: "Settings", href: "/?tab=settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleClose]);

  const isActive = (href) => {
    if (href === "/") return pathname === "/" && !searchParams.has("tab");
    const [base, query] = href.split("?");
    if (!query) return pathname === base;
    const [key, value] = query.split("=");
    return pathname === base && searchParams.get(key) === value;
  };

  const sidebar = (
    <nav className="flex flex-col h-full py-6">
      <div className="px-6 pb-5 mb-4 border-b border-gray-100">
        <Link href="/" onClick={onClose} className="flex items-center gap-3">
          <div className="size-3 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            NexPrice
          </span>
        </Link>
      </div>

      <div className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              onClick={onClose}
              className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-orange-50 to-orange-50/50 text-orange-600 shadow-sm"
                  : "text-muted-foreground hover:text-secondary-foreground hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`size-[18px] shrink-0 transition-colors duration-200 ${
                  active
                    ? "text-orange-500"
                    : "text-muted-foreground group-hover:text-secondary-foreground"
                }`}
              />
              <span>{label}</span>
              {active && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.4)]" />
              )}
              {!active && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-transparent group-hover:bg-gray-300 dark:group-hover:bg-gray-500 transition-colors" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="px-6 pt-5 mt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 px-1">
          <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]" />
          <span className="text-[11px] text-muted-foreground font-medium">All systems normal</span>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-100 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 shadow-elevated animate-in slide-in-from-left duration-300">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-secondary-foreground hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
