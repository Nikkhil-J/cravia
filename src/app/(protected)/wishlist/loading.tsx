export default function WishlistLoading() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-8 animate-fade-in">
      {/* Centered header */}
      <div className="text-center">
        <div className="mx-auto h-7 w-40 animate-pulse rounded-lg bg-border" />
        <div className="mx-auto mt-2 h-4 w-52 animate-pulse rounded bg-border" />
        <div className="mx-auto mt-2 h-3 w-24 animate-pulse rounded bg-border" />
      </div>

      {/* Dish card grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="relative h-36 animate-pulse bg-surface-3">
              <div className="absolute right-2.5 top-2.5 h-8 w-8 animate-pulse rounded-full bg-border" />
            </div>
            <div className="p-3.5">
              <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
              <div className="mt-1.5 h-3 w-1/2 animate-pulse rounded bg-border" />
              <div className="mt-3 h-3 w-16 animate-pulse rounded bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
