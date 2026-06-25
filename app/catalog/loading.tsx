const skeletonCards = Array.from({ length: 8 }, (_, index) => index);

export default function CatalogLoading() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="border-b border-[#E5E5E5] bg-[#F6F6F6]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="h-3 w-28 animate-pulse rounded-full bg-[#E5E5E5]" />
          <div className="mt-5 h-11 w-48 animate-pulse rounded-lg bg-[#E5E5E5]" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row">
          <div className="h-11 w-full max-w-sm animate-pulse rounded-full bg-[#F6F6F6]" />
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-10 w-24 animate-pulse rounded-full bg-[#F6F6F6]"
              />
            ))}
          </div>
        </div>

        <div className="mb-6 h-4 w-28 animate-pulse rounded-full bg-[#F6F6F6]" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {skeletonCards.map((card) => (
            <div key={card}>
              <div className="aspect-[3/4] animate-pulse rounded-xl bg-[#F6F6F6]" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded-full bg-[#F6F6F6]" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-[#F6F6F6]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
