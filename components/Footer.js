export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-2 rounded-full bg-orange-500 shrink-0" />
            <span className="text-sm font-bold tracking-tight text-foreground">NexPrice</span>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">Track prices. Buy smarter.</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            &copy; 2026 All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
