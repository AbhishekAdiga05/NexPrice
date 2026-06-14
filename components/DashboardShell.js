"use client";

import { useState, Suspense } from "react";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";

export default function DashboardShell({ user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} onMenuToggle={() => setSidebarOpen(true)} />
      <Suspense fallback={null}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Suspense>
      <main className="lg:pl-60 pt-14 sm:pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
