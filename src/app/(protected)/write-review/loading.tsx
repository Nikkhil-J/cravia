export default function WriteReviewLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 animate-fade-in">
      {/* Dish context header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 animate-pulse rounded-md bg-border" />
        <div>
          <div className="h-5 w-40 animate-pulse rounded bg-border" />
          <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-border" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="h-[3px] overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-surface-3" />
        </div>
      </div>
      <div className="mb-8 flex justify-between px-1">
        <div className="h-3 w-10 animate-pulse rounded bg-border" />
        <div className="h-3 w-16 animate-pulse rounded bg-border" />
        <div className="h-3 w-10 animate-pulse rounded bg-border" />
      </div>

      {/* Step 1 — Photo upload area */}
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded-lg bg-border" />
        <div className="flex h-56 items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-2">
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-border" />
            <div className="h-3.5 w-36 animate-pulse rounded bg-border" />
            <div className="h-3 w-28 animate-pulse rounded bg-border" />
          </div>
        </div>

        {/* CTA button */}
        <div className="h-12 w-full animate-pulse rounded-pill bg-border" />
      </div>
    </div>
  )
}
