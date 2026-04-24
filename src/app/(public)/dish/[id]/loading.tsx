export default function DishLoading() {
  return (
    <div className="mx-auto max-w-[1200px] overflow-hidden px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-3.5 w-10 animate-pulse rounded bg-border" />
        <span className="text-text-muted">/</span>
        <div className="h-3.5 w-14 animate-pulse rounded bg-border" />
        <span className="text-text-muted">/</span>
        <div className="h-3.5 w-28 animate-pulse rounded bg-border" />
      </div>

      {/* Photo grid — mirrors DishPhotoGrid 60/40 two-row layout */}
      <div className="grid h-[240px] grid-cols-[60%_40%] grid-rows-[1fr_1fr] gap-[4px] overflow-hidden rounded-[12px] border border-border sm:h-[320px]">
        <div className="row-span-2 animate-pulse bg-surface-2" />
        <div className="animate-pulse bg-surface-2" />
        <div className="animate-pulse bg-surface-2" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2">
          {/* Badges */}
          <div className="flex gap-3">
            <div className="h-7 w-24 animate-pulse rounded-pill bg-border" />
            <div className="h-7 w-20 animate-pulse rounded-pill bg-border" />
          </div>

          {/* Title */}
          <div className="mt-3 h-9 w-3/4 animate-pulse rounded-lg bg-border" />

          {/* Meta: restaurant, rating, reviews, price */}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-border" />
            <div className="h-4 w-14 animate-pulse rounded bg-border" />
            <div className="h-4 w-20 animate-pulse rounded bg-border" />
            <div className="h-4 w-16 animate-pulse rounded bg-border" />
          </div>

          {/* Description */}
          <div className="mt-4 space-y-2">
            <div className="h-3.5 w-full animate-pulse rounded bg-border" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-border" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-border" />
          </div>

          {/* Tags */}
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded-pill bg-border" style={{ width: `${60 + (i % 3) * 16}px` }} />
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex gap-3">
            <div className="h-12 w-40 animate-pulse rounded-pill bg-border" />
            <div className="h-12 w-12 animate-pulse rounded-pill bg-border" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Rating card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col items-center">
                <div className="h-12 w-16 animate-pulse rounded-lg bg-border" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-border" />
              </div>
              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-3 w-14 animate-pulse rounded bg-border" />
                    <div className="h-2 flex-1 animate-pulse rounded-full bg-border" />
                  </div>
                ))}
              </div>
            </div>

            {/* Restaurant mini-card */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="h-3 w-16 animate-pulse rounded bg-border" />
              <div className="mt-2 h-4 w-40 animate-pulse rounded bg-border" />
              <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-border" />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-12">
        <div className="h-6 w-36 animate-pulse rounded-lg bg-border" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-border" />
                <div>
                  <div className="h-3.5 w-28 animate-pulse rounded bg-border" />
                  <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-border" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-border" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-border" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-border" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
