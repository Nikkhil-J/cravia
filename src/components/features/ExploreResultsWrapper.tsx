'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'

let pendingFlag = false
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return pendingFlag
}

function setPendingFlag(val: boolean) {
  if (pendingFlag !== val) {
    pendingFlag = val
    listeners.forEach((cb) => cb())
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('explore-filter-change', () => setPendingFlag(true))
}

export function resetExplorePending() {
  setPendingFlag(false)
}

export function ExploreResultsWrapper({ children }: { children: React.ReactNode }) {
  const pending = useSyncExternalStore(subscribe, getSnapshot, () => false)

  useEffect(() => {
    setPendingFlag(false)
  })

  if (pending) {
    return (
      <div className="mt-6">
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-border" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
