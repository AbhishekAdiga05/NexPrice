export default function RootLoading() {
  return (
    <main className="min-h-screen bg-background font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="animate-pulse space-y-8">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-gray-100 rounded-xl" />
            <div className="h-4 w-96 bg-gray-100 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-gray-100 border border-gray-100"
                />
              ))}
            </div>

            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-100 rounded-lg" />
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-xl bg-gray-100 border border-gray-100"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
