"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  BarChart3,
  ListChecks,
  Bell,
  Settings,
  X,
  Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Products", href: "/", icon: Package },
  { label: "Insights", href: "/?tab=insights", icon: BarChart3 },
  { label: "Watchlist", href: "/?tab=watchlist", icon: ListChecks },
  { label: "Alerts", href: "/?tab=alerts", icon: Bell },
  { label: "Settings", href: "/?tab=settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/") return pathname === "/" && !pathname.includes("?tab=");
    return pathname.startsWith(href.split("?")[0]) && pathname.includes(href.split("?")[1] || "");
  };

  const sidebar = (
    <nav className="flex flex-col h-full py-4">
      <div className="px-4 pb-4 mb-2 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-orange-500 shrink-0" />
          <span className="text-base font-bold tracking-tight text-gray-900">
            NEXPRICE
          </span>
        </Link>
      </div>

      <div className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 size-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 bg-white">
        {sidebar}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-xl animate-in slide-in-from-left">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 size-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600"
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
