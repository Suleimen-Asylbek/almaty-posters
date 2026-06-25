export default function HomeLoading() {
  const skeletonCards = Array.from({ length: 4 }, (_, index) => index);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="relative h-screen bg-gradient-to-b from-[#F6F6F6] to-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center">
          <div className="flex-1">
            <div className="h-16 w-3/4 bg-[#E5E5E5] rounded-lg animate-pulse mb-6" />
            <div className="h-6 w-1/2 bg-[#F6F6F6] rounded-lg animate-pulse mb-8" />
            <div className="h-12 w-40 bg-[#E5E5E5] rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Popular Posters skeleton */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="h-3 w-28 bg-[#E5E5E5] rounded-full animate-pulse mb-3" />
            <div className="h-11 w-48 bg-[#E5E5E5] rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {skeletonCards.map((card) => (
              <div key={card}>
                <div className="aspect-[3/4] bg-[#F6F6F6] rounded-xl animate-pulse" />
                <div className="mt-3 h-4 w-3/4 bg-[#F6F6F6] rounded-full animate-pulse" />
                <div className="mt-2 h-4 w-1/2 bg-[#F6F6F6] rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Arrivals skeleton */}
      <div className="py-24 bg-[#F6F6F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="h-3 w-32 bg-white rounded-full animate-pulse mb-3" />
            <div className="h-11 w-40 bg-white rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {skeletonCards.map((card) => (
              <div key={card}>
                <div className="aspect-[3/4] bg-white rounded-xl animate-pulse" />
                <div className="mt-3 h-4 w-3/4 bg-white rounded-full animate-pulse" />
                <div className="mt-2 h-4 w-1/2 bg-white rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
