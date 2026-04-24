export default function RewardsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 animate-fade-in">
      {/* Title */}
      <div className="h-7 w-56 animate-pulse rounded-lg bg-border" />

      {/* Balance card */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline gap-2">
          <div className="h-10 w-20 animate-pulse rounded-lg bg-border" />
          <div className="h-4 w-20 animate-pulse rounded bg-border" />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 animate-pulse rounded bg-border" />
            <div className="h-3 w-20 animate-pulse rounded bg-border" />
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-border" />
          </div>
        </div>
        <div className="mt-4 flex gap-6">
          <div className="h-4 w-24 animate-pulse rounded bg-border" />
          <div className="h-4 w-28 animate-pulse rounded bg-border" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 rounded-xl bg-surface-2 p-1">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-border" />
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-surface-3" />
      </div>

      {/* Coupon cards */}
      <div className="mt-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-5 w-44 animate-pulse rounded bg-border" />
                <div className="mt-2 h-3.5 w-32 animate-pulse rounded bg-border" />
              </div>
              <div className="text-right">
                <div className="h-5 w-12 animate-pulse rounded bg-border" />
                <div className="mt-1 h-3 w-6 animate-pulse rounded bg-border" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="h-3 w-14 animate-pulse rounded bg-border" />
                <div className="h-3 w-14 animate-pulse rounded bg-border" />
              </div>
              <div className="h-9 w-24 animate-pulse rounded-pill bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
