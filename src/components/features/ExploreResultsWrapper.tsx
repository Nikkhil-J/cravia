'use client'

import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

let pendingFlag = false
const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return pendingFlag
}

// Driven by the filters component's transition state. Keeps the previously
// rendered results painted (just dimmed) while the next RSC payload streams in,
// instead of unmounting them and flashing a skeleton.
export function setExplorePending(val: boolean) {
  if (pendingFlag !== val) {
    pendingFlag = val
    listeners.forEach((cb) => cb())
  }
}

export function ExploreResultsWrapper({ children }: { children: React.ReactNode }) {
  const pending = useSyncExternalStore(subscribe, getSnapshot, () => false)

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        pending && 'pointer-events-none opacity-60'
      )}
    >
      {children}
    </div>
  )
}
