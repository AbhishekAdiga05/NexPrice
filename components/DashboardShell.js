import Sidebar from "./Sidebar";

export default function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-60 pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 sm:py-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
