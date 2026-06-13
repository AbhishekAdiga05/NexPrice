export default function Footer() {
  return (
    <footer className="border-t border-gray-100/80 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
            <span className="text-sm font-bold tracking-tight text-foreground">NexPrice</span>
            <span className="text-xs text-muted-foreground/50 hidden sm:inline">&middot;</span>
            <span className="text-xs text-muted-foreground/50 hidden sm:inline">Track prices. Buy smarter.</span>
          </div>
          <p className="text-xs text-muted-foreground/50">
            &copy; 2026 NexPrice
          </p>
        </div>
      </div>
    </footer>
  );
}
