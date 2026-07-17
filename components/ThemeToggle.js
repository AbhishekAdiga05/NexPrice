"use client";

import { Sun, Moon } from "lucide-react";
import { useSyncExternalStore } from "react";

function getServerSnapshot() {
  return false;
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function subscribe(callback) {
  const observer = new MutationObserver(() => callback());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(
    typeof document !== "undefined" ? subscribe : () => () => {},
    typeof document !== "undefined" ? getSnapshot : () => false,
    getServerSnapshot
  );

  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="size-9 rounded-xl border border-gray-200/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
