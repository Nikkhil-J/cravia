export default function WriteReviewLoading() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-8 sm:px-6 lg:pb-8 animate-fade-in">

      {/* Dish hero card */}
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:gap-4 sm:p-7">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-xl bg-surface-2 sm:h-[72px] sm:w-[72px]" />
        <div className="min-w-0 flex-1">
          <div className="h-6 w-48 animate-pulse rounded bg-surface-2" />
          <div className="mt-1.5 h-4 w-32 animate-pulse rounded bg-surface-2" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-surface-2" />
        </div>
        <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-2 sm:h-10 sm:w-24 sm:rounded-pill" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

        {/* Main form */}
        <div className="space-y-10">

          {/* Rewards preview */}
          <div className="h-24 w-full animate-pulse rounded-2xl border border-border bg-card" />

          {/* Section 1: Ratings */}
          <section>
            <div className="mb-3 h-7 w-56 animate-pulse rounded bg-surface-2" />
            <div className="mb-4 h-4 w-72 max-w-full animate-pulse rounded bg-surface-2" />
            <div className="flex flex-col gap-3">
              <div className="h-[76px] w-full animate-pulse rounded-xl border-[1.5px] border-border bg-card" />
              <div className="h-[76px] w-full animate-pulse rounded-xl border-[1.5px] border-border bg-card" />
              <div className="h-[76px] w-full animate-pulse rounded-xl border-[1.5px] border-border bg-card" />
            </div>
          </section>

          {/* Section 2: Tags */}
          <section>
            <div className="mb-3 h-7 w-64 animate-pulse rounded bg-surface-2" />
            <div className="mb-5 h-4 w-72 max-w-full animate-pulse rounded bg-surface-2" />
            <div className="space-y-5">
              <div className="h-16 w-full animate-pulse rounded-xl border border-border bg-card" />
              <div className="h-16 w-full animate-pulse rounded-xl border border-border bg-card" />
              <div className="h-16 w-full animate-pulse rounded-xl border border-border bg-card" />
            </div>
          </section>

          {/* Section 3: Written review */}
          <section>
            <div className="mb-3 h-7 w-44 animate-pulse rounded bg-surface-2" />
            <div className="mb-5 h-4 w-72 max-w-full animate-pulse rounded bg-surface-2" />
            <div className="h-56 w-full animate-pulse rounded-2xl border-2 border-border bg-card" />
          </section>

          {/* Dish photo card */}
          <div className="h-24 w-full animate-pulse rounded-2xl border-2 border-dashed border-border bg-card" />

          {/* Verify your visit */}
          <div className="h-44 w-full animate-pulse rounded-2xl border-[1.5px] border-border bg-card" />

          {/* Submit bar (desktop only) */}
          <div className="hidden h-24 w-full animate-pulse rounded-2xl border border-border bg-card lg:block" />
        </div>

        {/* Sidebar (desktop only) */}
        <aside className="hidden space-y-4 lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="h-56 w-full animate-pulse rounded-2xl border border-border bg-card" />
            <div className="h-40 w-full animate-pulse rounded-2xl border border-border bg-card" />
          </div>
        </aside>
      </div>
    </div>
  )
}
