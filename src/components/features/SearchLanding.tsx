'use client'

import { Clock, X } from 'lucide-react'
import { useRecentSearches } from '@/lib/hooks/useRecentSearches'
import { setExploreQuery } from '@/lib/stores/explore-search'

export function SearchLanding() {
  const { searches, removeSearch, clearAll } = useRecentSearches()

  if (searches.length === 0) return null

  function handleSearchClick(term: string) {
    setExploreQuery(term)
  }

  return (
    <div className="mt-4 mb-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Your recent searches
        </p>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((term) => (
          <div
            key={term}
            className="group flex items-center gap-1.5 rounded-pill border border-border bg-card pl-3 pr-1.5 py-1.5 transition-all hover:border-primary/30"
          >
            <Clock className="h-3 w-3 shrink-0 text-text-muted" />
            <button
              type="button"
              onClick={() => handleSearchClick(term)}
              className="text-xs font-medium text-text-primary"
            >
              {term}
            </button>
            <button
              type="button"
              onClick={() => removeSearch(term)}
              className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary"
              aria-label={`Remove ${term}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
