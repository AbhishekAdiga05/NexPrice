export default function Footer() {
  return (
    <footer className="border-t border-gray-100/80">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="size-3 rounded-full bg-orange-500 shrink-0 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]" />
            <span className="text-base font-bold tracking-tight text-gray-900">
              NexPrice
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Track Prices. Buy Smarter.
          </p>
          <p className="text-xs text-gray-300">
            &copy; {new Date().getFullYear()} NexPrice
          </p>
        </div>
      </div>
    </footer>
  );
}
