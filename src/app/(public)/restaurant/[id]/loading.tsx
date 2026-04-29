export default function RestaurantLoading() {
  return (
    <div className="animate-fade-in">
      {/* Hero image area */}
      <div className="h-56 w-full animate-pulse bg-surface-2 sm:h-64" />

      {/* Info section with overlap */}
      <div className="relative -mt-8 rounded-t-xl bg-surface">
        <div className="mx-auto max-w-[1000px] px-6 pt-8">
          {/* Restaurant name */}
          <div className="h-8 w-72 animate-pulse rounded-lg bg-border" />
          {/* Cuisines text */}
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-border" />

          {/* Location */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-border" />
            <div className="h-4 w-40 animate-pulse rounded bg-border" />
          </div>

          {/* Links */}
          <div className="mt-3 flex gap-4">
            <div className="h-4 w-36 animate-pulse rounded bg-border" />
            <div className="h-4 w-24 animate-pulse rounded bg-border" />
          </div>

          {/* Cuisine tag pills */}
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-7 animate-pulse rounded-pill bg-border" style={{ width: `${70 + (i % 3) * 20}px` }} />
            ))}
          </div>

          {/* CTA button */}
          <div className="mt-6">
            <div className="h-11 w-40 animate-pulse rounded-pill bg-border" />
          </div>

          {/* Stats row */}
          <div className="mt-8 flex overflow-hidden rounded-lg bg-surface-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex-1 py-4 text-center">
                <div className="mx-auto h-6 w-10 animate-pulse rounded bg-border" />
                <div className="mx-auto mt-2 h-3 w-24 animate-pulse rounded bg-border" />
              </div>
            ))}
          </div>

          {/* Dishes section */}
          <div className="mt-10 pb-12">
            <div className="h-6 w-36 animate-pulse rounded-lg bg-border" />
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="h-36 w-full animate-pulse bg-surface-3" />
                  <div className="p-3.5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
                    <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-border" />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="h-3 w-16 animate-pulse rounded bg-border" />
                      <div className="h-3.5 w-12 animate-pulse rounded bg-border" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
