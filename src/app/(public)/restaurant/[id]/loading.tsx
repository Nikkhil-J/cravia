export default function RestaurantLoading() {
  return (
    <div>
      {/* Cover hero — mirrors h-56 sm:h-64 in page.tsx */}
      <div className="relative h-56 w-full animate-pulse bg-surface-2 sm:h-64">
        {/* Floating back button */}
        <div className="absolute left-3 top-3 h-11 w-11 rounded-full bg-black/30 md:hidden" />
      </div>

      {/* Info card — mirrors -mt-8 rounded-t-xl overlap */}
      <div className="relative -mt-8 rounded-t-xl border-t border-border bg-card">
        <div className="mx-auto max-w-[1000px] px-4 pt-6 sm:px-6 sm:pt-8">

          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-1.5 sm:gap-2">
            <div className="h-3.5 w-20 animate-pulse rounded bg-border" />
            <span className="text-text-muted">/</span>
            <div className="h-3.5 w-36 animate-pulse rounded bg-border" />
          </div>

          {/* Restaurant name */}
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-border sm:h-9" />

          {/* Cuisines text */}
          <div className="mt-1 h-4 w-1/3 animate-pulse rounded bg-border" />

          {/* Meta: location */}
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-4 w-4 animate-pulse rounded bg-border" />
            <div className="h-4 w-40 animate-pulse rounded bg-border" />
          </div>

          {/* Links row: Maps / Phone / Website */}
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="h-4 w-28 animate-pulse rounded bg-border" />
            <div className="h-4 w-20 animate-pulse rounded bg-border" />
          </div>

          {/* Cuisine pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-6 animate-pulse rounded-pill bg-border"
                style={{ width: `${64 + i * 20}px` }}
              />
            ))}
          </div>

          {/* "Review a dish" CTA button */}
          <div className="mt-6">
            <div className="h-10 w-40 animate-pulse rounded-pill bg-border" />
          </div>

          {/* Stats bar — mirrors flex gap-0 2-cell rounded-lg */}
          <div className="mt-8 flex overflow-hidden rounded-lg border border-border">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-1 flex-col items-center py-4">
                <div className="h-6 w-8 animate-pulse rounded bg-border" />
                <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-border" />
              </div>
            ))}
          </div>

          {/* Menu section */}
          <div className="mt-8 pb-12 sm:mt-10">
            {/* "Menu (N dishes)" heading */}
            <div className="h-6 w-36 animate-pulse rounded-lg bg-border sm:h-7" />

            {/* Dish list rows — mirrors RestaurantMenu card style */}
            <div className="mt-4 space-y-3 sm:mt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-card p-3"
                >
                  {/* Dish thumbnail */}
                  <div className="h-16 w-16 shrink-0 animate-pulse rounded-md bg-surface-2" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-border" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-border" />
                    <div className="h-3 w-16 animate-pulse rounded bg-border" />
                  </div>
                  {/* Rating badge */}
                  <div className="h-6 w-10 animate-pulse rounded bg-border" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
