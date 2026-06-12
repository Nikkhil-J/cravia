import { ReviewCardSkeleton } from '@/components/ui/ReviewCardSkeleton'

export default function DishLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      {/* Context row — back button + current dish context */}
      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 -mx-4 mb-4 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:top-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:mb-6 sm:px-6 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-border md:hidden" />
        <div className="min-w-0 space-y-1">
          <div className="h-4 w-36 animate-pulse rounded bg-border" />
          <div className="h-3 w-24 animate-pulse rounded bg-border" />
        </div>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="lg:col-span-2">
          <div className="grid gap-5 md:grid-cols-[minmax(0,360px)_1fr] md:gap-6">
            {/* Gallery skeleton — main square + thumbnail strip */}
            <div className="md:max-w-[360px]">
              <div className="aspect-square w-full animate-pulse rounded-xl bg-surface-2" />
              <div className="mt-2 grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-lg bg-surface-2" />
                ))}
              </div>
            </div>

            {/* Header skeleton */}
            <div className="min-w-0">
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
      <div className="mt-8 sm:mt-12">
        <div className="h-6 w-36 animate-pulse rounded-lg bg-border" />
        {/* Verified visits filter */}
        <div className="mt-4 h-9 w-36 animate-pulse rounded-pill bg-border" />
        {/* 2-up grid of thumbnail-left review cards */}
        <div className="mt-5 grid items-start gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* More from restaurant — related dishes */}
      <div className="mt-8">
        <div className="mb-4 h-6 w-48 animate-pulse rounded-lg bg-border" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex w-full gap-4 border-b border-border py-4 md:h-full md:flex-col-reverse md:gap-0 md:overflow-hidden md:rounded-lg md:border md:bg-card md:py-0"
            >
              <div className="min-w-0 flex-1 pt-3 md:p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
                <div className="mt-2 h-3.5 w-1/3 animate-pulse rounded bg-border" />
                <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-border" />
              </div>
              <div className="aspect-square w-[120px] shrink-0 animate-pulse rounded-lg bg-surface-2 sm:w-[128px] md:aspect-[4/3] md:w-full md:rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
