export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 animate-fade-in">
      {/* Title + mark-all-read button */}
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 animate-pulse rounded-lg bg-border" />
        <div className="h-4 w-20 animate-pulse rounded bg-border" />
      </div>

      {/* Notification items */}
      <div className="mt-6 space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
            <div className="mt-1.5 h-3.5 w-full animate-pulse rounded bg-border" />
            <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-border" />
          </div>
        ))}
      </div>
    </div>
  )
}
