'use client';

export function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col gap-3">
          <div className="aspect-[3/4] rounded-[1rem] bg-[#F6F6F6]" />
          <div className="h-4 w-2/3 rounded bg-[#F6F6F6]" />
          <div className="h-4 w-1/3 rounded bg-[#F6F6F6]" />
        </div>
      ))}
    </div>
  );
}
