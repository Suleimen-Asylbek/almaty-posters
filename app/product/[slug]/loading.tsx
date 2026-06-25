export default function ProductLoading() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image skeleton */}
          <div className="aspect-[3/4] bg-[#F6F6F6] rounded-xl animate-pulse" />

          {/* Info skeleton */}
          <div>
            <div className="mb-4 h-4 w-24 bg-[#F6F6F6] rounded-full animate-pulse" />
            <div className="mb-6 h-10 w-3/4 bg-[#E5E5E5] rounded-lg animate-pulse" />
            <div className="mb-8 h-6 w-48 bg-[#E5E5E5] rounded-lg animate-pulse" />

            {/* Description skeleton */}
            <div className="mb-8 space-y-3">
              <div className="h-4 w-full bg-[#F6F6F6] rounded animate-pulse" />
              <div className="h-4 w-full bg-[#F6F6F6] rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-[#F6F6F6] rounded animate-pulse" />
            </div>

            {/* Sizes skeleton */}
            <div className="mb-8">
              <div className="mb-4 h-5 w-32 bg-[#E5E5E5] rounded-lg animate-pulse" />
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-11 w-24 bg-[#F6F6F6] rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Button skeleton */}
            <div className="h-12 w-full bg-[#E5E5E5] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
