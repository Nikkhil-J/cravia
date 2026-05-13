export default function UpgradeLoading() {
  return (
    <div className="mx-auto max-w-md px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-border" />
        <div className="mx-auto mt-3 h-7 w-48 animate-pulse rounded-lg bg-border" />
        <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-border" />
      </div>

      {/* Feature cards */}
      <div className="mt-8 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-border bg-card p-4">
            <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-border" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 animate-pulse rounded bg-border" />
              <div className="h-3.5 w-full animate-pulse rounded bg-border" />
            </div>
          </div>
        ))}
      </div>

      {/* Launching soon banner */}
      <div className="mt-8 rounded-2xl border border-border bg-surface-2 px-6 py-6 text-center">
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-border" />
        <div className="mx-auto mt-2 h-5 w-32 animate-pulse rounded-lg bg-border" />
        <div className="mx-auto mt-2 h-4 w-full max-w-xs animate-pulse rounded bg-border" />
        <div className="mx-auto mt-1 h-4 w-3/4 animate-pulse rounded bg-border" />
      </div>
    </div>
  )
}
