"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  BarChart3,
  ListChecks,
  Bell,
  Settings,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Products", href: "/", icon: Package },
  { label: "Insights", href: "/?tab=insights", icon: BarChart3 },
  { label: "Watchlist", href: "/?tab=watchlist", icon: ListChecks },
  { label: "Alerts", href: "/?tab=alerts", icon: Bell },
  { label: "Settings", href: "/?tab=settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const isActive = (href) => {
    if (href === "/") return pathname === "/" && !pathname.includes("?tab=");
    return pathname.startsWith(href.split("?")[0]) && pathname.includes(href.split("?")[1] || "");
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
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-orange-50 text-orange-600 shadow-sm"
                  : "text-muted-foreground hover:text-secondary-foreground hover:bg-gray-50"
              }`}
            >
              <Icon className={`size-[18px] shrink-0 transition-colors duration-200 ${
                active ? "text-orange-500" : "text-muted-foreground group-hover:text-secondary-foreground"
              }`} />
              <span>{label}</span>
              {active && (
                <span className="ml-auto size-1.5 rounded-full bg-orange-500" />
              )}
            </Link>
          );
        })}
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
