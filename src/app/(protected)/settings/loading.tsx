export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 animate-fade-in">
      {/* Title + subtitle */}
      <div className="h-7 w-28 animate-pulse rounded-lg bg-border" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-border" />

      {/* Form fields */}
      <div className="mt-8 space-y-5">
        {/* Display name */}
        <div>
          <div className="mb-1.5 h-4 w-24 animate-pulse rounded bg-border" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-surface-2" />
        </div>
        {/* Email (disabled) */}
        <div>
          <div className="mb-1.5 h-4 w-14 animate-pulse rounded bg-border" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-surface-3" />
        </div>
        {/* City */}
        <div>
          <div className="mb-1.5 h-4 w-10 animate-pulse rounded bg-border" />
          <div className="h-11 w-full animate-pulse rounded-lg bg-surface-2" />
        </div>
        {/* Save button */}
        <div className="h-11 w-full animate-pulse rounded-lg bg-border" />
      </div>

      {/* Avatar section */}
      <div className="mt-6 border-t border-border pt-6">
        <div className="mb-4 h-5 w-28 animate-pulse rounded bg-border" />
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-full bg-border" />
          <div>
            <div className="h-3.5 w-36 animate-pulse rounded bg-border" />
            <div className="mt-1.5 h-3 w-48 animate-pulse rounded bg-border" />
          </div>
        </div>
      </div>

      {/* Password section */}
      <div className="mt-6 border-t border-border pt-6">
        <div className="mb-4 h-5 w-36 animate-pulse rounded bg-border" />
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 h-4 w-32 animate-pulse rounded bg-border" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-surface-2" />
          </div>
          <div>
            <div className="mb-1.5 h-4 w-28 animate-pulse rounded bg-border" />
            <div className="h-11 w-full animate-pulse rounded-lg bg-surface-2" />
          </div>
          <div className="h-11 w-40 animate-pulse rounded-lg bg-border" />
        </div>
      </div>

      {/* Account info */}
      <div className="mt-10 border-t border-border pt-6">
        <div className="h-4 w-20 animate-pulse rounded bg-border" />
        <div className="mt-2 h-3 w-48 animate-pulse rounded bg-border" />
        <div className="mt-1 h-3 w-40 animate-pulse rounded bg-border" />
      </div>
    </div>
  )
}
