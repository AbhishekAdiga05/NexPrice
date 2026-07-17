export default function ProductDetailLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-4 w-24 bg-gray-100 rounded-lg" />
      <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 p-4 sm:p-6">
          <div className="w-full md:w-36 aspect-square rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-16 bg-gray-100 rounded" />
            <div className="h-6 w-3/4 bg-gray-100 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
