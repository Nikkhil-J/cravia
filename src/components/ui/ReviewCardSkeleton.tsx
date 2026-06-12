export function ReviewCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex gap-3 p-2.5 sm:gap-3.5 sm:p-3">
        {/* Thumbnail */}
        <div className="aspect-square w-[104px] shrink-0 self-start animate-pulse rounded-lg bg-surface-2 sm:w-[132px]" />
        {/* Body */}
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-start gap-2.5">
            <div className="flex-1">
              <div className="h-4 w-36 animate-pulse rounded bg-border" />
              <div className="mt-1.5 h-3 w-28 animate-pulse rounded bg-border" />
            </div>
            <div className="h-6 w-12 animate-pulse rounded-md bg-border" />
          </div>
          {/* Sub-rating pills */}
          <div className="mt-2 flex gap-1 border-t border-border pt-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-5 w-16 animate-pulse rounded-md bg-border" />
            ))}
          </div>
          {/* Text lines */}
          <div className="mt-2 space-y-1.5">
            <div className="h-3 w-full animate-pulse rounded bg-border" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-border" />
          </div>
          {/* Meta line */}
          <div className="mt-2.5 h-3 w-24 animate-pulse rounded bg-border" />
        </div>
      </div>
    </div>
  )
}
