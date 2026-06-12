export default function ProductDetailLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="w-full md:w-36 aspect-square rounded bg-gray-100" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-6 w-3/4 bg-gray-100 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
