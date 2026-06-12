import Sidebar from "./Sidebar";

export default function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="lg:pl-56">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
