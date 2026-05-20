export default function RestaurantLoading() {
  return (
    <div>
      {/* Mobile context bar */}
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-xl sm:top-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-6 md:hidden">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-border" />
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="h-3.5 w-20 animate-pulse rounded bg-border" />
          <span className="text-text-muted">/</span>
          <div className="h-3.5 w-32 animate-pulse rounded bg-border" />
        </div>
      </div>

      {/* Cover hero — mirrors page.tsx */}
      <div className="relative min-h-[320px] w-full overflow-hidden bg-surface-2 sm:min-h-[380px]">
        <div className="absolute inset-0 animate-pulse bg-surface-2" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-[1000px] px-4 pb-8 pt-24 sm:px-6 sm:pb-10">
            <div className="mb-3 hidden items-center gap-2 md:flex">
              <div className="h-3.5 w-20 animate-pulse rounded bg-border" />
              <span className="text-text-muted">/</span>
              <div className="h-3.5 w-36 animate-pulse rounded bg-border" />
            </div>
            <div className="h-9 w-2/3 animate-pulse rounded-lg bg-border sm:h-10" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-border" />
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="h-4 w-40 animate-pulse rounded bg-border" />
              <div className="h-4 w-28 animate-pulse rounded bg-border" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-background">
        <div className="mx-auto max-w-[1000px] px-4 py-6 sm:px-6 sm:py-8">
          {/* Cuisine pills */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => {
              const widthClass = ['w-16', 'w-20', 'w-24'][i] ?? 'w-16'
              return (
              <div
                key={i}
                className={`h-6 animate-pulse rounded-pill bg-border ${widthClass}`}
              />
              )
            })}
          </div>

          {/* "Review a dish" CTA button */}
          <div className="mt-5">
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
