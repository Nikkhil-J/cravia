export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-[1080px] px-6 pb-20 animate-fade-in">
      {/* Hero banner skeleton */}
      <div className="rounded-b-xl border border-t-0 border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="h-[72px] w-[72px] shrink-0 animate-pulse rounded-full bg-border" />
          <div className="min-w-0 flex-1">
            <div className="h-6 w-40 animate-pulse rounded-lg bg-border" />
            <div className="mt-2 flex items-center gap-2">
              <div className="h-3.5 w-20 animate-pulse rounded bg-border" />
              <div className="h-5 w-16 animate-pulse rounded-pill bg-border" />
              <div className="h-3.5 w-28 animate-pulse rounded bg-border" />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <div className="h-8 w-24 animate-pulse rounded-lg bg-border" />
            <div className="h-8 w-28 animate-pulse rounded-lg bg-border" />
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-5 flex gap-1.5 border-t border-border pt-5 sm:gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 rounded-lg border border-border bg-surface-2 py-2.5 text-center">
              <div className="mx-auto h-5 w-6 animate-pulse rounded bg-border" />
              <div className="mx-auto mt-1.5 h-2.5 w-12 animate-pulse rounded bg-border" />
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="mt-7 grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_280px]">
        {/* Main: Reviews */}
        <div className="min-w-0">
          <div className="h-5 w-32 animate-pulse rounded-lg bg-border" />
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="h-[130px] w-full animate-pulse bg-border" />
                <div className="p-4">
                  <div className="flex items-start gap-2.5">
                    <div className="flex-1">
                      <div className="h-4 w-36 animate-pulse rounded bg-border" />
                      <div className="mt-1.5 h-3 w-44 animate-pulse rounded bg-border" />
                    </div>
                    <div className="h-6 w-14 animate-pulse rounded-md bg-border" />
                  </div>
                  <div className="mt-3 flex gap-1.5 border-t border-border pt-3">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="h-5 w-16 animate-pulse rounded-md bg-border" />
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-3 w-full animate-pulse rounded bg-border" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-border" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3.5 max-md:order-first">
          {/* Level progress */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="h-3.5 w-24 animate-pulse rounded bg-border" />
              <div className="h-3 w-28 animate-pulse rounded bg-border" />
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full w-3/5 animate-pulse rounded-full bg-border" />
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="h-3.5 w-14 animate-pulse rounded bg-border" />
              <div className="h-3 w-10 animate-pulse rounded bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-surface-2 py-2.5 text-center">
                  <div className="mx-auto h-5 w-5 animate-pulse rounded-full bg-border" />
                  <div className="mx-auto mt-1.5 h-2 w-10 animate-pulse rounded bg-border" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-border px-3.5 py-3 last:border-b-0">
                <div className="h-[34px] w-[34px] animate-pulse rounded-lg bg-border" />
                <div className="flex-1">
                  <div className="h-3.5 w-16 animate-pulse rounded bg-border" />
                  <div className="mt-1 h-2.5 w-24 animate-pulse rounded bg-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
