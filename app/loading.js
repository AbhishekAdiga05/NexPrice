export default function RootLoading() {
  return (
    <main className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="animate-pulse space-y-8">
          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-64 bg-muted rounded-lg" />
            <div className="h-4 w-96 bg-muted rounded-lg" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-muted border border-white/[0.06]"
                />
              ))}
            </div>

            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-48 bg-muted rounded-lg" />
              <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-xl bg-muted border border-white/[0.06]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
