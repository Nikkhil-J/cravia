export default function RestaurantLoading() {
  return (
    <div>
      {/* Mobile context bar */}
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-xl sm:top-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-6 md:hidden">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-border" />
        <div className="h-4 w-36 min-w-0 animate-pulse rounded bg-border" />
      </div>

      {/* Cover hero — mirrors page.tsx */}
      <div className="relative min-h-[320px] w-full overflow-hidden bg-surface-2 sm:min-h-[380px]">
        <div className="absolute inset-0 animate-pulse bg-surface-2" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/95 via-surface-dark/45 via-[42%] to-transparent to-[80%]" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-[1000px] px-4 pb-3 pt-24 sm:px-6 sm:pb-10">
            <div className="mb-3 hidden items-center gap-2 md:flex">
              <div className="h-3.5 w-20 animate-pulse rounded bg-white/20" />
              <span className="text-white/40">/</span>
              <div className="h-3.5 w-36 animate-pulse rounded bg-white/20" />
            </div>
            <div className="h-9 w-2/3 animate-pulse rounded-lg bg-white/25 sm:h-10" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-white/20" />
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="h-4 w-40 animate-pulse rounded bg-white/20" />
              <div className="h-4 w-28 animate-pulse rounded bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-background">
        <div className="mx-auto max-w-[1000px] px-4 pb-6 pt-3 sm:px-6 sm:py-8">
          {/* Cuisine pills — reserves the same min-h-6 row as page.tsx */}
          <div className="min-h-6">
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
          </div>

          {/* "Review a dish" CTA — mirrors the mt-5 min-h-10 slot in page.tsx */}
          <div className="mt-5 min-h-10">
            <div className="h-11 w-40 animate-pulse rounded-pill bg-border" />
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

          {/* Recommended carousel — mirrors RecommendedDishesRow (mt-6) */}
          <section className="mt-6">
            <div className="mb-3 h-5 w-44 animate-pulse rounded bg-border" />
            <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[200px] shrink-0 overflow-hidden rounded-2xl border-[0.5px] border-border bg-card"
                >
                  <div className="aspect-[4/3] w-full animate-pulse bg-surface-2" />
                  <div className="p-3">
                    <div className="h-3.5 w-full animate-pulse rounded bg-border" />
                    <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded bg-border" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Menu section — mirrors page.tsx + RestaurantMenu */}
          <div className="mt-8 pb-12 sm:mt-10">
            {/* "Menu (N dishes)" heading */}
            <div className="h-6 w-36 animate-pulse rounded-lg bg-border sm:h-7" />

            <div className="mt-4 sm:mt-6">
              {/* Dietary filter chips row */}
              <div className="mb-4 flex items-center gap-2">
                <div className="h-9 w-20 shrink-0 animate-pulse rounded-pill bg-border" />
                <div className="h-9 w-24 shrink-0 animate-pulse rounded-pill bg-border" />
              </div>

              {/* Search within menu */}
              <div className="mb-4 h-[42px] w-full animate-pulse rounded-pill bg-surface-2" />

              {/* Dish grid — mirrors RestaurantMenu grid + DishCard geometry */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex w-full border-b-[0.5px] border-border-tertiary py-4 md:h-full md:overflow-hidden md:rounded-lg md:border-[0.5px] md:border-border md:bg-card md:p-0 md:py-0 md:shadow-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4 md:h-full md:flex-col-reverse md:gap-0">
                      {/* Text column */}
                      <div className="min-w-0 flex-1 pt-3 md:w-full md:p-4">
                        <div className="h-3.5 w-3.5 animate-pulse rounded-sm bg-border" />
                        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-border" />
                        <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-border" />
                        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-border" />
                        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-border" />
                      </div>
                      {/* Thumbnail — square on mobile, 4/3 banner on md+ */}
                      <div className="relative w-[120px] shrink-0 sm:w-[128px] md:w-full">
                        <div className="aspect-square w-[120px] animate-pulse rounded-lg bg-surface-2 sm:w-[128px] md:aspect-[4/3] md:w-full md:rounded-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* "Claim this restaurant" CTA — mirrors page.tsx (mt-6 mb-8 py-6) */}
          <div className="mt-6 mb-8 flex flex-col items-center gap-3 py-6">
            <div className="h-4 w-40 animate-pulse rounded bg-border" />
            <div className="h-10 w-48 animate-pulse rounded-full bg-border" />
          </div>
        </div>
      </div>
    </div>
  )
}
